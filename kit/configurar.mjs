// configurar.mjs — prepara o kit para o SEU agente (Claude Code ou Codex) usar os dois servidores MCP de navegador.
// Escreve, só dentro de kit/:
//   pw-config.json  → Playwright MCP 0.0.83 com o Chromium do kit, headless, perfil em memória
//   .mcp.json       → servidores "playwright" e "devtools" para o Claude Code (escopo de projeto)
// e imprime o trecho equivalente para o Codex (~/.codex/config.toml), que você cola se quiser.
// Não chama modelo, não mexe na sua configuração global. Uso: node configurar.mjs [--webmcp]
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { KIT } from './lib/servidor.mjs';
import { CHROMIUM, FLAG_WEBMCP } from './lib/mcp.mjs';

const webmcp = process.argv.includes('--webmcp');   // liga a flag de teste do WebMCP no Chromium do kit
const chrome = CHROMIUM();
const args = webmcp ? [FLAG_WEBMCP] : [];

writeFileSync(resolve(KIT, 'pw-config.json'), JSON.stringify({
  browser: { browserName: 'chromium', isolated: true, launchOptions: { headless: true, executablePath: chrome, args } }
}, null, 2) + '\n');

const servidores = {
  playwright: { command: resolve(KIT, 'node_modules/.bin/playwright-mcp'), args: ['--config', resolve(KIT, 'pw-config.json')] },
  devtools: {
    command: resolve(KIT, 'node_modules/.bin/chrome-devtools-mcp'),
    args: ['--headless', '--isolated', '--executablePath', chrome,
      '--no-usage-statistics', '--no-performance-crux', '--chromeArg=--no-sandbox',
      ...(webmcp ? ['--categoryExperimentalWebmcp=true', `--chromeArg=${FLAG_WEBMCP}`] : [])]
  }
};
writeFileSync(resolve(KIT, '.mcp.json'), JSON.stringify({ mcpServers: servidores }, null, 2) + '\n');

console.log(`Chromium do kit: ${chrome.split('/').slice(-3).join('/')}${webmcp ? ' · flag WebMCP ligada (experimental)' : ''}`);
console.log('escrevi kit/pw-config.json e kit/.mcp.json (servidores: playwright, devtools)');
console.log('\n# Codex: cole em ~/.codex/config.toml se quiser os mesmos servidores lá');
for (const [nome, s] of Object.entries(servidores))
  console.log(`[mcp_servers.${nome}]\ncommand = ${JSON.stringify(s.command)}\nargs = [${s.args.map(a => JSON.stringify(a)).join(', ')}]\n`);
