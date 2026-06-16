import { useEffect, useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Perfil() {
  const [negocio, setNegocio] = useState(null);
  const [nome, setNome] = useState("");
  const [salvo, setSalvo] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    const { data } = await supabase
      .from("negocios")
      .select("id, nome, slug, plano")
      .limit(1)
      .maybeSingle();
    setNegocio(data);
    setNome(data?.nome || "");
  }

  useEffect(() => { carregar(); }, []);

  const link = negocio?.slug
    ? `${window.location.origin}/agendar/${negocio.slug}`
    : "";

  async function salvar(e) {
    e.preventDefault();
    if (!negocio) return;
    setSalvando(true);
    await supabase.from("negocios").update({ nome: nome.trim() }).eq("id", negocio.id);
    setSalvando(false);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
    carregar();
  }

  function copiar() {
    navigator.clipboard.writeText(link);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Perfil</h1>
          <p>Seus dados e o link de agendamento para divulgar.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-head"><h3>Seu link de agendamento</h3></div>
        <div style={{ padding: 20 }}>
          <p style={{ fontSize: 14, color: "var(--stone)", marginBottom: 12 }}>
            Coloque este link na bio do Instagram e no WhatsApp. Seus clientes marcam sozinhos.
          </p>
          {link ? (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <div className="search" style={{ flex: 1, minWidth: 220 }}>
                <input value={link} readOnly />
              </div>
              <button className="btn btn-primary" onClick={copiar}>
                {copiado ? <><Check size={16} /> Copiado</> : <><Copy size={16} /> Copiar</>}
              </button>
              <a className="btn btn-ghost" href={link} target="_blank" rel="noreferrer">
                <ExternalLink size={16} /> Abrir
              </a>
            </div>
          ) : (
            <p style={{ fontSize: 14, color: "var(--stone)" }}>Link sendo gerado…</p>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h3>Dados do negócio</h3></div>
        <form style={{ padding: 20 }} onSubmit={salvar}>
          <div className="field" style={{ maxWidth: 420 }}>
            <label>Nome do salão / barbearia</label>
            <input className="input" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="field" style={{ maxWidth: 420 }}>
            <label>Plano atual</label>
            <input className="input" value={negocio?.plano || "—"} readOnly />
          </div>
          <button className="btn btn-primary" disabled={salvando}>
            {salvando ? "Salvando…" : salvo ? "Salvo!" : "Salvar alterações"}
          </button>
        </form>
      </div>
    </>
  );
}
