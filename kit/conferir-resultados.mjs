// conferir-resultados.mjs — confere o FORMATO da resposta do seu agente (aula 6), nunca o texto do modelo.
// Aceita linhas fora do formato (o agente às vezes escreve antes ou depois) e conta só as linhas JSON.
// Uso: node conferir-resultados.mjs resultados/agente.jsonl bateria.json
// Saída 0 = uma linha JSON válida por tarefa da bateria, com status ok, falhou ou parou.
import { readFileSync } from 'node:fs';

const [arq, bat] = process.argv.slice(2);
if (!arq || !bat) { console.log('uso: node conferir-resultados.mjs <resultados.jsonl> <bateria.json>'); process.exit(2); }
const ids = JSON.parse(readFileSync(bat, 'utf8')).tarefas.map(t => t.id);
const vistos = new Map();
let ignoradas = 0;
for (const l of readFileSync(arq, 'utf8').split('\n')) {
  const t = l.trim();
  if (!t) continue;
  try {
    const r = JSON.parse(t);
    if (ids.includes(r.id) && ['ok', 'falhou', 'parou'].includes(r.status)) vistos.set(r.id, r.status); else ignoradas++;
  } catch { ignoradas++; }
}
for (const id of ids) console.log(`  ${id.padEnd(18)} ${vistos.get(id) || 'sem linha'}`);
console.log(`linhas JSON válidas: ${vistos.size} de ${ids.length} tarefas · linhas ignoradas: ${ignoradas}`);
process.exit(vistos.size === ids.length ? 0 : 1);
