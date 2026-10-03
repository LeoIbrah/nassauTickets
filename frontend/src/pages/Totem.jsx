import { useState } from "react";
import { useFila } from "../hooks/useFila.js";
import { TIPOS, aguardando, emitirSenha } from "../services/fila.js";
import SenhaTag from "../components/SenhaTag.jsx";

const OPCOES = [
  { tipo: "SP", descricao: "Idosos, gestantes, pessoas com deficiência" },
  { tipo: "SG", descricao: "Atendimento geral" },
  { tipo: "SE", descricao: "Retirar resultados de exames" },
];

export default function Totem() {
  const { estado, executar } = useFila();
  const [emitida, setEmitida] = useState(null);
  const [erro, setErro] = useState("");

  function emitir(tipo) {
    const r = executar(emitirSenha, tipo);
    if (r.erro) {
      setErro(r.erro);
      return;
    }
    setErro("");
    setEmitida(r.senha);
  }

  return (
    <main className="tela totem">
      <h1>Retire sua senha</h1>
      <p className="apoio">Escolha o tipo de atendimento e aguarde ser chamado no painel.</p>

      <div className="opcoes">
        {OPCOES.map((o) => (
          <button key={o.tipo} className={`opcao tipo-${o.tipo}`} onClick={() => emitir(o.tipo)}>
            <strong>{TIPOS[o.tipo]}</strong>
            <span>{o.descricao}</span>
            <small>{aguardando(estado, o.tipo).length} na fila</small>
          </button>
        ))}
      </div>

      {erro && <p role="alert" className="erro">{erro}</p>}

      {emitida && (
        <section className="ticket" aria-live="polite">
          <p>Sua senha</p>
          <SenhaTag numero={emitida.numero} tipo={emitida.tipo} grande />
          <p>Acompanhe a chamada no painel.</p>
        </section>
      )}
    </main>
  );
}
