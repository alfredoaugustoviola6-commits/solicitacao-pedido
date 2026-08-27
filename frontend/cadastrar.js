

const pedidoForm = document.querySelector("#pedidoForm");
const resultMessage = document.querySelector("#resultMessage");

function mostrarMensagem(elemento, texto, sucesso = false) {
    elemento.textContent = texto;
    elemento.classList.remove("hidden", "success");

    if (sucesso) {
        elemento.classList.add("success");
    }
}

pedidoForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const pedido = {
        numero: document.querySelector("#numero").value.trim(),
        titular: document.querySelector("#titular").value.trim(),
        tipo: document.querySelector("#tipo").value,
        estado: document.querySelector("#estado").value,
        dataRegisto: document.querySelector("#dataRegisto").value,
        delegacao: document.querySelector("#delegacao").value,
        responsavel: document.querySelector("#responsavel").value
    };

    mostrarMensagem(
        resultMessage,
        "A cadastrar o pedido..."
    );

    try {
        const response = await fetch("/api/pedidos", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(pedido)
        });

        const body = await response.json();

        if (!response.ok) {
            mostrarMensagem(
                resultMessage,
                body.erro || "Não foi possível cadastrar o pedido."
            );

            return;
        }

        mostrarMensagem(
            resultMessage,
            `Pedido ${body.pedido.numero} cadastrado com sucesso.`,
            true
        );

        pedidoForm.reset();
    } catch (error) {
        mostrarMensagem(
            resultMessage,
            "Não foi possível comunicar com o servidor."
        );

        console.error(error);
    }
});