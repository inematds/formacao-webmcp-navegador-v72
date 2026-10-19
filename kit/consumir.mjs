// consumir.mjs — o lado do AGENTE que consome WebMCP (aula 4), pelo Playwright MCP 0.0.83.
// WebMCP: document.modelContext, rascunho do W3C Web Machine Learning CG de 16/10/2026. EXPERIMENTAL.
// Uso:
//   node consumir.mjs nativo   → Chromium do kit com a flag de teste (--enable-features=WebMCPTesting)
//   node consumir.mjs sem      → Chromium sem a API (a maioria dos visitantes hoje): o agente cai para a tela
// O script descobre as ferramentas da página, mostra as anotações como o agente as recebe e chama
// só a de leitura. A que tem consequência (agendar_revisao) NÃO é chamada: é a pessoa quem confirma.
// Saída 0 = o caminho esperado funcionou (ferramenta no modo nativo; formulário no modo sem).
import { ligar } from './lib/mcp.mjs';
import { servir, semPorta } from './lib/servidor.mjs';
import { chromium } from 'playwright';

const modo = process.argv[2] || 'nativo';
if (!['nativo', 'sem'].includes(modo)) { console.log('uso: node consumir.mjs nativo|sem'); process.exit(2); }
const b = await chromium.launch(); const versao = b.version(); await b.close();
console.log(`Chromium ${versao} (Playwright) · modo: ${modo}`);
const srv = await servir();
const mcp = await ligar('playwright', { webmcp: modo === 'nativo' });
let codigo = 1;
try {
  const antes = (await mcp.ferramentas()).length;
  console.log(semPorta(`→ browser_navigate {"url":"${srv.url}agendar.html"}`));
  const nav = (await mcp.chamar('browser_navigate', { url: srv.url + 'agendar.html' })).texto;
  console.log('  ' + ((nav.match(/- \d+ webmcp tools? available on the page/) || ['- nenhuma ferramenta WebMCP na página'])[0]).slice(2));
  const lista = await mcp.ferramentas();
  const webmcp = lista.filter(f => f.name.startsWith('webmcp_'));
  console.log(`→ tools/list: ${antes} ferramentas do navegador + ${webmcp.length} da página`);
  for (const f of webmcp) {
    const a = f.annotations || {};
    console.log(`  ${f.name}  readOnlyHint=${a.readOnlyHint} destructiveHint=${a.destructiveHint} · "${f.description}"`);
  }
  if (webmcp.length) {
    const args = { servico: 'Troca de pneu', data: '2026-11-03' };
    console.log(`→ webmcp_consultar_horarios ${JSON.stringify(args)}`);
    const r = await mcp.chamar('webmcp_consultar_horarios', args);
    const linhas = r.texto.replace(/^### Result\n/, '').split('\n');
    console.log('  ' + semPorta(linhas[0]));
    const json = JSON.parse(r.texto.slice(r.texto.indexOf('{'), r.texto.lastIndexOf('}') + 1));
    console.log(`  horários: ${json.horarios.join(', ')}`);
    console.log('  agendar_revisao tem consequência (destructiveHint=true): o agente pede à pessoa, não chama sozinho');
    codigo = json.horarios.length ? 0 : 1;
  } else {
    console.log('  sem ferramentas: o agente usa a tela (snapshot + clique), como na aula 2');
    const snap = (await mcp.chamar('browser_snapshot', {})).texto;
    const temForm = /textbox "Seu nome"/.test(snap) && /button "Ver horários"/.test(snap);
    console.log(`  formulário na árvore: ${temForm ? 'sim (textbox "Seu nome", button "Ver horários")' : 'não'}`);
    codigo = temForm ? 0 : 1;
  }
} catch (e) { console.log(`falhou: ${e.message}`); }
await mcp.fechar(); await srv.fechar();
process.exit(codigo);
