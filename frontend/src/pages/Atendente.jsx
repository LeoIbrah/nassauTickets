import { useState } from "react";
import { useFila } from "../hooks/useFila.js";
import {
  TIPOS,
  ESTADOS,
  aguardando,
  senhaDoGuiche,
  chamarProxima,
  chamarNovamente,
  iniciarAtendimento,
  finalizarAtendimento,
  registrarNaoComparecimento,
  textoDaChamada,
} from "../services/fila.js";
import { falar } from "../services/audio.js";
import { limparEstado } from "../services/storage.js";
import SenhaTag from "../components/SenhaTag.jsx";

export default function Atendente() {
  const { estado, executar } = useFila();
  const [guiche, setGuiche] = useState(1);
  const [mensagem, setMensagem] = useState("");

  const atual = senhaDoGuiche(estado, guiche);

  function agir(operacao, { audio = false } = {}) {
    // Somente "chamar próxima" recebe o nome do atendente (usado na auditoria).
    const r =
      operacao === chamarProxima
        ? executar(operacao, guiche, "Atendente")
        : executar(operacao, guiche);
    setMensagem(r.erro ?? "");
    if (!r.erro && audio) falar(textoDaChamada(r.senha, r.ultimaChamada));
  }

  function reiniciar() {
    if (window.confirm("Apagar todas as senhas de hoje?")) {
      limparEstado();
      window.location.reload();
    }
  }

  return (
    <main className="tela atendente">
      <h1>Atendimento</h1>

      <label className="campo">
        Guichê
        <select value={guiche} onChange={(e) => setGuiche(Number(e.target.value))}>
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </label>

      <section className="fila-resumo" aria-label="Senhas aguardando">
        {Object.keys(TIPOS).map((t) => (
          <div key={t} className={`contador tipo-${t}`}>
            <strong>{aguardando(estado, t).length}</strong>
            <span>{TIPOS[t]}</span>
          </div>
        ))}
      </section>

      <section className="atual" aria-live="polite">
        {atual ? (
          <>
            <SenhaTag numero={atual.numero} tipo={atual.tipo} grande />
            <p>
              {atual.estado === ESTADOS.EM_ATENDIMENTO
                ? "Em atendimento"
                : `Chamada ${atual.chamadas} de 2`}
            </p>
          </>
        ) : (
          <p className="apoio">Guichê livre.</p>
        )}
      </section>

      <div className="acoes">
        <button onClick={() => agir(chamarProxima, { audio: true })} disabled={!!atual}>
          Chamar próxima
        </button>
        <button
          onClick={() => agir(chamarNovamente, { audio: true })}
          disabled={!atual || atual.estado === ESTADOS.EM_ATENDIMENTO}
        >
          Chamar novamente
        </button>
        <button
          onClick={() => agir(iniciarAtendimento)}
          disabled={!atual || atual.estado === ESTADOS.EM_ATENDIMENTO}
        >
          Iniciar atendimento
        </button>
        <button
          onClick={() => agir(finalizarAtendimento)}
          disabled={!atual || atual.estado !== ESTADOS.EM_ATENDIMENTO}
        >
          Finalizar atendimento
        </button>
        <button
          className="secundario"
          onClick={() => agir(registrarNaoComparecimento)}
          disabled={!atual || atual.estado === ESTADOS.EM_ATENDIMENTO}
        >
          Cliente não compareceu
        </button>
      </div>

      {mensagem && <p role="alert" className="erro">{mensagem}</p>}

      <button className="link-perigo" onClick={reiniciar}>
        Zerar dia (somente testes)
      </button>
    </main>
  );
}
