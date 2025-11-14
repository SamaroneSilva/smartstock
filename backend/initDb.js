import sqlite3 from "sqlite3";
import { open } from "sqlite";
import bcrypt from "bcrypt";

sqlite3.verbose();

const init = async () => {
  const db = await open({
    filename: "./smartstock.db",
    driver: sqlite3.Database,
  });

  // criar tabela users
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('gerente','vendedor')) NOT NULL
    )
  `);
  console.log("✅ Tabela 'users' criada (ou já existente).");

  // criar tabela produtos
  await db.exec(`
    CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      preco REAL NOT NULL,
      quantidade INTEGER NOT NULL
    )
  `);
  console.log("✅ Tabela 'produtos' criada (ou já existente).");

  // verificar se usuário admin existe
  const row = await db.get(`SELECT * FROM users WHERE email = ?`, [
    "admin@smartstock.com",
  ]);

  if (!row) {
    const hashedPassword = await bcrypt.hash("123456", 10);
    await db.run(
      `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
      ["Administrador", "admin@smartstock.com", hashedPassword, "gerente"]
    );
    console.log("✅ Usuário admin inserido com sucesso!");
  } else {
    console.log("ℹ️ Usuário admin já existe.");
  }

  await db.close();
};

init().catch((err) => console.error("❌ Erro ao inicializar o DB:", err));
