// versoes.mjs — confere as peças do kit (aula 1): Node, Playwright e o Chromium dele,
// Playwright MCP, Chrome DevTools MCP e o SDK do MCP usado pelo cliente de ensaio.
// Também diz se o Claude Code ou o Codex estão no PATH (opcional: o kit roda sem eles).
// Não chama modelo nem rede. Saída 0 = as 4 peças obrigatórias estão prontas.
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';
import { KIT } from './lib/servidor.mjs';

const versao = p => JSON.parse(readFileSync(resolve(KIT, 'node_modules', p, 'package.json'), 'utf8')).version;
let ok = 0;
const linha = (rot, valor, obrigatorio = true) => { console.log(`${rot.padEnd(22)} ${valor}`); if (obrigatorio && !/^(falta|não)/.test(valor)) ok++; };

const [maior, menor] = process.versions.node.split('.').map(Number);
linha('node', (maior >= 23 || (maior === 22 && menor >= 12) || (maior === 20 && menor >= 19)) ? process.versions.node : `falta: ${process.versions.node} (precisa 20.19+, 22.12+ ou 23+)`);
const exe = chromium.executablePath();
let chromiumVersao = 'falta: rode npx playwright install chromium';
if (existsSync(exe)) {
  const b = await chromium.launch(); chromiumVersao = `${versao('playwright')} · Chromium ${b.version()}`; await b.close();
}
linha('playwright', chromiumVersao);
linha('@playwright/mcp', versao('@playwright/mcp'));
linha('chrome-devtools-mcp', versao('chrome-devtools-mcp'));
console.log(`${'@modelcontextprotocol/sdk'.padEnd(22)} ${versao('@modelcontextprotocol/sdk')} (cliente de ensaio, sem modelo)`);
for (const cli of ['claude', 'codex']) {
  let v = 'não encontrado (opcional)';
  try { v = execFileSync(cli, ['--version'], { encoding: 'utf8', timeout: 20000 }).trim().split('\n')[0]; } catch {}
  console.log(`${(cli + ' (opcional)').padEnd(22)} ${v}`);
}
console.log(`kit pronto: ${ok} de 4 peças obrigatórias`);
process.exit(ok === 4 ? 0 : 1);
