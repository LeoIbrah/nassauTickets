import { useCallback, useEffect, useState } from "react";
import { carregarEstado, salvarEstado, CHAVE_ESTADO } from "../services/storage.js";
import { garantirDia } from "../services/fila.js";

// Mantém o estado da fila sincronizado entre as abas (totem, painel e
// atendente abertos ao mesmo tempo) usando o evento "storage".
export function useFila() {
  const [estado, setEstado] = useState(() => garantirDia(carregarEstado()));

  useEffect(() => {
    const aoMudar = (e) => {
      if (e.key === CHAVE_ESTADO) setEstado(carregarEstado());
    };
    window.addEventListener("storage", aoMudar);
    return () => window.removeEventListener("storage", aoMudar);
  }, []);

  // Aplica uma operação de fila sobre o estado MAIS RECENTE do storage,
  // evitando sobrescrever alterações feitas em outra aba.
  const executar = useCallback((operacao, ...args) => {
    const atual = garantirDia(carregarEstado());
    const resultado = operacao(atual, ...args);
    if (!resultado.erro) {
      salvarEstado(resultado.estado);
      setEstado(resultado.estado);
    }
    return resultado;
  }, []);

  return { estado, executar };
}
