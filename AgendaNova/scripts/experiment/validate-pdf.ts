import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument } from "pdf-lib";
import { protocol, sha256, readJson, type Method } from "./protocol";
export async function validateOutput(
  directory: string,
  method: Method,
  expected: { url: string; browser: string },
) {
  const bytes = await readFile(path.join(directory, `agenda-${method}.pdf`));
  const pdf = await PDFDocument.load(bytes),
    manifest = await readJson(path.join(directory, `${method}.json`));
  assert.equal(pdf.getPageCount(), protocol.pages, "PDF page count");
  for (const page of pdf.getPages()) {
    assert.ok(Math.abs(page.getWidth() - 595.28) < 1, "A4 width");
    assert.ok(Math.abs(page.getHeight() - 841.89) < 1, "A4 height");
  }
  assert.equal(manifest.method, method);
  assert.equal(manifest.bytes, bytes.length);
  assert.equal(manifest.pages, protocol.pages);
  assert.equal(manifest.url, expected.url);
  assert.equal(manifest.browser, expected.browser);
  assert.deepEqual(manifest.viewport, protocol.viewport);
  assert.equal(manifest.deviceScaleFactor, protocol.deviceScaleFactor);
  assert.equal(manifest.readiness?.montserrat, true);
  assert.deepEqual(manifest.fontFailures, []);
  assert.ok(
    Number.isFinite(manifest.elapsedMs) && manifest.elapsedMs > 0,
    "Exporter timer",
  );
  return {
    bytes: bytes.length,
    pages: pdf.getPageCount(),
    exporterElapsedMs: manifest.elapsedMs,
    browser: manifest.browser,
    parameters: {
      viewport: manifest.viewport,
      deviceScaleFactor: manifest.deviceScaleFactor,
      media: protocol.media,
      reducedMotion: protocol.reducedMotion,
      ...(method === "direct"
        ? {
            format: "A4",
            preferCSSPageSize: true,
            printBackground: true,
            margin: 0,
            scale: 1,
            displayHeaderFooter: false,
          }
        : {
            image: "PNG",
            animations: "disabled",
            pagePoints: [595.28, 841.89],
            saveIntermediatePngs: true,
          }),
    },
    pdfSha256: sha256(bytes),
  };
}
