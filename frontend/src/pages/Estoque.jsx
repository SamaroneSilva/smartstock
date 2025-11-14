import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Estoque.scss"; // migrado para SCSS

export default function Estoque() {
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    const carregarProdutos = async () => {
      try {
        const response = await axios.get("http://localhost:5000/produtos");
        console.log("📦 Produtos recebidos:", response.data);
        
        // Garante que 'produtos' seja sempre um array
        setProdutos(response.data || []); 
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      }
    };

    carregarProdutos();
  }, []);

  return (
    // 1. O container principal que ocupa a tela
    <div className="estoque-container">
      
      {/* 2. O Título da Página */}
      <h1 className="estoque-titulo">📦 Estoque de Produtos</h1>

      {/* 3. O Conteúdo (tabela ou mensagem) */}
      <div className="estoque-conteudo-wrapper">
        {produtos.length === 0 ? (
          <div className="sem-produtos">
            <p>Nenhum produto cadastrado ainda.</p>
          </div>
        ) : (
          <div className="tabela-responsiva-wrapper">
            <table className="tabela-estoque table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Quantidade</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((produto) => (
                  <tr key={produto.id}>
                    <td>{produto.nome}</td>
                    <td>{produto.quantidade}</td>
                    <td>
                      {Number(produto.valor || produto.preco).toLocaleString(
                        "pt-BR",
                        { style: "currency", currency: "BRL" }
                      )}
                    </td>
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