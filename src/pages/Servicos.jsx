import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "../lib/supabase";

const BRL = (v) =>
  (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Servicos() {
  const [servicos, setServicos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState({ nome: "", duracao_min: "30", preco: "" });
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    setCarregando(true);
    const { data } = await supabase
      .from("servicos")
      .select("id, nome, duracao_min, preco, ativo")
      .order("nome", { ascending: true });
    setServicos(data || []);
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function adicionar(e) {
    e.preventDefault();
    if (!form.nome.trim()) return;
    setSalvando(true);
    const { data: neg } = await supabase.from("negocios").select("id").limit(1).maybeSingle();
    if (neg) {
      await supabase.from("servicos").insert({
        negocio_id: neg.id,
        nome: form.nome.trim(),
        duracao_min: parseInt(form.duracao_min) || 30,
        preco: parseFloat(String(form.preco).replace(",", ".")) || 0,
      });
    }
    setForm({ nome: "", duracao_min: "30", preco: "" });
    setSalvando(false);
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

      <form className="inline-form" onSubmit={adicionar}>
        <div className="field" style={{ margin: 0 }}>
          <label>Serviço</label>
          <input className="input" value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            placeholder="Ex.: Corte masculino" />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label>Duração (min)</label>
          <input className="input" type="number" value={form.duracao_min}
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
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.nome}</td>
                  <td>{s.duracao_min} min</td>
                  <td>{BRL(s.preco)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
