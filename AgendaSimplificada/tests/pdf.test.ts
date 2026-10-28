import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PDFDocument } from "pdf-lib";
for (const method of ["direct", "raster"]) {
  test(`${method}: generated artifact has 34 A4 pages and matching execution metadata`, async () => {
    const bytes = await readFile(`artifacts/pdf/agenda-${method}.pdf`);
    const document = await PDFDocument.load(bytes);
    assert.equal(document.getPageCount(), 34);
    for (const page of document.getPages()) {
      assert.ok(Math.abs(page.getWidth() - 595.28) < 1);
      assert.ok(Math.abs(page.getHeight() - 841.89) < 1);
    }
    const metadata = JSON.parse(
      await readFile(`artifacts/pdf/${method}.json`, "utf8"),
    );
    assert.equal(metadata.bytes, bytes.length);
    assert.equal(metadata.pages, 34);
    assert.equal(metadata.variant, "AgendaSimplificada");
    assert.equal(metadata.visualProfile, "solid-colors-no-effects");
    assert.equal(metadata.readiness.montserrat, true);
    assert.deepEqual(metadata.fontFailures, []);
  });
}
