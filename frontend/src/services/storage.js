// Persistência provisória no navegador (fase 1).
// Na fase 2 este módulo será substituído por chamadas à API REST do backend.
import { novoEstado } from "./fila.js";

const CHAVE = "nassautickets:estado";

export function carregarEstado() {
  try {
    const bruto = localStorage.getItem(CHAVE);
    return bruto ? JSON.parse(bruto) : novoEstado();
  } catch {
    return novoEstado();
  }
}

export function salvarEstado(estado) {
  localStorage.setItem(CHAVE, JSON.stringify(estado));
}

export function limparEstado() {
  localStorage.removeItem(CHAVE);
}

export const CHAVE_ESTADO = CHAVE;
