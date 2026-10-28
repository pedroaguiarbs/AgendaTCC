# Agenda Ministerial — React

Reconstrução da agenda de 2026 em React, TypeScript e Tailwind CSS, com 34 folhas A4. A `../AgendaAntiga` permanece como referência, sem alterações. Não há login, banco de dados ou painel administrativo.

## Executar

Node 24.19.0 foi usado na validação (`.nvmrc`); o Vite requer Node >=22.12. Python não é necessário para servir a nova aplicação.

```sh
cd AgendaNova
npm ci
npm run dev
```

O servidor padrão usa a porta 5173. `npm run build` verifica tipos e gera `dist/`; `npm run preview` serve o build na porta 4173. O bind padrão é local.

## Estrutura e edição

- `src/pages/`: composições das famílias de páginas, em JSX real, sem injeção de HTML.
- `src/components/`: folhas A4, cabeçalhos/rodapés, calendário, sumário, cargos, dias semanais e eventos reutilizáveis.
- `src/data/events/02.ts` a `12.ts`: 170 eventos, com identificadores estáveis, datas civis, intervalos, títulos e marcadores editoriais.
- `src/data/weekly-schedule.ts`: sete dias e 14 atividades recorrentes, sem gerar ocorrências mensais artificiais.
- `src/data/institutional.ts`, `organization.ts` e `calendar.ts`: textos institucionais, cargos e calendário transcritos do original.
- `src/data/page-plan.ts`: ordem física, variantes e numeração; a primeira folha não é numerada.
- `src/data/monthly-pages.ts`: referências de eventos por folha, cabeçalhos, textos e marcadores específicos de cada mês. As continuações mantêm a composição original, inclusive a ausência de cabeçalho.
- `src/data/contents.ts`: referências do sumário; os números são derivados do plano de páginas.
- `src/styles/`: tokens, estilos por família e impressão. A ordem dos imports preserva a cascata original. O Tailwind está integrado sem Preflight, para evitar alterações no reset existente.
- `scripts/pdf/`: preparação comum e duas estratégias independentes de exportação.
- `artifacts/`: resultados locais ignorados pelo Git; nada é gravado na aplicação original.

Ao incluir um evento, crie um ID e adicione sua referência à folha apropriada. A paginação é editorial e explícita; não há distribuição automática por altura. Se uma folha ficar cheia, revise o plano e o conteúdo, sem reduzir silenciosamente a escala. Os testes fixam as 34 folhas e os 170 eventos desta edição; alterações editoriais intencionais exigem atualizar essas expectativas.

As datas ISO não são convertidas para o fuso do navegador. `dayLabel`, `monthLabel` e `weekdayLabel` preservam a grafia do original, inclusive intervalos; mantenha esses rótulos coerentes ao editar datas. `level`, `rangeStyle` e variantes de marcadores reproduzem estilos existentes, sem inferir regras ministeriais novas.

## Layout e fontes

Folhas de 210 × 297 mm, `@page` A4 sem margens externas, cores de impressão e rodapés específicos por família. Os estilos originais foram preservados na nova aplicação antes de qualquer simplificação da cascata. A tela mantém os comportamentos responsivos existentes; o PDF usa geometria fixa.

Montserrat é servida localmente, nos pesos solicitados pelo original. Licença e proveniência estão em `public/fonts/`. “Neue Montreal” continua apenas na pilha de alternativas, como no original; não foi adicionada uma fonte proprietária. A aplicação e a exportação não dependem de acesso ao Google Fonts.

## PDFs da mesma aplicação

Com o servidor ativo, execute **separadamente**, para não disputar recursos durante medições:

```sh
npm run pdf:direct
npm run pdf:raster
npm run test:pdf
```

É necessário o Chromium do Playwright. Em uma máquina com acesso aos servidores oficiais, instale-o com `npx playwright install chromium`. Neste ambiente foi validado o Chromium já instalado:

```sh
CHROMIUM_PATH=/usr/bin/chromium npm run pdf:direct
CHROMIUM_PATH=/usr/bin/chromium npm run pdf:raster
```

Variáveis opcionais:

| Nome | Padrão | Uso |
| --- | --- | --- |
| `AGENDA_URL` | `http://127.0.0.1:5173` | Mesma aplicação para ambos os métodos; use a porta 4173 para o preview do build |
| `CHROMIUM_PATH` | Navegador do Playwright | Executável Chromium alternativo |
| `PDF_OUTPUT_DIR` | `artifacts/pdf` | Diretório dos resultados |
| `ALLOW_FALLBACK_FONT` | Desabilitado | `1` permite diagnóstico com fonte alternativa, com aviso; não usar na comparação definitiva |

A preparação compartilhada fixa viewport 794 × 1123, escala de dispositivo 2 e mídia `print`; aguarda a aplicação, fontes e imagens. Falhas de recursos ou folhas ausentes interrompem a exportação. Não há desativação de TLS.

- **Direto:** `page.pdf()` do Chromium, sem cabeçalhos externos, com fundos e tamanho CSS A4.
- **Raster:** captura individual de cada `.sheet`, incorporação de PNGs com `pdf-lib` e montagem de páginas A4 em pontos.

Os arquivos `agenda-direct.pdf`, `agenda-raster.pdf`, as imagens raster e os manifestos JSON ficam no diretório de resultados. Os manifestos registram navegador, parâmetros, duração total, bytes, folhas e situação das fontes. Uma execução isolada é uma verificação funcional, não uma conclusão de desempenho para a monografia. Compare execuções serializadas, mesma versão do navegador, mesmo build e parâmetros; registre repetições e metodologia. A versão de sistema validada difere do navegador recomendado pelo Playwright; não misture versões dentro de um experimento.

## Verificação

```sh
npm test
npm run build
CHROMIUM_PATH=/usr/bin/chromium npm run test:print
```

O teste de impressão exige a nova aplicação ativa. Ele serve o original temporariamente, só para leitura, em porta livre e encerra seu servidor ao terminar. Compara conteúdo e geometria de todas as 34 folhas em impressão e tela (larguras 1440 e 794), e PNGs de oito páginas representativas em impressão. Para controlar a tipografia sem alterar o original, intercepta apenas a requisição de sua folha de fontes e fornece os mesmos arquivos locais verificados usados pela nova aplicação. Essa substituição é exclusiva do teste de referência.

Os resultados de geometria e as capturas ficam em `artifacts/validation/`. `test:pdf` deve ser executado após os dois exportadores e lê os PDFs reais: verifica 34 páginas A4, bytes e metadados. Ele usa o diretório padrão `artifacts/pdf`.

A comparação automatizada cobre o comportamento do Chromium validado, não certifica todos os navegadores ou impressoras. O layout original usa recorte por `overflow: hidden`; conservar suas dimensões não garante que futuras inclusões de conteúdo caibam na folha. Revise capturas ao editar conteúdo ou estilos.

## Experimento reproduzível (somente AgendaNova)

Consulte [o protocolo e as instruções para Windows](docs/experimento.md). `npm run experiment:pilot` faz um piloto identificado separadamente; `npm run experiment` faz dois aquecimentos e dez blocos pareados medidos. Texto e comparação visual são executados depois, por `npm run experiment:analyze -- "caminho-da-sessao"`. Os exportadores e o layout permanecem inalterados.
