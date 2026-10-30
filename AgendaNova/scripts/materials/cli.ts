import { buildMaterials, defaultAnalysis } from "./package";
const args = process.argv.slice(2),
  options: Record<string, string> = {};
try {
  for (let i = 0; i < args.length; i += 2) {
    const flag = args[i],
      value = args[i + 1];
    if (
      !["--session", "--analysis", "--output"].includes(flag) ||
      !value ||
      value.startsWith("--") ||
      options[flag]
    )
      throw new Error(
        'Uso: npm run materials -- --session "SESSAO" --analysis "analysis-..." --output "PASTA EXTERNA"',
      );
    options[flag] = value;
  }
  if (!options["--session"] || !options["--output"])
    throw new Error("--session e --output são obrigatórios");
  const directory = await buildMaterials({
    session: options["--session"],
    analysis: options["--analysis"] ?? defaultAnalysis,
    output: options["--output"],
  });
  console.log(
    `Pacote criado: ${directory}\nNenhuma coleta ou análise foi executada. Confira manifest.json, pendencias.csv e ORIENTACAO.md.`,
  );
} catch (error) {
  console.error(String(error));
  process.exitCode = 1;
}
