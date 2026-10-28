import { chromium, type Page } from "playwright";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
export const outputDirectory = path.resolve(
  process.env.PDF_OUTPUT_DIR ?? "artifacts/pdf",
);
export const settings = {
  url: process.env.AGENDA_URL ?? "http://127.0.0.1:5173",
  viewport: { width: 794, height: 1123 },
  deviceScaleFactor: 2,
};
export async function preparePage(url = settings.url, referenceFonts = false) {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
  });
  try {
    const page = await browser.newPage({
      viewport: settings.viewport,
      deviceScaleFactor: settings.deviceScaleFactor,
    });
    if (referenceFonts) {
      // Test-only substitution of the original's external font stylesheet with the
      // same verified, locally retained Google Fonts files; source stays untouched.
      const css = (await readFile("src/styles/fonts.css", "utf8")).replaceAll(
        "/fonts/",
        new URL("/fonts/", settings.url).href,
      );
      await page.route("https://fonts.googleapis.com/**", (route) =>
        route.fulfill({ contentType: "text/css", body: css }),
      );
    }
    const failures: string[] = [];
    page.on("requestfailed", (request) =>
      failures.push(`${request.url()}: ${request.failure()?.errorText}`),
    );
    page.on("pageerror", (error) => failures.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 400)
        failures.push(`${response.status()}: ${response.url()}`);
    });
    await page.emulateMedia({ media: "print", reducedMotion: "reduce" });
    const response = await page.goto(url, { waitUntil: "networkidle" });
    if (!response?.ok())
      throw new Error(`Falha ao carregar ${url}: ${response?.status()}`);
    await page.locator(".sheet").first().waitFor();
    const readiness = await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(Array.from(document.images, (image) => image.decode()));
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
      const faces = await document.fonts.load("400 16px Montserrat");
      return {
        sheets: document.querySelectorAll(".sheet").length,
        montserrat:
          faces.length > 0 && faces.every((face) => face.status === "loaded"),
      };
    });
    if (readiness.sheets !== 34)
      throw new Error(`Esperadas 34 folhas; encontradas ${readiness.sheets}`);
    const fontFailures = failures.filter((item) =>
      /fonts\.googleapis\.com|fonts\.gstatic\.com/.test(item),
    );
    const errors = failures.filter((item) => !fontFailures.includes(item));
    if (errors.length) throw new Error(errors.join("\n"));
    if (!readiness.montserrat || fontFailures.length) {
      if (process.env.ALLOW_FALLBACK_FONT !== "1")
        throw new Error(
          "Montserrat indisponível. Libere Google Fonts ou use ALLOW_FALLBACK_FONT=1 para uma execução explicitamente com fonte alternativa.",
        );
      console.warn(
        "ATENÇÃO: execução com fonte alternativa; não usar como referência tipográfica definitiva.",
      );
    }
    return { browser, page, readiness, fontFailures };
  } catch (error) {
    await browser.close();
    throw error;
  }
}
export async function writeMetrics(
  method: string,
  start: number,
  page: Page,
  bytes: number,
  extra: object = {},
) {
  await mkdir(outputDirectory, { recursive: true });
  const manifest = {
    method,
    generatedAt: new Date().toISOString(),
    elapsedMs: performance.now() - start,
    bytes,
    pages: await page.locator(".sheet").count(),
    browser: page.context().browser()?.version(),
    ...settings,
    ...extra,
  };
  await writeFile(
    path.join(outputDirectory, `${method}.json`),
    JSON.stringify(manifest, null, 2),
  );
  console.log(JSON.stringify(manifest, null, 2));
}
