import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import usuarioRoutes from "./routes/usuarios.js";
import authRoutes from "./routes/auth.js"; // <-- IMPORTANDO A ROTA DE LOGIN

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

// Rotas
app.use("/", authRoutes);       // <-- PRIMEIRO: LOGIN / CADASTRO
app.use("/usuarios", usuarioRoutes); // <-- DEPOIS: CRUD DE USUÁRIOS

// Rota raiz
app.get("/", (req, res) => {
  res.send("Backend SmartStock funcionando!");
});

// Inicializar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
