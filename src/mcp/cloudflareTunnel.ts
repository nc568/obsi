import type * as CpTypes from "child_process";
import type * as FsTypes from "fs";

export type TunnelState = "stopped" | "starting" | "running" | "error";

export interface TunnelStatus {
  state: TunnelState;
  publicBaseUrl: string | null;
  error: string | null;
  logsTail: string[];
}

async function loadChildProcessAndFs(): Promise<{
  cp: typeof CpTypes;
  fs: typeof FsTypes;
} | null> {
  try {
    const req =
      (globalThis as unknown as { require?: (id: string) => unknown }).require ||
      (typeof window !== "undefined"
        ? (window as unknown as { require?: (id: string) => unknown }).require
        : undefined);
    if (typeof req === "function") {
      return {
        cp: req("child_process") as typeof CpTypes,
        fs: req("fs") as typeof FsTypes,
      };
    }
  } catch {
    // Fallback to dynamic import in standalone Node ESM
  }
  try {
    const cpMod = "node:" + "child_process";
    const fsMod = "node:" + "fs";
    const [cp, fs] = await Promise.all([import(cpMod), import(fsMod)]);
    return { cp: cp as typeof CpTypes, fs: fs as typeof FsTypes };
  } catch {
    return null;
  }
}

export class CloudflareQuickTunnelManager {
  private proc: CpTypes.ChildProcess | null = null;
  private status: TunnelStatus = {
    state: "stopped",
    publicBaseUrl: null,
    error: null,
    logsTail: [],
  };
  private listeners = new Set<(status: TunnelStatus) => void>();

  public getStatus(): TunnelStatus {
    return { ...this.status, logsTail: [...this.status.logsTail] };
  }

  public onStatusChange(cb: (status: TunnelStatus) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private emit(): void {
    const snap = this.getStatus();
    for (const cb of this.listeners) {
      try {
        cb(snap);
      } catch {
        // ignore
      }
    }
  }

  private appendLog(line: string): void {
    const trimmed = line.trim();
    if (!trimmed) return;
    this.status.logsTail.push(trimmed);
    if (this.status.logsTail.length > 30) {
      this.status.logsTail.shift();
    }
  }

  public async start(
    localPort: number,
    customBinaryPath?: string
  ): Promise<string> {
    if (this.proc && this.status.state === "running" && this.status.publicBaseUrl) {
      return this.status.publicBaseUrl;
    }
    await this.stop();

    const mods = await loadChildProcessAndFs();
    if (!mods) {
      const msg = "child_process unavailable (desktop Obsidian or Node.js required)";
      this.status = {
        state: "error",
        publicBaseUrl: null,
        error: msg,
        logsTail: [],
      };
      this.emit();
      throw new Error(msg);
    }

    const bin = this.resolveCloudflaredBinary(mods.fs, customBinaryPath);
    const targetUrl = `http://127.0.0.1:${localPort}`;

    this.status = {
      state: "starting",
      publicBaseUrl: null,
      error: null,
      logsTail: [`Launching: ${bin} tunnel --url ${targetUrl} --no-autoupdate`],
    };
    this.emit();

    return await new Promise<string>((resolve, reject) => {
      let settled = false;
      const proc = mods.cp.spawn(
        bin,
        ["tunnel", "--url", targetUrl, "--no-autoupdate"],
        {
          stdio: ["ignore", "pipe", "pipe"],
          windowsHide: true,
        }
      );
      this.proc = proc;

      const timeout = setTimeout(() => {
        if (!settled) {
          settled = true;
          const errMsg =
            "Timed out waiting for trycloudflare.com URL (check internet connection)";
          this.status.state = "error";
          this.status.error = errMsg;
          this.emit();
          reject(new Error(errMsg));
        }
      }, 25_000);

      const handleChunk = (chunk: Buffer | string) => {
        const text = chunk.toString();
        for (const line of text.split(/\r?\n/)) {
          this.appendLog(line);
        }
        const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i);
        if (match && !this.status.publicBaseUrl) {
          this.status.publicBaseUrl = match[0];
          this.status.state = "running";
          this.status.error = null;
          this.emit();
          if (!settled) {
            settled = true;
            clearTimeout(timeout);
            resolve(match[0]);
          }
        }
      };

      proc.stdout?.on("data", handleChunk);
      proc.stderr?.on("data", handleChunk);

      proc.on("error", (err: NodeJS.ErrnoException) => {
        clearTimeout(timeout);
        this.proc = null;
        const friendly =
          err.code === "ENOENT"
            ? "cloudflared не найден. Установите: brew install cloudflared (macOS) или winget install Cloudflare.cloudflared (Windows)"
            : err.message;
        this.status.state = "error";
        this.status.error = friendly;
        this.status.publicBaseUrl = null;
        this.emit();
        if (!settled) {
          settled = true;
          reject(new Error(friendly));
        }
      });

      proc.on("exit", (code) => {
        clearTimeout(timeout);
        if (this.proc === proc) {
          this.proc = null;
        }
        if (this.status.state !== "stopped") {
          const msg =
            code === 0
              ? null
              : `cloudflared exited with code ${code ?? "unknown"}`;
          this.status.state = msg ? "error" : "stopped";
          this.status.error = msg;
          this.status.publicBaseUrl = null;
          this.emit();
          if (!settled) {
            settled = true;
            reject(new Error(msg || "cloudflared exited"));
          }
        }
      });
    });
  }

  public async stop(): Promise<void> {
    const p = this.proc;
    this.proc = null;
    this.status = {
      state: "stopped",
      publicBaseUrl: null,
      error: null,
      logsTail: this.status.logsTail,
    };
    this.emit();

    if (!p) return;
    await new Promise<void>((resolve) => {
      const killTimer = setTimeout(() => {
        try {
          p.kill("SIGKILL");
        } catch {
          // ignore
        }
        resolve();
      }, 1500);

      p.once("exit", () => {
        clearTimeout(killTimer);
        resolve();
      });

      try {
        p.kill("SIGTERM");
      } catch {
        clearTimeout(killTimer);
        resolve();
      }
    });
  }

  private resolveCloudflaredBinary(
    fs: typeof FsTypes,
    customPath?: string
  ): string {
    if (customPath && customPath.trim()) {
      return customPath.trim();
    }
    const envObj =
      typeof process !== "undefined" && process.env ? process.env : {};
    const home = envObj.HOME || envObj.USERPROFILE || "";
    const localAppData = envObj.LOCALAPPDATA || "";

    const candidates = [
      "/opt/homebrew/bin/cloudflared",
      "/usr/local/bin/cloudflared",
      "/usr/bin/cloudflared",
      home ? `${home}/.local/bin/cloudflared` : "",
      "C:\\Program Files (x86)\\cloudflared\\cloudflared.exe",
      "C:\\Program Files\\cloudflared\\cloudflared.exe",
      localAppData
        ? `${localAppData}\\Microsoft\\WinGet\\Links\\cloudflared.exe`
        : "",
    ].filter(Boolean);

    for (const c of candidates) {
      try {
        if (fs.existsSync(c)) return c;
      } catch {
        // ignore
      }
    }
    return "cloudflared";
  }
}
