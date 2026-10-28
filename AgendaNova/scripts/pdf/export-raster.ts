import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument } from "pdf-lib";
import { preparePage, outputDirectory, writeMetrics } from "./prepare-page";
const start = performance.now();
const { browser, page, readiness, fontFailures } = await preparePage();
try {
  const imageDirectory = path.join(outputDirectory, "raster-pages");
  await mkdir(imageDirectory, { recursive: true });
  const document = await PDFDocument.create();
  const sheets = page.locator(".sheet");
  for (let index = 0; index < readiness.sheets; index++) {
    const imageBytes = await sheets
      .nth(index)
      .screenshot({
        path: path.join(
          imageDirectory,
          `page-${String(index + 1).padStart(2, "0")}.png`,
        ),
        animations: "disabled",
      });
    const image = await document.embedPng(imageBytes);
    document
      .addPage([595.28, 841.89])
      .drawImage(image, { x: 0, y: 0, width: 595.28, height: 841.89 });
  }
  const bytes = await document.save();
  await writeFile(path.join(outputDirectory, "agenda-raster.pdf"), bytes);
  await writeMetrics("raster", start, page, bytes.length, {
    readiness,
    fontFailures,
  });
} finally {
  await browser.close();
}
