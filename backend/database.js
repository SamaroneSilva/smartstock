import sqlite3 from "sqlite3";
sqlite3.verbose();

const db = new sqlite3.Database("./smartstock.db", (err) => {
  if (err) {
    console.error("❌ Erro ao conectar ao banco:", err.message);
  } else {
    console.log("✅ Banco de dados conectado com sucesso!");
  }
});

export default db;
