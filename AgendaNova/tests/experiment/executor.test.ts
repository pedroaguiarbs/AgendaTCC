import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { PDFDocument } from "pdf-lib";
import { collectBlocks } from "../../scripts/experiment/schedule";
import {
  orderFor,
  describe,
  percentDifference,
  csv,
  type Attempt,
  type Method,
  type Phase,
} from "../../scripts/experiment/protocol";
import { executeProcess } from "../../scripts/experiment/process";
import { summarize } from "../../scripts/experiment/report";
import { validateOutput } from "../../scripts/experiment/validate-pdf";
function attempt(
  method: Method,
  block: number,
  order: number,
  phase: Phase = "measured",
): Attempt {
  return {
    id: `${phase}-${block}-${method}`,
    phase,
    blockAttempt: block,
    order,
    method,
    commit: "test",
    startedAt: "2026-01-01T00:00:00Z",
    status: "valid",
    includedInPrimaryAnalysis: false,
    acceptedBlock: null,
    processTotalMs: method === "direct" ? 10 : 20,
    exporterElapsedMs: method === "direct" ? 5 : 15,
    bytes: method === "direct" ? 100 : 200,
    pages: 34,
  };
}
test("official schedule: two warmups per method, ten measured per method; balanced order and no overlap", async () => {
  const records: Attempt[] = [];
  let active = 0,
    maximum = 0;
  for (const [phase, target] of [
    ["warmup", 2],
    ["measured", 10],
  ] as const)
    await collectBlocks(
      phase,
      target,
      target,
      async (block, order, method) => {
        active++;
        maximum = Math.max(active, maximum);
        await new Promise((resolve) => setTimeout(resolve, 1));
        active--;
        const record = attempt(method, block, order, phase);
        records.push(record);
        return record;
      },
      async () => {},
    );
  assert.equal(maximum, 1);
  assert.equal(records.length, 24);
  for (const method of ["direct", "raster"]) {
    assert.equal(
      records.filter((r) => r.phase === "warmup" && r.method === method).length,
      2,
    );
    assert.equal(
      records.filter((r) => r.includedInPrimaryAnalysis && r.method === method)
        .length,
      10,
    );
  }
  for (let block = 1; block <= 10; block++)
    assert.deepEqual(
      records
        .filter((r) => r.phase === "measured" && r.blockAttempt === block)
        .map((r) => r.method),
      orderFor(block),
    );
});
test("failed pairs are retained, successful counterparts excluded explicitly, replacements bounded", async () => {
  const records: Attempt[] = [];
  await collectBlocks(
    "measured",
    2,
    3,
    async (block, order, method) => {
      const record = attempt(method, block, order);
      if (block === 1 && method === "raster") {
        record.status = "invalid";
        record.reason = "simulated failure";
      }
      records.push(record);
      return record;
    },
    async () => {},
  );
  assert.equal(records.length, 6);
  assert.equal(records[0].status, "valid");
  assert.equal(records[0].includedInPrimaryAnalysis, false);
  assert.equal(records.filter((r) => r.includedInPrimaryAnalysis).length, 4);
  await assert.rejects(
    collectBlocks(
      "measured",
      2,
      1,
      async (b, o, m) => attempt(m, b, o),
      async () => {},
    ),
    /incomplete/,
  );
});
test("interruption starts no additional exporter", async () => {
  const controller = new AbortController();
  controller.abort();
  let called = false;
  await assert.rejects(
    collectBlocks(
      "measured",
      1,
      1,
      async (b, o, m) => {
        called = true;
        return attempt(m, b, o);
      },
      async () => {},
      controller.signal,
    ),
  );
  assert.equal(called, false);
});
test("descriptive and paired statistics use the same accepted blocks; incomplete pairs do not crash", async () => {
  const records: Attempt[] = [];
  await collectBlocks(
    "measured",
    2,
    2,
    async (b, o, m) => {
      const r = attempt(m, b, o);
      records.push(r);
      return r;
    },
    async () => {},
  );
  const report = summarize(records);
  assert.equal(report.primaryAttempts, 4);
  assert.equal(report.statistics.direct.processTotalMs.mean, 10);
  assert.equal(report.paired.blocks[0].processDifferencePercent, 100);
  assert.equal(report.aggregatePercent.bytes, 100);
  assert.equal(summarize([records[0]]).primaryAttempts, 0);
  assert.equal(describe([1, 2, 3]).sampleStandardDeviation, 1);
  assert.equal(describe([1, 2, 3, 4]).median, 2.5);
  assert.equal(describe([1]).sampleStandardDeviation, null);
  assert.equal(describe([]).mean, null);
  assert.equal(percentDifference(0, 2), null);
});
test("CSV preserves Unicode, failures, delimiters, quotes and embedded newlines", () => {
  const output = csv(
    [{ reason: 'falha, "fonte"\nlinha 2', status: "invalid" }],
    ["reason", "status"],
  );
  assert.ok(output.startsWith("\uFEFF"));
  assert.ok(output.includes('"falha, ""fonte""\nlinha 2","invalid"'));
});
test("subprocess timing, exit failure, timeout and spawn errors preserve logs", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "agenda-executor-"));
  try {
    for (const [name, args, timeout] of [
      ["success", ["-e", 'console.log("ok");setTimeout(()=>{},60)'], 2000],
      ["failure", ["-e", 'console.error("failure");process.exit(3)'], 2000],
      ["timeout", ["-e", "setInterval(()=>{},1000)"], 100],
    ] as const) {
      const result = await executeProcess(process.execPath, [...args], {
        stdout: path.join(root, `${name}.out`),
        stderr: path.join(root, `${name}.err`),
        timeoutMs: timeout,
      });
      assert.ok(result.processTotalMs > 0);
      assert.ok(result.endedAt >= result.startedAt);
      if (name === "success") {
        assert.equal(result.exitCode, 0);
        assert.ok(result.processTotalMs >= 60);
        assert.match(
          await readFile(path.join(root, `${name}.out`), "utf8"),
          /ok/,
        );
      }
      if (name === "failure") {
        assert.equal(result.exitCode, 3);
        assert.match(
          await readFile(path.join(root, `${name}.err`), "utf8"),
          /failure/,
        );
      }
      if (name === "timeout") assert.equal(result.timedOut, true);
    }
    const bad = await executeProcess(path.join(root, "missing-program"), [], {
      stdout: path.join(root, "spawn.out"),
      stderr: path.join(root, "spawn.err"),
      timeoutMs: 2000,
    });
    assert.ok(bad.spawnError);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
test("PDF validation reads real pages/bytes and rejects stale or mismatched output", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "agenda-validation-"));
  try {
    const pdf = await PDFDocument.create();
    for (let i = 0; i < 34; i++) pdf.addPage([595.28, 841.89]);
    const bytes = await pdf.save();
    await writeFile(path.join(root, "agenda-direct.pdf"), bytes);
    const manifest = {
      method: "direct",
      pages: 34,
      bytes: bytes.length,
      url: "http://localhost",
      browser: "test",
      viewport: { width: 794, height: 1123 },
      deviceScaleFactor: 2,
      elapsedMs: 20,
      readiness: { montserrat: true },
      fontFailures: [],
    };
    await writeFile(path.join(root, "direct.json"), JSON.stringify(manifest));
    assert.equal(
      (
        await validateOutput(root, "direct", {
          url: "http://localhost",
          browser: "test",
        })
      ).pages,
      34,
    );
    await assert.rejects(
      validateOutput(root, "direct", { url: "wrong", browser: "test" }),
    );
    await writeFile(
      path.join(root, "agenda-direct.pdf"),
      await PDFDocument.create().then((doc) => {
        doc.addPage();
        return doc.save();
      }),
    );
    await assert.rejects(
      validateOutput(root, "direct", {
        url: "http://localhost",
        browser: "test",
      }),
      /page count/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("session directories never overwrite a prior session and artifacts remain ignored", async () => {
  const { newSession } = await import("../../scripts/experiment/protocol");
  const first = await newSession("pilot"),
    second = await newSession("pilot");
  try {
    assert.notEqual(first.directory, second.directory);
    await writeFile(path.join(first.directory, "sentinel.txt"), "retain");
    assert.equal(
      await readFile(path.join(first.directory, "sentinel.txt"), "utf8"),
      "retain",
    );
    const { execFileSync } = await import("node:child_process");
    assert.match(
      execFileSync(
        "git",
        ["check-ignore", path.join(first.directory, "sentinel.txt")],
        { encoding: "utf8" },
      ),
      /sentinel/,
    );
  } finally {
    await rm(first.directory, { recursive: true, force: true });
    await rm(second.directory, { recursive: true, force: true });
  }
});

test("post-collection cleanup deletes only raster PNGs and documents hashes; active sessions are refused", async () => {
  const { artifactRoot, appRoot } = await import(
    "../../scripts/experiment/protocol"
  );
  const { execFileSync } = await import("node:child_process");
  await mkdir(artifactRoot, { recursive: true });
  const directory = await mkdtemp(path.join(artifactRoot, "test-cleanup-"));
  const output = path.join(directory, "attempts", "measured-01-2-raster");
  await mkdir(path.join(output, "raster-pages"), { recursive: true });
  const image = path.join(output, "raster-pages", "page-01.png");
  await writeFile(image, "test-png");
  await writeFile(path.join(output, "agenda-raster.pdf"), "preserve");
  await writeFile(
    path.join(directory, "session.json"),
    JSON.stringify({ status: "collecting" }),
  );
  const command = path.join(appRoot, "scripts/experiment/clean-png.ts");
  try {
    assert.throws(() =>
      execFileSync(process.execPath, ["--import", "tsx", command, directory], {
        cwd: appRoot,
        stdio: "pipe",
      }),
    );
    assert.equal(await readFile(image, "utf8"), "test-png");
    await writeFile(
      path.join(directory, "session.json"),
      JSON.stringify({ status: "completed" }),
    );
    execFileSync(process.execPath, ["--import", "tsx", command, directory], {
      cwd: appRoot,
      stdio: "pipe",
    });
    await assert.rejects(readFile(image));
    assert.equal(
      await readFile(path.join(output, "agenda-raster.pdf"), "utf8"),
      "preserve",
    );
    const { readdir } = await import("node:fs/promises");
    const log = (await readdir(directory)).find((name) =>
      name.startsWith("cleanup-"),
    )!;
    const manifest = JSON.parse(
      await readFile(path.join(directory, log), "utf8"),
    );
    assert.equal(manifest.status, "completed");
    assert.equal(manifest.files[0].deleted, true);
    assert.equal(manifest.files[0].sha256.length, 64);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
