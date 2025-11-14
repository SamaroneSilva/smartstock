import express from "express";
import { openDb } from "../database.js";

const router = express.Router();

// Listar todos os usuários
router.get("/", async (req, res) => {
  try {
    const db = await openDb();
    const users = await db.all("SELECT * FROM users");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar usuários." });
  }
});

// Buscar usuário por id
router.get("/:id", async (req, res) => {
  try {
    const db = await openDb();
    const user = await db.get("SELECT * FROM users WHERE id = ?", req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "Usuário não encontrado." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar usuário." });
  }
});

// Criar novo usuário
router.post("/", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const db = await openDb();
    const result = await db.run(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      name,
      email,
      password
    );
    res.status(201).json({ id: result.lastID, name, email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar usuário." });
  }
});

// Atualizar usuário
router.put("/:id", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const db = await openDb();
    const result = await db.run(
      "UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?",
      name,
      email,
      password,
      req.params.id
    );
    if (result.changes > 0) {
      res.json({ id: req.params.id, name, email });
    } else {
      res.status(404).json({ error: "Usuário não encontrado." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar usuário." });
  }
});

// Deletar usuário
router.delete("/:id", async (req, res) => {
  try {
    const db = await openDb();
    const result = await db.run("DELETE FROM users WHERE id = ?", req.params.id);
    if (result.changes > 0) {
      res.json({ message: "Usuário deletado com sucesso." });
    } else {
      res.status(404).json({ error: "Usuário não encontrado." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao deletar usuário." });
  }
});

export default router;
