import test from "node:test";
import assert from "node:assert/strict";
import {
  novoEstado,
  emitirSenha,
  chamarProxima,
  chamarNovamente,
  iniciarAtendimento,
  finalizarAtendimento,
  registrarNaoComparecimento,
  formatarNumero,
  ESTADOS,
} from "./fila.js";

const agora = new Date(2026, 9, 2, 9, 0, 0); // 02/10/2026 09:00

function emitir(estado, ...tipos) {
  return tipos.reduce((e, t) => emitirSenha(e, t, agora).estado, estado);
}

test("numeração segue YYMMDD-PPSQ", () => {
  assert.equal(formatarNumero(agora, "SP", 1), "261002-SP001");
  assert.equal(formatarNumero(agora, "SG", 42), "261002-SG042");
});

test("sequência é independente por tipo", () => {
  const e = emitir(novoEstado(agora), "SP", "SG", "SP");
  assert.deepEqual(
    e.senhas.map((s) => s.numero),
    ["261002-SP001", "261002-SG001", "261002-SP002"]
  );
});

test("alternância SP -> SE|SG -> SP", () => {
  let e = emitir(novoEstado(agora), "SG", "SG", "SE", "SP", "SP");
  const chamadas = [];
  for (let i = 0; i < 5; i++) {
    const r = chamarProxima(e, 1, "A", agora);
    e = r.estado;
    chamadas.push(r.senha.tipo);
    e = iniciarAtendimento(e, 1, agora).estado;
    e = finalizarAtendimento(e, 1, agora).estado;
  }
  assert.deepEqual(chamadas, ["SP", "SE", "SP", "SG", "SG"]);
});

test("fila vazia da vez cai para as demais", () => {
  let e = emitir(novoEstado(agora), "SG");
  const r = chamarProxima(e, 1, "A", agora);
  assert.equal(r.senha.tipo, "SG");
});

test("dois guichês nunca recebem a mesma senha", () => {
  let e = emitir(novoEstado(agora), "SG", "SG");
  const a = chamarProxima(e, 1, "A", agora);
  const b = chamarProxima(a.estado, 2, "B", agora);
  assert.notEqual(a.senha.numero, b.senha.numero);
});

test("guichê ocupado não chama outra senha", () => {
  let e = emitir(novoEstado(agora), "SG", "SG");
  e = chamarProxima(e, 1, "A", agora).estado;
  assert.ok(chamarProxima(e, 1, "A", agora).erro);
});

test("ciclo completo de estados", () => {
  let e = emitir(novoEstado(agora), "SP");
  e = chamarProxima(e, 1, "A", agora).estado;
  e = chamarNovamente(e, 1, agora).estado;
  e = iniciarAtendimento(e, 1, agora).estado;
  e = finalizarAtendimento(e, 1, agora).estado;
  assert.deepEqual(
    e.senhas[0].historico.map((h) => h.estado),
    ["EMITIDA", "AGUARDANDO", "CHAMADA", "CHAMADA_NOVAMENTE", "EM_ATENDIMENTO", "ATENDIDA"]
  );
  assert.equal(e.auditoria[0].fimAtendimento !== null, true);
});

test("não comparecimento só após duas chamadas", () => {
  let e = emitir(novoEstado(agora), "SG");
  e = chamarProxima(e, 1, "A", agora).estado;
  assert.ok(registrarNaoComparecimento(e, 1, agora).erro);
  e = chamarNovamente(e, 1, agora).estado;
  e = registrarNaoComparecimento(e, 1, agora).estado;
  assert.equal(e.senhas[0].estado, ESTADOS.NAO_COMPARECEU);
});

test("painel guarda no máximo as 5 últimas chamadas", () => {
  let e = emitir(novoEstado(agora), "SG", "SG", "SG", "SG", "SG", "SG", "SG");
  for (let i = 0; i < 7; i++) {
    e = chamarProxima(e, 1, "A", agora).estado;
    e = iniciarAtendimento(e, 1, agora).estado;
    e = finalizarAtendimento(e, 1, agora).estado;
  }
  assert.equal(e.ultimas.length, 5);
  assert.equal(e.ultimas[0].numero, "261002-SG007");
});

test("sequência reinicia em um novo dia", () => {
  let e = emitir(novoEstado(agora), "SG");
  const amanha = new Date(2026, 9, 3, 8, 0, 0);
  const r = emitirSenha(e, "SG", amanha);
  assert.equal(r.senha.numero, "261003-SG001");
});
