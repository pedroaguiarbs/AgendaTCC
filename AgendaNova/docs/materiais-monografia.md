# Pacote local de evidências para a monografia

Esta ferramenta lê resultados já existentes da **AgendaNova** e organiza materiais derivados fora do repositório. Não executa exportadores, coleta, navegador, PDF.js ou reanálise de PDFs. As outras versões da agenda não participam. Não gera conclusões acadêmicas, notas qualitativas ou referências bibliográficas inventadas.

A sessão e a análise oficiais informadas pelo pesquisador são, respectivamente:

- `official-2026-10-29T14-43-52-723Z-0be2e89c`
- `analysis-2026-10-29T15-25-32-677Z`

Esses arquivos estão no computador Windows do pesquisador, não presumidamente disponíveis no Codex. As contagens informadas (24 exportações, 20 medições, 680 registros visuais, 3.400 verificações textuais) não são injetadas nas tabelas: o programa lê e cruza os dados reais. Os testes usam exclusivamente fixtures sintéticas identificadas como teste.

## Executar no Windows/PowerShell

Com a branch atualizada, Node 24 LTS e o terminal na raiz `AgendaTCC`:

```powershell
cd AgendaNova
npm ci
npm run typecheck
npm run test:materials

$sessao = (Resolve-Path '.\artifacts\experiments\official-2026-10-29T14-43-52-723Z-0be2e89c').Path
$analise = 'analysis-2026-10-29T15-25-32-677Z'
$saida = 'C:\TCC-Agenda\Material-Monografia'

npm run materials -- --session "$sessao" --analysis "$analise" --output "$saida"
```

Não execute `experiment`, `experiment:analyze`, `pdf:direct` ou `pdf:raster` para esta etapa. Não precisa de servidor ou de instalar navegador. Os argumentos são passados como strings, sem shell interno. Caminhos com espaços/acentos são aceitos. Se o PowerShell bloquear `npm.ps1`, utilize `npm.cmd` nos mesmos comandos, sem mudar a política de execução.

`--session` e `--output` são obrigatórios. `--analysis` recebe **somente o nome** da subpasta da análise dentro da sessão; seu padrão é o nome oficial acima, nunca a pasta mais recente. O programa rejeita pilotos, coletas/análises incompletas, vínculos divergentes e estatísticas incompatíveis com os manifestos.

## Saída e repetição

Cada chamada cria um novo diretório exclusivo:

```text
C:\TCC-Agenda\Material-Monografia\pacote-official-...-<id>\
├── 01-Protocolo-e-Ambiente\
├── 02-Dados-Quantitativos\
├── 03-Avaliacao-Qualitativa\
├── 04-Graficos-e-Tabelas\
├── 05-Figuras-e-Capturas\
├── 06-Referencias-e-Normas\
├── ORIENTACAO.md
├── inventario-origens.csv
├── derivados-e-fontes.csv
├── copias-e-vinculos.csv
├── pendencias.csv
└── manifest.json
```

A pasta exata é impressa ao concluir. Uma nova execução cria outro pacote irmão, preservando inclusive avaliações já preenchidas no anterior. A saída é recusada se sobrepuser o repositório ou a sessão original, incluindo atalhos/junctions resolvidos pelo sistema. Não use o diretório dos dados brutos como saída.

Arquivos obrigatórios ausentes ou entradas inconsistentes impedem a geração. Imagens representativas ou metadados opcionais ausentes produzem pendências explícitas, sem substituir imagens ou inventar versões. Uma falha durante a geração deixa `FALHA.json` no novo diretório e não altera os originais. Para dados em OneDrive, certifique-se de que os arquivos estejam disponíveis localmente; o inventário lê e calcula hashes de todos os arquivos da sessão, o que pode demorar.

## O que contém cada pasta

1. **Protocolo e ambiente:** cópias de session.json, summary.json, analysis.json, registros disponíveis e ambiente observado na coleta. Informação ausente fica nula. Dependências da coleta, quando disponíveis em source/, são diferenciadas das dependências atuais do organizador.
2. **Dados quantitativos:** CSVs de estatísticas de geração, medições individuais, diferenças pareadas, diferenças percentuais entre médias, MAE/RMSE/fração de pixels e consultas textuais. As estatísticas registradas são conferidas com os manifestos, sem reescrever summary.json.
3. **Qualitativa:** oito linhas editáveis para páginas 1, 5, 13 e 34, para cada método, usando o primeiro bloco pareado aceito. Preencher com os registros do pesquisador, não com julgamentos automáticos. Uma avaliação original disponível é copiada separadamente.
4. **Gráficos e tabelas:** tabelas Markdown e três PNGs de alta resolução (2400×1500): tempos por bloco pareado, tamanho médio dos PDFs e MAE por página. Gerados com Chart.js e o canvas já utilizado pelo projeto. As figuras incluem título, unidade, legenda, fonte e avisos necessários. São artefatos independentes, sem serviço web externo.
5. **Figuras representativas:** quatro referências HTML, oito páginas renderizadas e oito mapas de diferença, quando existentes. Escolha fixa do primeiro bloco aceito, sem procurar o melhor MAE. Cópias preservam os bytes; PDFs completos ficam na origem, identificados no inventário.
6. **Referências e normas:** ficha para registrar documentos e normas efetivamente consultados. Não presume edições vigentes, autores, datas ou adequação automática às normas institucionais.

O inventário lista todos os arquivos da sessão com caminhos, bytes e SHA-256 e associa evidências aos resultados. As cópias possuem um mapa de origem/destino; derivados-e-fontes.csv liga tabelas e gráficos às entradas. O manifesto contém hashes dos derivados e identificação da ferramenta. Hashes verificam integridade, não autoria/autenticidade; manifest.json não inclui seu próprio hash.

## Critérios e limites de interpretação

- Amostra principal: somente medições válidas incluídas na análise pareada; aquecimentos e tentativas excluídas não entram nas médias. O inventário preserva sua identificação.
- Tempo principal: `processTotalMs`; complementar: `exporterElapsedMs`. São durações de **geração**, com os limites do protocolo original. Não medem abertura, navegação ou desempenho de visualização em Windows/celular.
- Desvio-padrão amostral: n−1; se n<2, fica nulo. Diferenças: 100 × (raster−direto)/direto, com sinal preservado e denominador zero tratado como nulo.
- Estatísticas visuais globais agregam páginas × PDFs, que não são réplicas independentes. O resumo por página complementa essa agregação.
- **A referência de MAE são capturas HTML, favorecendo potencialmente o raster. MAE zero não demonstra superioridade visual absoluta.** Avaliar nitidez em ampliação, legibilidade, cortes e sobreposições com os registros qualitativos. Antialiasing e normalização do renderizador também influenciam os números.
- A tabela textual mede recuperação das consultas esperadas. Não é percentual de todo o conteúdo preservado. Os caracteres são contados uma vez por página/PDF; não são multiplicados pelo número de consultas. Raster sem texto pesquisável é comportamento esperado, sem OCR.
- As figuras não incorporam conclusões de superioridade ou testes estatísticos novos. Não extrapole diferenças de geração para desempenho de visualização, que não foi medido quantitativamente.

## Conferir e validar o pacote

Copie o caminho exato impresso pelo comando:

```powershell
$pacote = 'C:\TCC-Agenda\Material-Monografia\pacote-official-...-ID'
npm run materials:verify -- "$pacote"
npm run materials:verify -- "$pacote" --check-sources
```

A primeira conferência verifica os hashes de todos os derivados imutáveis. A segunda também relê os arquivos originais nos caminhos registrados. Precisa de acesso aos originais, mas não executa análise nem modifica resultados. Alterações na planilha qualitativa e na ficha de referências editáveis são informadas, sem tratá-las como corrupção; a ferramenta não valida o mérito dessas avaliações humanas.

Depois:

1. Abra manifest.json: confirme IDs da sessão/análise, contagens, commit, fontes e status. `com-pendencias` exige consultar pendencias.csv; `FALHA.json` indica pacote incompleto.
2. Importe os CSVs no Excel por **Dados → De Texto/CSV**, com UTF-8 e delimitador vírgula. Os números usam ponto decimal. Se o Excel/Power Query estiver em português, defina as colunas numéricas por **Alterar Tipo → Usando Localidade → Inglês (Estados Unidos)** para interpretar o ponto como separador decimal. Não dependa do duplo clique e da configuração regional.
3. Compare a tabela de geração com summary.json e medições individuais; confira os IDs dos pares.
4. Confira as fontes/capturas da primeira amostra pareada e as advertências metodológicas nas figuras.
5. Transcreva os registros qualitativos já realizados e registre leitor, versão, dispositivo e zoom. Não preencha lacunas por inferência.
6. Complete referências e normas conforme os materiais consultados e o manual da instituição. Faça backup do pacote e dos dados originais.

## Testes

`npm run test:materials` cobre CSV com aspas/quebras/BOM, caminhos Windows (unidade, UNC, caixa e acentos), diretórios reais com espaços/acentos, arquivos obrigatórios ausentes, estatísticas inconsistentes, repetição sem sobrescrita, saída protegida por junction/symlink, imagens ausentes, hashes de originais, dimensões dos gráficos e verificação de alterações em derivados e arquivos editáveis.

Os testes não fazem experimentos: criam fixtures sintéticas em diretórios temporários, que não são medições da monografia. Para validar nativamente o Windows, execute o mesmo comando no computador pessoal; uma execução Linux não comprova todos os detalhes de permissões/OneDrive do Windows.

As fontes dos gráficos são solicitadas como Arial/sans-serif e podem variar por sistema operacional. O manifesto registra as versões instaladas do organizador e o hash de seu lockfile, separados do ambiente da coleta. Os valores das tabelas não dependem da fonte disponível; hashes de PNGs servem para conferir um pacote já gerado, não para exigir igualdade de pixels entre sistemas diferentes.
