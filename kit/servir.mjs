// servir.mjs — deixa o site de exemplo no ar em http://127.0.0.1:8433/ para o SEU agente usar (aula 6).
// Ctrl+C para parar. Só 127.0.0.1: nada fica exposto na rede.
import { servir } from './lib/servidor.mjs';
const porta = Number(process.argv[2] || 8433);
const s = await servir({ porta });
console.log(`site do kit em ${s.url} (Ctrl+C para parar)`);
