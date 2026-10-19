// mcp.mjs — cliente MCP de ensaio, SEM modelo: liga um servidor MCP de navegador por stdio
// (Playwright MCP ou Chrome DevTools MCP), lista as ferramentas e chama uma por uma.
// É o mesmo caminho que o Claude Code ou o Codex usam; aqui quem decide a próxima chamada é o script.
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { chromium } from 'playwright';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { KIT } from './servidor.mjs';

const BIN = n => resolve(KIT, 'node_modules/.bin', n);
// O Chromium que o Playwright 1.64.0 baixou (npx playwright install chromium). Nada de Chrome do sistema.
export const CHROMIUM = () => chromium.executablePath();
export const FLAG_WEBMCP = '--enable-features=WebMCPTesting';   // = chrome://flags/#enable-webmcp-testing

// Pasta curta para perfil/config (caminho longo derruba o Chromium: "Socket path too long").
function pastaCurta() { return mkdtempSync('/tmp/kit3-'); }

export async function ligar(qual, { webmcp = false } = {}) {
  const tmp = pastaCurta();
  let comando, args;
  if (qual === 'playwright') {
    const cfg = join(tmp, 'pw.json');
    writeFileSync(cfg, JSON.stringify({
      browser: {
        browserName: 'chromium', isolated: true,
        launchOptions: { headless: true, executablePath: CHROMIUM(), args: webmcp ? [FLAG_WEBMCP] : [] }
      }
    }));
    comando = BIN('playwright-mcp'); args = ['--config', cfg, '--output-dir', join(tmp, 'saida')];
  } else if (qual === 'devtools') {
    comando = BIN('chrome-devtools-mcp');
    args = ['--headless', '--isolated', '--executablePath', CHROMIUM(), '--no-usage-statistics', '--no-performance-crux', '--chromeArg=--no-sandbox'];
    if (webmcp) args.push('--categoryExperimentalWebmcp=true', `--chromeArg=${FLAG_WEBMCP}`);
  } else throw new Error(`servidor desconhecido: ${qual} (use playwright ou devtools)`);
  const transporte = new StdioClientTransport({ command: comando, args, stderr: process.env.KIT_DEBUG ? 'inherit' : 'ignore', env: { ...process.env, TMPDIR: tmp } });
  const cliente = new Client({ name: 'kit-formacao-webmcp-navegador', version: '1.0.0' });
  await cliente.connect(transporte);
  return {
    cliente,
    async ferramentas() { return (await cliente.listTools()).tools; },
    async chamar(name, args = {}) {
      const r = await cliente.callTool({ name, arguments: args }, undefined, { timeout: 60000 });
      return { erro: !!r.isError, texto: (r.content || []).filter(c => c.type === 'text').map(c => c.text).join('\n') };
    },
    async fechar() { await cliente.close().catch(() => {}); rmSync(tmp, { recursive: true, force: true }); }
  };
}
