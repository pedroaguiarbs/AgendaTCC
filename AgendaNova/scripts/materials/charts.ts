import { createCanvas } from "@napi-rs/canvas";
import {
  Chart,
  BasicPlatform,
  registerables,
  type ChartConfiguration,
} from "chart.js";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import type { Model } from "./model";
Chart.register(...registerables);
export async function charts(model: Model, directory: string) {
  const source = `Fonte: sessão ${model.session.id}; análise ${model.analysisName}.`;
  async function save(
    name: string,
    title: string,
    unit: string,
    configuration: Pick<ChartConfiguration, "type" | "data">,
    note = "",
  ) {
    const canvas = createCanvas(2400, 1500);
    const chart = new Chart(canvas as unknown as HTMLCanvasElement, {
      ...configuration,
      platform: BasicPlatform,
      options: {
        responsive: false,
        animation: false,
        devicePixelRatio: 1,
        color: "#111827",
        font: { family: "Arial, sans-serif", size: 36 },
        layout: { padding: { left: 35, right: 50, top: 20, bottom: 30 } },
        plugins: {
          title: { display: true, text: title, font: { size: 52 } },
          subtitle: {
            display: true,
            text: [source, ...(note.match(/.{1,100}(?:\s|$)/g) ?? [])].filter(
              Boolean,
            ),
            font: { size: 34 },
            padding: 20,
          },
          legend: { display: true, labels: { font: { size: 34 } } },
        },
        scales: {
          x: {
            title: {
              display: true,
              text:
                configuration.type === "line" && name.startsWith("mae")
                  ? "Página"
                  : "Método",
              font: { size: 40 },
            },
            ticks: { font: { size: 34 } },
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: unit, font: { size: 40 } },
            ticks: { font: { size: 34 } },
          },
        },
      },
      plugins: [
        {
          id: "paper-background",
          beforeDraw(chart) {
            const { ctx, width, height } = chart;
            ctx.save();
            ctx.globalCompositeOperation = "destination-over";
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, width, height);
            ctx.restore();
          },
        },
      ],
    });
    try {
      await writeFile(
        path.join(directory, `${name}.png`),
        canvas.toBuffer("image/png"),
        { flag: "wx" },
      );
    } finally {
      chart.destroy();
    }
  }
  await save(
    "tempo-pareado",
    "Tempo total de geração por bloco pareado",
    "Tempo total do processo (ms)",
    {
      type: "line",
      data: {
        labels: ["Direto", "Rasterizado"],
        datasets: model.summary.paired.blocks.map((b: any, i: number) => ({
          label: `Bloco ${b.block}`,
          data: ["direct", "raster"].map(
            (m) =>
              model.primary.find(
                (a) => a.acceptedBlock === b.block && a.method === m,
              )!.processTotalMs!,
          ),
          borderColor: `hsl(${i * 37}, 55%, 38%)`,
          backgroundColor: `hsl(${i * 37}, 55%, 38%)`,
          borderWidth: 3,
          pointRadius: 6,
        })),
      },
    },
    "Cada linha conecta as medições do mesmo bloco. Não mede velocidade de abertura do PDF.",
  );
  await save(
    "tamanho-pdf",
    "Tamanho médio dos PDFs gerados",
    "Tamanho do PDF (MB decimais)",
    {
      type: "bar",
      data: {
        labels: ["Direto", "Rasterizado"],
        datasets: [
          {
            label: "Média das medições válidas",
            data: ["direct", "raster"].map(
              (m) => model.summary.statistics[m].bytes.mean / 1e6,
            ),
            backgroundColor: ["#275a8a", "#9a5017"],
          },
        ],
      },
    },
    "As dispersões e os valores individuais estão nas tabelas; PNGs intermediários não entram no tamanho do PDF.",
  );
  await save(
    "mae-por-pagina",
    "Desvio médio em relação à referência HTML",
    "MAE médio por página (RGB 0–255)",
    {
      type: "line",
      data: {
        labels: Array.from({ length: model.session.protocol.pages }, (_, i) =>
          String(i + 1),
        ),
        datasets: ["direct", "raster"].map((m, i) => ({
          label: m === "direct" ? "Direto" : "Rasterizado",
          data: model.visualByPage
            .filter((r) => r.method === m)
            .map((r) => r.mean as number),
          borderColor: i ? "#9a5017" : "#275a8a",
          backgroundColor: i ? "#9a5017" : "#275a8a",
          pointRadius: 3,
          borderWidth: 3,
        })),
      },
    },
    "Referência de capturas HTML favorece o raster. MAE zero não demonstra superioridade visual absoluta.",
  );
}
