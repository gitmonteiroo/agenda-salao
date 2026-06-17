import { useEffect, useState } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";

const BRL = (v) =>
  (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const VAZIO = { nome: "", duracao_min: "30", preco: "" };

export default function Servicos() {
  const [servicos, setServicos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState(VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  // modal de edição
  const [editando, setEditando] = useState(null);
  const [editForm, setEditForm] = useState(VAZIO);
  const [salvandoEdit, setSalvandoEdit] = useState(false);
  const [erroEdit, setErroEdit] = useState("");

  async function carregar() {
    setCarregando(true);
    const { data } = await supabase
      .from("servicos")
      .select("id, nome, duracao_min, preco, ativo")
      .order("nome", { ascending: true });
    setServicos(data || []);
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, []);

  async function adicionar(e) {
    e.preventDefault();
    if (!form.nome.trim()) return;
    setErro("");
    setSalvando(true);
    const { data: neg, error: negErr } = await supabase
      .from("negocios").select("id").limit(1).maybeSingle();
    if (!neg) {
      setErro(negErr ? negErr.message : "Negócio não encontrado. Verifique seu cadastro.");
      setSalvando(false);
      return;
    }
    const { error } = await supabase.from("servicos").insert({
      negocio_id: neg.id,
      nome: form.nome.trim(),
      duracao_min: parseInt(form.duracao_min) || 30,
      preco: parseFloat(String(form.preco).replace(",", ".")) || 0,
    });
    if (error) { setErro("Erro ao salvar: " + error.message); }
    else { setForm(VAZIO); carregar(); }
    setSalvando(false);
  }

  function abrirEdicao(s) {
    setEditando(s);
    setEditForm({
      nome: s.nome || "",
      duracao_min: String(s.duracao_min || 30),
      preco: String(s.preco || ""),
    });
    setErroEdit("");
  }

  async function salvarEdicao(e) {
    e.preventDefault();
    if (!editForm.nome.trim()) return;
    setErroEdit("");
    setSalvandoEdit(true);
    const { error } = await supabase.from("servicos").update({
      nome: editForm.nome.trim(),
      duracao_min: parseInt(editForm.duracao_min) || 30,
      preco: parseFloat(String(editForm.preco).replace(",", ".")) || 0,
    }).eq("id", editando.id);
    if (error) { setErroEdit("Erro ao salvar: " + error.message); }
    else { setEditando(null); carregar(); }
    setSalvandoEdit(false);
  }

  async function excluir() {
    if (!window.confirm(`Excluir "${editando.nome}"?`)) return;
    await supabase.from("servicos").delete().eq("id", editando.id);
    setEditando(null);
    carregar();
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Serviços</h1>
          <p>O que você oferece, com preço e duração.</p>
        </div>
      </div>

      {erro && <div className="auth-err" style={{ marginBottom: 14 }}>{erro}</div>}

      <form className="inline-form" onSubmit={adicionar}>
        <div className="field" style={{ margin: 0 }}>
          <label>Serviço</label>
          <input className="input" value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            placeholder="Ex.: Manicure" required />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label>Duração (min)</label>
          <input className="input" type="number" min="5" value={form.duracao_min}
            onChange={(e) => setForm({ ...form, duracao_min: e.target.value })} />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label>Preço (R$)</label>
          <input className="input" value={form.preco}
            onChange={(e) => setForm({ ...form, preco: e.target.value })}
            placeholder="0,00" />
        </div>
        <button className="btn btn-primary" disabled={salvando}>
          <Plus size={16} /> {salvando ? "Salvando…" : "Adicionar"}
        </button>
      </form>

      <div className="card">
        {carregando ? (
          <div className="loading">Carregando…</div>
        ) : servicos.length === 0 ? (
          <div className="empty">Nenhum serviço cadastrado ainda.</div>
        ) : (
          <table className="tbl">
            <thead>
              <tr><th>Serviço</th><th>Duração</th><th>Preço</th></tr>
            </thead>
            <tbody>
              {servicos.map((s) => (
                <tr key={s.id} onClick={() => abrirEdicao(s)}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#F2F4F3"}
                  onMouseLeave={e => e.currentTarget.style.background = ""}>
                  <td style={{ fontWeight: 600 }}>{s.nome}</td>
                  <td>{s.duracao_min} min</td>
                  <td>{BRL(s.preco)}</td>
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
              <h3>Editar serviço</h3>
              <button onClick={() => setEditando(null)} style={{ background: "none", border: "none", padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            {erroEdit && <div className="auth-err" style={{ marginBottom: 14 }}>{erroEdit}</div>}

            <form onSubmit={salvarEdicao}>
              <div className="field">
                <label>Nome do serviço</label>
                <input className="input" value={editForm.nome}
                  onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                  placeholder="Ex.: Manicure" required />
              </div>
              <div className="field">
                <label>Duração (min)</label>
                <input className="input" type="number" min="5" value={editForm.duracao_min}
                  onChange={(e) => setEditForm({ ...editForm, duracao_min: e.target.value })} />
              </div>
              <div className="field">
                <label>Preço (R$)</label>
                <input className="input" value={editForm.preco}
                  onChange={(e) => setEditForm({ ...editForm, preco: e.target.value })}
                  placeholder="0,00" />
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
