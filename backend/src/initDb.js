import { openDb } from "./database.js";

async function init() {
  const db = await openDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      funcao TEXT DEFAULT 'user'
    )
  `);
  console.log("✅ Tabela 'users' criada (ou já existente).");

  await db.exec(`
    CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      preco REAL NOT NULL,
      quantidade INTEGER NOT NULL
    )
  `);
  console.log("✅ Tabela 'produtos' criada (ou já existente).");

  // Inserir usuário admin se não existir
  const adminExists = await db.get("SELECT * FROM users WHERE email = 'admin@admin.com'");
  if (!adminExists) {
    await db.run(`
      INSERT INTO users (nome, email, senha, funcao)
      VALUES ('Admin', 'admin@admin.com', 'admin123', 'admin')
    `);
    console.log("ℹ️ Usuário admin criado.");
  }
}

init();
