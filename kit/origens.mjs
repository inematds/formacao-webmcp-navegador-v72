// origens.mjs — quem vê qual ferramenta quando a página embute um iframe de outra origem (aula 4).
// Vitrine (origem A, kit/site) + widget de frete (origem B, kit/site-widget, outra porta).
// Roda no Chromium do kit com a flag de teste do WebMCP. EXPERIMENTAL: o build pode divergir da spec.
// Saída 0 = as quatro observações rodaram.
import { chromium } from 'playwright';
import { resolve } from 'node:path';
import { servir, KIT } from './lib/servidor.mjs';
import { ligar, FLAG_WEBMCP } from './lib/mcp.mjs';

const a = await servir();
const b = await servir({ pasta: resolve(KIT, 'site-widget') });
const pagina = allow => `${a.url}vitrine.html?widget=${encodeURIComponent(b.url)}${allow ? '' : '&allow=0'}`;
const nomes = async alvo => (await alvo.evaluate(async () => (await document.modelContext.getTools()).map(t => t.name).sort())).join(', ');
let codigo = 1;
const browser = await chromium.launch({ args: [FLAG_WEBMCP] });
try {
  console.log(`Chromium ${browser.version()} (Playwright) · modo: nativo · spec de 16/10/2026`);
  const p = await browser.newPage();
  await p.goto(pagina(true));
  await p.waitForFunction(() => document.querySelector('iframe'));
  const frame = () => p.frames().find(f => f !== p.mainFrame());
  await frame().waitForFunction(() => document.body.dataset.registro, null, { timeout: 10000 });
  console.log(`1. vitrine (origem A) · getTools(): ${await nomes(p)}`);
  console.log(`2. widget (origem B, allow="tools") · registro: ${await frame().evaluate(() => document.body.dataset.registro)} · getTools(): ${await nomes(frame())}`);
  await p.goto(pagina(false));
  await frame().waitForFunction(() => document.body.dataset.registro, null, { timeout: 10000 });
  console.log(`3. widget sem allow="tools" · registro: ${await frame().evaluate(() => document.body.dataset.registro)}`);
  const mcp = await ligar('playwright', { webmcp: true });
  await mcp.chamar('browser_navigate', { url: pagina(true) });
  await new Promise(ok => setTimeout(ok, 1500));
  await mcp.chamar('browser_snapshot', {});
  const vistas = (await mcp.ferramentas()).filter(f => f.name.startsWith('webmcp_')).map(f => f.name).sort();
  console.log(`4. Playwright MCP 0.0.83 (agente de automação, todos os frames) · vê: ${vistas.join(', ')}`);
  await mcp.fechar();
  codigo = 0;
} catch (e) { console.log(`falhou: ${e.message}`); }
await browser.close(); await a.fechar(); await b.fechar();
process.exit(codigo);
