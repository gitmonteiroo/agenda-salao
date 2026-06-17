import { useEffect, useRef, useState } from "react";
import { Plus, X, Trash2, ImagePlus } from "lucide-react";
import { supabase } from "../lib/supabase";

const BRL = (v) =>
  (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const VAZIO = { nome: "", duracao_min: "30", preco: "" };

async function uploadFoto(file, servicoId) {
  const ext = file.name.split(".").pop().toLowerCase();
  const path = `${servicoId}.${ext}`;
  await supabase.storage.from("servicos-fotos").upload(path, file, { upsert: true });
  const { data: { publicUrl } } = supabase.storage.from("servicos-fotos").getPublicUrl(path);
  return publicUrl;
}

export default function Servicos() {
  const [servicos, setServicos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState(VAZIO);
  const [imagemFile, setImagemFile] = useState(null);
  const [imagemPreview, setImagemPreview] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const inputFotoRef = useRef();

  const [editando, setEditando] = useState(null);
  const [editForm, setEditForm] = useState(VAZIO);
  const [editImagemFile, setEditImagemFile] = useState(null);
  const [editImagemPreview, setEditImagemPreview] = useState(null);
  const [salvandoEdit, setSalvandoEdit] = useState(false);
  const [erroEdit, setErroEdit] = useState("");
  const inputFotoEditRef = useRef();

  async function carregar() {
    setCarregando(true);
    const { data } = await supabase
      .from("servicos")
      .select("id, nome, duracao_min, preco, ativo, imagem_url")
      .order("nome", { ascending: true });
    setServicos(data || []);
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, []);

  function selecionarFoto(file, setFile, setPreview) {
    if (!file) return;
    setFile(file);
    setPreview(URL.createObjectURL(file));
  }

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

    const { data: inserted, error } = await supabase.from("servicos").insert({
      negocio_id: neg.id,
      nome: form.nome.trim(),
      duracao_min: parseInt(form.duracao_min) || 30,
      preco: parseFloat(String(form.preco).replace(",", ".")) || 0,
    }).select("id").single();

    if (error || !inserted) {
      setErro("Erro ao salvar: " + (error?.message || "tente de novo."));
      setSalvando(false);
      return;
    }

    if (imagemFile) {
      const url = await uploadFoto(imagemFile, inserted.id);
      await supabase.from("servicos").update({ imagem_url: url }).eq("id", inserted.id);
    }

    setForm(VAZIO);
    setImagemFile(null);
    setImagemPreview(null);
    if (inputFotoRef.current) inputFotoRef.current.value = "";
    setSalvando(false);
    carregar();
  }

  function abrirEdicao(s) {
    setEditando(s);
    setEditForm({
      nome: s.nome || "",
      duracao_min: String(s.duracao_min || 30),
      preco: String(s.preco || ""),
    });
    setEditImagemFile(null);
    setEditImagemPreview(s.imagem_url || null);
    setErroEdit("");
  }

  async function salvarEdicao(e) {
    e.preventDefault();
    if (!editForm.nome.trim()) return;
    setErroEdit("");
    setSalvandoEdit(true);

    let imagem_url = editando.imagem_url;
    if (editImagemFile) {
      imagem_url = await uploadFoto(editImagemFile, editando.id);
    }

    const { error } = await supabase.from("servicos").update({
      nome: editForm.nome.trim(),
      duracao_min: parseInt(editForm.duracao_min) || 30,
      preco: parseFloat(String(editForm.preco).replace(",", ".")) || 0,
      imagem_url,
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

      <form className="inline-form" onSubmit={adicionar}
        style={{ gridTemplateColumns: "1fr 1fr 1fr auto auto", alignItems: "end" }}>
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
        <div className="field" style={{ margin: 0 }}>
          <label>Foto</label>
          <div className="img-upload-wrap">
            {imagemPreview
              ? <img src={imagemPreview} className="img-preview" alt="" />
              : <div className="img-preview-ph">📷</div>}
            <label className="img-upload-btn">
              <ImagePlus size={14} style={{ marginRight: 4, verticalAlign: "-2px" }} />
              {imagemFile ? "Trocar" : "Foto"}
              <input ref={inputFotoRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={(e) => selecionarFoto(e.target.files[0], setImagemFile, setImagemPreview)} />
            </label>
          </div>
        </div>
        <button className="btn btn-primary" disabled={salvando} style={{ marginBottom: 0 }}>
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
              <tr><th></th><th>Serviço</th><th>Duração</th><th>Preço</th></tr>
            </thead>
            <tbody>
              {servicos.map((s) => (
                <tr key={s.id} onClick={() => abrirEdicao(s)}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#F2F4F3"}
                  onMouseLeave={e => e.currentTarget.style.background = ""}>
                  <td style={{ width: 56, paddingRight: 0 }}>
                    {s.imagem_url
                      ? <img src={s.imagem_url} className="srv-thumb" alt={s.nome} />
                      : <div className="srv-thumb-ph">📷</div>}
                  </td>
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
                <label>Foto do serviço</label>
                <div className="img-upload-wrap">
                  {editImagemPreview
                    ? <img src={editImagemPreview} className="img-preview" alt="" />
                    : <div className="img-preview-ph">📷</div>}
                  <label className="img-upload-btn">
                    <ImagePlus size={14} style={{ marginRight: 4, verticalAlign: "-2px" }} />
                    {editImagemFile ? "Trocar foto" : "Escolher foto"}
                    <input ref={inputFotoEditRef} type="file" accept="image/*" style={{ display: "none" }}
                      onChange={(e) => selecionarFoto(e.target.files[0], setEditImagemFile, setEditImagemPreview)} />
                  </label>
                </div>
              </div>
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
                <button type="button" className="btn btn-ghost" style={{ color: "var(--red)" }} onClick={excluir}>
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
