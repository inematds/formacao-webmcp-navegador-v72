# PLANO — Agentes de navegador: testar o site como o agente vê (Formação WebMCP · curso 3 de 6) — 19/10/2026

Repo `inematds/formacao-webmcp-navegador-v72`. Peça do CURRICULO: `~/projetos/wifi/longrun/2026-10-19-formacao-webmcp-v72/CURRICULO.md` §3. Régua de "atual": `PESQUISA-ESTADO-DA-ARTE.md` (19/10/2026).
Público: dev ou QA que edita HTML/JS e roda terminal. Sai com uma bateria de tarefas que um agente roda contra o próprio site (local).
Kit: `kit/` — Playwright 1.64.0 (07/10/2026, Chromium 156.0.8078.4), `@playwright/mcp` 0.0.83 (28/09/2026), `chrome-devtools-mcp` 1.10.1 (23/09/2026; a 1.11.0 é de 15/10 e não foi testada), `@modelcontextprotocol/sdk` 1.32.1 (05/10/2026, só o cliente de ensaio). Node 20.19+ (exigência do chrome-devtools-mcp). Site fictício Oficina Pedal Livre (o mesmo do curso 0) servido em 127.0.0.1. **Nenhum passo chama modelo**, exceto o passo opcional da aula 6 (um `claude -p`, verificado só pelo formato).

## Conferência das fontes (passo 0, regra do Nei de 19/10)

Legenda: **confere** com a PESQUISA · **velho** (substituído pelo atual, não copiado) · **sem confirmação** (fora, ou "relatado por X").

| Fonte antiga | O que afirma | Marca | O que o curso 3 usa |
|---|---|---|---|
| `webmcp-4-agent-developer/curso/agent/modulo-3-1` | Descoberta: `document.modelContext.getTools()`; descritor = nome, descrição, `inputSchema`, anotações | **confere** (§1.2) | Aula 4, lado consumidor, rodando de verdade pelo Playwright MCP 0.0.83 (`webmcp_<nome>`) |
| idem 3-1/3-2 | Código com `model.chooseTool(context)`, `gate.evaluate(...)`, `validator.validate(...)` | **velho / pseudo-API** (não existe em pacote nenhum) | Não copiado; o kit é a fonte (`consumir.mjs`) |
| idem 3-2 | "Chamada do modelo é proposta não confiável; política antes do efeito" | **confere** (§1.8, §3.1) | Aula 4: ferramenta com consequência não é chamada sozinha; ameaça a fundo → curso 4 |
| idem 3-3 | `registerTool(tool, { exposedTo: [...], signal })`; "same-origin é o padrão"; permissions policy `tools` | **confere** (§1.2, §1.8) | Aula 4 roda `origens.mjs`: sem `allow="tools"` → `NotAllowedError` (Chromium 156, flag de teste) |
| idem 3-3 | Snapshot da spec de 17/09/2026 | **velho** | Spec de **16/10/2026**; tudo com selo "experimental em 19/10/2026" |
| idem 3-4 | Laço observar → decidir → agir com orçamento (`maxCalls: 4`) | **confere** como ideia | Aula 5/6: "parada" do contrato = orçamento de 10 ações + login/verificação/confirmação |
| idem (todo o curso) | Sem o mapa de agentes de out/2026; "adaptadores de modelo" nunca escritos | **velho / incompleto** | Aula 1 com o mapa datado (PESQUISA §3) |
| `astra-computer-use` trilha 1, mód. 1-2 | Contrato de prompt em 4 partes: APP · RESULTADO · ESCOPO · PROVA; "bloqueio bem reportado" | **confere** como método (não depende de modelo) | Aula 5 adapta para objetivo · limites · prova · parada; placeholders `<APP>` viram `[colchetes]` |
| idem (todo o curso) | Preso a um nome de modelo ("GPT-6 Astra"); fluxos com Google Flights, Descript e apps de terceiros; vídeo de terceiro como fonte | **velho / preso a modelo / terceiro** | Nada disso entra: nenhum nome de modelo, nenhum site de terceiro automatizado, nenhum vídeo citado |
| idem trilha 2, mód. 2-3 | "Um agente testa outro": tarefa pequena só de leitura, observar, ponto de falha, reteste | **confere** como método | Aula 6 vira bateria local: o robô de ensaio e o seu agente rodam as mesmas tarefas e gravam resultado em arquivo |
| `agent-browser/README.md` | `snapshot` devolve árvore de acessibilidade com refs | **confere** (§3.4) | Aula 2 usa o Playwright MCP (refs `e13`, `e15`…) |
| PESQUISA §3.4 | Playwright MCP usa snapshot de acessibilidade e "hoje recomenda CLI+skills para agentes de código" | **confere** | Aula 2; a versão 0.0.83 ainda tem as ferramentas `browser_*` por MCP (capturado) |
| PESQUISA §3.4 | Chrome DevTools MCP "for coding agents" | **confere** | Aula 3 com a 1.10.1: `list_console_messages`, `list_network_requests` (capturado) |
| PESQUISA §3.1 | Anthropic, 24/11/2025: taxa de ataque ~1% "still represents meaningful risk. No browser agent is immune" | **confere** (com data) | Aula 1 e 7, citado como posição datada do fornecedor; tema a fundo → curso 4 |
| PESQUISA §3.1 | GA do Claude para Chrome em ago/2026 | **[2ª/incerto]** | Fora como fato |
| PESQUISA §3.2 | ChatGPT Atlas, "hardening" 22/12/2025 | **[2ª]** (página primária deu 403) | Aula 1: "relatado pela cobertura, não confirmado em 19/10/2026" |
| PESQUISA §3.3 | Google "auto browse" no Chrome (28/01/2026); Android em 18/08/2026 | **[2ª]** / **[incerto]** | Aula 1: só o primeiro, como "relatado"; Android fora |
| PESQUISA §3.4 | browser-use | **[incerto]** | Fora |
| PESQUISA §3.5 | OSWorld: humanos 72,36% × melhor modelo 12,24% no artigo original; OSWorld 2.0 em 26/06/2026; placar atual não lido | **confere** só o artigo original | Aula 1, como conceito ("benchmark de computer use"); nenhum número de placar atual |
| PESQUISA §1.5–1.6 | WebMCP: rascunho CG 16/10/2026, OT Chrome 149–156, Edge 150, flag `#enable-webmcp-testing` | **confere** | Aula 4 com selo; o Chromium do Playwright 1.64.0 (156) roda com `--enable-features=WebMCPTesting` |
| Bundle do Playwright 1.64.0 (`tools/backend/webmcp.ts`) | Lê `document.modelContext ?? navigator.modelContext` | **fato do código** | Aula 4 cita `navigator.modelContext` só como **nome antigo** que a ferramenta ainda aceita |
| `chrome-devtools-mcp` 1.10.1 `--help` | WebMCP requer "Chrome 150+ com `--enable-features=WebMCP`"; telemetria ligada por padrão | **fato do pacote** | Aula 3 desliga a telemetria; aula 4 usa a flag do kit (`WebMCPTesting`) e anota a diferença de nome |
| Servidores MCP de navegador (Playwright MCP, DevTools MCP) | Ligados com `@modelcontextprotocol/sdk` 1.x | **fato** | O curso não ensina o protocolo (revisão 2026-07-28 → curso 1, `formacao-webmcp-mcp-v72`); só usa o cliente para o ensaio |

Atualizações em relação aos cursos antigos (vão para o retorno):
1. Mapa de agentes: nenhum nos cursos antigos → **out/2026 com status datado** (Claude para Chrome beta desde 24/11/2025; Atlas e auto browse só "relatados"; Playwright MCP 0.0.83 e Chrome DevTools MCP 1.10.1 testados).
2. Lado consumidor do WebMCP: pseudo-código (`model.chooseTool`) → **dois servidores reais** que já consomem WebMCP (Playwright MCP `webmcp_*`, DevTools MCP `list_webmcp_tools`), rodados em 19/10/2026.
3. `exposedTo`/origem: só texto → **observado no Chromium 156** (getTools por documento; `NotAllowedError` sem `allow="tools"`; agente de automação vê todos os frames).
4. Snapshot da spec 17/09 → **16/10/2026**; `navigator.modelContext` só como nome antigo aceito pelo Playwright.
5. Contrato do astra (preso a "GPT-6 Astra", apps de terceiros) → **objetivo · limites · prova · parada**, sem modelo, contra página local.
6. "Um agente testa outro" → **bateria local em arquivo** (`rodar-bateria.mjs` + `conferir-resultados.mjs`), mesma tarefa no ensaio e no agente real.

## As 8 aulas

| # | slug | Objetivo (≤160) | Diagrama | Prática · pronto quando |
|---|---|---|---|---|
| 1 | mapa | Situar computer use, extensões, navegadores com agente e ferramentas de dev, com status datado, e deixar o kit pronto. | 4 famílias de agente | `node versoes.mjs` → `kit pronto: 4 de 4 peças obrigatórias` · `saída: 0` |
| 2 | playwright-mcp | Fazer pelo Playwright MCP o que o agente faz: ler o snapshot, achar o controle pela ref e agir, e ligar o servidor ao seu agente. | página → snapshot → ref → ação | `node ver-como-agente.mjs` → `→ 2 (08:00, 13:00) em 7 chamadas` · `saída: 0` |
| 3 | devtools-mcp | Ver pelo Chrome DevTools MCP o console e a rede da página que o agente abriu e zerar os erros. | agente → DevTools MCP → console/rede | `node devtools.mjs` → `erros no console: 0 … com falha: 0` · `saída: 0` (cópia corrigida) |
| 4 | consumir-webmcp | Ver como um agente descobre e chama ferramentas WebMCP, o que muda sem a API e quem vê o quê entre origens. | página → descoberta → anotações → chamada | `node consumir.mjs nativo` → `horários: 09:30, …` · `saída: 0`; `sem` → `formulário na árvore: sim` |
| 5 | contrato | Escrever o contrato de uma tarefa de navegador com objetivo, limites, prova e parada, e conferir que está completo. | 4 partes | `node conferir-contrato.mjs meu-contrato.md` → `contrato ok: 4/4 partes` · `saída: 0` |
| 6 | agente-testa | Rodar uma bateria de tarefas contra o site e gravar o resultado em arquivo, no ensaio e com o seu agente. | bateria → robô/agente → resultados.jsonl | `node rodar-bateria.mjs bateria.json` → `3 como esperado` · `saída: 0`; agente: `linhas JSON válidas: 3 de 3` |
| 7 | onde-falha | Reconhecer onde a tela falha (conteúdo dinâmico, login, verificação, confirmação) e fazer o agente parar e chamar a pessoa. | tarefa → sinal → parar | `node rodar-bateria.mjs limites.json` → `4 como esperado (ok 1 · parou 3 · falhou 0)` · `saída: 0` |
| 8 | bateria | Montar a bateria de tarefas do seu site e conferir que cada tarefa tem contrato, prova e parada (mapa + gerador). | mapa (4 degraus) + gerador | `node conferir-bateria.mjs minha-bateria.json` → `bateria ok: N tarefas · 4 partes em todas` · `saída: 0` |

Dono de cada assunto (só link): panorama agente × site e acessibilidade → curso 0; protocolo MCP 2026-07-28 → curso 1; registrar ferramenta WebMCP → curso 2; prompt injection, confirmação e `exposedTo` como ameaça → curso 4; evals a fundo → `loop-r-eng-verificacao-v72`; bateria congelada e regressão quando a spec muda → curso 5.
Vídeo: nenhum (o short WebMCP é do curso 0; não há vídeo publicado de agentes de navegador). Sem avatar novo.
