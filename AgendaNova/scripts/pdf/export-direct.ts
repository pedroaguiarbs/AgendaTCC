import { mkdir } from "node:fs/promises";
import path from "node:path";
import { preparePage, outputDirectory, writeMetrics } from "./prepare-page";
const start = performance.now();
const { browser, page, readiness, fontFailures } = await preparePage();
try {
  await mkdir(outputDirectory, { recursive: true });
  const bytes = await page.pdf({
    path: path.join(outputDirectory, "agenda-direct.pdf"),
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    scale: 1,
    displayHeaderFooter: false,
  });
  await writeMetrics("direct", start, page, bytes.length, {
    readiness,
    fontFailures,
  });
} finally {
  await browser.close();
}
