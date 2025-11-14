import sqlite3 from "sqlite3";
import { open } from "sqlite";

const checkDb = async () => {
  const db = await open({
    filename: "./smartstock.db",
    driver: sqlite3.Database,
  });

  const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
  console.log("📋 Tabelas encontradas no banco:");
  console.log(tables);

  await db.close();
};

checkDb().catch(err => console.error("Erro ao verificar o banco:", err));
