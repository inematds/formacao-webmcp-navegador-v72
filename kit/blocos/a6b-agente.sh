cd ~/projetos/formacao-webmcp-navegador-v72/kit
mkdir -p resultados; node servir.mjs & SRV=$!; sleep 1
node configurar.mjs > /dev/null
claude -p "$(node prompt-agente.mjs bateria.json)" --mcp-config .mcp.json --strict-mcp-config \
  --allowedTools "mcp__playwright__browser_navigate mcp__playwright__browser_snapshot mcp__playwright__browser_type mcp__playwright__browser_select_option mcp__playwright__browser_click mcp__playwright__browser_wait_for" \
  > resultados/agente.jsonl; echo "claude: saída $?"
kill $SRV
node conferir-resultados.mjs resultados/agente.jsonl bateria.json; echo "saída: $?"
