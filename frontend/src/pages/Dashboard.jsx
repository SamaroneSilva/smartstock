import { useNavigate } from "react-router-dom";
import { FaBoxOpen, FaShoppingCart, FaWarehouse, FaUsers } from "react-icons/fa";
import "./Dashboard.scss";

export default function Dashboard() {
  const navigate = useNavigate();

  const cards = [
    { title: "Cadastro de Produtos", route: "/produtos", icon: <FaBoxOpen size={40} /> },
    { title: "Vendas", route: "/vendas", icon: <FaShoppingCart size={40} /> },
    { title: "Estoque", route: "/estoque", icon: <FaWarehouse size={40} /> },
    { title: "Usuários", route: "/usuarios", icon: <FaUsers size={40} /> },
  ];

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      <div className="card-container">
        {cards.map((card) => (
          <div
            key={card.title}
            className="card"
            onClick={() => navigate(card.route)}
          >
            <div className="card-icon">{card.icon}</div>
            <h3>{card.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
