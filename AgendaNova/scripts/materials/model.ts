import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { type Attempt, describe, sha256 } from "../experiment/protocol";
import { summarize } from "../experiment/report";
import { parseCsv, numeric, boolean, regularFile } from "./io";
export const representativePages = [1, 5, 13, 34];
export const folders = [
  "01-Protocolo-e-Ambiente",
  "02-Dados-Quantitativos",
  "03-Avaliacao-Qualitativa",
  "04-Graficos-e-Tabelas",
  "05-Figuras-e-Capturas",
  "06-Referencias-e-Normas",
];
export type Row = Record<string, unknown>;
export async function loadModel(
  sessionDirectory: string,
  analysisName: string,
) {
  if (!/^analysis-[A-Za-z0-9-]+$/.test(analysisName))
    throw new Error(
      "Informe somente o nome da pasta analysis-..., sem caminhos relativos",
    );
  const analysisDirectory = path.join(sessionDirectory, analysisName),
    loaded = new Map<string, string>();
  async function bytes(file: string) {
    await regularFile(file);
    const b = await readFile(file);
    loaded.set(file, sha256(b));
    return b;
  }
  const json = async (file: string) =>
    JSON.parse((await bytes(file)).toString("utf8"));
  const session = await json(path.join(sessionDirectory, "session.json"));
  const summary = await json(path.join(sessionDirectory, "summary.json"));
  const analysis = await json(path.join(analysisDirectory, "analysis.json"));
  assert.equal(
    session.mode,
    "official",
    "A ferramenta acadêmica exige sessão oficial; não use um piloto",
  );
  assert.equal(session.status, "completed", "Coleta incompleta");
  assert.equal(
    summary.primarySampleComplete,
    true,
    "Amostra principal incompleta",
  );
  assert.equal(analysis.status, "completed", "Análise incompleta");
  assert.equal(analysis.session, session.id, "Análise pertence a outra sessão");
  assert.equal(
    analysis.buildHash,
    session.buildHash,
    "Build divergente entre sessão e análise",
  );
  assert.equal(summary.mode, "official");
  assert.equal(summary.sessionStatus, "completed");
  const attempts: Attempt[] = [];
  for (const name of (
    await readdir(path.join(sessionDirectory, "attempts"))
  ).sort()) {
    const record = (await json(
      path.join(sessionDirectory, "attempts", name, "attempt.json"),
    )) as Attempt;
    assert.equal(record.id, name, "ID de tentativa divergente da pasta");
    assert.ok(
      ["direct", "raster"].includes(record.method),
      "Método desconhecido",
    );
    assert.equal(record.commit, session.commit, "Commit divergente");
    attempts.push(record);
  }
  const recomputed = summarize(attempts);
  // Structural summary equality follows the existing consolidator, not rounded presentation values.
  assert.deepEqual(
    summary.statistics,
    recomputed.statistics,
    "summary.json diverge dos manifestos de tentativas",
  );
  assert.deepEqual(
    summary.paired,
    recomputed.paired,
    "Diferenças pareadas inconsistentes",
  );
  assert.deepEqual(
    summary.aggregatePercent,
    recomputed.aggregatePercent,
    "Diferenças percentuais inconsistentes",
  );
  for (const key of [
    "totalAttempts",
    "invalidAttempts",
    "unfinishedAttempts",
    "primaryAttempts",
  ] as const)
    assert.equal(summary[key], recomputed[key], key);
  const primary = attempts.filter(
    (a) =>
      a.phase === "measured" &&
      a.status === "valid" &&
      a.includedInPrimaryAnalysis,
  );
  assert.equal(
    primary.length,
    numeric(session.measuredBlocks, "measuredBlocks") * 2,
  );
  assert.equal(new Set(attempts.map((a) => a.id)).size, attempts.length);
  for (const method of ["direct", "raster"]) {
    assert.equal(
      primary.filter((a) => a.method === method).length,
      session.measuredBlocks,
    );
    assert.equal(
      attempts.filter(
        (a) =>
          a.phase === "warmup" &&
          a.status === "valid" &&
          a.method === method &&
          a.acceptedBlock !== null,
      ).length,
      session.warmupBlocks,
    );
  }
  const pages = numeric(session.protocol?.pages, "protocol.pages");
  assert.ok(Number.isInteger(pages) && pages >= 34);
  assert.deepEqual(
    [...analysis.selectedPages].sort((a: number, b: number) => a - b),
    Array.from({ length: pages }, (_, i) => i + 1),
    "A análise deve cobrir todas as páginas",
  );
  for (const a of primary)
    assert.equal(a.pages, pages, "Quantidade de páginas divergente");
  for (const a of primary)
    for (const key of [
      "processTotalMs",
      "exporterElapsedMs",
      "bytes",
      "pages",
    ] as const)
      assert.ok(numeric(a[key], `${a.id}.${key}`) >= 0);
  const visuals = parseCsv(
    (await bytes(path.join(analysisDirectory, "visual.csv"))).toString("utf8"),
  );
  const text = parseCsv(
    (await bytes(path.join(analysisDirectory, "text.csv"))).toString("utf8"),
  );
  const eligible = new Map(primary.map((a) => [a.id, a]));
  const visualKeys = new Set<string>(),
    textKeys = new Set<string>();
  for (const row of visuals) {
    const attempt = attempts.find((a) => a.id === row.attemptId);
    assert.ok(
      attempt && attempt.method === row.method,
      "Referência de tentativa visual desconhecida",
    );
    const page = numeric(row.page, "visual.page");
    assert.ok(Number.isInteger(page) && page >= 1 && page <= pages);
    const key = `${row.attemptId}:${page}`;
    assert.ok(!visualKeys.has(key), "Registro visual duplicado");
    visualKeys.add(key);
    for (const field of [
      "meanAbsoluteError",
      "rootMeanSquareError",
      "changedFraction",
    ])
      assert.ok(numeric(row[field], `visual.${field}`) >= 0);
    assert.ok(
      Number(row.meanAbsoluteError) <= 255 &&
        Number(row.rootMeanSquareError) <= 255,
    );
    assert.ok(numeric(row.changedFraction, "changedFraction") <= 1);
  }
  for (const row of text) {
    const attempt = attempts.find((a) => a.id === row.attemptId);
    assert.ok(
      attempt && attempt.method === row.method,
      "Referência textual desconhecida",
    );
    const page = numeric(row.page, "text.page");
    assert.ok(Number.isInteger(page) && page >= 1 && page <= pages);
    const key = `${row.attemptId}:${page}:${row.query}`;
    assert.ok(!textKeys.has(key), "Registro textual duplicado");
    textKeys.add(key);
    boolean(row.expected, "expected");
    boolean(row.found, "found");
    assert.ok(numeric(row.extractedCharacters, "extractedCharacters") >= 0);
  }
  const queries: string[] = analysis.protocol?.textQueries;
  assert.ok(
    Array.isArray(queries) && queries.length > 0,
    "Consultas textuais ausentes",
  );
  for (const a of primary)
    for (let page = 1; page <= pages; page++) {
      assert.ok(
        visualKeys.has(`${a.id}:${page}`),
        `Registro visual ausente: ${a.id}, página ${page}`,
      );
      for (const query of queries)
        assert.ok(
          textKeys.has(`${a.id}:${page}:${query}`),
          `Registro textual ausente: ${a.id}, página ${page}, ${query}`,
        );
    }
  const quantitative: Row[] = [];
  for (const method of ["direct", "raster"])
    for (const metric of [
      "processTotalMs",
      "exporterElapsedMs",
      "bytes",
      "pages",
    ])
      quantitative.push({
        method,
        metric,
        unit: metric.endsWith("Ms")
          ? "ms"
          : metric === "bytes"
            ? "bytes"
            : "páginas",
        ...summary.statistics[method][metric],
        source: "summary.json; attempts/*/attempt.json",
      });
  const visualSummary: Row[] = [],
    visualByPage: Row[] = [];
  for (const method of ["direct", "raster"]) {
    const selected = visuals.filter(
      (r) => r.method === method && eligible.has(r.attemptId),
    );
    for (const metric of [
      "meanAbsoluteError",
      "rootMeanSquareError",
      "changedFraction",
    ])
      visualSummary.push({
        method,
        metric,
        unit:
          metric === "changedFraction"
            ? "fração de pixels"
            : "níveis RGB (0–255)",
        ...describe(selected.map((r) => numeric(r[metric], metric))),
        scope: "páginas × medições; não são réplicas independentes",
        source: `${analysisName}/visual.csv`,
      });
    for (let page = 1; page <= pages; page++)
      visualByPage.push({
        method,
        page,
        ...describe(
          selected
            .filter((r) => Number(r.page) === page)
            .map((r) => numeric(r.meanAbsoluteError, "MAE")),
        ),
        source: `${analysisName}/visual.csv`,
      });
  }
  const textual: Row[] = [];
  for (const method of ["direct", "raster"]) {
    const selected = text.filter(
        (r) => r.method === method && eligible.has(r.attemptId),
      ),
      expected = selected.filter((r) => boolean(r.expected, "expected"));
    const found = expected.filter((r) => boolean(r.found, "found")).length;
    const uniquePages = new Map<string, number>();
    for (const r of selected) {
      const key = `${r.attemptId}:${r.page}`;
      const size = numeric(r.extractedCharacters, "characters");
      if (uniquePages.has(key))
        assert.equal(
          uniquePages.get(key),
          size,
          "Caracteres inconsistentes na mesma página",
        );
      uniquePages.set(key, size);
    }
    textual.push({
      method,
      totalChecks: selected.length,
      expectedQueries: expected.length,
      expectedQueriesFound: found,
      recall: expected.length ? found / expected.length : null,
      unexpectedMatches: selected.filter(
        (r) => !boolean(r.expected, "expected") && boolean(r.found, "found"),
      ).length,
      pageInstances: uniquePages.size,
      extractedCharacters: [...uniquePages.values()].reduce((a, b) => a + b, 0),
      interpretation:
        "recuperação das consultas definidas; não é porcentagem de todo o conteúdo preservado; sem OCR",
      source: `${analysisName}/text.csv`,
    });
  }
  const block = Math.min(...primary.map((a) => a.acceptedBlock!));
  const representatives = primary.filter((a) => a.acceptedBlock === block);
  assert.equal(representatives.length, 2);
  return {
    sessionDirectory,
    analysisDirectory,
    analysisName,
    session,
    summary,
    analysis,
    attempts,
    primary,
    visuals,
    text,
    quantitative,
    visualSummary,
    visualByPage,
    textual,
    representatives,
    loaded,
    bytes,
  };
}
export type Model = Awaited<ReturnType<typeof loadModel>>;
