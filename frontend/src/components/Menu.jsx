const TELAS = [
  { id: "totem", nome: "Totem" },
  { id: "painel", nome: "Painel" },
  { id: "atendente", nome: "Atendente" },
];

export default function Menu({ atual }) {
  return (
    <header className="menu">
      <a className="marca" href="#/totem">
        nassauTickets
      </a>
      <nav aria-label="Telas do sistema">
        {TELAS.map((t) => (
          <a
            key={t.id}
            href={`#/${t.id}`}
            aria-current={atual === t.id ? "page" : undefined}
          >
            {t.nome}
          </a>
        ))}
      </nav>
    </header>
  );
}
