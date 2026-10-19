// devtools.mjs — abre a página pelo Chrome DevTools MCP 1.10.1 e lista o que o agente veria no
// console e na rede (aula 3). Ensaio sem modelo: o script faz as chamadas que um agente faria.
// Telemetria desligada (--no-usage-statistics, --no-performance-crux): por padrão o servidor manda uso ao Google.
// Uso:
//   node devtools.mjs                     → página inicial do kit (tem um erro de propósito)
//   node devtools.mjs https://[seu-site]  → a sua página (só lê)
// Saída 0 = nenhum erro no console e nenhuma requisição com falha; 1 = há erro para olhar.
import { ligar } from './lib/mcp.mjs';
import { servir, semPorta } from './lib/servidor.mjs';

const alvo = process.argv.slice(2).find(a => /^https?:\/\//.test(a));
const srv = alvo ? null : await servir();
const url = alvo || srv.url;
const mcp = await ligar('devtools');
let codigo = 1;
try {
  const paginas = (await mcp.chamar('list_pages')).texto;
  const pageId = Number((paginas.match(/^(\d+):/m) || [])[1]);   // o servidor exige pageId (padrão do 1.10.1)
  console.log(semPorta(`→ navigate_page {"url":"${url}","pageId":${pageId}}`));
  const nav = await mcp.chamar('navigate_page', { url, pageId });
  if (nav.erro) throw new Error(nav.texto.split('\n')[0]);
  await new Promise(ok => setTimeout(ok, 800));                    // deixa o fetch da página terminar
  console.log(`→ list_console_messages {"pageId":${pageId}}`);
  const consola = (await mcp.chamar('list_console_messages', { pageId })).texto;
  const erros = consola.split('\n').filter(l => /^msgid=\d+ \[error\]/.test(l));
  for (const l of erros) console.log('  ' + l.replace(/^msgid=\d+ /, '').replace(/ \(\d+ args?\)$/, ''));
  console.log(`→ list_network_requests {"pageId":${pageId}}`);
  const rede = (await mcp.chamar('list_network_requests', { pageId })).texto;
  const reqs = rede.split('\n').filter(l => /^reqid=\d+ /.test(l));
  const falhas = reqs.filter(l => !/\[(2\d\d|3\d\d)\]$/.test(l));
  for (const l of reqs) console.log('  ' + semPorta(l.replace(/^reqid=\d+ /, '')));
  console.log(`erros no console: ${erros.length} · requisições: ${reqs.length} · com falha: ${falhas.length}`);
  codigo = erros.length || falhas.length ? 1 : 0;
} catch (e) { console.log(`falhou: ${e.message}`); }
await mcp.fechar(); await srv?.fechar();
process.exit(codigo);
