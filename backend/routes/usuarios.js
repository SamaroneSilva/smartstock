import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const router = express.Router();

const dbPromise = open({
  filename: "./smartstock.db",
  driver: sqlite3.Database
});

// ✅ Listar todos os usuários
router.get("/", async (req, res) => {
  try {
    const db = await dbPromise;
    const usuarios = await db.all("SELECT id, nome, email, funcao FROM users");
    res.json(usuarios);
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    res.status(500).json({ error: "Erro ao listar usuários" });
  }
});

export default router;
