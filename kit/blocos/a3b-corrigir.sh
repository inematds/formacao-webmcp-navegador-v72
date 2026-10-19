cd ~/projetos/formacao-webmcp-navegador-v72/kit
E=${TMPDIR:-/tmp}/kit3-aula3; rm -rf "$E"; cp -r site "$E"
echo '{"texto": "Revisão básica com 10% de desconto em novembro."}' > "$E/promocoes.json"
SITE="$E" node devtools.mjs; echo "saída: $?"
