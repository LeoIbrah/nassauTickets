# Requisitos do nassauTickets

Sistema de Controle de Atendimento para um Laboratório de Análises Clínicas.
Base: documento "Sistema para controle de atendimento" (versão 06).

## 1. Agentes

| Sigla | Agente | Papel |
|-------|--------|-------|
| AS | Agente Sistema | Emite senhas, aplica as regras de fila, atualiza o painel, persiste dados |
| AA | Agente Atendente | Chama, inicia e encerra atendimentos no guichê |
| AC | Agente Cliente | Retira a senha no totem (anônimo) e aguarda no painel |

## 2. Requisitos funcionais

| ID | Requisito |
|----|-----------|
| RF01 | O totem deve permitir ao AC emitir senha dos tipos SP, SG ou SE sem identificação. |
| RF02 | O AS deve numerar as senhas no formato `YYMMDD-PPSQ`, com sequência por tipo reiniciada diariamente. |
| RF03 | O AA deve poder chamar a próxima senha por meio de funcionalidade específica. |
| RF04 | O AS deve escolher a próxima senha respeitando a alternância `[SP] -> [SE\|SG] -> [SP] -> [SE\|SG]`. |
| RF05 | Se a fila da vez estiver vazia, o AS deve escolher a próxima senha mantendo as regras de prioridade. |
| RF06 | Qualquer guichê deve poder atender qualquer tipo de senha. |
| RF07 | O AA deve poder iniciar o atendimento depois que o AC se apresentar ao guichê. |
| RF08 | O AA deve poder finalizar o atendimento (funcionalidade "encerrar atendimento"). |
| RF09 | O AA deve poder acionar "Chamar novamente", que repete a chamada precedida de "Última chamada". |
| RF10 | Após duas chamadas sem comparecimento, a senha deve passar ao estado NÃO_COMPARECEU e o AS deve seguir para a próxima. |
| RF11 | O painel deve exibir as 5 últimas senhas chamadas, com o guichê, e nunca a próxima senha. |
| RF12 | O painel deve atualizar automaticamente. |
| RF13 | A chamada deve ter áudio informando prioridade, sequencial da senha e guichê. |
| RF14 | As senhas devem seguir a máquina de estados definida em `docs/models/uml/maquina-de-estados.md`. |
| RF15 | O sistema deve permitir login do AA, com um único usuário adicional de perfil gestor (cadastros e relatórios). |
| RF16 | O sistema deve gerar relatórios diário e mensal: total emitidas, total atendidas, emitidas por tipo, atendidas por tipo. |
| RF17 | O sistema deve gerar relatório detalhado das senhas (número, tipo, emissão, atendimento, guichê; campos de atendimento em branco se não atendida). |
| RF18 | O sistema deve gerar relatório do tempo médio de atendimento (TM). |
| RF19 | O sistema deve gerar relatório de auditoria (AA, guichê, senha, 1ª chamada, 2ª chamada, início e fim do atendimento). |
| RF20 | O sistema deve iniciar a chamada de senhas às 7h e encerrá-la às 17h; atendimentos em andamento devem ser concluídos pelo AA e senhas restantes descartadas. |
| RF21 | O sistema deve apresentar uma proposta de indicadores para acompanhar o desempenho dos atendimentos. |

## 3. Requisitos não funcionais

| ID | Categoria | Requisito |
|----|-----------|-----------|
| RNF01 | Segurança | Autenticação do AA e do gestor com senha armazenada com hash (bcrypt/argon2) e sessão por token com expiração. |
| RNF02 | Segurança | Autorização por perfil: apenas o gestor acessa cadastros e relatórios. |
| RNF03 | Segurança | Comunicação via HTTPS; validação de entrada em todos os endpoints; proteção contra SQL injection (consultas parametrizadas). |
| RNF04 | Disponibilidade | O painel e o frontend devem exibir mensagem clara de indisponibilidade e tentar reconectar automaticamente se o backend ou o banco falharem. |
| RNF05 | Disponibilidade | Backup diário do banco e plano de recuperação de desastres documentado. |
| RNF06 | Auditoria | Toda chamada, início e fim de atendimento devem ser registrados com data/hora, AA e guichê; registros de auditoria não podem ser alterados. |
| RNF07 | Desempenho | Emissão de senha e chamada da próxima em até 1 segundo em condições normais. |
| RNF08 | Concorrência | Duas chamadas simultâneas de AAs diferentes nunca podem retornar a mesma senha (transação com bloqueio de linha no banco). |
| RNF09 | LGPD | O AC é anônimo: nenhum dado pessoal do cliente é coletado. Dados do AA/gestor limitados ao necessário, com finalidade documentada. |
| RNF10 | Acessibilidade | Interface em conformidade com WCAG 2.1 AA e Lei Brasileira de Inclusão (Lei 13.146/2015): contraste, foco visível, navegação por teclado, leitores de tela, áudio das chamadas. |
| RNF11 | Usabilidade | Totem com botões grandes e textos curtos; painel legível a distância. |
| RNF12 | Portabilidade | Frontend em React 19; banco MySQL 8.0; backend em Node.js LTS 22 com Express. |
| RNF13 | Manutenibilidade | Código organizado em componentes, páginas, serviços e hooks; regras de negócio isoladas e testadas. |

## 4. Regras de negócio

| ID | Regra |
|----|-------|
| RN01 | Existem três tipos de senha: SP (prioritária), SG (geral) e SE (retirada de exames). |
| RN02 | A alternância de atendimento é `[SP] -> [SE\|SG] -> [SP] -> [SE\|SG]`. Na vez de SE\|SG, a SE é chamada antes da SG (premissa adotada pelo grupo, pois o documento não define a ordem entre elas). |
| RN03 | Dentro de cada tipo, a ordem de chamada é a de emissão (FIFO). |
| RN04 | Se a fila da vez estiver vazia, o AS escolhe o próximo atendimento mantendo as prioridades SP > SE > SG. |
| RN05 | Senha numerada como `YYMMDD-PPSQ`: YY ano, MM mês, DD dia, PP tipo, SQ sequência de 3 dígitos por tipo com reinício diário. |
| RN06 | Tempo médio (TM): SG 5 min (variação de ±3 min), SP 15 min (±5 min), SE 1 min em 95% dos casos e 5 min em 5%. |
| RN07 | Após duas chamadas sem comparecimento, a senha é considerada abandonada (NÃO_COMPARECEU). |
| RN08 | Cerca de 5% das senhas emitidas não são atendidas por responsabilidade do cliente e são descartadas sem atendimento. |
| RN09 | Expediente das 7h às 17h. Ao final, atendimentos em andamento são concluídos pelo AA e as senhas restantes são descartadas. |
| RN10 | O painel exibe as 5 últimas senhas chamadas e nunca a próxima. |
| RN11 | Não há guichê específico por tipo de senha. |
| RN12 | Um guichê só pode chamar nova senha depois de concluir ou descartar a anterior. |
| RN13 | O cliente é anônimo; só o AA (e um gestor) possuem login. |
| RN14 | A chamada por áudio informa prioridade, sequencial e guichê; na repetição é precedida de "Última chamada". |

## 5. Casos de uso

| ID | Caso de uso | Ator | Fluxo principal |
|----|-------------|------|-----------------|
| UC01 | Emitir senha | AC | AC escolhe o tipo no totem -> AS gera o número -> senha entra na fila (AGUARDANDO) -> totem exibe a senha. |
| UC02 | Chamar próxima senha | AA | AA aciona "Chamar próxima" -> AS aplica as regras de prioridade -> senha vai para CHAMADA -> painel atualiza e toca o áudio. |
| UC03 | Chamar novamente | AA | AA aciona "Chamar novamente" -> senha vai para CHAMADA_NOVAMENTE -> áudio com "Última chamada". |
| UC04 | Registrar não comparecimento | AA | Após 2 chamadas, AA registra -> senha vai para NÃO_COMPARECEU -> guichê é liberado. |
| UC05 | Iniciar atendimento | AA | AC chega ao guichê -> AA inicia -> senha vai para EM_ATENDIMENTO. |
| UC06 | Finalizar atendimento | AA | AA encerra -> senha vai para ATENDIDA -> guichê liberado. |
| UC07 | Acompanhar painel | AC | AC observa as 5 últimas chamadas e o guichê indicado. |
| UC08 | Autenticar | AA / Gestor | Informa credenciais -> sistema valida e cria a sessão. |
| UC09 | Gerar relatórios | Gestor | Escolhe período (diário/mensal) -> sistema gera os relatórios de quantitativos, detalhado, TM e auditoria. |
| UC10 | Gerir cadastros | Gestor | Cadastra e mantém atendentes e guichês. |

## 6. Desafios (como o grupo pretende tratá-los)

- **Concorrência:** a escolha da próxima senha e sua atribuição ao guichê ocorrem em uma única transação no banco com `SELECT ... FOR UPDATE SKIP LOCKED`; no frontend da fase 1, a operação é síncrona sobre o estado mais recente.
- **Desempenho:** indicadores propostos: tempo médio de espera, tempo médio de atendimento por tipo, senhas atendidas por hora, taxa de não comparecimento e tempo de espera por tipo.
- **Áudio:** Web Speech API do navegador (`speechSynthesis`, idioma pt-BR).
- **Falhas:** o frontend e o painel mostram aviso de "Sistema temporariamente indisponível", mantêm a última informação conhecida e tentam reconectar a cada poucos segundos; backups diários do MySQL.

## 7. Fora do escopo da fase 1

Backend, banco de dados MySQL, login, relatórios e simulação dos 5% de não comparecimento serão implementados na fase 2.
