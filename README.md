# nassauTickets

Sistema de Controle de Atendimento (tickets) para um Laboratório de Análises Clínicas.

## Descrição

O nassauTickets controla a emissão, a fila, a chamada e o atendimento de senhas de um laboratório. O cliente retira a senha em um totem, acompanha as chamadas em um painel e é atendido em um guichê por um atendente. O sistema segue o documento "Sistema para controle de atendimento" (UNINASSAU).

## Objetivo

Aplicar conhecimentos de desenvolvimento Web, React, organização de projetos, Git/GitHub e documentação em um sistema com regras de negócio reais: prioridades de atendimento, máquina de estados, auditoria e relatórios.

## Membros

| Nome | Matrícula | Papel |
|------|-----------|-------|
| Leonardo Ibrahim | 01773992 | Scrum Master |
| Leonardo Ibrahim | 01773992 | Documentador |
| Leonardo Ibrahim | 01773992 | Desenvolvedor |
| Leonardo Ibrahim | 01773992 | Testador |

> Projeto desenvolvido individualmente.

## Tecnologias

| Camada | Tecnologia | Situação |
|--------|-----------|----------|
| Frontend | React 19 + Vite | Fase 1 (em andamento) |
| Backend | Node.js LTS 22 + Express | Planejado (fase 2) |
| Banco de dados | MySQL 8.0 | Planejado (fase 2) |
| Testes | `node:test` (lógica da fila) | Fase 1 |

### Justificativa da escolha do backend

Node.js com Express usa a mesma linguagem (JavaScript) do frontend React, o que permite reaproveitar a lógica de fila já escrita e testada em `frontend/src/services/fila.js`, reduz o número de ferramentas a aprender e está entre as opções suportadas pela infraestrutura do laboratório.

## Visão geral da arquitetura

```
Totem (React)  --\
Painel (React) ---+--> Serviço de fila (regras de negócio) --> Persistência
Atendente (React)-/       frontend/src/services/fila.js        (fase 1: localStorage)
                                                               (fase 2: API REST + MySQL)
```

- `frontend/src/services/fila.js`: regras de negócio (alternância de prioridade, numeração `YYMMDD-PPSQ`, máquina de estados, auditoria).
- `frontend/src/pages/`: telas Totem, Painel e Atendente.
- `frontend/src/components/`: componentes reutilizáveis.
- `frontend/src/hooks/useFila.js`: estado compartilhado entre as abas.
- `docs/`: requisitos, UML, MER e demais artefatos.

## Estrutura do repositório

```
nassauTickets/
├── backend/
├── docs/
│   ├── branding/
│   ├── mer/
│   ├── mockups/
│   ├── models/
│   │   └── uml/
│   └── requirements/
├── frontend/
├── .gitignore
├── LICENSE
└── README.md
```

## Pré-requisitos

- Node.js 22 (LTS) e npm
- Git

## Instalação

```bash
git clone https://github.com/LeoIbrah/nassauTickets.git
cd nassauTickets/frontend
npm install
```

## Execução

```bash
cd frontend
npm run dev
```

Abra o endereço mostrado no terminal (normalmente http://localhost:5173). Para simular o laboratório, abra cada tela em uma aba diferente:

- Totem: `#/totem`
- Painel: `#/painel`
- Atendente: `#/atendente`

As abas se sincronizam automaticamente (na fase 1 os dados ficam no `localStorage` do navegador).

### Testes

```bash
cd frontend
npm test
```

## Configuração

Nesta fase não há variáveis de ambiente. Na fase 2 serão documentadas as configurações do backend e do banco MySQL (arquivo `.env.example`).

## Branches

| Branch | Uso |
|--------|-----|
| `main` | Versão estável; recebe apenas merges da `dev` |
| `dev` | Desenvolvimento; todos os commits são feitos aqui primeiro |

Padrão de commits: `feat:`, `fix:`, `docs:`, `chore:`.

## Documentação

- [Requisitos e regras de negócio](docs/requirements/requisitos.md)
- [Máquina de estados](docs/models/uml/maquina-de-estados.md)
- [Casos de uso](docs/models/uml/casos-de-uso.md)
- [Diagrama de sequência](docs/models/uml/sequencia-chamar-proxima.md)
- [Modelo Entidade-Relacionamento](docs/mer/mer.md)

## Status

**Fase 1:** repositório, documentação principal e frontend inicial (totem, painel e atendente com regras de fila).
**Fase 2 (planejada):** backend, MySQL, login, relatórios, simulação dos 5% de não comparecimento, tratamento de falhas e acessibilidade completa.

## Licença

[MIT](LICENSE)
