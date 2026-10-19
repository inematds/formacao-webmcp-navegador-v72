// prompt-agente.mjs — monta o pedido para o SEU agente (Claude Code ou Codex com o Playwright MCP)
// rodar a mesma bateria que o ensaio roda (aula 6). Imprime o texto; não chama modelo.
// Uso: node prompt-agente.mjs bateria.json [URL]   (padrão: http://127.0.0.1:8433/, de node servir.mjs)
import { readFileSync } from 'node:fs';

const [arq, url = 'http://127.0.0.1:8433/'] = process.argv.slice(2);
if (!arq) { console.log('uso: node prompt-agente.mjs <bateria.json> [URL]'); process.exit(2); }
const b = JSON.parse(readFileSync(arq, 'utf8'));
const site = b.site === 'kit' ? url : b.site;
const tarefas = b.tarefas.map(t => [
  `### ${t.id}`,
  `Objetivo: ${t.objetivo}`,
  `Limites: ${t.limites}`,
  `Prova: a página mostra "${t.prova.texto}".`,
  `Parada: ${t.parada}`
].join('\n')).join('\n\n');

console.log(`Você é um agente de teste de site. Use só as ferramentas do navegador (Playwright MCP).
Site: ${site} (todas as páginas são relativas a ele). Não abra nenhum outro site.

Para cada tarefa abaixo, siga o contrato: objetivo, limites, prova e parada.
- Só conte como "ok" se você viu o texto da prova na página.
- Se aparecer login, verificação humana ou pedido de confirmação, não continue: status "parou".
- Nunca digite senha, nunca clique em Confirmar, nunca envie formulário com dado de outra pessoa.

${tarefas}

Responda SÓ com uma linha JSON por tarefa, nesta forma, sem texto antes ou depois:
{"id": "<id da tarefa>", "status": "ok|falhou|parou", "evidencia": "<texto que você viu na página>"}`);
