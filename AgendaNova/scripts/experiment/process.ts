import { spawn, type ChildProcess } from "node:child_process";
import { createWriteStream } from "node:fs";
import { finished } from "node:stream/promises";
import { appRoot } from "./protocol";
export async function terminateTree(child: ChildProcess) {
  if (!child.pid) return;
  if (process.platform === "win32") {
    await new Promise<void>((resolve) => {
      const killer = spawn(
        "taskkill",
        ["/PID", String(child.pid), "/T", "/F"],
        { stdio: "ignore", windowsHide: true },
      );
      killer.once("error", () => resolve());
      killer.once("close", () => resolve());
    });
  } else {
    try {
      process.kill(-child.pid, "SIGKILL");
    } catch {
      /* owned group already exited */
    }
  }
}
/** Wall interval includes spawn, module loading, exporter, browser close and pipe drain.
 * Validation and log flush to disk are performed AFTER recording this interval. */
export async function executeProcess(
  command: string,
  args: string[],
  options: {
    stdout: string;
    stderr: string;
    timeoutMs: number;
    env?: NodeJS.ProcessEnv;
    signal?: AbortSignal;
  },
) {
  const out = createWriteStream(options.stdout, { flags: "wx" }),
    err = createWriteStream(options.stderr, { flags: "wx" });
  const startedAt = new Date().toISOString(),
    start = performance.now();
  const child = spawn(command, args, {
    cwd: appRoot,
    env: options.env ?? process.env,
    stdio: ["ignore", "pipe", "pipe"],
    detached: process.platform !== "win32",
    windowsHide: true,
  });
  child.stdout?.pipe(out, { end: false });
  child.stderr?.pipe(err, { end: false });
  let timedOut = false,
    aborted = false,
    spawnError: string | undefined;
  let killing: Promise<void> | undefined;
  const stop = () => {
    killing ??= terminateTree(child);
  };
  const onAbort = () => {
    aborted = true;
    stop();
  };
  options.signal?.addEventListener("abort", onAbort, { once: true });
  if (options.signal?.aborted) onAbort();
  const timer = setTimeout(() => {
    timedOut = true;
    stop();
  }, options.timeoutMs);
  child.once("error", (error) => {
    spawnError = error.message;
  });
  const result = await new Promise<{
    exitCode: number | null;
    signal: string | null;
  }>((resolve) =>
    child.once("close", (exitCode, signal) => resolve({ exitCode, signal })),
  );
  const processTotalMs = performance.now() - start,
    endedAt = new Date().toISOString();
  clearTimeout(timer);
  options.signal?.removeEventListener("abort", onAbort);
  await killing;
  out.end();
  err.end();
  await Promise.all([finished(out), finished(err)]);
  return {
    startedAt,
    endedAt,
    processTotalMs,
    ...result,
    timedOut,
    aborted,
    spawnError,
  };
}
