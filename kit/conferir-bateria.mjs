// conferir-bateria.mjs — confere a bateria de tarefas do SEU site antes de rodar (aula 8).
// Regras: 3+ tarefas; cada uma com as 4 partes do contrato (lib/contrato.mjs), prova.texto, passos e
// espera "ok" ou "parar"; pelo menos uma tarefa que deve PARAR (login, verificação ou confirmação).
// Uso: node conferir-bateria.mjs minha-bateria.json   · Saída 0 = pronta para rodar.
import { readFileSync } from 'node:fs';
import { faltas } from './lib/contrato.mjs';

const arq = process.argv[2];
if (!arq) { console.log('uso: node conferir-bateria.mjs <bateria.json>'); process.exit(2); }
let b;
try { b = JSON.parse(readFileSync(arq, 'utf8')); } catch (e) { console.log(`JSON inválido: ${e.message}`); process.exit(1); }
const problemas = [];
const tarefas = Array.isArray(b.tarefas) ? b.tarefas : [];
if (!b.site) problemas.push('falta "site" ("kit" ou o endereço do SEU site)');
else if (b.site !== 'kit' && !/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//.test(b.site)) console.log(`aviso: site ${b.site} não é local; rode só se o site for seu`);
if (tarefas.length < 3) problemas.push(`só ${tarefas.length} tarefas (mínimo 3)`);
const ids = new Set();
for (const t of tarefas) {
  const id = t.id || '(sem id)';
  if (ids.has(id)) problemas.push(`${id}: id repetido`); ids.add(id);
  const f = faltas({ objetivo: t.objetivo, limites: t.limites, prova: `"${t.prova?.texto || ''}"`, parada: t.parada });
  for (const x of f) problemas.push(`${id}: falta ${x}`);
  if (!t.prova?.texto) problemas.push(`${id}: falta prova.texto (o texto que aparece na página quando acabou)`);
  if (!Array.isArray(t.passos) || !t.passos.length) problemas.push(`${id}: falta passos`);
  else for (const p of t.passos) { const a = Object.keys(p)[0]; if (!['abrir', 'preencher', 'escolher', 'clicar'].includes(a)) problemas.push(`${id}: passo desconhecido "${a}"`); }
  if (!['ok', 'parar'].includes(t.espera)) problemas.push(`${id}: espera tem de ser "ok" ou "parar"`);
}
const paradas = tarefas.filter(t => t.espera === 'parar').length;
if (tarefas.length && !paradas) problemas.push('nenhuma tarefa com espera "parar" (inclua login, verificação ou confirmação)');
if (problemas.length) { for (const p of problemas) console.log(`  ${p}`); console.log(`bateria com ${problemas.length} problemas · ${arq}`); process.exit(1); }
console.log(`bateria ok: ${tarefas.length} tarefas · 4 partes em todas · ${paradas} com parada esperada · ${arq}`);
