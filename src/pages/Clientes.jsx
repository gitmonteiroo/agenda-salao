import { useEffect, useState } from "react";
import { Search, Plus, X, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";

const VAZIO = { nome: "", telefone: "", aniversario: "" };

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState(VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  // modal de edição
  const [editando, setEditando] = useState(null); // objeto cliente ou null
  const [editForm, setEditForm] = useState(VAZIO);
  const [salvandoEdit, setSalvandoEdit] = useState(false);
  const [erroEdit, setErroEdit] = useState("");

  async function carregar() {
    setCarregando(true);
    const { data } = await supabase
      .from("clientes")
      .select("id, nome, telefone, aniversario")
      .order("nome", { ascending: true });
    setClientes(data || []);
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, []);

  async function adicionar(e) {
    e.preventDefault();
    if (!form.nome.trim()) return;
    setErro("");
    setSalvando(true);
    const { data: neg } = await supabase.from("negocios").select("id").limit(1).maybeSingle();
    if (!neg) {
      setErro("Negócio não encontrado. Verifique seu cadastro.");
      setSalvando(false);
      return;
    }
    const { error } = await supabase.from("clientes").insert({
      negocio_id: neg.id,
      nome: form.nome.trim(),
      telefone: form.telefone.trim() || null,
      aniversario: form.aniversario || null,
    });
    if (error) { setErro("Erro ao salvar: " + error.message); }
    else { setForm(VAZIO); carregar(); }
    setSalvando(false);
  }

  function abrirEdicao(c) {
    setEditando(c);
    setEditForm({
      nome: c.nome || "",
      telefone: c.telefone || "",
      aniversario: c.aniversario ? c.aniversario.substring(0, 10) : "",
    });
    setErroEdit("");
  }

  async function salvarEdicao(e) {
    e.preventDefault();
    if (!editForm.nome.trim()) return;
    setErroEdit("");
    setSalvandoEdit(true);
    const { error } = await supabase.from("clientes").update({
      nome: editForm.nome.trim(),
      telefone: editForm.telefone.trim() || null,
      aniversario: editForm.aniversario || null,
    }).eq("id", editando.id);
    if (error) { setErroEdit("Erro ao salvar: " + error.message); }
    else { setEditando(null); carregar(); }
    setSalvandoEdit(false);
  }

  async function excluir() {
    if (!window.confirm(`Excluir "${editando.nome}"?`)) return;
    await supabase.from("clientes").delete().eq("id", editando.id);
    setEditando(null);
    carregar();
  }

  const filtrados = clientes.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Clientes</h1>
          <p>Cadastre e encontre seus clientes.</p>
        </div>
      </div>

      {erro && <div className="auth-err" style={{ marginBottom: 14 }}>{erro}</div>}

      <form className="inline-form" onSubmit={adicionar}>
        <div className="field" style={{ margin: 0 }}>
          <label>Nome</label>
          <input className="input" value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            placeholder="Nome do cliente" />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label>Telefone</label>
          <input className="input" value={form.telefone}
            onChange={(e) => setForm({ ...form, telefone: e.target.value })}
            placeholder="(00) 00000-0000" />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label>Aniversário</label>
          <input className="input" type="date" value={form.aniversario}
            onChange={(e) => setForm({ ...form, aniversario: e.target.value })} />
        </div>
        <button className="btn btn-primary" disabled={salvando}>
          <Plus size={16} /> {salvando ? "Salvando…" : "Adicionar"}
        </button>
      </form>

      <div className="toolbar">
        <div className="search">
          <Search size={18} />
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar cliente…" />
        </div>
      </div>

      <div className="card">
        {carregando ? (
          <div className="loading">Carregando…</div>
        ) : filtrados.length === 0 ? (
          <div className="empty">Nenhum cliente encontrado.</div>
        ) : (
          <table className="tbl">
            <thead>
              <tr><th>Nome</th><th>Telefone</th><th>Aniversário</th></tr>
            </thead>
            <tbody>
              {filtrados.map((c) => (
                <tr key={c.id} onClick={() => abrirEdicao(c)}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#F2F4F3"}
                  onMouseLeave={e => e.currentTarget.style.background = ""}>
                  <td style={{ fontWeight: 600 }}>{c.nome}</td>
                  <td>{c.telefone || "—"}</td>
                  <td>{c.aniversario ? new Date(c.aniversario + "T12:00:00").toLocaleDateString("pt-BR") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editando && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditando(null)}>
          <div className="modal">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <h3>Editar cliente</h3>
              <button onClick={() => setEditando(null)} style={{ background: "none", border: "none", padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            {erroEdit && <div className="auth-err" style={{ marginBottom: 14 }}>{erroEdit}</div>}

            <form onSubmit={salvarEdicao}>
              <div className="field">
                <label>Nome</label>
                <input className="input" value={editForm.nome}
                  onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                  placeholder="Nome do cliente" required />
              </div>
              <div className="field">
                <label>Telefone</label>
                <input className="input" value={editForm.telefone}
                  onChange={(e) => setEditForm({ ...editForm, telefone: e.target.value })}
                  placeholder="(00) 00000-0000" />
              </div>
              <div className="field">
                <label>Aniversário</label>
                <input className="input" type="date" value={editForm.aniversario}
                  onChange={(e) => setEditForm({ ...editForm, aniversario: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" style={{ color: "var(--red)" }}
                  onClick={excluir}>
                  <Trash2 size={15} /> Excluir
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditando(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={salvandoEdit}>
                  {salvandoEdit ? "Salvando…" : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
