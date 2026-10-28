# AgendaSimplificada

Terceira versão independente da Agenda Ministerial, em React, TypeScript e Tailwind CSS. Mantém os mesmos 170 eventos, textos e 34 folhas A4 da `../AgendaNova`, com cores sólidas e menos efeitos para reduzir a complexidade dos PDFs. `../AgendaAntiga` e `../AgendaNova` permanecem intactas.

## Executar

Com Node.js 24 LTS, abra o terminal na raiz `AgendaTCC`:

```sh
cd AgendaSimplificada
npm ci
npm run dev
```

A porta desta versão é **5174** (a `AgendaNova` usa 5173). `--strictPort` impede a troca silenciosa de porta. Você pode rodar as duas em terminais separados. O build é gerado com `npm run build`; `npm run preview` usa a porta **4174**.

## Exportar

Mantenha o servidor ativo e, em outro terminal dentro de `AgendaSimplificada`, execute em série:

```sh
npx playwright install chromium
npm run pdf:direct
npm run pdf:raster
npm run test:pdf
```

A instalação do navegador é necessária uma única vez por máquina. Os PDFs, manifestos JSON e imagens de páginas ficam em `AgendaSimplificada/artifacts/pdf/`, sem substituir saídas das outras versões. Esses arquivos são gerados localmente e ignorados pelo Git.

Em Linux, para usar o navegador de sistema: `CHROMIUM_PATH=/usr/bin/chromium npm run pdf:direct` (ou `pdf:raster`). No Windows, os comandos normais usam o navegador instalado pelo Playwright.

| Variável opcional | Uso |
| --- | --- |
| `AGENDA_URL` | Padrão `http://127.0.0.1:5174`; selecione a porta 4174 para exportar o build de produção |
| `CHROMIUM_PATH` | Executável alternativo do Chromium |
| `PDF_OUTPUT_DIR` | Diretório de saída; padrão `artifacts/pdf` |
| `ALLOW_FALLBACK_FONT` | `1` somente para diagnóstico com fonte alternativa; não usar na comparação definitiva |

O teste `test:pdf` lê o diretório padrão e exige fontes carregadas sem falhas.

## O que muda nesta versão

O perfil `src/styles/simplified.css`, importado por último, vale tanto para tela quanto para impressão e para os dois métodos de PDF:

- Fundos opacos e cores sólidas, sem gradientes ou transparências intermediárias.
- Sem sombras, desfoques e texturas decorativas.
- Cartões claros, bordas simples e cores para distinguir eventos.
- Montserrat local, com licença e origem em `public/fonts/`.

Não foram alterados tamanhos de fontes, espaçamentos, colunas, dimensões A4, rodapés, numeração nem atribuição dos eventos às folhas. A primeira folha continua sem número. As composições e a base CSS foram copiadas da `AgendaNova`; a simplificação fica concentrada no arquivo de perfil.

## Estrutura

- `src/components/`: folhas A4, cabeçalhos, rodapés, calendário, sumário, cargos e eventos reutilizáveis.
- `src/pages/`: composições dos tipos de folha.
- `src/data/events/`: eventos mensais tipados.
- `src/data/monthly-pages.ts`: referências de eventos por folha, cabeçalhos e continuações.
- `src/data/page-plan.ts`: ordem e numeração; `contents.ts` referencia esse plano no sumário.
- `src/data/weekly-schedule.ts`, `institutional.ts`, `organization.ts`, `calendar.ts`: demais dados.
- `src/styles/`: geometria herdada, fontes e perfil simplificado.
- `scripts/pdf/`: preparação compartilhada e exportadores.
- `tests/`: dados, consistência entre versões, geometria, efeitos e PDFs reais.

A aplicação é independente: não importa componentes ou dados das outras pastas em produção. Um teste consulta os dados da `AgendaNova` para detectar divergências do conjunto experimental. As cópias de dados devem receber as mesmas alterações editoriais se a intenção for manter uma comparação controlada. Não há paginação automática: revise as capturas ao acrescentar conteúdo, pois o modelo original usa `overflow: hidden`.

## Metodologia para o TCC

Os dois exportadores operam sobre a **mesma aplicação simplificada**, URL, fontes, dados e mídia `print`, com viewport 794 × 1123 e escala de dispositivo 2.

- Direto: `page.pdf()` do Chromium; o texto permanece selecionável.
- Raster: captura PNG de cada folha e montagem A4 pelo `pdf-lib`.

Não foi alterada a resolução do raster nem adicionada compressão JPEG. Assim, este primeiro experimento muda somente a apresentação. Os manifestos registram navegador, parâmetros, bytes, duração total, fontes e o perfil `solid-colors-no-effects` da variante `AgendaSimplificada`.

A duração inclui preparação do navegador. Uma execução funcional não estabelece desempenho estatístico: use o mesmo navegador, configuração e dados, execute os métodos em série e faça repetições. Um PDF menor não garante compatibilidade com todos os leitores; o celular que apresentou problemas precisa de validação própria.

## Verificação

```sh
npm test
npm run build
npm run test:print
```

O teste visual exige a aplicação simplificada ativa. Serve temporariamente a `AgendaAntiga` em porta livre, somente para leitura, e fornece à referência as mesmas fontes locais verificadas. Compara conteúdo e geometria das 34 folhas em impressão e nas larguras de tela 1440 e 794. Captura oito páginas representativas para revisão visual; as cores não devem ser idênticas ao original. Verifica também a ausência de gradientes, sombras, filtros e fundos semitransparentes na impressão.

Os resultados ficam em `artifacts/validation/`. Após gerar os PDFs, `npm run test:pdf` abre os arquivos reais e confere 34 páginas A4, bytes e metadados. `npm test` também compara eventos, textos institucionais, cargos, calendário e plano editorial com a `AgendaNova`. Não houve testes físicos de celulares neste ambiente.
