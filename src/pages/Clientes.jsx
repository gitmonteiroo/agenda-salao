import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState({ nome: "", telefone: "" });
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    setCarregando(true);
    const { data } = await supabase
      .from("clientes")
      .select("id, nome, telefone, aniversario")
      .order("nome", { ascending: true });
    setClientes(data || []);
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function adicionar(e) {
    e.preventDefault();
    if (!form.nome.trim()) return;
    setSalvando(true);

    // descobre o negócio da conta logada (a RLS garante que é o seu)
    const { data: neg } = await supabase.from("negocios").select("id").limit(1).maybeSingle();
    if (neg) {
      await supabase.from("clientes").insert({
        negocio_id: neg.id,
        nome: form.nome.trim(),
        telefone: form.telefone.trim() || null,
      });
    }
    setForm({ nome: "", telefone: "" });
    setSalvando(false);
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
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.nome}</td>
                  <td>{c.telefone || "—"}</td>
                  <td>{c.aniversario ? new Date(c.aniversario).toLocaleDateString("pt-BR") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
