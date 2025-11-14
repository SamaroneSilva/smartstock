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

// Inicializar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
