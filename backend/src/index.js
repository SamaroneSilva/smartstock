import express from "express";
import cors from "cors";
import usuariosRoutes from "./routes/usuarios.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/usuarios", usuariosRoutes);

// Porta dinâmica para Render
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
