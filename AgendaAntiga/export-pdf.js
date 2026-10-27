// export-pdf.js (CommonJS)
const { chromium } = require("playwright");

(async () => {
  try {
    const url = "http://127.0.0.1:5501/index.html";

    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Aguarda tudo carregar (HTML, CSS, fontes)
    await page.goto(url, { waitUntil: "networkidle" });

    // Pequena pausa para garantir renderização final
    await page.waitForTimeout(300);

    await page.pdf({
      path: "Agenda-2026-Bloco2.pdf",
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "0mm",
        right: "0mm",
        bottom: "0mm",
        left: "0mm",
      },
      scale: 1,
      displayHeaderFooter: false,
    });

    await browser.close();
    console.log("✅ PDF gerado com sucesso: Agenda-2026-Bloco2.pdf");
  } catch (err) {
    console.error("❌ Erro ao gerar o PDF:", err);
    process.exit(1);
  }
})();
