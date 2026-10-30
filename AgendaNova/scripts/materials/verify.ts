import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { hashFile, parseCsv, within, regularFile } from "./io";
export async function verifyMaterials(directory: string, checkSources = false) {
  const root = await realpath(directory),
    manifest = JSON.parse(
      await readFile(path.join(root, "manifest.json"), "utf8"),
    );
  if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.outputs))
    throw new Error("Manifesto de pacote inválido");
  const edited: string[] = [];
  for (const item of manifest.outputs) {
    const file = path.resolve(root, item.relative);
    if (!within(file, root))
      throw new Error("Caminho de saída escapa do pacote");
    await regularFile(file);
    if (!within(await realpath(file), root))
      throw new Error("Link escapa do pacote");
    const actual = await hashFile(file);
    if (actual !== item.sha256) {
      if (item.editable) edited.push(item.relative);
      else throw new Error(`Hash divergente: ${item.relative}`);
    }
  }
  let sources = 0;
  if (checkSources)
    for (const row of parseCsv(
      await readFile(path.join(root, "inventario-origens.csv"), "utf8"),
    )) {
      await regularFile(row.sourceAbsolute);
      if ((await hashFile(row.sourceAbsolute)) !== row.sha256)
        throw new Error(`Fonte divergente: ${row.sourceAbsolute}`);
      sources++;
    }
  return {
    status: "integridade-conferida",
    packageStatus: manifest.status,
    outputs: manifest.outputs.length,
    sourcesChecked: sources,
    editedEditableFiles: edited,
    note: "Campos qualitativos e referências editáveis podem mudar; isso não autentica nem valida avaliações humanas.",
  };
}
