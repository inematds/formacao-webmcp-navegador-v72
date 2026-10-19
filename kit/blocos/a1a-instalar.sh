[ -d ~/projetos/formacao-webmcp-navegador-v72 ] || git clone -q https://github.com/inematds/formacao-webmcp-navegador-v72 ~/projetos/formacao-webmcp-navegador-v72
cd ~/projetos/formacao-webmcp-navegador-v72/kit
npm ci --no-audit --no-fund && npx playwright install chromium; echo "saída: $?"
