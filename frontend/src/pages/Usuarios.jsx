import React, { useEffect, useState } from "react";
import "./Usuarios.scss";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    funcao: "vendedor",
  });
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pwdForm, setPwdForm] = useState({ novaSenha: "", confirmar: "" });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ nome: "", email: "", funcao: "vendedor" });

  const loggedUser = JSON.parse(localStorage.getItem("usuarioLogado") || "null");

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/usuarios");
      const ct = res.headers.get("content-type") || "";
      if (!res.ok) {
        const payload = ct.includes("application/json") ? await res.json() : await res.text();
        const payloadStr = typeof payload === "object" ? JSON.stringify(payload) : String(payload);
        throw new Error(payloadStr || `HTTP ${res.status}`);
      }
      const data = ct.includes("application/json") ? await res.json() : [];
      // aplicar regras de visibilidade por role
      let visible = data || [];
      if (loggedUser) {
        const isAdmin = loggedUser.email === "admin@smartstock.com";
        if (isAdmin) {
          visible = data;
        } else if (loggedUser.role === "gerente") {
          // gerente vê somente vendedores e o próprio registro
          visible = (data || []).filter((u) => u.funcao === "vendedor" || u.id === loggedUser.id);
        } else if (loggedUser.role === "vendedor") {
          // vendedor vê apenas a si mesmo
          visible = (data || []).filter((u) => u.id === loggedUser.id);
        }
      } else {
        visible = [];
      }
      setUsuarios(visible || []);
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
      setMensagem({ tipo: "erro", texto: "Erro ao carregar usuários." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setMensagem(null);
    if (!form.nome || !form.email || !form.senha) {
      setMensagem({ tipo: "erro", texto: "Preencha todos os campos." });
      return;
    }
    if (form.senha.length < 6) {
      setMensagem({ tipo: "erro", texto: "A senha precisa ter ao menos 6 caracteres." });
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: form.nome, email: form.email, senha: form.senha, funcao: form.funcao }),
      });

      const ct = res.headers.get("content-type") || "";
      if (!res.ok) {
        const payload = ct.includes("application/json") ? await res.json() : await res.text();
        const payloadStr = typeof payload === "object" ? JSON.stringify(payload) : String(payload);
        throw new Error(payloadStr || `HTTP ${res.status}`);
      }
      const novo = ct.includes("application/json") ? await res.json() : null;
      // atualiza lista localmente
      setUsuarios((s) => [...s, novo]);
      setMensagem({ tipo: "sucesso", texto: "Usuário criado com sucesso." });
      setShowModal(false);
      setForm({ nome: "", email: "", senha: "", funcao: "vendedor" });
    } catch (err) {
      console.error("Erro ao criar usuário:", err);
      setMensagem({ tipo: "erro", texto: err.message || "Erro ao criar usuário." });
    }
  };

  return (
    <div className="usuarios-page">
      <div className="usuarios-container">

        {/* 🔹 Topo com título + ações */}
          <div className="usuarios-topo">
          <h1>👥 Usuários do Sistema</h1>

          <div className="usuarios-acoes">
            <button className="btn-novo-usuario" onClick={() => setShowModal(true)}>
              + Novo Usuário
            </button>
          </div>
        </div>

        {mensagem && (
          <div className={`mensagem ${mensagem.tipo === "erro" ? "erro" : "sucesso"}`}>
            {mensagem.texto}
          </div>
        )}

        {loading ? (
          <p className="sem-usuarios">Carregando usuários...</p>
        ) : usuarios.length === 0 ? (
          <div className="sem-usuarios">
            <p>Nenhum usuário cadastrado.</p>
            <button className="btn-novo-usuario" onClick={() => setShowModal(true)}>Criar primeiro usuário</button>
          </div>
        ) : (
          <div className="tabela-container">
            <table className="tabela-usuarios table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Função</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((user, index) => {
                  const isAdmin = loggedUser && loggedUser.email === "admin@smartstock.com";
                  const isGerente = loggedUser && loggedUser.role === "gerente";
                  const isVendedor = loggedUser && loggedUser.role === "vendedor";

                  // permissões para editar senha
                  const canEditPassword = (() => {
                    if (!loggedUser) return false;
                    if (isAdmin) return true; // admin pode alterar todos
                    if (isGerente) {
                      // gerente pode alterar qualquer perfil exceto o administrador
                      return user.email !== "admin@smartstock.com";
                    }
                    if (isVendedor) {
                      // vendedor só pode alterar a própria senha
                      return user.id === loggedUser.id;
                    }
                    return false;
                  })();

                  // permissões para editar dados (somente administrador)
                  const canEditData = isAdmin;

                  return (
                    <tr key={user.id} className={index % 2 === 0 ? "linha-par" : "linha-impar"}>
                      <td>{user.id}</td>
                      <td>{user.nome}</td>
                      <td>{user.email}</td>
                      <td>{user.funcao}</td>
                      <td className="acoes-col">
                        {canEditData && (
                          <button className="btn-editar-dados" onClick={() => { setSelectedUser(user); setEditForm({ nome: user.nome, email: user.email, funcao: user.funcao }); setShowEditModal(true); }}>
                            Editar
                          </button>
                        )}
                        {canEditPassword && (
                          <button className="btn-editar-senha" onClick={() => { setSelectedUser(user); setShowPwdModal(true); }}>
                            Editar Senha
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal simples para criação de usuário */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Novo Usuário</h3>
                <button className="btn-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body">
                  <label>
                    Nome
                    <input name="nome" value={form.nome} onChange={handleChange} />
                  </label>
                  <label>
                    E-mail
                    <input name="email" type="email" value={form.email} onChange={handleChange} />
                  </label>
                  <label>
                    Senha
                    <input name="senha" type="password" value={form.senha} onChange={handleChange} />
                  </label>
                  <label>
                    Função
                    <select name="funcao" value={form.funcao} onChange={handleChange}>
                      <option value="vendedor">Vendedor</option>
                      <option value="gerente">Gerente</option>
                    </select>
                  </label>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-sec" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn-primary">Criar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal para editar senha de usuário */}
        {showPwdModal && selectedUser && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Alterar senha — {selectedUser.nome}</h3>
                <button className="btn-close" onClick={() => setShowPwdModal(false)}>×</button>
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setMensagem(null);
                  if (!pwdForm.novaSenha || pwdForm.novaSenha.length < 6) {
                    setMensagem({ tipo: "erro", texto: "A senha precisa ter ao menos 6 caracteres." });
                    return;
                  }
                  if (pwdForm.novaSenha !== pwdForm.confirmar) {
                    setMensagem({ tipo: "erro", texto: "As senhas não conferem." });
                    return;
                  }

                  try {
                    const res = await fetch(`http://localhost:5000/usuarios/${selectedUser.id}/senha`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ novaSenha: pwdForm.novaSenha }),
                    });

                      const ct = res.headers.get("content-type") || "";
                      if (!res.ok) {
                        const payload = ct.includes("application/json") ? await res.json() : await res.text();
                        throw new Error((payload && payload.error) || payload || `HTTP ${res.status}`);
                      }

                    setMensagem({ tipo: "sucesso", texto: "Senha alterada com sucesso." });
                    setShowPwdModal(false);
                    setPwdForm({ novaSenha: "", confirmar: "" });
                  } catch (err) {
                    console.error(err);
                    setMensagem({ tipo: "erro", texto: err.message || "Erro ao alterar senha." });
                  }
                }}
              >
                <div className="modal-body">
                  <label>
                    Nova senha
                    <input name="novaSenha" type="password" value={pwdForm.novaSenha} onChange={(e) => setPwdForm(s => ({...s, novaSenha: e.target.value}))} />
                  </label>
                  <label>
                    Confirmar senha
                    <input name="confirmar" type="password" value={pwdForm.confirmar} onChange={(e) => setPwdForm(s => ({...s, confirmar: e.target.value}))} />
                  </label>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-sec" onClick={() => setShowPwdModal(false)}>Cancelar</button>
                  <button type="submit" className="btn-primary">Salvar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal para editar dados do usuário */}
        {showEditModal && selectedUser && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Editar usuário — {selectedUser.nome}</h3>
                <button className="btn-close" onClick={() => setShowEditModal(false)}>×</button>
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setMensagem(null);
                  if (!editForm.nome || !editForm.email) {
                    setMensagem({ tipo: "erro", texto: "Nome e e-mail são obrigatórios." });
                    return;
                  }

                  try {
                    const res = await fetch(`http://localhost:5000/usuarios/${selectedUser.id}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ nome: editForm.nome, email: editForm.email, funcao: editForm.funcao }),
                    });

                    const ct = res.headers.get("content-type") || "";
                    if (!res.ok) {
                      const payload = ct.includes("application/json") ? await res.json() : await res.text();
                      const payloadStr = typeof payload === "object" ? JSON.stringify(payload) : String(payload);
                      throw new Error(payloadStr || `HTTP ${res.status}`);
                    }

                    const updated = ct.includes("application/json") ? await res.json() : null;
                    setUsuarios((list) => list.map(u => u.id === updated.id ? updated : u));
                    setMensagem({ tipo: "sucesso", texto: "Usuário atualizado." });
                    setShowEditModal(false);
                  } catch (err) {
                    console.error("Erro ao atualizar usuário:", err);
                    setMensagem({ tipo: "erro", texto: err.message || "Erro ao atualizar usuário." });
                  }
                }}
              >
                <div className="modal-body">
                  <label>
                    Nome
                    <input name="nome" value={editForm.nome} onChange={(e) => setEditForm(s => ({...s, nome: e.target.value}))} />
                  </label>
                  <label>
                    E-mail
                    <input name="email" type="email" value={editForm.email} onChange={(e) => setEditForm(s => ({...s, email: e.target.value}))} />
                  </label>
                  <label>
                    Função
                    <select name="funcao" value={editForm.funcao} onChange={(e) => setEditForm(s => ({...s, funcao: e.target.value}))}>
                      <option value="vendedor">Vendedor</option>
                      <option value="gerente">Gerente</option>
                    </select>
                  </label>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-sec" onClick={() => setShowEditModal(false)}>Cancelar</button>
                  <button type="submit" className="btn-primary">Salvar</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
