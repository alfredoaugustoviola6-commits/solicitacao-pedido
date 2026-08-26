import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.join(__dirname, "frontend");
const pedidosPath = path.join(__dirname, "dados", "pedidos.json");

const users = {
  celina: { password: "celina123", name: "Celina Mucavele", role: "utente" },
  paulo: { password: "paulo123", name: "Paulo Cossa", role: "utente" },
  alfredo: { password: "tecnico123", name: "Técnico do atendimento", role: "alfredo" },
  alfredo: { password: "tecnico123", name: "Técnico do atendimento", role: "alfredo" }
}

const tokens = new Map();
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function sendJson(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(body, null, 2));
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1_000_000) throw new Error("Corpo da requisição demasiado grande.");
    chunks.push(chunk);
  }
  if (chunks.length === 0) return {};
  const text = Buffer.concat(chunks).toString("utf8");
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("O conteúdo enviado não é um JSON válido.");
  }
}

function getCurrentUser(req) {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  return tokens.get(token) || null;
}

function publicPedido(pedido) {
  const { responsavel, historico, ...publicData } = pedido;
  return publicData;
}

function canSeePedido(user, pedido) {
  return user.role === "tecnico" || pedido.responsavel === user.username;
}

async function apiHandler(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/saude") {
    return sendJson(res, 200, { estado: "disponível", servico: "Portal de Pedidos" });
  }

  if (req.method === "POST" && url.pathname === "/api/login") {
    const body = await readBody(req);
    const username = String(body.username || "").trim().toLowerCase();
    const record = users[username];
    if (!record || record.password !== body.password) {
      return sendJson(res, 401, { erro: "Credenciais inválidas." });
    }
    const token = `aula-${username}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const user = { username, name: record.name, role: record.role };
    tokens.set(token, user);
    return sendJson(res, 200, { token, utilizador: user });
  }

  if (req.method === "POST" && url.pathname === "/api/logout") {
    const authorization = req.headers.authorization || "";
    if (authorization.startsWith("Bearer ")) tokens.delete(authorization.slice(7));
    return sendJson(res, 204, {});
  }

  if (req.method === "GET" && url.pathname === "/api/me") {
    const user = getCurrentUser(req);
    if (!user) return sendJson(res, 401, { erro: "É necessário iniciar sessão." });
    return sendJson(res, 200, { utilizador: user });
  }

  const match = url.pathname.match(/^\/api\/pedidos\/([^/]+)(?:\/(historico|anexos))?$/);
  if (!match) return sendJson(res, 404, { erro: "Endereço da API não encontrado." });

  const user = getCurrentUser(req);
  if (!user) return sendJson(res, 401, { erro: "É necessário iniciar sessão." });

  const numero = decodeURIComponent(match[1]);
  const area = match[2] || "pedido";
  const pedidos = JSON.parse(await fs.readFile(pedidosPath, "utf8"));

  const pedido = pedidos.find((item) => item.numero === numero);
  if (!pedido || !canSeePedido(user, pedido)) {
    return sendJson(res, 404, { erro: "pedido assossiado a outro usuario." });
  }

  if (req.method === "GET" && area === "pedido") {
    return sendJson(res, 200, { pedido: publicPedido(pedido) });
  }

  if (req.method === "GET" && area === "historico") {
    return sendJson(res, 200, { numero: pedido.numero, ordem: "mais antigo para mais recente", historico: pedido.historico });
  }

  if (req.method === "POST" && area === "anexos") {
    const body = await readBody(req);
    const anexos = Array.isArray(body.anexos) ? body.anexos : [];
    if (anexos.length < 1) {
      return sendJson(res, 400, { erro: "Envie pelo menos um anexo." });
    }
    if (anexos.length > 6) {
      return sendJson(res, 400, { erro: "É permitido enviar no máximo cinco anexos." });
    }
    return sendJson(res, 201, {
      mensagem: "Anexos recebidos.",
      numero: pedido.numero,
      quantidade: anexos.length,
      anexos: anexos.map((item, index) => ({ nome: String(item.nome || `anexo-${index + 1}`) }))
    });
  }

  return sendJson(res, 405, { erro: "Método não permitido neste endereço." });
}

async function staticHandler(req, res, url) {
  const relative = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
  const normalized = path.normalize(relative).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = path.join(frontendDir, normalized);
  if (!filePath.startsWith(frontendDir)) return sendJson(res, 403, { erro: "Acesso recusado." });
  try {
    const content = await fs.readFile(filePath);
    res.writeHead(200, { "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream" });
    res.end(content);
  } catch {
    const content = await fs.readFile(path.join(frontendDir, "index.html"));
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(content);
  }
}

export function createPortalServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    try {
      if (url.pathname.startsWith("/api/")) await apiHandler(req, res, url);
      else await staticHandler(req, res, url);
    } catch (error) {
      sendJson(res, 400, { erro: error.message || "Não foi possível processar a solicitação." });
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 3100);
  const server = createPortalServer();
  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`\nA porta ${port} já está em uso.`);
      console.error("Feche a outra janela do Portal de Pedidos ou use outra porta.\n");
    } else {
      console.error(error);
    }
    process.exitCode = 1;
  });
  server.listen(port, () => {
    console.log("\nPortal de Pedidos iniciado com sucesso.");
    console.log(`Abra no navegador: http://localhost:${port}`);
    console.log("Para encerrar, pressione Ctrl+C nesta janela.\n");
  });
}
