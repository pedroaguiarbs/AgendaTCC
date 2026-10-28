import { execFileSync } from "node:child_process";
import { cp, mkdir, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";
import { preview } from "vite";
import { preparePage } from "../pdf/prepare-page";
import {
  appRoot,
  fingerprint,
  json,
  newSession,
  protocol,
  sha256,
  type Attempt,
  type Phase,
} from "./protocol";
import { executeProcess } from "./process";
import { validateOutput } from "./validate-pdf";
import { consolidate } from "./report";
import { collectBlocks } from "./schedule";
const argv = process.argv.slice(2);
if (
  argv.some(
    (arg, i) =>
      !["--pilot", "--allow-dirty", "--port"].includes(arg) &&
      argv[i - 1] !== "--port",
  )
)
  throw new Error("Options: --pilot [--allow-dirty] [--port 4175]");
const mode = argv.includes("--pilot") ? "pilot" : "official";
if (argv.includes("--allow-dirty") && mode !== "pilot")
  throw new Error("--allow-dirty is restricted to the pilot");
const port = argv.includes("--port")
  ? Number(argv[argv.indexOf("--port") + 1])
  : 4175;
if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw new Error("Invalid port");
const git = (...args: string[]) =>
  execFileSync("git", args, { cwd: appRoot, encoding: "utf8" }).trim();
const status = git("status", "--porcelain");
if (status && !argv.includes("--allow-dirty"))
  throw new Error(
    "Commit or preserve local changes first; official collection requires a clean repository. Pilot only: --allow-dirty.",
  );
const commit = git("rev-parse", "HEAD");
const { id, directory } = await newSession(mode);
console.log(`SESSION ${directory}`);
const controller = new AbortController();
const stop = () => controller.abort();
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
let server: Awaited<ReturnType<typeof preview>> | undefined;
const session: any = {
  id,
  mode,
  commit,
  dirty: !!status,
  gitStatus: status,
  status: "preparing",
  createdAt: new Date().toISOString(),
  protocol,
  warmupBlocks: mode === "pilot" ? 1 : 2,
  measuredBlocks: mode === "pilot" ? 1 : 10,
  node: process.version,
  platform: process.platform,
  architecture: process.arch,
  osRelease: os.release(),
  cpu: os.cpus()[0]?.model,
  logicalCpus: os.cpus().length,
  memoryBytes: os.totalmem(),
  url: `http://127.0.0.1:${port}`,
};
const sessionFile = path.join(directory, "session.json");
await json(sessionFile, session);
const sourceNames = git(
  "ls-files",
  "--cached",
  "--others",
  "--exclude-standard",
  "-z",
)
  .split("\0")
  .filter(Boolean);
async function sourceHashes() {
  return Object.fromEntries(
    await Promise.all(
      sourceNames.map(async (name) => [
        name,
        sha256(await readFile(path.join(appRoot, name))),
      ]),
    ),
  );
}
try {
  session.sources = await sourceHashes();
  await mkdir(path.join(directory, "source"));
  for (const name of sourceNames) {
    const target = path.join(directory, "source", name);
    await mkdir(path.dirname(target), { recursive: true });
    await cp(path.join(appRoot, name), target);
  }
  const executable = path.resolve(
    process.env.CHROMIUM_PATH || chromium.executablePath(),
  );
  session.browserExecutable = executable;
  session.browserExecutableHash = sha256(await readFile(executable));
  process.env.CHROMIUM_PATH = executable;
  delete process.env.ALLOW_FALLBACK_FONT;
  for (const [name, args] of [
    [
      "typecheck",
      [path.join(appRoot, "node_modules/typescript/bin/tsc"), "-b"],
    ],
    [
      "build",
      [
        path.join(appRoot, "node_modules/vite/bin/vite.js"),
        "build",
        "--outDir",
        path.join(directory, "build"),
      ],
    ],
  ] as const) {
    const result = await executeProcess(process.execPath, [...args], {
      stdout: path.join(directory, `${name}.stdout.log`),
      stderr: path.join(directory, `${name}.stderr.log`),
      timeoutMs: 180_000,
      signal: controller.signal,
    });
    if (
      result.exitCode !== 0 ||
      result.timedOut ||
      result.aborted ||
      result.spawnError
    )
      throw new Error(`${name} failed; see logs`);
  }
  session.buildFiles = await fingerprint(path.join(directory, "build"));
  session.buildHash = sha256(JSON.stringify(session.buildFiles));
  server = await preview({
    root: appRoot,
    configFile: path.join(appRoot, "vite.config.ts"),
    build: { outDir: path.join(directory, "build") },
    preview: { host: "127.0.0.1", port, strictPort: true },
  });
  const preflight = await preparePage(session.url);
  try {
    session.browser = preflight.browser.version();
    session.fonts = await preflight.page.evaluate(async () => {
      const result = [];
      for (const weight of [400, 500, 600, 700, 800]) {
        const faces = await document.fonts.load(`${weight} 16px Montserrat`);
        result.push({
          weight,
          loaded:
            faces.length > 0 && faces.every((face) => face.status === "loaded"),
        });
      }
      return result;
    });
    if (!session.fonts.every((font: any) => font.loaded))
      throw new Error("Font preflight failed");
  } finally {
    await preflight.browser.close();
  }
  session.status = "collecting";
  session.collectionStartedAt = new Date().toISOString();
  await json(sessionFile, session);
  await mkdir(path.join(directory, "attempts"));
  async function phase(phase: Phase, target: number, max: number) {
    await collectBlocks(
      phase,
      target,
      max,
      async (blockAttempt, order, method) => {
        const attemptId = `${phase}-${String(blockAttempt).padStart(2, "0")}-${order}-${method}`;
        const output = path.join(directory, "attempts", attemptId);
        await mkdir(output);
        const record: Attempt = {
          id: attemptId,
          phase,
          blockAttempt,
          order,
          method,
          commit,
          startedAt: new Date().toISOString(),
          status: "running",
          exclusionReason: phase === "warmup" ? "warmup" : "pending-pair",
          includedInPrimaryAnalysis: false,
          acceptedBlock: null,
        };
        const file = path.join(output, "attempt.json");
        await json(file, record);
        try {
          const result = await executeProcess(
            process.execPath,
            [
              "--import",
              "tsx",
              path.join(appRoot, `scripts/pdf/export-${method}.ts`),
            ],
            {
              stdout: path.join(output, "stdout.log"),
              stderr: path.join(output, "stderr.log"),
              timeoutMs: protocol.timeoutMs,
              signal: controller.signal,
              env: {
                ...process.env,
                AGENDA_URL: session.url,
                PDF_OUTPUT_DIR: output,
              },
            },
          );
          Object.assign(record, result);
          if (
            result.exitCode !== 0 ||
            result.timedOut ||
            result.aborted ||
            result.spawnError
          )
            throw new Error(
              result.spawnError ||
                (result.aborted
                  ? "interrupted"
                  : result.timedOut
                    ? "timeout"
                    : `exit=${result.exitCode}; signal=${result.signal}`),
            );
          Object.assign(
            record,
            await validateOutput(output, method, {
              url: session.url,
              browser: session.browser,
            }),
          );
          record.status = "valid";
        } catch (error) {
          record.status = "invalid";
          record.reason = String(error);
        }
        record.endedAt ??= new Date().toISOString();
        await json(file, record);
        console.log(
          `${record.id}: ${record.status}; ${record.processTotalMs?.toFixed(0) ?? "?"} ms`,
        );
        await consolidate(directory);
        return record;
      },
      async (pair) => {
        for (const record of pair)
          await json(
            path.join(directory, "attempts", record.id, "attempt.json"),
            record,
          );
        await consolidate(directory);
      },
      controller.signal,
    );
  }
  await phase("warmup", session.warmupBlocks, protocol.maxWarmupAttempts);
  await phase("measured", session.measuredBlocks, protocol.maxMeasuredAttempts);
  session.collectionEndedAt = new Date().toISOString();
  if (JSON.stringify(await sourceHashes()) !== JSON.stringify(session.sources))
    throw new Error("Sources changed during collection");
  if (
    sha256(JSON.stringify(await fingerprint(path.join(directory, "build")))) !==
    session.buildHash
  )
    throw new Error("Build changed during collection");
  if (sha256(await readFile(executable)) !== session.browserExecutableHash)
    throw new Error("Browser executable changed during collection");
  session.status = "completed";
} catch (error) {
  session.status = controller.signal.aborted ? "interrupted" : "failed";
  session.error = String(error);
  process.exitCode = 1;
} finally {
  if (server)
    await new Promise<void>((resolve) => {
      if ("closeAllConnections" in server!.httpServer)
        server!.httpServer.closeAllConnections();
      server!.httpServer.close(() => resolve());
    });
  session.finishedAt = new Date().toISOString();
  await json(sessionFile, session);
  await consolidate(directory);
  process.off("SIGINT", stop);
  process.off("SIGTERM", stop);
  console.log(
    `Collection ${session.status}. Analysis is a separate command; no text/image analysis ran during collection.`,
  );
}
