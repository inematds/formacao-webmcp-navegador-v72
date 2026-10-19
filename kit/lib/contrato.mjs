// contrato.mjs — as 4 partes de um contrato de tarefa para agente de navegador (aulas 5, 6 e 8):
// objetivo (onde e o quê), limites (o que pode e o que não pode), prova (o que se vê quando acabou)
// e parada (quando parar e chamar a pessoa). Aceita os nomes em PT, EN e ES.
export const PARTES = {
  objetivo: ['objetivo', 'goal', 'objective'],
  limites: ['limites', 'limits', 'límites'],
  prova: ['prova', 'proof', 'prueba'],
  parada: ['parada', 'stop', 'detención']
};
const letras = s => (String(s || '').match(/\p{L}/gu) || []).length;

// Confere um contrato já separado em partes {objetivo, limites, prova, parada} (texto).
// Devolve a lista do que falta (vazia = contrato completo).
export function faltas(c) {
  const f = [];
  if (letras(c.objetivo) < 20) f.push('objetivo (diga onde e o quê, com 20+ letras)');
  else if (!/https?:\/\/|\b[\w-]+\.html\b|\bpágina\b|\bpage\b|\bpágina\b/i.test(c.objetivo)) f.push('objetivo sem o lugar (endereço ou página)');
  if (letras(c.limites) < 20) f.push('limites (o que pode e o que não pode)');
  else if (!/\b(não|nunca|not|never|no|nunca)\b/i.test(c.limites)) f.push('limites sem nenhum "não" (o que o agente não pode fazer)');
  if (letras(c.prova) < 10) f.push('prova (o que se vê na página quando acabou)');
  else if (!/["“”«»]/.test(c.prova)) f.push('prova sem um texto entre aspas para conferir na página');
  if (letras(c.parada) < 20) f.push('parada (quando parar e chamar a pessoa)');
  else if (!/\d/.test(c.parada)) f.push('parada sem número (ex.: pare depois de 10 ações)');
  return f;
}

// Lê um contrato em Markdown com os títulos "## Objetivo", "## Limites", "## Prova", "## Parada".
export function lerMarkdown(md) {
  const c = {};
  let atual = null;
  for (const linha of md.split('\n')) {
    const t = linha.match(/^##\s+(.+?)\s*$/);
    if (t) { atual = Object.keys(PARTES).find(k => PARTES[k].includes(t[1].toLowerCase())) || null; if (atual) c[atual] = ''; continue; }
    if (atual) c[atual] += linha + '\n';
  }
  return c;
}
