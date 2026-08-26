# Requisitos e riscos do laboratório

## Requisitos

- **RF-01:** Uma pessoa autenticada pode consultar um pedido que esteja autorizada a ver.
- **RF-02:** A consulta deve apresentar número, titular, tipo, estado, data e delegação.
- **RF-03:** O histórico deve aparecer do evento mais antigo para o mais recente.
- **RF-04:** O pedido deve aceitar no mínimo 1 e no máximo 5 anexos por envio.
- **RF-05:** Uma pessoa sem sessão deve ser orientada a iniciar sessão.
- **RF-06:** Um número de pedido com formato inválido deve receber resposta 400.
- **RN-01:** Uma pessoa não pode visualizar pedidos de outro titular.
- **RN-02:** O técnico autorizado pode consultar todos os pedidos do laboratório.

## Riscos

- **R-01:** Exposição de dados a uma pessoa não autorizada.
- **R-02:** Um pedido correto não ser encontrado.
- **R-03:** Documentos necessários não serem aceites.
- **R-04:** Histórico apresentado em ordem incorreta induzir uma decisão errada.
- **R-05:** Mensagens e códigos de resposta dificultarem o diagnóstico de falhas.
