// export-pdf-raster.js (CommonJS)
const { chromium } = require("playwright");
const { PDFDocument } = require("pdf-lib");
const fs = require("fs");

(async () => {
  const url = "http://127.0.0.1:5501/index.html";

  const browser = await chromium.launch();
  const page = await browser.newPage({
    // A4 aproximado em CSS px (96dpi). Com deviceScaleFactor 2 fica bem nítido.
    viewport: { width: 794, height: 1123 },
    deviceScaleFactor: 2,
  });

  await page.goto(url, { waitUntil: "networkidle" });

  // Força regras de print (importantíssimo pro layout bater com o PDF)
  await page.emulateMedia({ media: "print" });

  // Aguarda fontes (se existir)
  await page.evaluate(() => document.fonts?.ready);

  // Pausa curta pro layout estabilizar
  await page.waitForTimeout(500);

  const sheetLocator = page.locator(".sheet");
  const count = await sheetLocator.count();

  if (!count) {
    throw new Error(
      "Nenhuma .sheet encontrada. Verifique se a classe está correta.",
    );
  }

  const pdfDoc = await PDFDocument.create();

  // A4 em pontos no PDF
  const A4_W = 595.28;
  const A4_H = 841.89;

  // (Opcional) cria pasta pra não poluir raiz
  const outDir = "./__raster_pages";
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  for (let i = 0; i < count; i++) {
    const loc = sheetLocator.nth(i);

    // Garante que está "vivo" e visível
    await loc.waitFor({ state: "visible" });

    // Tenta trazer pro viewport (não falha se não conseguir)
    try {
      await loc.scrollIntoViewIfNeeded();
    } catch (_) {}

    const pngPath = `${outDir}/page_${String(i + 1).padStart(2, "0")}.png`;

    // Screenshot direto do locator (mais robusto que ElementHandle)
    await loc.screenshot({ path: pngPath });

    const pngBytes = fs.readFileSync(pngPath);
    const pngImage = await pdfDoc.embedPng(pngBytes);

    const pdfPage = pdfDoc.addPage([A4_W, A4_H]);
    pdfPage.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: A4_W,
      height: A4_H,
    });
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync("Agenda-2026-Bloco2-Raster.pdf", pdfBytes);

  await browser.close();
  console.log("✅ PDF raster gerado: Agenda-2026-Bloco2-Raster.pdf");
})();
