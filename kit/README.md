# Kit — Agentes de navegador (Formação WebMCP, curso 3 de 6)

Site fictício (Oficina Pedal Livre) servido só em 127.0.0.1, dois servidores MCP de navegador e a bateria de tarefas que um agente roda contra o site. Versões fixadas em 19/10/2026. Nenhum script chama modelo; o único passo com modelo é o opcional da aula 6 (`blocos/a6b-agente.sh`).

```bash
cd ~/projetos/formacao-webmcp-navegador-v72/kit
npm ci && npx playwright install chromium
node versoes.mjs                 # kit pronto: 4 de 4 peças obrigatórias
node rodar-bateria.mjs bateria.json
```

| Peça | Versão (data) |
|---|---|
| `playwright` | 1.64.0 (07/10/2026) · Chromium 156.0.8078.4 |
| `@playwright/mcp` | 0.0.83 (28/09/2026) |
| `chrome-devtools-mcp` | 1.10.1 (23/09/2026) · telemetria desligada nos scripts |
| `@modelcontextprotocol/sdk` | 1.32.1 (05/10/2026) · só o cliente de ensaio |
| Node | 20.19 ou mais novo |

| Arquivo | Aula | O que faz |
|---|---|---|
| `versoes.mjs` | 1 | confere as peças do kit |
| `ver-como-agente.mjs` | 2 | as chamadas do agente pelo Playwright MCP (snapshot, ref, ação) |
| `configurar.mjs` | 2 | escreve `.mcp.json` (Claude Code) e imprime o trecho do Codex |
| `devtools.mjs` | 3 | console e rede pelo Chrome DevTools MCP |
| `consumir.mjs`, `origens.mjs` | 4 | o agente que consome WebMCP (experimental, rascunho de 16/10/2026) e o teste de origens |
| `conferir-contrato.mjs`, `contratos/` | 5 | as 4 partes do contrato de tarefa |
| `rodar-bateria.mjs`, `bateria.json`, `prompt-agente.mjs`, `conferir-resultados.mjs`, `servir.mjs` | 6 | bateria em arquivo, no ensaio e com o seu agente |
| `limites.json` | 7 | dinâmico, login, verificação e confirmação |
| `conferir-bateria.mjs`, `modelo-bateria.json` | 8 | a bateria do seu site |
| `blocos/`, `saidas/` | — | os blocos "Terminal" do curso e as saídas capturadas |

Regras: agente de navegador só contra este kit ou contra um site seu. Nada de login real, compra ou formulário de terceiros.

Curso: https://inematds.github.io/formacao-webmcp-navegador-v72/ · conteúdo aberto e gratuito do INEMA.CLUB.
