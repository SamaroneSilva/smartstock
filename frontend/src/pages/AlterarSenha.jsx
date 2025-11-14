import React, { useState, useEffect } from "react";
import "./AlterarSenha.scss";

export default function AlterarSenha() {
  const [usuario, setUsuario] = useState(null);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [mensagemTipo, setMensagemTipo] = useState(""); // 'success' | 'error' | ''

  useEffect(() => {
    const user = localStorage.getItem("usuarioLogado");
    if (user) {
      setUsuario(JSON.parse(user));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!senhaAtual || !novaSenha) {
      setMensagem("Preencha todos os campos.");
      setMensagemTipo('error');
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/usuarios/alterar-senha", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: usuario?.id,
          senhaAtual,
          novaSenha,
        }),
      });

      const data = await response.json();
      setMensagem(data.message || 'Operação concluída.');
      if (response.ok) {
        setMensagemTipo('success');
      } else {
        setMensagemTipo('error');
      }
    } catch (error) {
      console.error(error);
      setMensagem("Erro ao alterar senha.");
      setMensagemTipo('error');
    }
  };

  return (
    <div className="alterar-senha-page">
      <div className="alterar-senha-container card">
        <h1>Alterar Senha</h1>

        {usuario ? (
          <p className="usuario-info">
            Usuário logado: <strong>{usuario.nome}</strong> ({usuario.email})
          </p>
        ) : (
          <p className="usuario-info">Nenhum usuário logado.</p>
        )}

        <form onSubmit={handleSubmit} className="form-alterar-senha">
          <label>Senha atual</label>
          <input
            type="password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            placeholder="Digite sua senha atual"
            required
          />

          <label>Nova senha</label>
          <input
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            placeholder="Digite a nova senha"
            required
          />

          <button type="submit" className="btn btn-primary">Alterar senha</button>
        </form>

        {mensagem && <p className={`mensagem ${mensagemTipo}`}>{mensagem}</p>}
      </div>
    </div>
  );
}
