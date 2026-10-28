# Validação da versão simplificada

Verificação funcional em 28/10/2026. Builds de produção da AgendaNova e AgendaSimplificada, Chromium 154.0.8037.57, Montserrat local carregada sem falhas, viewport 794 × 1123, escala de dispositivo 2 e mídia de impressão. Exportações executadas em série. Ambas as versões e ambos os métodos geraram **34 páginas A4**.

| Método | AgendaNova (bytes) | AgendaSimplificada (bytes) | Redução de tamanho |
| --- | ---: | ---: | ---: |
| direct | 7.149.042 | 728.852 | 89.8% |
| raster | 14.031.139 | 6.409.381 | 54.3% |

- Build e verificação de tipos passaram.
- Seis testes de dados passaram, incluindo consistência do conjunto experimental entre as versões.
- Dois testes dos PDFs reais passaram: contagem, tamanho A4 e metadados.
- Conteúdo e geometria de todas as folhas coincidem com a referência em impressão e nas larguras de tela 1440 e 794.
- Oito páginas representativas foram capturadas e a página mensal foi inspecionada visualmente.
- Nenhum gradiente, sombra, filtro ou fundo semitransparente foi detectado nos elementos e pseudo-elementos renderizados na impressão.
- O texto extraído com pdftotext dos dois PDFs diretos coincide após normalizar espaços; os dois possuem 34 páginas. O texto continua selecionável.
- A inspeção com pdfimages não encontrou imagens embutidas no PDF direto simplificado desta execução.
- Servidor de desenvolvimento iniciado na porta 5174 e aplicação identificada por resposta HTTP 200.
- Os arquivos versionados de AgendaAntiga e AgendaNova foram conferidos por SHA-256 e permaneceram intactos.

São medidas de uma execução de validação, não uma conclusão estatística de desempenho ou prova de compatibilidade com todos os leitores. Não houve teste físico no celular que apresentou o problema. Para o TCC, registre repetições, configuração e versões; as durações totais ficam nos manifestos JSON locais.

Os PDFs, imagens, resultados de geometria e manifestos desta execução ficam em artifacts/ e não são versionados. Para regenerar, siga o README desta pasta.
