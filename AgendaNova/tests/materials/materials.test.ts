import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtemp,
  mkdir,
  writeFile,
  readFile,
  readdir,
  rm,
  symlink,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { PNG } from "pngjs";
import {
  type Attempt,
  csv,
  sha256,
  protocol,
  appRoot,
} from "../../scripts/experiment/protocol";
import { summarize } from "../../scripts/experiment/report";
import {
  buildMaterials,
  defaultAnalysis,
} from "../../scripts/materials/package";
import { folders } from "../../scripts/materials/model";
import { hashFile, parseCsv, walk, within } from "../../scripts/materials/io";
import { verifyMaterials } from "../../scripts/materials/verify";

async function fixture() {
  const root = await mkdtemp(
    path.join(os.tmpdir(), "TCC Área de Trabalho #100%-"),
  );
  const session = path.join(root, "dados-originais", "official-SYNTHETIC-TEST"),
    analysis = path.join(session, defaultAnalysis),
    output = path.join(root, "Material Monografia");
  await mkdir(analysis, { recursive: true });
  const records: Attempt[] = [];
  const json = async (file: string, value: unknown) => {
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, JSON.stringify(value));
  };
  for (const [phase, blocks] of [
    ["warmup", 2],
    ["measured", 10],
  ] as const)
    for (let b = 1; b <= blocks; b++)
      for (const [i, method] of (b % 2
        ? ["direct", "raster"]
        : ["raster", "direct"]
      ).entries()) {
        const id = `${phase}-${b}-${method}`,
          pdf = Buffer.from(`SYNTHETIC TEST ONLY - NOT A PDF - ${method}`);
        const record: Attempt = {
          id,
          phase,
          method: method as "direct" | "raster",
          blockAttempt: b,
          order: i + 1,
          acceptedBlock: b,
          commit: "fixture-not-a-real-commit",
          startedAt: "2000-01-01T00:00:00Z",
          status: "valid",
          includedInPrimaryAnalysis: phase === "measured",
          processTotalMs: 100 * b * (method === "direct" ? 1 : 2),
          exporterElapsedMs: 80 * b * (method === "direct" ? 1 : 2),
          bytes: pdf.length,
          pages: 34,
          pdfSha256: sha256(pdf),
        };
        records.push(record);
        await json(path.join(session, "attempts", id, "attempt.json"), record);
        await writeFile(
          path.join(session, "attempts", id, `agenda-${method}.pdf`),
          pdf,
        );
      }
  await json(path.join(session, "session.json"), {
    id: "official-SYNTHETIC-TEST",
    fixtureOnly: true,
    mode: "official",
    status: "completed",
    commit: "fixture-not-a-real-commit",
    buildHash: "synthetic-build",
    measuredBlocks: 10,
    warmupBlocks: 2,
    protocol,
  });
  await json(path.join(session, "summary.json"), {
    mode: "official",
    sessionStatus: "completed",
    primarySampleComplete: true,
    ...summarize(records),
  });
  await json(path.join(analysis, "analysis.json"), {
    session: "official-SYNTHETIC-TEST",
    status: "completed",
    buildHash: "synthetic-build",
    protocol,
    selectedPages: Array.from({ length: 34 }, (_, i) => i + 1),
  });
  const visuals: Record<string, unknown>[] = [],
    texts: Record<string, unknown>[] = [];
  for (const a of records.filter((a) => a.phase === "measured"))
    for (let page = 1; page <= 34; page++) {
      visuals.push({
        attemptId: a.id,
        method: a.method,
        page,
        meanAbsoluteError: a.method === "direct" ? 2 : 0,
        rootMeanSquareError: a.method === "direct" ? 3 : 0,
        changedFraction: a.method === "direct" ? 0.1 : 0,
      });
      for (const [i, query] of protocol.textQueries.entries())
        texts.push({
          attemptId: a.id,
          method: a.method,
          page,
          query,
          expected: i === 0,
          found: i === 0 && a.method === "direct",
          extractedCharacters: a.method === "direct" ? 10 : 0,
        });
    }
  await writeFile(
    path.join(analysis, "visual.csv"),
    csv(visuals, Object.keys(visuals[0])),
  );
  await writeFile(
    path.join(analysis, "text.csv"),
    csv(texts, Object.keys(texts[0])),
  );
  await writeFile(
    path.join(analysis, "qualitative.csv"),
    csv([{ status: "pending", notes: "" }], ["status", "notes"]),
  );
  await writeFile(path.join(session, "results.csv"), "synthetic test evidence");
  await json(path.join(analysis, "outcomes.json"), []);
  await mkdir(path.join(session, "source"));
  await json(path.join(session, "source", "package.json"), {
    fixtureOnly: true,
  });
  await json(path.join(session, "source", "package-lock.json"), {
    fixtureOnly: true,
  });
  const image = new PNG({ width: 2, height: 2 });
  image.data.fill(255);
  const png = PNG.sync.write(image);
  for (const page of [1, 5, 13, 34]) {
    await mkdir(path.join(analysis, "reference"), { recursive: true });
    await writeFile(path.join(analysis, "reference", `${page}.png`), png);
    for (const a of records.filter(
      (a) => a.phase === "measured" && a.acceptedBlock === 1,
    ))
      for (const kind of ["page", "diff"]) {
        await mkdir(path.join(analysis, a.id), { recursive: true });
        await writeFile(path.join(analysis, a.id, `${kind}-${page}.png`), png);
      }
  }
  return { root, session, analysis, output };
}
async function hashes(directory: string) {
  return Object.fromEntries(
    await Promise.all(
      (await walk(directory)).map(async (file) => [
        file,
        await hashFile(path.join(directory, file)),
      ]),
    ),
  );
}

test("RFC CSV parser handles BOM, multiline cells, delimiters and rejects malformed input", () => {
  assert.deepEqual(
    parseCsv('\uFEFF"a","b"\r\n"Área, café","linha 1\n""citada"""\r\n'),
    [{ a: "Área, café", b: 'linha 1\n"citada"' }],
  );
  assert.throws(() => parseCsv("a,a\n1,2"));
  assert.throws(() => parseCsv("a,b\n1"));
  assert.throws(() => parseCsv('a\n"open'));
  assert.throws(() => parseCsv('a\n"x"y'));
});
test("Windows drive and UNC path containment is case insensitive and not a string-prefix check", () => {
  assert.equal(
    within(
      "c:\\USERS\\Pedro\\Área de Trabalho\\Repo\\saida",
      "C:\\Users\\pedro\\Área de Trabalho\\repo",
      true,
    ),
    true,
  );
  assert.equal(within("C:\\Repo-externo", "C:\\Repo", true), false);
  assert.equal(
    within(
      "\\\\SERVIDOR\\Share\\Pasta\\Filho",
      "\\\\servidor\\share\\pasta",
      true,
    ),
    true,
  );
});
test("material package uses evidence, keeps sources intact, creates graphs/figures and permits repeat without overwrite", async () => {
  const f = await fixture();
  try {
    const before = await hashes(f.session);
    const first = await buildMaterials({
      session: f.session,
      output: f.output,
    });
    for (const folder of folders)
      assert.ok((await readdir(first)).includes(folder));
    const manifest = JSON.parse(
      await readFile(path.join(first, "manifest.json"), "utf8"),
    );
    assert.equal(manifest.status, "completo");
    assert.deepEqual(manifest.counts, {
      attempts: 24,
      warmups: 4,
      primary: 20,
      invalid: 0,
      visualRecords: 680,
      textChecks: 3400,
    });
    const stats = parseCsv(
      await readFile(
        path.join(first, folders[1], "descritivas-geracao.csv"),
        "utf8",
      ),
    );
    assert.equal(
      Number(
        stats.find(
          (r) => r.method === "direct" && r.metric === "processTotalMs",
        )!.mean,
      ),
      550,
    );
    const text = parseCsv(
      await readFile(
        path.join(first, folders[1], "pesquisa-textual.csv"),
        "utf8",
      ),
    );
    assert.equal(
      Number(text.find((r) => r.method === "direct")!.extractedCharacters),
      3400,
    ); // once per page, not five times
    assert.equal(Number(text.find((r) => r.method === "raster")!.recall), 0);
    const qualitative = path.join(first, folders[2], "avaliacao-editavel.csv");
    const review = parseCsv(await readFile(qualitative, "utf8"));
    assert.equal(review.length, 8);
    assert.ok(review.every((r) => r.legibility === "" && r.notes === ""));
    for (const name of ["tempo-pareado", "tamanho-pdf", "mae-por-pagina"]) {
      const png = PNG.sync.read(
        await readFile(path.join(first, folders[3], `${name}.png`)),
      );
      assert.equal(png.width, 2400);
      assert.equal(png.height, 1500);
    }
    await verifyMaterials(first, true);
    await writeFile(qualitative, "pesquisador preencheu este arquivo");
    const second = await buildMaterials({
      session: f.session,
      output: f.output,
    });
    assert.notEqual(first, second);
    assert.equal(
      await readFile(qualitative, "utf8"),
      "pesquisador preencheu este arquivo",
    );
    assert.equal((await verifyMaterials(first)).editedEditableFiles.length, 1);
    assert.deepEqual(await hashes(f.session), before);
    await writeFile(
      path.join(first, folders[3], "mae-por-pagina.png"),
      "corrupt",
    );
    await assert.rejects(verifyMaterials(first), /Hash divergente/);
  } finally {
    await rm(f.root, { recursive: true, force: true });
  }
});
test("missing required files and inconsistent summaries fail before producing a package", async () => {
  const f = await fixture();
  try {
    const summary = path.join(f.session, "summary.json"),
      saved = await readFile(summary);
    await rm(summary);
    await assert.rejects(
      buildMaterials({ session: f.session, output: f.output }),
      /Arquivo necessário/,
    );
    await assert.rejects(readdir(f.output));
    await writeFile(summary, saved);
    const modified = JSON.parse(saved.toString());
    modified.statistics.direct.bytes.mean = 999999;
    await writeFile(summary, JSON.stringify(modified));
    await assert.rejects(
      buildMaterials({ session: f.session, output: f.output }),
      /summary.json diverge/,
    );
  } finally {
    await rm(f.root, { recursive: true, force: true });
  }
});
test("source/repository outputs and symlink destinations cannot overwrite originals", async () => {
  const f = await fixture();
  try {
    for (const output of [
      f.session,
      path.join(f.session, "saida"),
      appRoot,
      path.join(appRoot, "artifacts", "materials-output"),
    ])
      await assert.rejects(
        buildMaterials({ session: f.session, output }),
        /externa/,
      );
    const link = path.join(f.root, "atalho");
    await symlink(
      f.session,
      link,
      process.platform === "win32" ? "junction" : "dir",
    );
    await assert.rejects(
      buildMaterials({ session: f.session, output: path.join(link, "saida") }),
      /externa/,
    );
    await assert.rejects(
      buildMaterials({
        session: f.session,
        analysis: "../analysis-escape",
        output: f.output,
      }),
      /somente o nome/,
    );
  } finally {
    await rm(f.root, { recursive: true, force: true });
  }
});
test("missing optional representative image is a documented pending item, never a generated substitute", async () => {
  const f = await fixture();
  try {
    await rm(path.join(f.analysis, "reference", "34.png"));
    const result = await buildMaterials({
      session: f.session,
      output: f.output,
    });
    const manifest = JSON.parse(
      await readFile(path.join(result, "manifest.json"), "utf8"),
    );
    assert.equal(manifest.status, "com-pendencias");
    assert.ok(manifest.pending.some((r: any) => r.source.endsWith("/34.png")));
    await assert.rejects(
      readFile(path.join(result, folders[4], "referencia-html-pagina-34.png")),
    );
  } finally {
    await rm(f.root, { recursive: true, force: true });
  }
});

test("documented CLI passes paths with spaces/accents and its verifier checks the generated package", async () => {
  const f = await fixture();
  try {
    const { execFileSync } = await import("node:child_process");
    const result = execFileSync(
      process.execPath,
      [
        "--import",
        "tsx",
        path.join(appRoot, "scripts/materials/cli.ts"),
        "--session",
        f.session,
        "--analysis",
        defaultAnalysis,
        "--output",
        f.output,
      ],
      { cwd: appRoot, encoding: "utf8" },
    );
    assert.match(result, /Pacote criado:/);
    const names = await readdir(f.output);
    assert.equal(names.length, 1);
    const check = execFileSync(
      process.execPath,
      [
        "--import",
        "tsx",
        path.join(appRoot, "scripts/materials/verify-cli.ts"),
        path.join(f.output, names[0]),
        "--check-sources",
      ],
      { cwd: appRoot, encoding: "utf8" },
    );
    const status = JSON.parse(check);
    assert.equal(status.status, "integridade-conferida");
    assert.ok(status.sourcesChecked > 24);
  } finally {
    await rm(f.root, { recursive: true, force: true });
  }
});
