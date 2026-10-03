// Áudio das chamadas usando a Web Speech API do navegador.
export function falar(texto) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const fala = new SpeechSynthesisUtterance(texto);
  fala.lang = "pt-BR";
  fala.rate = 0.9;
  window.speechSynthesis.speak(fala);
}
