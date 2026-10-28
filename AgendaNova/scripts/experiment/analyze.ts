import assert from "node:assert/strict";
import { appendFileSync } from "node:fs";
import { format } from "node:util";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createCanvas } from "@napi-rs/canvas";
import {
  getDocument,
  version as pdfjsVersion,
} from "pdfjs-dist/legacy/build/pdf.mjs";
import { PNG } from "pngjs";
import { preview } from "vite";
import { preparePage } from "../pdf/prepare-page";
import {
  appRoot,
  sessionDirectory,
  csv,
  fingerprint,
  json,
  protocol,
  readJson,
  sha256,
} from "./protocol";
import { loadAttempts } from "./report";
export function normalizeText(text: string) {
  return text
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("pt-BR");
}
export function comparePixels(
  actual: PNG,
  reference: PNG,
  threshold: number = protocol.visual.channelThreshold,
) {
  assert.equal(actual.width, reference.width);
  assert.equal(actual.height, reference.height);
  const diff = new PNG({ width: actual.width, height: actual.height });
  let changed = 0,
    sum = 0,
    squares = 0;
  for (let pixel = 0; pixel < actual.width * actual.height; pixel++) {
    let max = 0;
    for (let channel = 0; channel < 3; channel++) {
      const delta = Math.abs(
        actual.data[pixel * 4 + channel] - reference.data[pixel * 4 + channel],
      );
      sum += delta;
      squares += delta * delta;
      max = Math.max(max, delta);
    }
    if (max > threshold) changed++;
    diff.data[pixel * 4] = max > threshold ? 255 : reference.data[pixel * 4];
    diff.data[pixel * 4 + 1] =
      max > threshold ? 0 : reference.data[pixel * 4 + 1];
    diff.data[pixel * 4 + 2] =
      max > threshold ? 0 : reference.data[pixel * 4 + 2];
    diff.data[pixel * 4 + 3] = 255;
  }
  const channels = actual.width * actual.height * 3;
  return {
    meanAbsoluteError: sum / channels,
    rootMeanSquareError: Math.sqrt(squares / channels),
    changedPixels: changed,
    changedFraction: changed / (actual.width * actual.height),
    channelThreshold: threshold,
    diff,
  };
}
async function analyze() {
  const directory = await sessionDirectory(process.argv[2]);
  const session = await readJson(path.join(directory, "session.json"));
  if (session.status !== "completed")
    throw new Error(
      "Analyze only a completed collection; interrupted attempts and PDFs remain available for diagnosis.",
    );
  assert.deepEqual(session.protocol, protocol, 'Protocol differs from the collected session; use the source snapshot for analysis');
  let selectedPages = Array.from({ length: protocol.pages }, (_, i) => i + 1);
  if (process.argv[3]) {
    if (session.mode !== "pilot" || process.argv[3] !== "--pilot-pages")
      throw new Error("Page subsets are restricted to the pilot");
    selectedPages = process.argv[4]?.split(",").map(Number) ?? [];
    if (
      !selectedPages.length ||
      selectedPages.some((n) => !Number.isInteger(n) || n < 1 || n > 34) ||
      new Set(selectedPages).size !== selectedPages.length
    )
      throw new Error("Invalid page list");
  }
  assert.equal(
    sha256(JSON.stringify(await fingerprint(path.join(directory, "build")))),
    session.buildHash,
    "Retained build changed",
  );
  assert.equal(
    sha256(await readFile(session.browserExecutable)),
    session.browserExecutableHash,
    "Browser changed",
  );
  const analysis = path.join(
    directory,
    `analysis-${new Date().toISOString().replace(/[:.]/g, "-")}`,
  );
  await mkdir(analysis);
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
  };
  for (const level of ["log", "warn", "error"] as const) {
    console[level] = (...args: unknown[]) => {
      appendFileSync(
        path.join(analysis, level === "log" ? "stdout.log" : "stderr.log"),
        format(...args) + "\n",
      );
      originalConsole[level](...args);
    };
  }
  const analysisManifest: any = {
    status: "running",
    createdAt: new Date().toISOString(),
    session: session.id,
    buildHash: session.buildHash,
    pdfjsVersion,
    node: process.version,
    analyzerHash: sha256(
      await readFile(path.join(appRoot, "scripts/experiment/analyze.ts")),
    ),
    protocol: session.protocol,
    selectedPages,
    referenceBias:
      "HTML screenshots may favor raster; indicators are complementary, not a quality verdict.",
  };
  await json(path.join(analysis, "analysis.json"), analysisManifest);
  process.env.CHROMIUM_PATH = session.browserExecutable;
  delete process.env.ALLOW_FALLBACK_FONT;
  let server: Awaited<ReturnType<typeof preview>> | undefined;
  try {
    const url = new URL(session.url);
    server = await preview({
      root: appRoot,
      configFile: path.join(appRoot, "vite.config.ts"),
      build: { outDir: path.join(directory, "build") },
      preview: { host: url.hostname, port: Number(url.port), strictPort: true },
    });
    const reference = await preparePage(session.url);
    const referenceText: string[] = [];
    try {
      assert.equal(reference.browser.version(), session.browser);
      referenceText.push(
        ...(await reference.page.locator(".sheet").allInnerTexts()),
      );
      await mkdir(path.join(analysis, "reference"));
      for (const page of selectedPages)
        await reference.page
          .locator(".sheet")
          .nth(page - 1)
          .screenshot({
            path: path.join(analysis, "reference", `${page}.png`),
            animations: "disabled",
          });
    } finally {
      await reference.browser.close();
    }
    await writeFile(
      path.join(analysis, "reference-text.json"),
      JSON.stringify(referenceText, null, 2),
    );
    const textRows: any[] = [],
      visualRows: any[] = [],
      reviewRows: any[] = [];
    const outcomes: any[] = [];
    for (const attempt of (await loadAttempts(directory)).filter(
      (a) => a.phase === "measured",
    )) {
      const outcome: any = {
        attemptId: attempt.id,
        status: "running",
        includedInPrimaryAnalysis: attempt.includedInPrimaryAnalysis,
      };
      outcomes.push(outcome);
      const output = path.join(analysis, attempt.id);
      await mkdir(output);
      try {
        const bytes = await readFile(
          path.join(
            directory,
            "attempts",
            attempt.id,
            `agenda-${attempt.method}.pdf`,
          ),
        );
        if (attempt.pdfSha256)
          assert.equal(
            sha256(bytes),
            attempt.pdfSha256,
            "Preserved PDF changed",
          );
        const loadingTask = getDocument({
          data: new Uint8Array(bytes),
          useSystemFonts: false,
          standardFontDataUrl: path.join(
            appRoot,
            "node_modules/pdfjs-dist/standard_fonts/",
          ),
          cMapUrl: path.join(appRoot, "node_modules/pdfjs-dist/cmaps/"),
          cMapPacked: true,
          wasmUrl: path.join(appRoot, "node_modules/pdfjs-dist/wasm/"),
        });
        const document = await loadingTask.promise;
        const extracted: string[] = [];
        try {
          for (let number = 1; number <= document.numPages; number++) {
            const page = await document.getPage(number),
              content = await page.getTextContent();
            const text = content.items
              .map((item) =>
                "str" in item
                  ? item.str + ("hasEOL" in item && item.hasEOL ? "\n" : " ")
                  : "",
              )
              .join("");
            extracted.push(text);
            for (const query of protocol.textQueries)
              textRows.push({
                attemptId: attempt.id,
                method: attempt.method,
                page: number,
                query,
                expected: normalizeText(
                  referenceText[number - 1] ?? "",
                ).includes(normalizeText(query)),
                found: normalizeText(text).includes(normalizeText(query)),
                extractedCharacters: text.length,
                interpretation:
                  attempt.method === "raster"
                    ? "image-only; no OCR"
                    : "embedded text",
              });
            if (selectedPages.includes(number)) {
              const expected = PNG.sync.read(
                await readFile(
                  path.join(analysis, "reference", `${number}.png`),
                ),
              );
              const viewport = page.getViewport({
                scale: expected.width / page.getViewport({ scale: 1 }).width,
              });
              const canvas = createCanvas(expected.width, expected.height);
              const verticalNormalization = expected.height / viewport.height;
              await page.render({
                canvas: canvas as unknown as HTMLCanvasElement,
                viewport,
                transform: [1, 0, 0, verticalNormalization, 0, 0],
                background: "rgb(255,255,255)",
              }).promise;
              const rendered = canvas.toBuffer("image/png");
              await writeFile(
                path.join(output, `page-${number}.png`),
                rendered,
              );
              const { diff, ...metrics } = comparePixels(
                PNG.sync.read(rendered),
                expected,
              );
              await writeFile(
                path.join(output, `diff-${number}.png`),
                PNG.sync.write(diff),
              );
              visualRows.push({
                attemptId: attempt.id,
                method: attempt.method,
                page: number,
                pagePoints: page.view,
                width: expected.width,
                height: expected.height,
                scale: viewport.scale,
                verticalNormalization,
                ...metrics,
              });
              reviewRows.push({
                attemptId: attempt.id,
                method: attempt.method,
                page: number,
                status: "pending",
                viewer: "",
                device: "",
                reviewer: "",
                legibility: "",
                sharpness: "",
                cuts: "",
                overlaps: "",
                zoom100: "",
                zoom200: "",
                zoom400: "",
                notes: "",
              });
            }
            page.cleanup();
          }
        } finally {
          await loadingTask.destroy();
        }
        await json(path.join(output, "text.json"), extracted);
        outcome.status = "completed";
      } catch (error) {
        outcome.status = "failed";
        outcome.error = String(error);
      }
      await json(path.join(analysis, "outcomes.json"), outcomes);
      console.log(`Analysis ${attempt.id}: ${outcome.status}`);
    }
    for (const [name, rows] of [
      ["text", textRows],
      ["visual", visualRows],
      ["qualitative", reviewRows],
    ] as const)
      await writeFile(
        path.join(analysis, `${name}.csv`),
        csv(rows, rows.length ? Object.keys(rows[0]) : ["attemptId"]),
      );
    analysisManifest.status = outcomes.some((o) => o.status !== "completed")
      ? "partial"
      : "completed";
    analysisManifest.outcomes = outcomes;
    analysisManifest.qualitative =
      "Pending human review; no automated claim of legibility, sharpness or mobile compatibility";
  } catch (error) {
    analysisManifest.status = "failed";
    analysisManifest.error = String(error);
    process.exitCode = 1;
  } finally {
    if (server)
      await new Promise<void>((resolve) => {
        if ("closeAllConnections" in server!.httpServer)
          server!.httpServer.closeAllConnections();
        server!.httpServer.close(() => resolve());
      });
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    analysisManifest.finishedAt = new Date().toISOString();
    await json(path.join(analysis, "analysis.json"), analysisManifest);
    console.log(`Analysis results: ${analysis}`);
    if (analysisManifest.status !== "completed") process.exitCode = 1;
  }
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) ===
    path.join(appRoot, "scripts/experiment/analyze.ts")
)
  await analyze();
