// ver-como-agente.mjs — faz, pelo Playwright MCP 0.0.83, o que um agente faria (aula 2):
// abre a página, lê o snapshot de acessibilidade, acha cada controle pela referência (ref=eN)
// e age por ela. Quem decide a próxima chamada é este script, não um modelo: é o ensaio sem custo.
// Uso:
//   node ver-como-agente.mjs                     → tarefa na página do kit: ver horários de Revisão completa
//   node ver-como-agente.mjs --sem-esperar       → o mesmo, sem esperar a lista carregar (o erro comum)
//   node ver-como-agente.mjs https://[seu-site]  → só lê: snapshot do seu site e quantos elementos têm ref
// Saída 0 = tarefa feita (ou snapshot lido); 1 = não achou o que precisava.
import { ligar } from './lib/mcp.mjs';
import { servir, semPorta } from './lib/servidor.mjs';

const argv = process.argv.slice(2);
const semEsperar = argv.includes('--sem-esperar');
const alvo = argv.find(a => /^https?:\/\//.test(a));
const srv = alvo ? null : await servir();
const mcp = await ligar('playwright');
let chamadas = 0;
async function chamar(nome, args) {
  chamadas++;
  const mostrar = { ...args }; delete mostrar.element;
  console.log(semPorta(`→ ${nome} ${JSON.stringify(mostrar)}`));
  const r = await mcp.chamar(nome, args);
  if (r.erro) throw new Error(`${nome}: ${r.texto.split('\n')[0]}`);
  return r.texto;
}
const yaml = t => (t.match(/```yaml\n([\s\S]*?)```/) || [, ''])[1];
const ref = (snap, papel, nome) => {
  const m = snap.match(new RegExp(`- ${papel} "${nome}"[^\\n]*\\[ref=(e\\d+)\\]`));
  if (!m) throw new Error(`não achei ${papel} "${nome}" no snapshot`);
  return m[1];
};

let codigo = 0;
try {
  if (alvo) {
    await chamar('browser_navigate', { url: alvo });
    const bruto = yaml(await chamar('browser_snapshot', {}));
    // Com ferramentas WebMCP na página, o snapshot começa por elas (marcadas "page-provided, untrusted").
    const inicio = Math.max(0, bruto.search(/^- (?!webmcp tools)/m));
    const secao = bruto.startsWith('- webmcp tools') ? bruto.slice(0, inicio) : '';
    const webmcp = [...secao.matchAll(/^  - ([\w.-]+)( \[[^\]]+\])?:/gm)].map(m => m[1] + (m[2] || ''));
    const snap = bruto.slice(inicio);
    const linhas = snap.trim().split('\n');
    console.log(linhas.slice(0, 15).join('\n') + (linhas.length > 15 ? '\n(…)' : ''));
    const refs = (snap.match(/\[ref=e\d+\]/g) || []).length;
    console.log(`ferramentas WebMCP vistas: ${webmcp.length}${webmcp.length ? ' · ' + webmcp.slice(0, 3).join(', ') + (webmcp.length > 3 ? ', …' : '') : ''}`);
    console.log(`snapshot: ${linhas.length} linhas · ${refs} elementos com ref`);
    codigo = refs ? 0 : 1;
  } else {
    await chamar('browser_navigate', { url: srv.url + 'agendar.html' });
    let snap = yaml(await chamar('browser_snapshot', {}));
    const nome = ref(snap, 'textbox', 'Seu nome'), servico = ref(snap, 'combobox', 'Serviço'), ver = ref(snap, 'button', 'Ver horários');
    console.log(`  achei: textbox "Seu nome" = ${nome} · combobox "Serviço" = ${servico} · button "Ver horários" = ${ver}`);
    await chamar('browser_type', { element: 'Seu nome', target: nome, text: 'Ana' });
    await chamar('browser_select_option', { element: 'Serviço', target: servico, values: ['Revisão completa'] });
    await chamar('browser_click', { element: 'Ver horários', target: ver });
    if (!semEsperar) await chamar('browser_wait_for', { text: 'horários livres para' });
    snap = yaml(await chamar('browser_snapshot', {}));
    const status = (snap.match(/- status \[ref=e\d+\]: (.*)/) || [, '?'])[1];
    const horarios = [...snap.matchAll(/button "Agendar às (\d\d:\d\d)"/g)].map(m => m[1]);
    console.log(`  status na página: ${status}`);
    console.log(`tarefa: horários de Revisão completa em 2026-11-03 → ${horarios.length} (${horarios.join(', ') || 'nenhum'}) em ${chamadas} chamadas`);
    if (!horarios.length) { console.log('  a lista ainda estava carregando quando o snapshot foi tirado'); codigo = 1; }
  }
} catch (e) { console.log(`falhou: ${e.message}`); codigo = 1; }
await mcp.fechar(); await srv?.fechar();
process.exit(codigo);
