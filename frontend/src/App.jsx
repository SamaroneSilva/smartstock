import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Produtos from "./pages/Produtos";
import Vendas from "./pages/Vendas";
import Estoque from "./pages/Estoque";
import Usuarios from "./pages/Usuarios";
// OU, se salvou direto em pages:
// import AlterarSenha from "./pages/AlterarSenha";







function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/vendas" element={<Vendas />} />
        <Route path="/estoque" element={<Estoque />} />
        <Route path="/usuarios" element={<Usuarios />} />
          </Routes>
    </Router>
  );
}

export default App;
