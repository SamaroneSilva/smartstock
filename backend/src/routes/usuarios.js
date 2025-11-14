import express from "express";
import { openDb } from "../database.js";

const router = express.Router();

// Listar todos os usuários
router.get("/", async (req, res) => {
  try {
    const db = await openDb();
    const usuarios = await db.all("SELECT id, nome, email, funcao FROM users");
    res.json(usuarios);
  } catch (err) {
    console.error("Erro ao buscar usuários:", err);
    res.status(500).json({ error: "Erro ao buscar usuários." });
  }
});

// Aqui você pode adicionar mais rotas: criar usuário, alterar senha, deletar...

export default router;
