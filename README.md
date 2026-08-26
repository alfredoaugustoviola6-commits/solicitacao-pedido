# Portal de Pedidos — laboratório M15–M18

Projeto fictício para aulas de design de casos de teste, testes de API, defeitos e homologação. Nenhum dado real é utilizado.

## Como iniciar no Windows

1. Instale o Node.js 18 ou superior.
2. Extraia a pasta completa do ficheiro ZIP.
3. Clique duas vezes em `iniciar.bat`.
4. O navegador abrirá em `http://localhost:3100`.
5. Mantenha a janela preta aberta durante a atividade.
6. Para encerrar, pressione `Ctrl+C` na janela preta.

Se a página não abrir automaticamente, digite `http://localhost:3100` no navegador.

## Perfis da atividade

| Perfil | Utilizador | Palavra-passe | Situação |
|---|---|---|---|
| Celina | `celina` | `celina123` | Pode consultar os pedidos 1001 e 1003 |
| Paulo | `paulo` | `paulo123` | Pode consultar somente o pedido 1002 |
| Técnico | `tecnico` | `tecnico123` | Pode consultar todos os pedidos |
| Marta | — | — | Usa o portal sem iniciar sessão |

## Números preparados

- `1001`: pedido de Celina.
- `1002`: pedido de Paulo.
- `1003`: pedido de Celina com um histórico a investigar.
- `9999`: pedido inexistente.

## Testes da API

Importe no Postman o ficheiro:

`colecao-postman/Portal_de_Pedidos.postman_collection.json`

Não é necessário instalar pacotes com `npm install`: o projeto usa apenas recursos nativos do Node.js.
