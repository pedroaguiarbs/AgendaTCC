import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

type ResourceKind = "cMapUrl" | "standardFontDataUrl" | "wasmUrl";
type ResourceLocations = Record<ResourceKind, string>;

/** PDF.js 6's Node factory passes strings to readFile, which does not decode
 * file:// strings. Passing a URL object preserves spaces and Unicode correctly. */
export class FileBinaryDataFactory {
  constructor(private readonly locations: ResourceLocations) {}

  async fetch({ kind, filename }: { kind: ResourceKind; filename: string }) {
    const base = this.locations[kind];
    if (!base) throw new Error(`Missing PDF.js resource directory: ${kind}`);
    return new Uint8Array(await readFile(new URL(filename, base)));
  }
}

export function pdfResourceOptions(
  root: string,
  platform: NodeJS.Platform = process.platform,
) {
  // Explicit platform selection also permits real Windows-path regression tests
  // on non-Windows hosts. Production always uses the current platform.
  const windows = platform === "win32";
  const paths = windows ? path.win32 : path.posix;
  const directory = (name: string) => {
    const url = pathToFileURL(
      paths.resolve(root, "node_modules", "pdfjs-dist", name),
      { windows },
    );
    if (!url.pathname.endsWith("/")) url.pathname += "/";
    return url.href;
  };
  return {
    cMapUrl: directory("cmaps"),
    standardFontDataUrl: directory("standard_fonts"),
    wasmUrl: directory("wasm"),
    useWorkerFetch: false,
    BinaryDataFactory: FileBinaryDataFactory,
  };
}
