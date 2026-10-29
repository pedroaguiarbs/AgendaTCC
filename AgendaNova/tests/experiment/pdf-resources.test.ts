import test from "node:test";
import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { createCanvas } from "@napi-rs/canvas";
import {
  FileBinaryDataFactory,
  pdfResourceOptions,
} from "../../scripts/experiment/pdf-resources";
import { appRoot } from "../../scripts/experiment/protocol";

const resources = {
  cMapUrl: ["cmaps", "78-EUC-H.bcmap"],
  standardFontDataUrl: ["standard_fonts", "LiberationSans-Regular.ttf"],
  wasmUrl: ["wasm", "qcms_bg.wasm"],
} as const;

test("Windows drive paths use encoded file URLs and final forward slashes on any host", () => {
  for (const suffix of ["", "\\", "/"]) {
    const options = pdfResourceOptions(
      "C:\\Users\\pedro\\OneDrive\\Área de Trabalho\\AgendaTCC\\AgendaTCC\\AgendaNova" +
        suffix,
      "win32",
    );
    for (const [kind, [folder]] of Object.entries(resources)) {
      assert.equal(
        options[kind as keyof typeof resources],
        `file:///C:/Users/pedro/OneDrive/%C3%81rea%20de%20Trabalho/AgendaTCC/AgendaTCC/AgendaNova/node_modules/pdfjs-dist/${folder}/`,
      );
    }
  }
});

test("POSIX and Windows UNC resource directories preserve spaces, accents and URL delimiters", () => {
  assert.equal(
    pdfResourceOptions("/tmp/Área de Trabalho #100%/AgendaNova", "linux")
      .cMapUrl,
    "file:///tmp/%C3%81rea%20de%20Trabalho%20%23100%25/AgendaNova/node_modules/pdfjs-dist/cmaps/",
  );
  assert.equal(
    pdfResourceOptions(
      "\\\\servidor\\compartilhamento\\Área de Trabalho\\AgendaNova",
      "win32",
    ).wasmUrl,
    "file://servidor/compartilhamento/%C3%81rea%20de%20Trabalho/AgendaNova/node_modules/pdfjs-dist/wasm/",
  );
});

test("PDF.js loads and renders with real resources from a directory containing spaces and accents", async () => {
  const root = await mkdtemp(
    path.join(os.tmpdir(), "Agenda Área de Trabalho #100%-"),
  );
  const options = pdfResourceOptions(root);
  try {
    for (const [folder, filename] of Object.values(resources)) {
      const relative = path.join("node_modules", "pdfjs-dist", folder);
      await mkdir(path.join(root, relative), { recursive: true });
      await cp(
        path.join(appRoot, relative, filename),
        path.join(root, relative, filename),
      );
    }
    const factory = new FileBinaryDataFactory(options);
    // Check actual bytes, not just URL syntax, for all three resource kinds.
    for (const [kind, [folder, filename]] of Object.entries(resources)) {
      const loaded = await factory.fetch({
        kind: kind as keyof typeof resources,
        filename,
      });
      assert.deepEqual(
        loaded,
        new Uint8Array(
          await readFile(
            path.join(appRoot, "node_modules/pdfjs-dist", folder, filename),
          ),
        ),
      );
    }
    const fetched: string[] = [];
    class TrackingFactory extends FileBinaryDataFactory {
      override async fetch(
        request: Parameters<FileBinaryDataFactory["fetch"]>[0],
      ) {
        fetched.push(request.kind);
        return super.fetch(request);
      }
    }
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    pdf.addPage().drawText("Regressão Área de Trabalho", { font });
    const task = getDocument({
      data: new Uint8Array(await pdf.save()),
      useSystemFonts: false,
      ...options,
      BinaryDataFactory: TrackingFactory,
      cMapPacked: true,
    });
    try {
      const document = await task.promise;
      const page = await document.getPage(1);
      const text = await page.getTextContent();
      assert.match(
        text.items.map((item) => ("str" in item ? item.str : "")).join(""),
        /Regressão Área de Trabalho/,
      );
      const viewport = page.getViewport({ scale: 1 });
      const canvas = createCanvas(
        Math.ceil(viewport.width),
        Math.ceil(viewport.height),
      );
      await page.render({
        canvas: canvas as unknown as HTMLCanvasElement,
        viewport,
      }).promise;
      assert.ok(
        fetched.includes("standardFontDataUrl"),
        "PDF.js must actually request the configured font resource",
      );
      assert.ok(canvas.toBuffer("image/png").length > 0);
    } finally {
      await task.destroy();
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
