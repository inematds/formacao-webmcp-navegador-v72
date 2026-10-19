// conferir-contrato.mjs — confere se um contrato de tarefa tem as 4 partes (aula 5).
// Uso: node conferir-contrato.mjs contratos/exemplo.md
// Saída 0 = completo; 1 = falta parte (a lista diz qual).
import { readFileSync } from 'node:fs';
import { lerMarkdown, faltas } from './lib/contrato.mjs';

const arq = process.argv[2];
if (!arq) { console.log('uso: node conferir-contrato.mjs <contrato.md>'); process.exit(2); }
const f = faltas(lerMarkdown(readFileSync(arq, 'utf8')));
if (!f.length) { console.log(`contrato ok: 4/4 partes (objetivo, limites, prova, parada) · ${arq}`); process.exit(0); }
console.log(`contrato incompleto: ${4 - new Set(f.map(x => x.split(' ')[0])).size}/4 partes · ${arq}`);
for (const x of f) console.log(`  falta: ${x}`);
process.exit(1);
