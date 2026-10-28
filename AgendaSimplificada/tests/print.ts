import type { Page } from "playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { preparePage } from "../scripts/pdf/prepare-page";
const referenceRoot = path.resolve("../AgendaAntiga");
const originalServer = createServer(async (request, response) => {
  const file = path.resolve(
    referenceRoot,
    "." + new URL(request.url!, "http://localhost").pathname,
  );
  if (!file.startsWith(referenceRoot + path.sep)) {
    response.writeHead(403).end();
    return;
  }
  try {
    const bytes = await readFile(file);
    response.setHeader(
      "Content-Type",
      file.endsWith(".css") ? "text/css" : "text/html; charset=utf-8",
    );
    response.end(bytes);
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise<void>((resolve) =>
  originalServer.listen(0, "127.0.0.1", resolve),
);
const address = originalServer.address();
if (!address || typeof address === "string")
  throw new Error("Reference server failed");
const referenceUrl = `http://127.0.0.1:${address.port}/index.html`;
let current: Awaited<ReturnType<typeof preparePage>> | undefined;
let original: Awaited<ReturnType<typeof preparePage>> | undefined;
try {
  current = await preparePage();
  original = await preparePage(referenceUrl, true);
  assert.equal(
    current.readiness.montserrat,
    original.readiness.montserrat,
    "Font conditions must match",
  );
  const snapshot = async (page: Page) =>
    page.locator(".sheet").evaluateAll((sheets) =>
      sheets.map((sheet) => {
        const base = sheet.getBoundingClientRect();
        return {
          text: sheet.textContent!.replace(/\s+/g, ""),
          label: sheet.getAttribute("aria-label"),
          width: Math.round(base.width * 100) / 100,
          height: Math.round(base.height * 100) / 100,
          // Leaf content is independent of incidental whitespace between block elements.
          leaves: Array.from(sheet.querySelectorAll("*"))
            .filter((node) => !node.children.length && node.textContent?.trim())
            .map((node) => ({
              text: node.textContent!.replace(/\s+/g, " ").trim(),
              className: node.getAttribute("class"),
              x:
                Math.round((node.getBoundingClientRect().x - base.x) * 100) /
                100,
              y:
                Math.round((node.getBoundingClientRect().y - base.y) * 100) /
                100,
              width: Math.round(node.getBoundingClientRect().width * 100) / 100,
              height:
                Math.round(node.getBoundingClientRect().height * 100) / 100,
            })),
        };
      }),
    );
  const actual = await snapshot(current.page),
    expected = await snapshot(original.page);
  await mkdir("artifacts/validation", { recursive: true });
  await writeFile(
    "artifacts/validation/geometry.json",
    JSON.stringify({ actual, expected }, null, 2),
  );
  const differences = actual.flatMap((sheet, index) =>
    JSON.stringify(sheet) === JSON.stringify(expected[index])
      ? []
      : [index + 1],
  );
  assert.deepEqual(
    differences,
    [],
    "Sheets with different content/layout; see artifacts/validation/geometry.json",
  );
  // Representative page families; all pages are checked for geometry above.
  for (const index of [0, 2, 3, 4, 7, 12, 14, 33]) {
    const a = await current.page
      .locator(".sheet")
      .nth(index)
      .screenshot({ path: `artifacts/validation/new-${index + 1}.png` });
    const b = await original.page
      .locator(".sheet")
      .nth(index)
      .screenshot({ path: `artifacts/validation/original-${index + 1}.png` });
    assert.ok(a.length > 0 && b.length > 0, "Captures must be nonempty");
  }
  const effects = await current.page.locator(".sheet").evaluateAll((sheets) =>
    sheets.flatMap((sheet, index) =>
      [sheet, ...sheet.querySelectorAll("*")].flatMap((element) =>
        [null, "::before", "::after"].flatMap((pseudo) => {
          const style = getComputedStyle(element, pseudo);
          if (style.display === "none") return [];
          const unexpected = [
            "background-image",
            "box-shadow",
            "text-shadow",
            "filter",
            "backdrop-filter",
          ].filter(
            (property) =>
              !["none", ""].includes(style.getPropertyValue(property)),
          );
          if (style.opacity !== "1") unexpected.push("opacity");
          const background = style.backgroundColor;
          if (
            background.startsWith("rgba(") &&
            !/[, /]\s*(0|1)\)$/.test(background)
          )
            unexpected.push("translucent-background");
          return unexpected.length
            ? [
                {
                  page: index + 1,
                  className: element.getAttribute("class"),
                  pseudo,
                  unexpected,
                },
              ]
            : [];
        }),
      ),
    ),
  );
  assert.deepEqual(
    effects,
    [],
    "Simplified print must contain only solid fills, with no expensive effects",
  );
  for (const width of [1440, 794]) {
    await Promise.all(
      [current.page, original.page].map(async (page) => {
        await page.emulateMedia({ media: "screen" });
        await page.setViewportSize({ width, height: 1123 });
      }),
    );
    const screenActual = await snapshot(current.page);
    const screenExpected = await snapshot(original.page);
    const screenDifferences = screenActual.flatMap((sheet, index) =>
      JSON.stringify(sheet) === JSON.stringify(screenExpected[index])
        ? []
        : [index + 1],
    );
    await writeFile(
      `artifacts/validation/screen-${width}.json`,
      JSON.stringify(
        { actual: screenActual, expected: screenExpected },
        null,
        2,
      ),
    );
    assert.deepEqual(
      screenDifferences,
      [],
      `Screen differences at viewport width ${width}`,
    );
  }
  console.log(
    "PASS: 34 sheets match content/geometry; 8 representative sheets captured for review; desktop/mobile geometry matches; no expensive print effects.",
  );
} finally {
  await current?.browser.close();
  await original?.browser.close();
  originalServer.closeAllConnections();
  originalServer.close();
}
