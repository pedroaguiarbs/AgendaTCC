import { createReadStream } from "node:fs";
import { createHash } from "node:crypto";
import { lstat, readdir, realpath, stat } from "node:fs/promises";
import path from "node:path";

export function parseCsv(input: string): Record<string, string>[] {
  const text = input.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [],
    value = "",
    quoted = false,
    afterQuote = false;
  const cell = () => {
    row.push(value);
    value = "";
    afterQuote = false;
  };
  const line = () => {
    cell();
    if (row.some((v) => v !== "")) rows.push(row);
    row = [];
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          value += '"';
          i++;
        } else {
          quoted = false;
          afterQuote = true;
        }
      } else value += c;
      continue;
    }
    if (c === ",") {
      cell();
      continue;
    }
    if (c === "\r" || c === "\n") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      line();
      continue;
    }
    if (afterQuote) throw new Error("CSV: caracteres após aspas finais");
    if (c === '"') {
      if (value) throw new Error("CSV: aspas inesperadas");
      quoted = true;
    } else value += c;
  }
  if (quoted) throw new Error("CSV: aspas não fechadas");
  if (value || row.length || afterQuote) line();
  const headers = rows.shift();
  if (!headers?.length || new Set(headers).size !== headers.length)
    throw new Error("CSV: cabeçalho ausente ou duplicado");
  return rows.map((cells, i) => {
    if (cells.length !== headers.length)
      throw new Error(`CSV: quantidade de colunas inválida na linha ${i + 2}`);
    return Object.fromEntries(headers.map((h, j) => [h, cells[j]]));
  });
}
export function numeric(value: unknown, name: string) {
  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && !value.trim())
  )
    throw new Error(`Valor ausente: ${name}`);
  if (typeof value !== "string" && typeof value !== "number")
    throw new Error(`Valor numérico inválido: ${name}`);
  const n = Number(value);
  if (!Number.isFinite(n)) throw new Error(`Valor numérico inválido: ${name}`);
  return n;
}
export function boolean(value: string, name: string) {
  if (value !== "true" && value !== "false")
    throw new Error(`Booleano inválido: ${name}`);
  return value === "true";
}
export async function hashFile(file: string) {
  const h = createHash("sha256");
  for await (const chunk of createReadStream(file)) h.update(chunk);
  return h.digest("hex");
}
export async function walk(root: string): Promise<string[]> {
  const files: string[] = [];
  async function visit(relative: string) {
    for (const entry of (
      await readdir(path.join(root, relative), { withFileTypes: true })
    ).sort((a, b) => a.name.localeCompare(b.name))) {
      const name = path.join(relative, entry.name);
      if (entry.isSymbolicLink())
        throw new Error(`Link simbólico não permitido nas evidências: ${name}`);
      if (entry.isDirectory()) await visit(name);
      else if (entry.isFile()) files.push(name.replaceAll(path.sep, "/"));
    }
  }
  await visit("");
  return files;
}
export function within(
  candidate: string,
  root: string,
  windows = process.platform === "win32",
) {
  const p = windows ? path.win32 : path.posix;
  const normalize = (s: string) =>
    windows ? p.resolve(s).toLowerCase() : p.resolve(s);
  const relative = p.relative(normalize(root), normalize(candidate));
  return (
    relative === "" ||
    (!relative.startsWith(".." + p.sep) &&
      relative !== ".." &&
      !p.isAbsolute(relative))
  );
}
export async function resolvedDestination(input: string) {
  let existing = path.resolve(input),
    parts: string[] = [];
  for (;;) {
    try {
      return path.join(await realpath(existing), ...parts);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      const parent = path.dirname(existing);
      if (parent === existing) throw error;
      parts.unshift(path.basename(existing));
      existing = parent;
    }
  }
}
export async function requireExternalOutput(
  output: string,
  repository: string,
  session: string,
) {
  const destination = await resolvedDestination(output);
  for (const protectedRoot of [
    await realpath(repository),
    await realpath(session),
  ]) {
    if (
      within(destination, protectedRoot) ||
      within(protectedRoot, destination)
    )
      throw new Error(
        `Saída deve ser externa e não pode sobrepor repositório ou dados originais: ${destination}`,
      );
  }
  return destination;
}
export async function regularFile(file: string) {
  try {
    if (!(await lstat(file)).isFile())
      throw new Error(`Não é arquivo regular: ${file}`);
    return await stat(file);
  } catch (error) {
    throw new Error(`Arquivo necessário ausente ou inacessível: ${file}`, {
      cause: error,
    });
  }
}
