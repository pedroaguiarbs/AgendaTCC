# Agenda Ministerial — versões do TCC

Este repositório mantém três versões independentes da mesma agenda de 2026:

| Pasta | Tecnologias | Objetivo |
| --- | --- | --- |
| [AgendaAntiga](AgendaAntiga/) | HTML, CSS e scripts JavaScript | Referência original |
| [AgendaNova](AgendaNova/README.md) | React, TypeScript e Tailwind CSS | Modernização preservando a aparência original |
| [AgendaSimplificada](AgendaSimplificada/README.md) | React, TypeScript e Tailwind CSS | Mesmo conteúdo e paginação, com cores sólidas e menos efeitos visuais |

As duas versões React mantêm 170 eventos e 34 folhas A4. Ambas possuem exportação direta pelo Chromium/Playwright e rasterização das folhas com montagem por `pdf-lib`. Na versão simplificada, os dois métodos usam o mesmo perfil visual, sem mudar a resolução do raster, para permitir uma comparação controlada.

## Abrir a versão simplificada

Com Node.js 24 LTS instalado, abra o terminal na raiz `AgendaTCC`:

```sh
cd AgendaSimplificada
npm ci
npm run dev
```

Abra o endereço mostrado no terminal. A porta reservada é **5174**. A `AgendaNova` usa **5173**, então as duas podem rodar simultaneamente em terminais separados. Para encerrar um servidor, pressione Ctrl+C.

## Gerar os PDFs simplificados

Mantenha a aplicação simplificada rodando e abra outro terminal dentro de `AgendaSimplificada`:

```sh
npx playwright install chromium
npm run pdf:direct
npm run pdf:raster
npm run test:pdf
```

Os arquivos ficam em `AgendaSimplificada/artifacts/pdf/`. Cada versão mantém seus próprios arquivos de saída. PDFs, capturas, dependências e builds não são enviados ao GitHub; são gerados localmente.

Consulte os READMEs de cada versão para estrutura, testes, parâmetros e cuidados metodológicos do TCC. As alterações de simplificação não modificam `AgendaAntiga` nem `AgendaNova`.
