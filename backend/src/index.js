import express from "express";
import cors from "cors";
import usuariosRouter from "./routes/usuarios.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/usuarios", usuariosRouter);

app.get("/", (req, res) => {
  res.send("Backend SmartStock funcionando!");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
