import { useEffect, useState } from "react";
import Menu from "./components/Menu.jsx";
import Totem from "./pages/Totem.jsx";
import Painel from "./pages/Painel.jsx";
import Atendente from "./pages/Atendente.jsx";

const PAGINAS = { totem: Totem, painel: Painel, atendente: Atendente };

// Roteamento simples por hash (#/totem, #/painel, #/atendente) para permitir
// abrir cada tela em uma aba/janela diferente.
function paginaDaUrl() {
  const id = window.location.hash.replace("#/", "");
  return PAGINAS[id] ? id : "totem";
}

export default function App() {
  const [pagina, setPagina] = useState(paginaDaUrl);

  useEffect(() => {
    const aoMudar = () => setPagina(paginaDaUrl());
    window.addEventListener("hashchange", aoMudar);
    return () => window.removeEventListener("hashchange", aoMudar);
  }, []);

  const Pagina = PAGINAS[pagina];
  return (
    <>
      <Menu atual={pagina} />
      <Pagina />
    </>
  );
}
