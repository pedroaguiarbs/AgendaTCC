import { verifyMaterials } from "./verify";
try {
  const [directory, flag, ...extra] = process.argv.slice(2);
  if (!directory || (flag && flag !== "--check-sources") || extra.length)
    throw new Error(
      'Uso: npm run materials:verify -- "PACOTE" [--check-sources]',
    );
  console.log(
    JSON.stringify(
      await verifyMaterials(directory, flag === "--check-sources"),
      null,
      2,
    ),
  );
} catch (error) {
  console.error(String(error));
  process.exitCode = 1;
}
