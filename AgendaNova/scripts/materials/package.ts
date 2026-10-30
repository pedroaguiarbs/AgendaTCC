import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import {
  copyFile,
  mkdir,
  readFile,
  realpath,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { appRoot, csv } from "../experiment/protocol";
import { charts } from "./charts";
import { hashFile, requireExternalOutput, walk } from "./io";
import { folders, loadModel, representativePages, type Row } from "./model";
export const defaultAnalysis = "analysis-2026-10-29T15-25-32-677Z";
function markdown(rows: Row[]) {
  if (!rows.length) return "Nenhum registro disponível.\n";
  const columns = Object.keys(rows[0]);
  const value = (v: unknown) =>
    v === null || v === undefined
      ? "não disponível"
      : String(v).replaceAll("|", "\\|").replaceAll("\n", " ");
  return (
    "| " +
    columns.join(" | ") +
    " |\n| " +
    columns.map(() => "---").join(" | ") +
    " |\n" +
    rows
      .map((r) => "| " + columns.map((c) => value(r[c])).join(" | ") + " |")
      .join("\n") +
    "\n"
  );
}
export async function buildMaterials(input: {
  session: string;
  analysis?: string;
  output: string;
}) {
  const sessionDirectory = await realpath(input.session),
    repository = await realpath(path.join(appRoot, ".."));
  const outputBase = await requireExternalOutput(
    input.output,
    repository,
    sessionDirectory,
  );
  const model = await loadModel(
    sessionDirectory,
    input.analysis ?? defaultAnalysis,
  );
  const pending: Row[] = [],
    copies: Row[] = [],
    inventory: Row[] = [];
  const inventoryMap = new Map<string, Row>();
  // Inventory precedes output creation; failures never leave a misleading final package.
  for (const relative of await walk(sessionDirectory)) {
    const file = path.join(sessionDirectory, relative),
      metadata = await stat(file),
      hash = await hashFile(file);
    if (model.loaded.has(file) && model.loaded.get(file) !== hash)
      throw new Error(`Fonte alterada durante leitura: ${file}`);
    const attempt = model.attempts.find((a) =>
      relative.startsWith(`attempts/${a.id}/`),
    );
    if (
      attempt?.pdfSha256 &&
      relative === `attempts/${attempt.id}/agenda-${attempt.method}.pdf` &&
      hash !== attempt.pdfSha256
    )
      throw new Error(`Hash de PDF divergente: ${relative}`);
    const item = {
      sourceRelative: relative,
      sourceAbsolute: file,
      bytes: metadata.size,
      sha256: hash,
      sessionId: model.session.id,
      analysisName: relative.startsWith(model.analysisName + "/")
        ? model.analysisName
        : "",
      attemptId: attempt?.id ?? "",
      method: attempt?.method ?? "",
      phase: attempt?.phase ?? "",
      includedInPrimaryAnalysis: attempt?.includedInPrimaryAnalysis ?? "",
      relation: relative.endsWith("attempt.json")
        ? "tempos/tamanho/páginas e pares"
        : relative === `${model.analysisName}/visual.csv`
          ? "MAE/tabelas/gráfico visual"
          : relative === `${model.analysisName}/text.csv`
            ? "pesquisa textual"
            : relative === "summary.json"
              ? "estatísticas quantitativas"
              : relative === "session.json"
                ? "protocolo/ambiente"
                : "evidência preservada na origem",
    };
    if (
      attempt &&
      relative === `attempts/${attempt.id}/agenda-${attempt.method}.pdf` &&
      attempt.status === "valid"
    )
      assert.equal(
        metadata.size,
        attempt.bytes,
        "Tamanho do PDF diverge do manifesto",
      );
    inventory.push(item);
    inventoryMap.set(relative, item);
  }
  for (const attempt of model.primary)
    if (
      !inventoryMap.has(`attempts/${attempt.id}/agenda-${attempt.method}.pdf`)
    )
      pending.push({
        source: `attempts/${attempt.id}/agenda-${attempt.method}.pdf`,
        reason:
          "PDF não disponível; valores das tabelas vêm do manifesto, não de nova leitura do PDF",
      });
  const packageDirectory = path.join(
    outputBase,
    `pacote-${model.session.id.replace(/[^A-Za-z0-9-]/g, "_")}-${randomUUID().slice(0, 8)}`,
  );
  await mkdir(outputBase, { recursive: true });
  await mkdir(packageDirectory); // Exclusive: repeated calls create siblings, never overwrite.
  for (const folder of folders)
    await mkdir(path.join(packageDirectory, folder));
  const write = async (relative: string, content: string | Uint8Array) => {
    const file = path.join(packageDirectory, relative);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, content, { flag: "wx" });
  };
  const json = async (relative: string, data: unknown) =>
    write(relative, JSON.stringify(data, null, 2) + "\n");
  async function copy(
    sourceRelative: string,
    destination: string,
    required = false,
  ) {
    const item = inventoryMap.get(sourceRelative);
    if (!item) {
      if (required)
        throw new Error(`Arquivo necessário ausente: ${sourceRelative}`);
      pending.push({
        source: sourceRelative,
        reason: "arquivo não disponível; não recriado ou inventado",
      });
      return;
    }
    const source = path.join(sessionDirectory, sourceRelative),
      target = path.join(packageDirectory, destination);
    await mkdir(path.dirname(target), { recursive: true });
    await copyFile(source, target, 1);
    if ((await hashFile(target)) !== item.sha256)
      throw new Error(`Arquivo alterado durante cópia: ${source}`);
    copies.push({ sourceRelative, destination, sha256: item.sha256 });
  }
  try {
    for (const [source, target] of [
      ["session.json", "session.json"],
      ["summary.json", "summary.json"],
      [`${model.analysisName}/analysis.json`, "analysis.json"],
    ])
      await copy(source, `${folders[0]}/${target}`, true);
    for (const source of ["results.csv", `${model.analysisName}/outcomes.json`])
      await copy(source, `${folders[0]}/${path.basename(source)}`);
    await json(`${folders[0]}/ambiente-e-proveniencia.json`, {
      sessionId: model.session.id,
      analysis: model.analysisName,
      commit: model.session.commit ?? null,
      buildHash: model.session.buildHash ?? null,
      browser: model.session.browser ?? null,
      browserExecutableHash: model.session.browserExecutableHash ?? null,
      node: model.session.node ?? null,
      platform: model.session.platform ?? null,
      osRelease: model.session.osRelease ?? null,
      cpu: model.session.cpu ?? null,
      memoryBytes: model.session.memoryBytes ?? null,
      pdfjsVersion: model.analysis.pdfjsVersion ?? null,
      protocol: model.session.protocol,
      note: "null significa não registrado; versões da ferramenta de organização não são versões do ambiente de coleta.",
    });
    await copy("source/package.json", `${folders[0]}/package-da-coleta.json`);
    await copy(
      "source/package-lock.json",
      `${folders[0]}/package-lock-da-coleta.json`,
    );
    const sample = model.primary.map((a) => ({
      attemptId: a.id,
      method: a.method,
      block: a.acceptedBlock,
      order: a.order,
      processTotalMs: a.processTotalMs,
      exporterElapsedMs: a.exporterElapsedMs,
      bytes: a.bytes,
      pages: a.pages,
      commit: a.commit,
    }));
    const aggregate = Object.entries(model.summary.aggregatePercent ?? {}).map(
      ([metric, differencePercent]) => ({
        metric,
        differencePercent,
        formula: "100 × (média raster − média direto) / média direto",
        source: "summary.json",
      }),
    );
    const tables: Record<string, Row[]> = {
      "descritivas-geracao": model.quantitative,
      "medicoes-individuais": sample,
      "diferencas-pareadas": model.summary.paired.blocks,
      "descritivas-diferencas-pareadas": [
        "processDifferenceMs",
        "processDifferencePercent",
        "bytesDifference",
        "bytesDifferencePercent",
      ].map((metric) => ({ metric, ...model.summary.paired[metric] })),
      "diferencas-percentuais-entre-medias": aggregate,
      "descritivas-visuais": model.visualSummary,
      "mae-por-pagina": model.visualByPage,
      "pesquisa-textual": model.textual,
    };
    for (const [name, rows] of Object.entries(tables)) {
      await write(
        `${folders[1]}/${name}.csv`,
        csv(rows, rows.length ? Object.keys(rows[0]) : ["registro"]),
      );
      await write(
        `${folders[3]}/${name}.md`,
        `# ${name}\n\nFonte: sessão ${model.session.id}; análise ${model.analysisName}.\n\n` +
          markdown(rows),
      );
    }
    const links = Object.keys(tables).map((name) => ({
      derived: `${folders[1]}/${name}.csv; ${folders[3]}/${name}.md`,
      source:
        name === "pesquisa-textual"
          ? `${model.analysisName}/text.csv`
          : name.includes("visua") || name === "mae-por-pagina"
            ? `${model.analysisName}/visual.csv`
            : "summary.json; attempts/*/attempt.json",
      filter: "Somente medições válidas incluídas na amostra pareada principal",
    }));
    for (const [name, table] of [
      ["tempo-pareado", "medicoes-individuais"],
      ["tamanho-pdf", "descritivas-geracao"],
      ["mae-por-pagina", "mae-por-pagina"],
    ]) {
      links.push({
        derived: `${folders[3]}/${name}.png`,
        source: `${folders[1]}/${table}.csv`,
        filter: "Mesmos valores das tabelas; sem seleção por resultado",
      });
    }
    await write(
      "derivados-e-fontes.csv",
      csv(links, ["derived", "source", "filter"]),
    );
    await copy(
      `${model.analysisName}/visual.csv`,
      `${folders[1]}/visual-origem.csv`,
      true,
    );
    await copy(
      `${model.analysisName}/text.csv`,
      `${folders[1]}/text-origem.csv`,
      true,
    );
    await copy(
      `${model.analysisName}/qualitative.csv`,
      `${folders[2]}/qualitativa-origem.csv`,
    );
    const qualitative = model.representatives.flatMap((a) =>
      representativePages.map((page) => ({
        method: a.method,
        page,
        attemptId: a.id,
        block: a.acceptedBlock,
        status: "aguarda-transcricao-dos-registros-do-pesquisador",
        researcher: "",
        date: "",
        readerAndVersion: "",
        device: "",
        legibility: "",
        sharpness: "",
        cuts: "",
        overlaps: "",
        zoom100: "",
        zoom200: "",
        zoom400: "",
        notes: "",
        recordSource: "",
      })),
    );
    await write(
      `${folders[2]}/avaliacao-editavel.csv`,
      csv(qualitative, Object.keys(qualitative[0])),
    );
    await write(
      `${folders[2]}/INSTRUCOES.md`,
      "# Avaliação qualitativa\n\nTranscreva os registros fornecidos pelo pesquisador. Campos vazios não significam avaliação negativa nem que a avaliação não ocorreu. Este pacote não inventa julgamentos. Registre leitor, versão, dispositivo e comportamento em 100%, 200% e 400%. Compare legibilidade, nitidez, cortes e sobreposições. A duração de abertura e de navegação NÃO foi medida quantitativamente.\n",
    );
    for (const page of representativePages) {
      await copy(
        `${model.analysisName}/reference/${page}.png`,
        `${folders[4]}/referencia-html-pagina-${page}.png`,
      );
      for (const a of model.representatives)
        for (const kind of ["page", "diff"])
          await copy(
            `${model.analysisName}/${a.id}/${kind}-${page}.png`,
            `${folders[4]}/${a.method}-${kind}-${page}.png`,
          );
    }
    await json(`${folders[4]}/selecao.json`, {
      criterion:
        "Primeiro bloco pareado aceito; seleção independente dos valores de MAE ou tempo. Não seleciona a melhor imagem.",
      pages: representativePages,
      attempts: model.representatives.map((a) => ({
        id: a.id,
        method: a.method,
        block: a.acceptedBlock,
      })),
      copies: copies.filter((row) =>
        String(row.destination).startsWith(folders[4] + "/"),
      ),
    });
    await charts(model, path.join(packageDirectory, folders[3]));
    await write(
      `${folders[5]}/REFERENCIAS-E-NORMAS-A-COMPLETAR.md`,
      "# Referências e normas a confirmar\n\nPreencher com as referências efetivamente consultadas, versões e datas de acesso. Consultar o manual da instituição e confirmar as edições vigentes das normas aplicáveis à apresentação, citações e referências. Nenhuma edição, autoria ou data bibliográfica foi presumida por esta ferramenta.\n\n| Item | Referência consultada | Edição/versão | Data de acesso | Registro do pesquisador |\n| --- | --- | --- | --- | --- |\n| Manual institucional | | | | |\n| Normas de apresentação | | | | |\n| Normas de citações | | | | |\n| Normas de referências | | | | |\n| Chromium/Playwright | | | | |\n| pdf-lib | | | | |\n| PDF.js | | | | |\n\nAs versões registradas no experimento estão em 01-Protocolo-e-Ambiente. Não confundir com as dependências atuais da ferramenta que organiza estes materiais.\n",
    );
    await write(
      "inventario-origens.csv",
      csv(inventory, Object.keys(inventory[0])),
    );
    await write(
      "copias-e-vinculos.csv",
      csv(copies, ["sourceRelative", "destination", "sha256"]),
    );
    await write("pendencias.csv", csv(pending, ["source", "reason"]));
    await write("ORIENTACAO.md", guide(model, pending.length));
    // Check all data inputs consumed in tables again; organization never writes to them.
    for (const [file, hash] of model.loaded)
      if ((await hashFile(file)) !== hash)
        throw new Error(`Entrada alterada durante organização: ${file}`);
    let commit: string | null = null,
      toolDirty: boolean | null = null;
    try {
      commit = execFileSync("git", ["rev-parse", "HEAD"], {
        cwd: appRoot,
        encoding: "utf8",
      }).trim();
      toolDirty = !!execFileSync("git", ["status", "--porcelain"], {
        cwd: appRoot,
        encoding: "utf8",
      }).trim();
    } catch {
      /* hashes below still identify the tool */
    }
    const toolFiles: Record<string, string> = {};
    for (const name of await walk(path.join(appRoot, "scripts/materials")))
      toolFiles[name] = await hashFile(
        path.join(appRoot, "scripts/materials", name),
      );
    const outputs = [];
    for (const relative of await walk(packageDirectory))
      outputs.push({
        relative,
        bytes: (await stat(path.join(packageDirectory, relative))).size,
        sha256: await hashFile(path.join(packageDirectory, relative)),
        editable:
          relative === `${folders[2]}/avaliacao-editavel.csv` ||
          relative === `${folders[5]}/REFERENCIAS-E-NORMAS-A-COMPLETAR.md`,
      });
    await json("manifest.json", {
      schemaVersion: 1,
      status: pending.length ? "com-pendencias" : "completo",
      createdAt: new Date().toISOString(),
      sessionId: model.session.id,
      analysisName: model.analysisName,
      sourceSession: sessionDirectory,
      sourceAnalysis: model.analysisDirectory,
      collectionCommit: model.session.commit ?? null,
      toolCommit: commit,
      toolDirty,
      toolFiles,
      organizerLockSha256: await hashFile(
        path.join(appRoot, "package-lock.json"),
      ),
      organizerVersions: Object.fromEntries(
        await Promise.all(
          ["chart.js", "@napi-rs/canvas", "pngjs"].map(async (name) => [
            name,
            JSON.parse(
              await readFile(
                path.join(appRoot, "node_modules", name, "package.json"),
                "utf8",
              ),
            ).version,
          ]),
        ),
      ),
      organizerNode: process.version,
      chartFontRequested: "Arial, sans-serif",
      organizerDependencies: JSON.parse(
        await readFile(path.join(appRoot, "package.json"), "utf8"),
      ).devDependencies,
      counts: {
        attempts: model.attempts.length,
        warmups: model.attempts.filter((a) => a.phase === "warmup").length,
        primary: model.primary.length,
        invalid: model.attempts.filter((a) => a.status === "invalid").length,
        visualRecords: model.visuals.length,
        textChecks: model.text.length,
      },
      outputs,
      pending,
      warnings: [
        "MAE em relação a capturas HTML favorece potencialmente o raster; não implica superioridade visual absoluta.",
        "Não foi medido desempenho quantitativo de visualização.",
        "Avaliação qualitativa depende dos registros do pesquisador.",
      ],
      integrityNote:
        "Hashes detectam alterações; não são assinatura digital ou prova de autenticidade. manifest.json não se inclui em seu próprio hash.",
    });
    return packageDirectory;
  } catch (error) {
    await json("FALHA.json", {
      status: "incompleto",
      error: String(error),
      createdAt: new Date().toISOString(),
    });
    throw error;
  }
}
function guide(model: Awaited<ReturnType<typeof loadModel>>, missing: number) {
  return `# Orientação do pacote de evidências

Sessão: ${model.session.id}. Análise: ${model.analysisName}. Commit da coleta: ${model.session.commit ?? "não registrado"}.

Este pacote organiza evidências reais. Não executa coleta, exportação ou análise PDF/HTML; não produz conclusões acadêmicas automáticas. ${missing} pendência(s) de arquivos opcionais estão em pendencias.csv.

## Pastas

1. **01-Protocolo-e-Ambiente**: cópias dos manifestos, ambiente e dependências registradas na coleta. Valores ausentes ficam nulos; não são preenchidos com o ambiente atual.
2. **02-Dados-Quantitativos**: CSVs de estatísticas, medições individuais, pares, MAE e consultas textuais. CSV UTF-8 BOM: importe no Excel como UTF-8, delimitador vírgula. Valores numéricos usam ponto decimal; não dependa da configuração de duplo clique do Excel.
3. **03-Avaliacao-Qualitativa**: oito linhas editáveis (páginas 1, 5, 13 e 34 dos dois métodos) para transcrever registros do pesquisador. Nenhuma nota foi inventada. A cópia qualitativa original, quando disponível, continua separada.
4. **04-Graficos-e-Tabelas**: tabelas Markdown e gráficos PNG 2400 × 1500. Para 300 dpi, use até 8 × 5 polegadas. Títulos, unidades e fonte estão nas figuras. As médias dos tamanhos usam MB decimais; tempos permanecem em ms. Confira com as tabelas antes de citar.
5. **05-Figuras-e-Capturas**: somente páginas representativas do primeiro bloco pareado aceito. Referência HTML, renderização e diferenças estão identificadas, sem recortar ou alterar pixels. A seleção é fixa, sem escolher a melhor medição. Os PDFs completos continuam na origem e no inventário.
6. **06-Referencias-e-Normas**: ficha para completar referências efetivamente consultadas e normas institucionais; nenhuma norma ou edição foi inventada.

## Origem e cálculos

Estatísticas de geração são lidas de summary.json e conferidas com attempts/*/attempt.json; os pares usam acceptedBlock. Aquecimentos, tentativas inválidas e contrapartes excluídas não entram nas médias principais, mas permanecem identificáveis no inventário e nas cópias. Desvio-padrão amostral usa n−1 e fica nulo com n<2. Diferença percentual: 100 × (raster − direto) / direto, sem inverter o sinal. Tempos processTotalMs e exporterElapsedMs são apresentados separadamente, com as definições do protocolo original.

Os registros de visual.csv são filtrados pela amostra principal. O resumo visual agrega instâncias página × medição, que NÃO são réplicas independentes; a tabela por página mostra a variação entre PDFs. MAE/RMSE têm unidades RGB 0–255; changedFraction é uma fração, não percentagem.

A referência visual são capturas HTML, o que favorece a técnica rasterizada. MAE zero não prova superioridade visual absoluta, legibilidade ou nitidez em ampliação. Antialiasing, normalização das dimensões e o motor PDF.js influenciam as diferenças. Complemente com a avaliação qualitativa registrada pelo pesquisador.

A tabela textual usa somente as consultas definidas: found entre expected. Não mede a porcentagem de todo o conteúdo preservado. Caracteres são contados uma vez por página/PDF, sem multiplicar pelo número de consultas. Ausência de texto pesquisável no raster é uma característica esperada, sem OCR. Não extrapole essa verificação para equivalência semântica integral.

processTotalMs mede geração, incluindo inicialização e fechamento conforme o protocolo. NÃO é duração de abertura, navegação, renderização em celular ou desempenho de visualização: estes não foram medidos quantitativamente. Não conclua que um método é mais rápido para visualizar a partir destes gráficos.

## Integridade e repetição

inventario-origens.csv lista todos os arquivos da sessão com caminho, bytes e SHA-256. copias-e-vinculos.csv liga cópias às fontes; derivados-e-fontes.csv relaciona tabelas e gráficos às entradas. manifest.json registra fontes, ferramenta, hashes dos derivados e avisos; não se autoassina. O conteúdo dos dados originais não foi alterado. Uma nova execução cria um pacote irmão exclusivo; nunca atualiza silenciosamente uma avaliação preenchida.

Execute npm run materials:verify -- "CAMINHO-DESTE-PACOTE" em AgendaNova para conferir os derivados. Acrescente --check-sources para conferir também os dados originais, quando disponíveis no mesmo caminho. Alterações nos dois arquivos editáveis são informadas e permitidas; alterações em gráficos, tabelas ou cópias imutáveis falham na verificação. Guarde os resultados dessa conferência e faça backup das evidências.
`;
}
