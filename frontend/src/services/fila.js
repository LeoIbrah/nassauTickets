// Regras de negócio da fila do nassauTickets.
// Módulo puro (sem React e sem navegador): cada função recebe o estado
// atual e devolve um NOVO estado, o que facilita testar e, na fase 2,
// mover a mesma lógica para o backend.

export const TIPOS = {
  SP: "Senha Prioritária",
  SG: "Senha Geral",
  SE: "Retirada de Exames",
};

export const ESTADOS = {
  EMITIDA: "EMITIDA",
  AGUARDANDO: "AGUARDANDO",
  CHAMADA: "CHAMADA",
  CHAMADA_NOVAMENTE: "CHAMADA_NOVAMENTE",
  EM_ATENDIMENTO: "EM_ATENDIMENTO",
  ATENDIDA: "ATENDIDA",
  NAO_COMPARECEU: "NÃO_COMPARECEU",
};

export const EXPEDIENTE = { inicio: 7, fim: 17 };
export const MAX_ULTIMAS = 5;

const pad = (n, tam = 2) => String(n).padStart(tam, "0");

// YYMMDD
export function prefixoData(data) {
  return `${pad(data.getFullYear() % 100)}${pad(data.getMonth() + 1)}${pad(data.getDate())}`;
}

// Formato YYMMDD-PPSQ (ex.: 261002-SP001)
export function formatarNumero(data, tipo, sequencia) {
  return `${prefixoData(data)}-${tipo}${pad(sequencia, 3)}`;
}

export function dentroDoExpediente(data) {
  const h = data.getHours();
  return h >= EXPEDIENTE.inicio && h < EXPEDIENTE.fim;
}

export function novoEstado(data = new Date()) {
  return {
    dia: prefixoData(data),
    sequencias: { SP: 0, SG: 0, SE: 0 }, // reinicia todo dia
    senhas: [],
    proximaEhSP: true, // controla a alternância [SP] -> [SE|SG] -> [SP]
    ultimas: [], // painel: 5 últimas chamadas (mais recente primeiro)
    auditoria: [],
  };
}

// Garante o reinício diário das sequências.
export function garantirDia(estado, agora = new Date()) {
  return estado.dia === prefixoData(agora) ? estado : novoEstado(agora);
}

function registrar(senha, estado, agora) {
  senha.estado = estado;
  senha.historico.push({ estado, em: agora.toISOString() });
}

export function emitirSenha(estadoAtual, tipo, agora = new Date()) {
  if (!TIPOS[tipo]) return { estado: estadoAtual, erro: "Tipo de senha inválido." };
  const estado = structuredClone(garantirDia(estadoAtual, agora));
  estado.sequencias[tipo] += 1;
  const senha = {
    numero: formatarNumero(agora, tipo, estado.sequencias[tipo]),
    tipo,
    estado: ESTADOS.EMITIDA,
    emitidaEm: agora.toISOString(),
    chamadas: 0,
    guiche: null,
    atendente: null,
    inicioEm: null,
    fimEm: null,
    historico: [],
  };
  registrar(senha, ESTADOS.EMITIDA, agora);
  registrar(senha, ESTADOS.AGUARDANDO, agora); // entra direto na fila
  estado.senhas.push(senha);
  return { estado, senha };
}

export function aguardando(estado, tipo) {
  return estado.senhas.filter((s) => s.tipo === tipo && s.estado === ESTADOS.AGUARDANDO);
}

// Decide o tipo da próxima senha. Premissa: na vez "outra" (SE|SG), SE
// é chamada antes de SG. Se a fila da vez estiver vazia, usa as demais
// mantendo a ordem de prioridade.
export function escolherTipo(estado) {
  const tem = (t) => aguardando(estado, t).length > 0;
  if (estado.proximaEhSP) {
    if (tem("SP")) return "SP";
    if (tem("SE")) return "SE";
    if (tem("SG")) return "SG";
    return null;
  }
  if (tem("SE")) return "SE";
  if (tem("SG")) return "SG";
  if (tem("SP")) return "SP";
  return null;
}

export function senhaDoGuiche(estado, guiche) {
  return estado.senhas.find(
    (s) =>
      s.guiche === guiche &&
      [ESTADOS.CHAMADA, ESTADOS.CHAMADA_NOVAMENTE, ESTADOS.EM_ATENDIMENTO].includes(s.estado)
  );
}

function atualizarPainel(estado, senha, agora) {
  estado.ultimas = [
    { numero: senha.numero, tipo: senha.tipo, guiche: senha.guiche, em: agora.toISOString() },
    ...estado.ultimas.filter((u) => u.numero !== senha.numero),
  ].slice(0, MAX_ULTIMAS);
}

export function chamarProxima(estadoAtual, guiche, atendente = "Atendente", agora = new Date()) {
  const estado = structuredClone(garantirDia(estadoAtual, agora));
  if (senhaDoGuiche(estado, guiche)) {
    return { estado: estadoAtual, erro: `O guichê ${guiche} já possui um atendimento em andamento.` };
  }
  const tipo = escolherTipo(estado);
  if (!tipo) return { estado: estadoAtual, erro: "Não há senhas aguardando." };

  // FIFO dentro do tipo. Como esta função é síncrona e altera o estado de
  // uma só vez, duas chamadas seguidas nunca recebem a mesma senha.
  const senha = aguardando(estado, tipo)[0];
  senha.guiche = guiche;
  senha.atendente = atendente;
  senha.chamadas = 1;
  registrar(senha, ESTADOS.CHAMADA, agora);
  estado.proximaEhSP = tipo !== "SP";
  atualizarPainel(estado, senha, agora);
  estado.auditoria.push({
    atendente,
    guiche,
    senha: senha.numero,
    primeiraChamada: agora.toISOString(),
    segundaChamada: null,
    inicioAtendimento: null,
    fimAtendimento: null,
  });
  return { estado, senha };
}

function entradaAuditoria(estado, numero) {
  return estado.auditoria.find((a) => a.senha === numero);
}

export function chamarNovamente(estadoAtual, guiche, agora = new Date()) {
  const estado = structuredClone(estadoAtual);
  const senha = senhaDoGuiche(estado, guiche);
  if (!senha || senha.estado === ESTADOS.EM_ATENDIMENTO) {
    return { estado: estadoAtual, erro: "Não há senha chamada neste guichê." };
  }
  if (senha.chamadas >= 2) {
    return { estado: estadoAtual, erro: "A senha já foi chamada duas vezes." };
  }
  senha.chamadas = 2;
  registrar(senha, ESTADOS.CHAMADA_NOVAMENTE, agora);
  atualizarPainel(estado, senha, agora);
  entradaAuditoria(estado, senha.numero).segundaChamada = agora.toISOString();
  return { estado, senha, ultimaChamada: true };
}

export function iniciarAtendimento(estadoAtual, guiche, agora = new Date()) {
  const estado = structuredClone(estadoAtual);
  const senha = senhaDoGuiche(estado, guiche);
  if (!senha || senha.estado === ESTADOS.EM_ATENDIMENTO) {
    return { estado: estadoAtual, erro: "Não há senha chamada para iniciar." };
  }
  senha.inicioEm = agora.toISOString();
  registrar(senha, ESTADOS.EM_ATENDIMENTO, agora);
  entradaAuditoria(estado, senha.numero).inicioAtendimento = agora.toISOString();
  return { estado, senha };
}

export function finalizarAtendimento(estadoAtual, guiche, agora = new Date()) {
  const estado = structuredClone(estadoAtual);
  const senha = senhaDoGuiche(estado, guiche);
  if (!senha || senha.estado !== ESTADOS.EM_ATENDIMENTO) {
    return { estado: estadoAtual, erro: "Não há atendimento em andamento." };
  }
  senha.fimEm = agora.toISOString();
  registrar(senha, ESTADOS.ATENDIDA, agora);
  entradaAuditoria(estado, senha.numero).fimAtendimento = agora.toISOString();
  return { estado, senha };
}

// Cliente não compareceu: só é permitido depois das duas chamadas.
export function registrarNaoComparecimento(estadoAtual, guiche, agora = new Date()) {
  const estado = structuredClone(estadoAtual);
  const senha = senhaDoGuiche(estado, guiche);
  if (!senha || senha.estado === ESTADOS.EM_ATENDIMENTO) {
    return { estado: estadoAtual, erro: "Não há senha chamada neste guichê." };
  }
  if (senha.chamadas < 2) {
    return { estado: estadoAtual, erro: "Chame a senha duas vezes antes de descartá-la." };
  }
  registrar(senha, ESTADOS.NAO_COMPARECEU, agora);
  return { estado, senha };
}

// Texto lido em voz alta nas chamadas (desafio do áudio).
export function textoDaChamada(senha, ultimaChamada = false) {
  const letras = senha.numero.split("-")[1].slice(2).replace(/^0+/, "") || "0";
  const prefixo = ultimaChamada ? "Última chamada. " : "";
  return `${prefixo}${TIPOS[senha.tipo]}, ${senha.tipo} ${letras}, guichê ${senha.guiche}`;
}
