// Exibe o número de uma senha com a cor do seu tipo.
export default function SenhaTag({ numero, tipo, grande = false }) {
  return (
    <span className={`senha tipo-${tipo} ${grande ? "grande" : ""}`}>{numero}</span>
  );
}
