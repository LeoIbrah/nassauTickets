import { useFila } from "../hooks/useFila.js";
import SenhaTag from "../components/SenhaTag.jsx";

export default function Painel() {
  const { estado } = useFila();
  const [atual, ...anteriores] = estado.ultimas;

  return (
    <main className="tela painel">
      <h1>Painel de chamadas</h1>

      <section aria-live="assertive" aria-label="Senha chamada agora" className="destaque">
        {atual ? (
          <>
            <SenhaTag numero={atual.numero} tipo={atual.tipo} grande />
            <p className="guiche">Guichê {atual.guiche}</p>
          </>
        ) : (
          <p className="apoio">Nenhuma senha chamada até o momento.</p>
        )}
      </section>

      {anteriores.length > 0 && (
        <section aria-label="Chamadas anteriores">
          <h2>Chamadas anteriores</h2>
          <ul className="historico">
            {anteriores.map((u) => (
              <li key={u.numero}>
                <SenhaTag numero={u.numero} tipo={u.tipo} />
                <span>Guichê {u.guiche}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
