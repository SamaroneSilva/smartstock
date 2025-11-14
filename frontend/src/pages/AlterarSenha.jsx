import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Página removida: redireciona automaticamente para /usuarios
export default function AlterarSenha() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/usuarios", { replace: true });
  }, []);
  return null;
}
