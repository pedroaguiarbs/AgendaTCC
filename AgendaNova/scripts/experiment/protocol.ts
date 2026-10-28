import { randomUUID, createHash } from "node:crypto";
import {
  mkdir,
  readFile,
  readdir,
  writeFile,
  rename,
  realpath,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
export const appRoot = fileURLToPath(new URL("../../", import.meta.url));
export const artifactRoot = path.join(appRoot, "artifacts/experiments");
export const methods = ["direct", "raster"] as const;
export type Method = (typeof methods)[number];
export type Phase = "warmup" | "measured";
export const protocol = {
  version: 1,
  warmupBlocks: 2,
  measuredBlocks: 10,
  maxWarmupAttempts: 4,
  maxMeasuredAttempts: 20,
  timeoutMs: 180_000,
  pages: 34,
  viewport: { width: 794, height: 1123 },
  deviceScaleFactor: 2,
  media: "print",
  reducedMotion: "reduce",
  visual: { width: 1588, height: 2246, channelThreshold: 16 },
  textQueries: [
    "Uma Palavra à Igreja",
    "Programação Semanal",
    "Culto de Casais",
    "Natal",
    "Pr. Josivaldo Silva",
  ],
} as const;
export interface Attempt {
  id: string;
  phase: Phase;
  blockAttempt: number;
  order: number;
  method: Method;
  startedAt: string;
  endedAt?: string;
  processTotalMs?: number;
  exporterElapsedMs?: number;
  bytes?: number;
  pages?: number;
  browser?: string;
  parameters?: unknown;
  pdfSha256?: string;
  commit: string;
  status: "running" | "valid" | "invalid";
  reason?: string;
  exclusionReason?: string;
  exitCode?: number | null;
  signal?: string | null;
  timedOut?: boolean;
  includedInPrimaryAnalysis: boolean;
  acceptedBlock: number | null;
}
export function orderFor(blockAttempt: number): Method[] {
  return blockAttempt % 2 ? ["direct", "raster"] : ["raster", "direct"];
}
export function sha256(bytes: Uint8Array | string) {
  return createHash("sha256").update(bytes).digest("hex");
}
export async function json(file: string, value: unknown) {
  const temporary = `${file}.tmp-${randomUUID()}`;
  await writeFile(temporary, JSON.stringify(value, null, 2) + "\n", {
    flag: "wx",
  });
  await rename(temporary, file);
}
export async function readJson<T = any>(file: string): Promise<T> {
  return JSON.parse(await readFile(file, "utf8"));
}
export async function newSession(mode: "pilot" | "official") {
  await mkdir(artifactRoot, { recursive: true });
  const id = `${mode}-${new Date().toISOString().replace(/[:.]/g, "-")}-${randomUUID().slice(0, 8)}`;
  const directory = path.join(artifactRoot, id);
  await mkdir(directory); // Never reuse a session directory.
  return { id, directory };
}
export async function fingerprint(
  directory: string,
): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  async function walk(relative: string) {
    for (const entry of (
      await readdir(path.join(directory, relative), { withFileTypes: true })
    ).sort((a, b) => a.name.localeCompare(b.name))) {
      const name = path.join(relative, entry.name);
      if (entry.isDirectory()) await walk(name);
      else if (entry.isFile())
        result[name.replaceAll(path.sep, "/")] = sha256(
          await readFile(path.join(directory, name)),
        );
      else throw new Error(`Unsupported build entry: ${name}`);
    }
  }
  await walk("");
  return result;
}
export function csv(rows: Record<string, unknown>[], columns: string[]) {
  const quote = (value: unknown) =>
    '"' + String(value ?? "").replaceAll('"', '""') + '"';
  return (
    "\uFEFF" +
    [
      columns.map(quote).join(","),
      ...rows.map((row) =>
        columns
          .map((key) =>
            quote(
              typeof row[key] === "object" && row[key] !== null
                ? JSON.stringify(row[key])
                : row[key],
            ),
          )
          .join(","),
      ),
    ].join("\r\n") +
    "\r\n"
  );
}
export function describe(values: number[]) {
  if (!values.length)
    return {
      n: 0,
      mean: null,
      median: null,
      sampleStandardDeviation: null,
      min: null,
      max: null,
    };
  const sorted = [...values].sort((a, b) => a - b),
    mean = values.reduce((a, b) => a + b, 0) / values.length;
  return {
    n: values.length,
    mean,
    median:
      (sorted[Math.floor((sorted.length - 1) / 2)] +
        sorted[Math.ceil((sorted.length - 1) / 2)]) /
      2,
    sampleStandardDeviation:
      values.length < 2
        ? null
        : Math.sqrt(
            values.reduce((sum, x) => sum + (x - mean) ** 2, 0) /
              (values.length - 1),
          ),
    min: sorted[0],
    max: sorted.at(-1)!,
  };
}
export function percentDifference(direct: number, raster: number) {
  return direct === 0 ? null : (100 * (raster - direct)) / direct;
}

export async function sessionDirectory(input: string) {
  if (!input) throw new Error("Supply a session directory");
  const directory = await realpath(path.resolve(input));
  const root = await realpath(artifactRoot);
  if (!directory.startsWith(root + path.sep))
    throw new Error("Session must be inside AgendaNova/artifacts/experiments");
  return directory;
}
