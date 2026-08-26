const state = { token: null, user: null, pedido: null };

const $ = (selector) => document.querySelector(selector);
const loginPanel = $("#loginPanel");
const workspace = $("#workspace");
const message = $("#message");
const resultPanel = $("#resultPanel");

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  const response = await fetch(path, { ...options, headers });
  let body = {};
  try { body = await response.json(); } catch { body = {}; }
  return { response, body };
}

function showMessage(element, text, success = false) {
  element.textContent = text;
  element.classList.remove("hidden", "success");
  if (success) element.classList.add("success");
}

function enterWorkspace(user) {
  loginPanel.classList.add("hidden");
  workspace.classList.remove("hidden");
  resultPanel.classList.add("hidden");
  message.classList.add("hidden");
  $("#sessionText").textContent = user ? `Sessão iniciada: ${user.name}` : "Marta: sem sessão iniciada";
}

document.querySelectorAll(".profile[data-user]").forEach((button) => {
  button.addEventListener("click", async () => {
    const { response, body } = await api("/api/login", {
      method: "POST",
      body: JSON.stringify({ username: button.dataset.user, password: button.dataset.password })
    });
    if (!response.ok) return alert(body.erro || "Não foi possível iniciar sessão.");
    state.token = body.token;
    state.user = body.utilizador;
    enterWorkspace(state.user);
  });
});

$("#guestButton").addEventListener("click", () => {
  state.token = null;
  state.user = null;
  enterWorkspace(null);
});

$("#logoutButton").addEventListener("click", async () => {
  if (state.token) await api("/api/logout", { method: "POST" });
  state.token = null;
  state.user = null;
  state.pedido = null;
  workspace.classList.add("hidden");
  loginPanel.classList.remove("hidden");
});

$("#searchButton").addEventListener("click", searchPedido);
$("#pedidoNumero").addEventListener("keydown", (event) => {
  if (event.key === "Enter") searchPedido();
});

async function searchPedido() {
  const numero = $("#pedidoNumero").value.trim();
  resultPanel.classList.add("hidden");
  if (!numero) return showMessage(message, "Informe o número do pedido antes de consultar.");
  const { response, body } = await api(`/api/pedidos/${encodeURIComponent(numero)}`);
  if (!response.ok) return showMessage(message, body.erro || "Não foi possível consultar o pedido.");
  message.classList.add("hidden");
  state.pedido = body.pedido;
  renderPedido(body.pedido);
}

function renderPedido(pedido) {
  $("#resultTitle").textContent = `Pedido ${pedido.numero}`;
  $("#stateBadge").textContent = pedido.estado;
  const labels = {
    titular: "Titular", tipo: "Tipo", dataRegisto: "Data de registo",
    delegacao: "Delegação", numero: "Número", estado: "Estado"
  };
  $("#pedidoDetails").innerHTML = ["titular", "tipo", "dataRegisto", "delegacao", "numero", "estado"]
    .map((key) => `<div><dt>${labels[key]}</dt><dd>${pedido[key]}</dd></div>`).join("");
  $("#historyList").innerHTML = "<li>Selecione “Carregar histórico”.</li>";
  $("#attachmentMessage").classList.add("hidden");
  resultPanel.classList.remove("hidden");
}

$("#historyButton").addEventListener("click", async () => {
  if (!state.pedido) return;
  const { response, body } = await api(`/api/pedidos/${state.pedido.numero}/historico`);
  if (!response.ok) return showMessage(message, body.erro || "Não foi possível carregar o histórico.");
  $("#historyList").innerHTML = body.historico
    .map((item) => `<li><strong>${item.data}</strong> — ${item.evento}</li>`).join("");
});

$("#attachmentsButton").addEventListener("click", async () => {
  if (!state.pedido) return;
  const count = Number($("#attachmentCount").value);
  const anexos = Array.from({ length: Math.max(0, count) }, (_, index) => ({ nome: `documento-${index + 1}.pdf` }));
  const { response, body } = await api(`/api/pedidos/${state.pedido.numero}/anexos`, {
    method: "POST", body: JSON.stringify({ anexos })
  });
  showMessage($("#attachmentMessage"), body.erro || `${body.quantidade} anexo(s) recebido(s).`, response.ok);
});

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((item) => item.classList.add("hidden"));
    tab.classList.add("active");
    $(`#${tab.dataset.tab}`).classList.remove("hidden");
  });
});
