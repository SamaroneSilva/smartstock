import React, { useEffect, useState } from "react";
import "./Usuarios.scss";
import { Link } from "react-router-dom";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/usuarios")
      .then((res) => res.json())
      .then((data) => setUsuarios(data))
      .catch((err) => console.error("Erro ao carregar usuários:", err));
  }, []);

  return (
    <div className="usuarios-page">
      <div className="usuarios-container">

        {/* 🔹 Topo com título + botão Alterar Senha */}
        <div className="usuarios-topo">
          <h1>👥 Usuários do Sistema</h1>

          <Link to="/alterar-senha" className="btn-alterar-senha">
            Alterar Senha
          </Link>
        </div>

        {usuarios.length === 0 ? (
          <p className="sem-usuarios">Nenhum usuário cadastrado.</p>
        ) : (
          <div className="tabela-container">
            <table className="tabela-usuarios table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Função</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((user, index) => (
                  <tr key={user.id} className={index % 2 === 0 ? "linha-par" : "linha-impar"}>
                    <td>{user.id}</td>
                    <td>{user.nome}</td>
                    <td>{user.email}</td>
                    <td>{user.funcao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
