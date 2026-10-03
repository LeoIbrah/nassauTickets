# Diagrama de casos de uso

```mermaid
flowchart LR
    AC([Cliente AC])
    AA([Atendente AA])
    GE([Gestor])
    AS([Sistema AS])

    subgraph nassauTickets
        UC01(UC01 Emitir senha)
        UC07(UC07 Acompanhar painel)
        UC02(UC02 Chamar próxima senha)
        UC03(UC03 Chamar novamente)
        UC04(UC04 Registrar não comparecimento)
        UC05(UC05 Iniciar atendimento)
        UC06(UC06 Finalizar atendimento)
        UC08(UC08 Autenticar)
        UC09(UC09 Gerar relatórios)
        UC10(UC10 Gerir cadastros)
    end

    AC --> UC01
    AC --> UC07
    AA --> UC08
    AA --> UC02
    AA --> UC03
    AA --> UC04
    AA --> UC05
    AA --> UC06
    GE --> UC08
    GE --> UC09
    GE --> UC10
    AS -.-> UC01
    AS -.-> UC02
```
