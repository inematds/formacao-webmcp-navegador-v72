// servidor.mjs — serve a pasta do site de exemplo (kit/site) só em 127.0.0.1.
// 127.0.0.1 conta como contexto seguro (como https), que é o que o WebMCP exige.
// SITE=<pasta> troca a pasta servida (use para testar a sua cópia).
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const KIT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml' };

export async function servir({ pasta = process.env.SITE || resolve(KIT, 'site'), porta = 0 } = {}) {
  pasta = resolve(pasta);
  const srv = createServer(async (req, res) => {
    let caminho = resolve(pasta, '.' + decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (caminho === pasta || caminho.endsWith('/')) caminho = resolve(caminho, 'index.html');
    if (!caminho.startsWith(pasta)) return res.writeHead(403).end();
    try { const dado = await readFile(caminho); res.setHeader('Content-Type', TIPOS[extname(caminho)] || 'text/plain'); res.end(dado); }
    catch { res.writeHead(404).end('não encontrado'); }
  });
  await new Promise((ok, falha) => { srv.once('error', falha); srv.listen(porta, '127.0.0.1', ok); });
  return { url: `http://127.0.0.1:${srv.address().port}/`, fechar: () => new Promise(ok => srv.close(ok)) };
}

// Troca a porta aleatória por PORTA nas linhas impressas (a saída fica igual em toda máquina).
export const semPorta = s => String(s).replace(/127\.0\.0\.1:\d+/g, '127.0.0.1:PORTA');
