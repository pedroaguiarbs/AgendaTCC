import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  appRoot,
  sessionDirectory,
  type Attempt,
  csv,
  describe,
  methods,
  percentDifference,
  readJson,
  json,
} from "./protocol";
export async function loadAttempts(directory: string): Promise<Attempt[]> {
  const root = path.join(directory, "attempts");
  let entries: string[];
  try {
    entries = await readdir(root);
  } catch {
    return [];
  }
  const result: Attempt[] = [];
  for (const name of entries.sort())
    result.push(await readJson(path.join(root, name, "attempt.json")));
  return result;
}
export function summarize(attempts: Attempt[]) {
  const candidates = attempts.filter(
    (a) =>
      a.phase === "measured" &&
      a.includedInPrimaryAnalysis &&
      a.status === "valid",
  );
  const eligible = candidates.filter(
    (a) =>
      candidates.filter((b) => b.acceptedBlock === a.acceptedBlock).length ===
        2 &&
      candidates.some(
        (b) => b.acceptedBlock === a.acceptedBlock && b.method !== a.method,
      ),
  );
  const statistics = Object.fromEntries(
    methods.map((method) => [
      method,
      Object.fromEntries(
        ["processTotalMs", "exporterElapsedMs", "bytes", "pages"].map(
          (metric) => [
            metric,
            describe(
              eligible
                .filter((a) => a.method === method)
                .map((a) => a[metric as "bytes"]!)
                .filter(Number.isFinite),
            ),
          ],
        ),
      ),
    ]),
  );
  const blocks = [...new Set(eligible.map((a) => a.acceptedBlock!))]
    .sort((a, b) => a - b)
    .map((block) => {
      const direct = eligible.find(
        (a) => a.acceptedBlock === block && a.method === "direct",
      )!;
      const raster = eligible.find(
        (a) => a.acceptedBlock === block && a.method === "raster",
      )!;
      return {
        block,
        firstMethod: direct.order === 1 ? "direct" : "raster",
        directId: direct.id,
        rasterId: raster.id,
        processDifferenceMs: raster.processTotalMs! - direct.processTotalMs!,
        processDifferencePercent: percentDifference(
          direct.processTotalMs!,
          raster.processTotalMs!,
        ),
        bytesDifference: raster.bytes! - direct.bytes!,
        bytesDifferencePercent: percentDifference(direct.bytes!, raster.bytes!),
      };
    });
  const aggregatePercent = Object.fromEntries(
    ["processTotalMs", "exporterElapsedMs", "bytes"].map((metric) => {
      const direct = statistics.direct[metric].mean,
        raster = statistics.raster[metric].mean;
      return [
        metric,
        direct === null || raster === null
          ? null
          : percentDifference(direct, raster),
      ];
    }),
  );
  return {
    totalAttempts: attempts.length,
    invalidAttempts: attempts.filter((a) => a.status === "invalid").length,
    unfinishedAttempts: attempts.filter((a) => a.status === "running").length,
    primaryAttempts: eligible.length,
    statistics,
    aggregatePercent,
    paired: {
      blocks,
      processDifferenceMs: describe(blocks.map((b) => b.processDifferenceMs)),
      processDifferencePercent: describe(
        blocks.map((b) => b.processDifferencePercent).filter((x) => x !== null),
      ),
      bytesDifference: describe(blocks.map((b) => b.bytesDifference)),
      bytesDifferencePercent: describe(
        blocks.map((b) => b.bytesDifferencePercent).filter((x) => x !== null),
      ),
    },
  };
}
export async function consolidate(directory: string) {
  const session = await readJson(path.join(directory, "session.json")),
    attempts = await loadAttempts(directory);
  const rows = attempts.map((a) => ({
    ...a,
    sessionId: session.id,
    mode: session.mode,
    url: session.url,
    node: session.node,
    platform: session.platform,
    buildHash: session.buildHash,
    browserExecutableHash: session.browserExecutableHash,
  }));
  await writeFile(
    path.join(directory, "results.csv"),
    csv(rows, [
      "sessionId",
      "mode",
      "id",
      "phase",
      "blockAttempt",
      "acceptedBlock",
      "order",
      "method",
      "startedAt",
      "endedAt",
      "status",
      "reason",
      "exclusionReason",
      "includedInPrimaryAnalysis",
      "processTotalMs",
      "exporterElapsedMs",
      "bytes",
      "pages",
      "browser",
      "parameters",
      "commit",
      "buildHash",
      "browserExecutableHash",
      "pdfSha256",
      "node",
      "platform",
      "url",
      "exitCode",
      "signal",
      "timedOut",
    ]),
  );
  const summary = summarize(attempts);
  await json(path.join(directory, "summary.json"), {
    sessionStatus: session.status,
    mode: session.mode,
    primarySampleComplete:
      session.status === "completed" &&
      summary.primaryAttempts === session.measuredBlocks * 2,
    ...summary,
  });
  return summary;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) ===
    path.join(appRoot, "scripts/experiment/report.ts")
) {
  const directory = await sessionDirectory(process.argv[2]);
  await consolidate(directory);
  console.log(directory);
}
