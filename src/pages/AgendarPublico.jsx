import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { CalendarCheck, Clock, Check } from "lucide-react";
import { supabase } from "../lib/supabase";

const BRL = (v) =>
  (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const ymd = (d) => {
  const z = new Date(d);
  return `${z.getFullYear()}-${String(z.getMonth() + 1).padStart(2, "0")}-${String(z.getDate()).padStart(2, "0")}`;
};

const HORA_INICIO = 9;
const HORA_FIM = 18;
const PASSO = 30; // minutos

function gerarSlots(dataStr, durMin, ocupados) {
  const slots = [];
  const agora = new Date();
  for (let m = HORA_INICIO * 60; m + durMin <= HORA_FIM * 60; m += PASSO) {
    const h = Math.floor(m / 60);
    const mi = m % 60;
    const hh = String(h).padStart(2, "0");
    const mm = String(mi).padStart(2, "0");
    const inicio = new Date(`${dataStr}T${hh}:${mm}:00`);
    const fim = new Date(inicio.getTime() + durMin * 60000);
    if (inicio < agora) continue;
    const choca = ocupados.some(
      (o) => inicio < new Date(o.fim) && fim > new Date(o.inicio)
    );
    if (!choca) slots.push(`${hh}:${mm}`);
  }
  return slots;
}

export default function AgendarPublico() {
  const { slug } = useParams();
  const [info, setInfo] = useState(undefined); // undefined=carregando, null=não encontrado
  const [servicoId, setServicoId] = useState("");
  const [data, setData] = useState(ymd(new Date()));
  const [ocupados, setOcupados] = useState([]);
  const [hora, setHora] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    supabase.rpc("agendamento_publico_info", { p_slug: slug }).then(({ data }) => {
      if (!data || !data.negocio) setInfo(null);
      else setInfo(data);
    });
  }, [slug]);

  const servico = useMemo(
    () => info?.servicos?.find((s) => s.id === servicoId),
    [info, servicoId]
  );

  // recarrega horários ocupados quando muda serviço/data
  useEffect(() => {
    setHora("");
    if (!servicoId) return;
    supabase
      .rpc("agendamento_publico_ocupados", { p_slug: slug, p_data: data })
      .then(({ data: occ }) => setOcupados(occ || []));
  }, [slug, servicoId, data]);

  const slots = useMemo(
    () => (servico ? gerarSlots(data, servico.duracao_min, ocupados) : []),
    [servico, data, ocupados]
  );

  async function confirmar() {
    setErro("");
    if (!servicoId || !hora) { setErro("Escolha o serviço e o horário."); return; }
    if (!nome.trim()) { setErro("Informe seu nome."); return; }

    const inicio = new Date(`${data}T${hora}:00`).toISOString();
    setEnviando(true);
    const { data: res } = await supabase.rpc("agendamento_publico_criar", {
      p_slug: slug,
      p_servico_id: servicoId,
      p_inicio: inicio,
      p_cliente_nome: nome.trim(),
      p_cliente_telefone: telefone.trim(),
    });
    setEnviando(false);

    if (res?.ok) setSucesso(true);
    else setErro(res?.erro || "Não foi possível agendar. Tente outro horário.");
  }

  if (info === undefined) {
    return <div className="auth"><div className="loading">Carregando…</div></div>;
  }
  if (info === null) {
    return (
      <div className="auth">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <h1>Página não encontrada</h1>
          <p className="sub">Confira o link de agendamento com o estabelecimento.</p>
        </div>
      </div>
    );
  }

  if (sucesso) {
    return (
      <div className="auth">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <div className="brand-mark" style={{ margin: "0 auto 16px", background: "var(--teal)" }}>
            <Check size={20} />
          </div>
          <h1>Agendamento enviado!</h1>
          <p className="sub">
            {info.negocio.nome} recebeu seu pedido para {new Date(`${data}T${hora}`).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}.
            Você receberá a confirmação em breve.
          </p>
          <button className="btn btn-ghost" style={{ width: "100%" }} onClick={() => { setSucesso(false); setHora(""); }}>
            Fazer outro agendamento
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth" style={{ alignItems: "flex-start", paddingTop: 40 }}>
      <div className="auth-card" style={{ maxWidth: 460 }}>
        <div className="auth-brand" style={{ marginBottom: 8 }}>
          <span className="brand-mark">A</span>
          <b>{info.negocio.nome}</b>
        </div>
        <p className="sub" style={{ marginBottom: 22 }}>Agende seu horário online.</p>

        {erro && <div className="auth-err">{erro}</div>}

        <div className="field">
          <label><CalendarCheck size={14} style={{ verticalAlign: "-2px", marginRight: 4 }} /> Serviço</label>
          <select className="input" value={servicoId} onChange={(e) => setServicoId(e.target.value)}>
            <option value="">Selecione o serviço…</option>
            {info.servicos.map((s) => (
              <option key={s.id} value={s.id}>{s.nome} — {BRL(s.preco)} · {s.duracao_min}min</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Data</label>
          <input className="input" type="date" value={data} min={ymd(new Date())}
            onChange={(e) => setData(e.target.value)} />
        </div>

        {servicoId && (
          <div className="field">
            <label><Clock size={14} style={{ verticalAlign: "-2px", marginRight: 4 }} /> Horário</label>
            {slots.length === 0 ? (
              <p style={{ fontSize: 14, color: "var(--stone)" }}>Sem horários livres neste dia. Tente outra data.</p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {slots.map((h) => (
                  <button key={h} type="button"
                    className={"tab" + (hora === h ? " active" : "")}
                    onClick={() => setHora(h)}>{h}</button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="field">
          <label>Seu nome</label>
          <input className="input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" />
        </div>
        <div className="field">
          <label>WhatsApp</label>
          <input className="input" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(00) 00000-0000" />
        </div>

        <button className="btn btn-primary" style={{ width: "100%" }} onClick={confirmar} disabled={enviando}>
          {enviando ? "Enviando…" : "Confirmar agendamento"}
        </button>
      </div>
    </div>
  );
}
