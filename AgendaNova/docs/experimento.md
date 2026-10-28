# Protocolo experimental — AgendaNova

## Escopo

Compare exclusivamente `scripts/pdf/export-direct.ts` e `scripts/pdf/export-raster.ts`. Os dois arquivos e `prepare-page.ts` permanecem inalterados, assim como conteúdo, dados, componentes e CSS. Nenhuma outra agenda participa deste experimento. O teste legado `test:print` é uma verificação histórica de migração e **não** é o avaliador experimental.

A coleta definitiva deve ser executada no computador pessoal, com Windows, Node 24 LTS (24.19.0 no desenvolvimento), Git e dependências do `package-lock.json`. A análise usa PDF.js 6.4.299, canvas nativo 1.0.13 e pngjs 7.0.0, fixados; os tipos do pngjs são apenas para TypeScript. A coleta não importa as bibliotecas de análise. Node anterior a 22.13 não atende a dependência de análise; prefira a versão indicada em `.nvmrc`.

## Preparar no Windows (PowerShell, terminal do VS Code)

1. Abra a pasta AgendaTCC no VS Code. Não deixe outros experimentos ou exportadores rodando. Aplicações pesadas, atualizações e antivírus podem introduzir variação; registre as condições e use alimentação/regras de energia consistentes. Não desative proteções para executar o experimento.
2. No terminal, entre em `AgendaNova` (se já estiver nela, não repita `cd`). Verifique o Node e instale exatamente o lockfile:

   ```powershell
   cd AgendaNova
   node --version
   git --version
   npm ci
   npx playwright install chromium
   npm run typecheck
   npm test
   npm run test:experiment
   ```

3. Use preferencialmente o Chromium instalado pelo Playwright 1.57.0. Para remover uma seleção anterior de navegador e qualquer permissão de fonte alternativa:

   ```powershell
   Remove-Item Env:CHROMIUM_PATH -ErrorAction SilentlyContinue
   Remove-Item Env:ALLOW_FALLBACK_FONT -ErrorAction SilentlyContinue
   ```

   Não misture resultados de navegadores ou versões diferentes. Se precisar selecionar um executável específico, use `$env:CHROMIUM_PATH = 'C:\caminho\chrome.exe'` e mantenha o mesmo durante toda a sessão. O programa registra caminho, hash e versão. Se o caminho for um launcher, o hash identifica o launcher; a versão reportada pelo navegador também é conferida por tentativa.

4. Reserve vários GB para PDFs, PNGs intermediários e análises. O projeto tem 34 páginas; capturas e mapas de diferenças podem ocupar mais espaço que os PDFs.

## Piloto (não é resultado da monografia)

```powershell
npm run experiment:pilot
```

O piloto faz **um bloco de aquecimento e um bloco medido**, portanto quatro exportações sem falhas. Fica em uma pasta com prefixo `pilot-`. Se estiver desenvolvendo e houver alterações não commitadas, somente o piloto aceita:

```powershell
npm run experiment:pilot -- --allow-dirty
```

O commit base, indicador `dirty`, estado Git, hashes e cópia dos arquivos-fonte são preservados. A coleta oficial não aceita essa exceção. Não apresente estatísticas do piloto como resultados definitivos.

## Coleta oficial

Registre primeiro todas as alterações da infraestrutura em um commit. O executor exige o repositório limpo: execute `git status` e resolva alterações intencionais antes de coletar. Não use reset para descartar trabalho apenas para satisfazer essa verificação.

```powershell
npm run experiment
```

Não execute `npm run dev` nem inicie o preview manualmente para a coleta. O executor:

1. Cria uma sessão exclusiva `artifacts/experiments/official-<timestamp>-<id>/`.
2. Preserva fontes, metadados, lockfile e hashes.
3. Verifica tipos e gera **um único build** dentro da sessão, sem reutilizar `dist/`.
4. Inicia um servidor desse build em `http://127.0.0.1:4175`, sem fallback de porta.
5. Faz um pré-teste de recursos, 34 folhas e Montserrat nos pesos 400, 500, 600, 700 e 800. Fonte alternativa não é aceita no protocolo.
6. Executa dois blocos de aquecimento e dez blocos medidos completos.
7. Verifica que fontes/arquivos-fonte, build e executável não foram alterados durante a sessão; encerra seu próprio servidor.

Se a porta estiver ocupada, o erro fica registrado. Não encerre processos desconhecidos: escolha outra porta antes da sessão, por exemplo `npm run experiment -- --port 4185`. A mesma URL será usada por ambos os métodos.

Em condições normais: **2 aquecimentos por técnica + 10 medições por técnica = 24 exportações**. A ordem em cada fase alterna por tentativa de bloco: direto→raster, raster→direto, e assim por diante. Não há processos exportadores simultâneos nem reutilização do navegador entre exportações. Aquecimento refere-se a caches do sistema/arquivos, não a uma instância persistente do Chromium. Cada navegador continua sendo aberto e fechado pelo exportador original.

## Falhas, reposições e interrupção

Um resultado operacionalmente válido exige saída zero, manifesto coerente, PDF legível com 34 páginas A4 (tolerância de 1 ponto nas dimensões), bytes reais iguais ao manifesto, navegador/URL/parâmetros iguais e fontes sem falhas. O critério estrutural não exige sucesso nas análises de texto ou imagem.

Um bloco só entra na análise pareada principal se **as duas tentativas forem válidas**. Se uma falhar, a outra continua registrada como válida individualmente, com `includedInPrimaryAnalysis=false` e motivo de exclusão do par. O próximo bloco usa a próxima ordem alternada. Não se apagam valores extremos nem se repetem resultados por serem lentos ou visualmente ruins.

Há no máximo 4 tentativas de bloco de aquecimento e 20 tentativas de bloco medido. Portanto, falhas podem aumentar o número total de exportações, sem aumentar a amostra principal além de dez pares completos. Falta de cota encerra a sessão como `failed`, com resultados parciais explícitos. A ordem realizada dos pares aceitos é preservada; falhas podem desequilibrar a ordem entre os pares aceitos, o que deve ser relatado.

Cada subprocesso tem limite de 180 segundos. O executor registra saída, erro, código, sinal e tempo. No Windows usa `taskkill /T /F` somente para a árvore de um processo que ele iniciou quando precisa interrompê-lo. No POSIX utiliza grupo de processos próprio. Ctrl+C pede interrupção e grava os resultados disponíveis. Queda de energia/encerramento forçado pode deixar status `running` ou `collecting`; não reclassifique como sucesso. Preserve a sessão e inicie outra.

Para reconstruir o CSV e o resumo a partir dos manifestos preservados, sem executar novamente os exportadores:

```powershell
$sessao = 'C:\seu caminho\AgendaTCC\AgendaNova\artifacts\experiments\official-...'
npm run experiment:report -- "$sessao"
```

O resumo só marca `primarySampleComplete=true` quando a sessão terminou e a cota de pares foi atingida. Estatísticas parciais de uma sessão incompleta não são a coleta oficial final.

## Definição das métricas

- **processTotalMs (principal):** relógio monotônico do processo pai, imediatamente antes de `spawn`, até o evento `close` do subprocesso (processo encerrado e canais de saída fechados). Inclui inicialização do Node/tsx, imports, abertura do navegador, carregamento, renderização, geração, gravações do exportador, manifesto original e fechamento do navegador. A geração de logs ocorre durante o processo; a espera final da escrita dos logs é posterior ao registro do tempo. Não mede sincronização física do disco (`fsync`). Não inclui build, pré-teste, validação estrutural ou análise posterior.
- **exporterElapsedMs (complementar):** valor `elapsedMs` original. Começa após os imports, antes de `preparePage`; termina ao compor o manifesto, antes da consulta final de folhas, gravação do manifesto e fechamento do navegador. Não é tempo isolado da chamada de conversão. Não substitui a métrica principal.
- **bytes:** tamanho do PDF real. O raster também grava PNGs intermediários durante a exportação, como antes; esse custo faz parte do método implementado. Os PNGs não são somados ao tamanho do PDF.
- **pages:** páginas lidas do PDF, e não apenas quantidade de elementos HTML. As 34 folhas do manifesto original também são verificadas.

Os parâmetros comuns são mídia print, movimento reduzido, viewport 794×1123, deviceScaleFactor 2, mesmas fontes locais, build, URL e navegador. Parâmetros específicos permanecem: direto com `page.pdf()`, A4 CSS, escala 1 e margens externas zero; raster com PNGs de cada `.sheet` e páginas pdf-lib de 595,28×841,89 pontos. A escala de dispositivo não torna os modelos de renderização idênticos: o direto retém texto/vetores e pode rasterizar efeitos internamente; o raster incorpora capturas.

Os manifestos incluem timestamp UTC, ID da sessão, commit completo, hashes, método, bloco, ordem, status e ambiente. O horário em UTC evita ambiguidade; não é usado para medir duração.

## Arquivos e estatísticas

```text
artifacts/experiments/<sessao>/
├── session.json
├── source/                 # cópia das entradas, inclusive para piloto dirty
├── build/                  # único build utilizado
├── typecheck.*.log
├── build.*.log
├── attempts/
│   └── measured-01-1-direct/
│       ├── attempt.json    # sempre criado antes do subprocesso
│       ├── stdout.log
│       ├── stderr.log
│       ├── agenda-direct.pdf
│       └── direct.json     # manifesto original, sem alteração de esquema
├── results.csv
└── summary.json
```

O CSV usa UTF-8 com BOM, vírgula e aspas conforme CSV; no Excel em português use **Dados → De Texto/CSV**, escolha UTF-8 e delimitador vírgula, em vez de depender do duplo clique. Inclui aquecimentos, falhas e reposições. Filtre a amostra principal por sessão concluída, `phase=measured`, `status=valid` e `includedInPrimaryAnalysis=true`. Não misture sessões diferentes nem piloto com oficial.

O JSON resume média, mediana, desvio-padrão **amostral** (n−1), mínimo e máximo por método para tempos, bytes e páginas. Com n<2 o desvio-padrão é nulo, não zero. Preserva dez pares por `acceptedBlock`, IDs e método executado primeiro. Reporta diferenças absolutas e percentuais pareadas, além de diferenças percentuais entre médias. A fórmula é **100×(raster−direto)/direto**; sinal positivo significa maior tempo/tamanho do raster. Denominador zero produz valor nulo. Não há teste de hipótese, remoção de outliers ou conclusão causal automática.

## Análises posteriores (comando separado)

Espere a coleta encerrar. Copie o caminho da sessão impresso pelo executor e rode:

```powershell
$sessao = 'C:\seu caminho\AgendaTCC\AgendaNova\artifacts\experiments\official-...'
npm run experiment:analyze -- "$sessao"
```

O analisador aceita somente sessões concluídas. Usa o build preservado, confere hashes, abre o mesmo navegador e produz a referência **após a coleta de desempenho**. Analisa as tentativas medidas, inclusive tentativas medidas excluídas da amostra principal; erros de análise são registrados separadamente. Os aquecimentos continuam preservados, mas não são analisados por padrão. Cada chamada cria uma nova pasta `analysis-<timestamp>` sem sobrescrever análises anteriores. Falhas de processamento não alteram as métricas da coleta.

### Extração/pesquisa de texto

PDF.js extrai texto de todas as páginas, sem OCR. `text.csv` registra caracteres, consulta, página esperada no HTML e presença no PDF; `text.json` preserva texto por página. As consultas fixas estão em `protocol.ts`. Normalização: Unicode NFKC, espaços/quebras de linha colapsados, comparação sem distinguir maiúsculas, **preservando acentos e pontuação**. Fragmentação interna do PDF pode afetar buscas literais; inspecione o texto extraído antes de atribuir uma ausência a conteúdo perdido.

Ausência de texto pesquisável no raster é característica esperada da técnica imagem, não falha operacional. No direto, investigue consultas esperadas ausentes. Não há OCR, indexação externa ou nova técnica de exportação.

### Comparação visual e seus limites

A referência comum são capturas das `.sheet` do mesmo build da AgendaNova, com fontes carregadas, mídia print, escala 2 e animações desabilitadas. PDF.js/canvas renderiza ambos os PDFs com o mesmo motor e fundo branco. Cada página inteira é normalizada para o tamanho da captura (aproximadamente 1588×2246); a transformação vertical e dimensões originais são registradas. Não há recorte de margens, alinhamento adaptativo ou deslocamento para melhorar artificialmente a correspondência. A pequena diferença de pontos do A4 entre os métodos fica documentada, não é corrigida nos exportadores.

`visual.csv` registra erro absoluto médio e RMSE em canais RGB de 0–255, mais proporção de pixels cujo maior erro de canal excede **16/255**. O limiar está fixado na versão 1 do protocolo; não é um limite de aprovação. Há imagens renderizadas e mapas de diferenças (pixels divergentes em vermelho). Não há SSIM ou dependência adicional para ela.

**A referência HTML favorece potencialmente o raster**, que também parte de capturas do navegador. As métricas são indicadores complementares, não ranking definitivo de qualidade. PDF.js também não representa todos os leitores. Antialiasing, cores e rasterização de fontes afetam diferenças numéricas sem necessariamente prejudicar leitura.

`qualitative.csv` é uma ficha **pendente de revisão humana**, com campos para leitor, dispositivo, avaliador, legibilidade, nitidez, cortes, sobreposições, zoom 100%, 200% e 400% e observações. Compare as mesmas páginas lado a lado; procure caracteres deformados, linhas ou rodapés cortados, blocos sobrepostos e perda de nitidez ao ampliar. Registre o leitor/versão, dispositivo e zoom; confira ao menos um leitor Windows e o celular de interesse. Não marque uma inspeção como realizada sem fazê-la. Avaliação subjetiva e testes em dispositivos não são substituídos por números de pixels.

Somente no piloto pode-se reduzir as páginas comparadas visualmente, por exemplo:

```powershell
npm run experiment:analyze -- "$sessao" --pilot-pages 1,5,13,34
```

A extração textual continua cobrindo todas as páginas. A seleção fica no manifesto e não pode ser usada para a coleta oficial, que compara todas as páginas.

## Armazenamento e limpeza opcional

Tudo permanece por padrão. Nunca limpe enquanto a medição estiver ativa. Após finalizar a coleta, pode remover **somente PNGs intermediários do exportador raster**:

```powershell
npm run experiment:clean-png -- "$sessao"
```

O comando exige status finalizado, não acessa outras agendas, PDFs, manifestos, logs ou imagens da análise. Salva um manifesto `cleanup-*.json` com caminho, bytes, hash e estado de remoção de cada arquivo, registrando a intenção antes de remover. O custo original de gerar PNGs já foi medido e não é alterado pela limpeza. A análise pode reconstruir suas referências sem esses intermediários.

`artifacts/`, `dist/` e dependências já são ignorados por `.gitignore`. Mantenha backup dos resultados fora do Git, com manifestos e hashes. Não publique só as médias: preserve tentativas, motivos de exclusão e observações qualitativas.

## Validação da implementação (piloto de desenvolvimento)

Em 28/10/2026, foi executado um piloto Linux com Chromium de sistema 154.0.8037.57, identificado como `pilot`, com alterações locais explicitamente marcadas e fontes/build preservados. Foram quatro exportações válidas: um aquecimento e uma medição por método. Não houve coleta oficial nem avaliação de desempenho definitiva.

A análise posterior percorreu todas as 34 páginas dos dois PDFs medidos: 68 imagens renderizadas, 340 verificações de consulta textual e 68 fichas qualitativas pendentes. O direto encontrou as 20 ocorrências esperadas das consultas; o raster não apresentou texto pesquisável, como esperado sem OCR. Esses números verificam o fluxo, não estabelecem qualidade geral da extração.

O PDF.js emitiu avisos `Failed to compile PostScript function to wasm, falling back to JS` ao interpretar alguns efeitos do PDF direto. A análise terminou usando o fallback JavaScript do próprio motor; os avisos foram preservados em `analysis-*/stderr.log`. Isso ocorre após a coleta e não altera os tempos dos exportadores. Deve ser considerado ao interpretar imagens e métricas do renderizador, sem generalizar o resultado para outros leitores.

Os testes automatizados cobrem programação de 24 exportações oficiais, ordem, ausência de sobreposição, reposições limitadas, interrupção, tempos/saídas de subprocessos, timeout, falha ao iniciar processo, CSV, estatísticas pareadas, validação do PDF real, diretórios exclusivos, exclusão Git e limpeza documentada de PNGs em uma sessão sintética. A limpeza não foi aplicada aos PNGs do piloto real. O build e os testes de dados existentes também passaram.

O ambiente Windows e o Chromium instalado pelo Playwright no computador pessoal ainda precisam do piloto local. As fichas de legibilidade/nitidez, ampliações e leitores de celular permanecem para avaliação humana. O diretório local do piloto não é versionado; os scripts permitem reproduzir a verificação.

Se o PowerShell bloquear o lançador `npm.ps1`, utilize `npm.cmd` e `npx.cmd` nos mesmos comandos, sem alterar a política de execução. Não rode coleta e análise simultaneamente, mesmo de sessões diferentes. O executor controla apenas seus próprios processos; outros programas e processos externos continuam sendo responsabilidade do ambiente de coleta.
