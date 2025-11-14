import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
const PORT = 5000;

// Configurações
app.use(cors());
app.use(bodyParser.json());

// Log simples de todas as requisições (método + url)
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.url}`);
  next();
});

// Função central de conexão ao banco
async function openDb() {
  return open({
    filename: "./smartstock.db", // mesmo banco usado no initDb.js
    driver: sqlite3.Database,
  });
}

// 🟢 LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = await openDb();

    const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) {
      await db.close();
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await db.close();
      return res.status(401).json({ error: "Senha incorreta." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      "segredo_super_secreto",
      { expiresIn: "1h" }
    );

    await db.close();
    res.json({ token, user });
  } catch (error) {
    console.error("Erro ao autenticar:", error);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
});

// 🟢 CADASTRAR PRODUTO
app.post("/produtos", async (req, res) => {
  try {
    const { nome, preco, quantidade } = req.body;
    console.log("Dados recebidos:", req.body);

    const db = await openDb();
    await db.run(
      "INSERT INTO produtos (nome, preco, quantidade) VALUES (?, ?, ?)",
      [nome, preco, quantidade]
    );

    await db.close();
    res.json({ message: "Produto cadastrado com sucesso!" });
  } catch (error) {
    console.error("Erro ao inserir produto:", error);
    res.status(500).json({ error: "Erro ao cadastrar produto" });
  }
});

// 🟢 LISTAR PRODUTOS
app.get("/produtos", async (req, res) => {
  try {
    const db = await openDb();
    const produtos = await db.all("SELECT * FROM produtos");
    await db.close();
    res.json(produtos);
  } catch (error) {
    console.error("Erro ao listar produtos:", error);
    res.status(500).json({ error: "Erro ao listar produtos" });
  }
});

// 🟢 LISTAR USUÁRIOS (formato compatível com frontend em PT-BR)
app.get("/usuarios", async (req, res) => {
  try {
    const db = await openDb();
    const usuarios = await db.all(
      "SELECT id, name AS nome, email, role AS funcao FROM users"
    );
    await db.close();
    res.json(usuarios);
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    res.status(500).json({ error: "Erro ao listar usuários" });
  }
});

// 🟢 CADASTRAR USUÁRIO
app.post("/usuarios", async (req, res) => {
  try {
    const { nome, email, senha, funcao } = req.body;
    // validações básicas
    if (!nome || !email || !senha || !funcao) {
      return res.status(400).json({ error: "Parâmetros inválidos." });
    }

    // validar valores aceitos para função
    const allowedRoles = ["gerente", "vendedor"];
    if (!allowedRoles.includes(funcao)) {
      return res.status(400).json({ error: "Função inválida." });
    }

    const db = await openDb();

    // verificar se e-mail já existe
    const existente = await db.get("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (existente) {
      await db.close();
      return res.status(409).json({ error: "E-mail já cadastrado." });
    }

    const hashed = await bcrypt.hash(senha, 10);
    await db.run(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [nome, email, hashed, funcao]
    );

    // buscar o usuário criado para retornar ao cliente (sem senha)
    const criado = await db.get(
      "SELECT id, name AS nome, email, role AS funcao FROM users WHERE email = ?",
      [email]
    );

    await db.close();
    res.status(201).json(criado);
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    res.status(500).json({ error: "Erro ao cadastrar usuário" });
  }
});

// 🟡 ATUALIZAR DADOS DO USUÁRIO (nome, email, role)
app.put("/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, funcao } = req.body;

    if (!nome || !email || !funcao) {
      return res.status(400).json({ error: "Parâmetros inválidos." });
    }

    const allowedRoles = ["gerente", "vendedor"];
    if (!allowedRoles.includes(funcao)) {
      return res.status(400).json({ error: "Função inválida." });
    }

    const db = await openDb();

    // verificar se existe outro usuário com o mesmo e-mail
    const existing = await db.get("SELECT * FROM users WHERE email = ? AND id != ?", [email, id]);
    if (existing) {
      await db.close();
      return res.status(409).json({ error: "E-mail já cadastrado por outro usuário." });
    }

    await db.run("UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?", [nome, email, funcao, id]);

    const updated = await db.get(
      "SELECT id, name AS nome, email, role AS funcao FROM users WHERE id = ?",
      [id]
    );
    await db.close();

    res.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
});

// 🔴 REMOVER USUÁRIO (somente admin via UI, endpoint público por enquanto)
app.delete("/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await openDb();
    const user = await db.get("SELECT * FROM users WHERE id = ?", [id]);
    if (!user) {
      await db.close();
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    // Evitar remoção do admin por acidente
    if (user.email === "admin@smartstock.com") {
      await db.close();
      return res.status(403).json({ error: "Não é permitido remover o usuário administrador." });
    }

    await db.run("DELETE FROM users WHERE id = ?", [id]);
    await db.close();
    res.json({ message: "Usuário removido com sucesso." });
  } catch (error) {
    console.error("Erro ao remover usuário:", error);
    res.status(500).json({ error: "Erro ao remover usuário" });
  }
});

// 🟡 ALTERAR SENHA DE UM USUÁRIO (admin/reset) - sem exigir senha atual
app.put("/usuarios/:id/senha", async (req, res) => {
  try {
    const { id } = req.params;
    const { novaSenha } = req.body;

    if (!novaSenha || typeof novaSenha !== "string" || novaSenha.length < 6) {
      return res.status(400).json({ error: "Senha inválida. Mínimo 6 caracteres." });
    }

    const db = await openDb();
    const user = await db.get("SELECT * FROM users WHERE id = ?", [id]);
    if (!user) {
      await db.close();
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    const hashed = await bcrypt.hash(novaSenha, 10);
    await db.run("UPDATE users SET password = ? WHERE id = ?", [hashed, id]);
    await db.close();

    res.json({ message: "Senha atualizada com sucesso." });
  } catch (error) {
    console.error("Erro ao atualizar senha do usuário:", error);
    res.status(500).json({ error: "Erro ao atualizar senha." });
  }
});

// 🟢 ALTERAR SENHA DO USUÁRIO
app.put("/usuarios/alterar-senha", async (req, res) => {
  try {
    // Debug: log body received
    console.log("[PUT /usuarios/alterar-senha] body:", req.body);
    const { id, senhaAtual, novaSenha } = req.body;
    if (!id || !senhaAtual || !novaSenha) {
      return res.status(400).json({ message: "Parâmetros inválidos." });
    }

    const db = await openDb();
    const user = await db.get("SELECT * FROM users WHERE id = ?", [id]);
    console.log("[PUT /usuarios/alterar-senha] user from db:", user ? { id: user.id, email: user.email } : null);
    if (!user) {
      await db.close();
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    const isMatch = await bcrypt.compare(senhaAtual, user.password);
    console.log("[PUT /usuarios/alterar-senha] isMatch:", isMatch);
    if (!isMatch) {
      await db.close();
      return res.status(401).json({ message: "Senha atual incorreta." });
    }

    const hashed = await bcrypt.hash(novaSenha, 10);
    await db.run("UPDATE users SET password = ? WHERE id = ?", [hashed, id]);
    await db.close();

    res.json({ message: "Senha alterada com sucesso." });
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    res.status(500).json({ message: "Erro interno ao alterar senha." });
  }
});

// Inicializar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
