import { readdir, readFile, unlink } from "node:fs/promises";
import path from "node:path";

import { json, readJson, sha256, sessionDirectory } from "./protocol";
const directory = await sessionDirectory(process.argv[2]);
const session = await readJson(path.join(directory, "session.json"));
if (!["completed", "failed", "interrupted"].includes(session.status))
  throw new Error("Cannot clean PNGs while collection may be active");
const log = path.join(
  directory,
  `cleanup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
);
const record: any = {
  startedAt: new Date().toISOString(),
  policy:
    "Only exporter raster-pages/*.png, after collection; PDFs, manifests, logs and analysis images retained",
  files: [],
  status: "running",
};
await json(log, record);
try {
  for (const attempt of await readdir(path.join(directory, "attempts"))) {
    const root = path.join(directory, "attempts", attempt, "raster-pages");
    let entries;
    try {
      entries = await readdir(root, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries.filter(
      (e) => e.isFile() && e.name.endsWith(".png"),
    )) {
      const file = path.join(root, entry.name),
        bytes = await readFile(file);
      const item = {
        file: path.relative(directory, file),
        bytes: bytes.length,
        sha256: sha256(bytes),
        deleted: false,
      };
      record.files.push(item);
      await json(log, record);
      await unlink(file);
      item.deleted = true;
      await json(log, record);
    }
  }
  record.status = "completed";
} catch (error) {
  record.status = "failed";
  record.error = String(error);
  process.exitCode = 1;
} finally {
  record.finishedAt = new Date().toISOString();
  await json(log, record);
  console.log(log);
}
