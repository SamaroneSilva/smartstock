import { useState } from "react";
import axios from "axios";
import "./Produtos.scss";

export default function Produtos() {
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [valor, setValor] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [produtoCadastrado, setProdutoCadastrado] = useState(null);

  // Formata automaticamente o valor em R$
  const formatarMoeda = (valorDigitado) => {
    let valorNumerico = valorDigitado.replace(/\D/g, "");
    valorNumerico = (valorNumerico / 100).toFixed(2) + "";
    valorNumerico = valorNumerico.replace(".", ",");
    valorNumerico = "R$ " + valorNumerico.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return valorNumerico;
  };

  const handleValorChange = (e) => {
    const valorFormatado = formatarMoeda(e.target.value);
    setValor(valorFormatado);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const valorNumerico = parseFloat(
      valor.replace("R$", "").replace(/\./g, "").replace(",", ".").trim()
    );

    try {
      const response = await axios.post("http://localhost:5000/produtos", {
        nome,
        preco: valorNumerico,
        quantidade: parseInt(quantidade),
      });

      setMensagem(response.data.message);
      setProdutoCadastrado({
        nome,
        quantidade,
        valor,
      });

      setNome("");
      setQuantidade("");
      setValor("");
    } catch (err) {
      setMensagem("Erro ao cadastrar produto.");
    }
  };

  return (
    <div className="produtos-page">
      <h1>Cadastro de Produtos</h1>

      <form className="produto-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nome:</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Teclado Mecânico"
            required
          />
        </div>

        <div className="form-inline">
          <div className="input-half">
            <label>Quantidade:</label>
            <input
              type="number"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              placeholder="0"
              min="0"
              required
            />
          </div>

          <div className="input-half">
            <label>Valor (R$):</label>
            <input
              type="text"
              value={valor}
              onChange={handleValorChange}
              placeholder="R$ 0,00"
              required
            />
          </div>
        </div>

        <button type="submit">Cadastrar Produto</button>
      </form>

      {produtoCadastrado && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="modal-close"
              onClick={() => setProdutoCadastrado(null)}
            >
              ✕
            </button>
            <h2>Produto cadastrado com sucesso!</h2>
            <div className="modal-info">
              <p><strong>Nome:</strong> {produtoCadastrado.nome}</p>
              <p><strong>Quantidade:</strong> {produtoCadastrado.quantidade}</p>
              <p><strong>Valor:</strong> {produtoCadastrado.valor}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
