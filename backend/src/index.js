import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import usuarioRoutes from "./routes/usuarios.js";

const app = express();
const PORT = process.env.PORT || 10000;

// Permitir requisições de qualquer origem (necessário para o front acessar)
app.use(cors());

// Middleware
app.use(bodyParser.json());

// Rotas
app.use("/", usuarioRoutes);

// Rota raiz
app.get("/", (req, res) => {
  res.send("Backend SmartStock funcionando!");
});

// Inicializar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
