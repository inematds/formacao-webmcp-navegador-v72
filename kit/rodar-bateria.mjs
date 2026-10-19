// rodar-bateria.mjs — roda uma bateria de tarefas contra o site e grava o resultado em arquivo (aulas 6, 7 e 8).
// Ensaio sem modelo: o robô segue os "passos" da tarefa usando os papéis e nomes da árvore de acessibilidade
// (getByLabel/getByRole, o mesmo que o agente lê), confere a "prova" e respeita a "parada".
// Uso: node rodar-bateria.mjs <bateria.json> [--espera MS] [--site URL]
//   "site": "kit" na bateria = a página de exemplo do kit, servida em 127.0.0.1 numa porta livre.
//   Só rode contra o kit ou contra um site SEU. Nada de login real, compra ou formulário de terceiros.
// Resultado: resultados/<nome>.jsonl, uma linha por tarefa {id, esperado, status, motivo, ms}.
// Saída 0 = toda tarefa terminou como esperado (ok ou parou); 1 = alguma divergiu.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { chromium } from 'playwright';
import { servir, semPorta, KIT } from './lib/servidor.mjs';

const argv = process.argv.slice(2);
const opt = n => { const i = argv.indexOf(n); return i >= 0 ? argv.splice(i, 2)[1] : null; };
const espera = Number(opt('--espera') ?? 3000);
const siteArg = opt('--site');
const arq = argv[0];
if (!arq) { console.log('uso: node rodar-bateria.mjs <bateria.json> [--espera MS] [--site URL]'); process.exit(2); }
const bateria = JSON.parse(readFileSync(arq, 'utf8'));
const srv = (siteArg || bateria.site) === 'kit' || !(siteArg || bateria.site) ? await servir() : null;
const base = srv ? srv.url : (siteArg || bateria.site).replace(/\/?$/, '/');
const MAX_ACOES = 10;

// Sinais de que o agente tem de PARAR e chamar a pessoa (aula 7).
async function sinalDeParada(page) {
  if (await page.locator('input[type=password]:visible').count()) return 'login exigido';
  if (await page.getByLabel(/verificação|captcha|não sou um robô|verification|verificación/i).count()) return 'verificação humana';
  if (await page.getByRole('button', { name: /^(Confirmar|Confirm)$/ }).filter({ visible: true }).count()) return 'pede confirmação da pessoa';
  return null;
}

async function rodar(page, t) {
  let acoes = 0;
  for (const p of t.passos || []) {
    if (++acoes > MAX_ACOES) return ['parou', `passou de ${MAX_ACOES} ações`];
    const [acao, valor] = Object.entries(p)[0];
    if (acao === 'abrir') await page.goto(new URL(valor, base).href);
    else if (acao === 'preencher') await page.getByLabel(valor[0], { exact: true }).fill(valor[1], { timeout: 3000 });
    else if (acao === 'escolher') await page.getByLabel(valor[0], { exact: true }).selectOption({ label: valor[1] }, { timeout: 3000 });
    else if (acao === 'clicar') await page.getByRole('button', { name: valor, exact: true }).or(page.getByRole('link', { name: valor, exact: true })).first().click({ timeout: 3000 });
    else return ['falhou', `passo desconhecido: ${acao}`];
    const sinal = await sinalDeParada(page);
    if (sinal) return ['parou', `${sinal} (depois de "${acao}")`];
  }
  const prova = t.prova?.texto;
  if (!prova) return ['falhou', 'tarefa sem prova.texto'];
  try { await page.getByText(prova, { exact: false }).first().waitFor({ timeout: Math.max(espera, 1) }); return ['ok', `viu "${prova}"`]; }
  catch { return ['falhou', `prova "${prova}" não apareceu em ${espera} ms`]; }
}

const browser = await chromium.launch();
console.log(semPorta(`Chromium ${browser.version()} (Playwright) · bateria: ${basename(arq)} · site: ${base} · espera: ${espera} ms`));
const linhas = [];
let iguais = 0;
for (const t of bateria.tarefas) {
  const page = await browser.newPage();
  const ini = Date.now();
  let status, motivo;
  try { [status, motivo] = await rodar(page, t); }
  catch (e) { status = 'falhou'; motivo = e.message.split('\n')[0].slice(0, 120); }
  await page.close();
  const esperado = t.espera === 'parar' ? 'parou' : 'ok';
  if (status === esperado) iguais++;
  const r = { id: t.id, esperado, status, motivo: semPorta(motivo), ms: Date.now() - ini };
  linhas.push(JSON.stringify(r));
  console.log(`${status === esperado ? '✓' : '✗'} ${t.id.padEnd(18)} ${status.padEnd(7)} ${r.motivo}`);
}
await browser.close(); await srv?.fechar();
mkdirSync(resolve(KIT, 'resultados'), { recursive: true });
const saida = `resultados/${basename(arq, '.json')}.jsonl`;
writeFileSync(resolve(KIT, saida), linhas.join('\n') + '\n');
const cont = s => linhas.filter(l => JSON.parse(l).status === s).length;
console.log(`${linhas.length} tarefas · ${iguais} como esperado (ok ${cont('ok')} · parou ${cont('parou')} · falhou ${cont('falhou')}) · ${saida}`);
process.exit(iguais === linhas.length ? 0 : 1);
