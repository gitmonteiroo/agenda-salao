import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Wallet, Users, Check, Plus, X } from "lucide-react";
import { supabase } from "../lib/supabase";

const BRL = (v) =>
  (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const ymd = (d) => {
  const z = new Date(d);
  return `${z.getFullYear()}-${String(z.getMonth() + 1).padStart(2, "0")}-${String(z.getDate()).padStart(2, "0")}`;
};
const horaDe = (iso) =>
  new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

const STATUS_LABEL = {
  confirmado: "Confirmado", pendente: "Pendente",
  concluido: "Concluído", cancelado: "Cancelado",
};

export default function Agenda() {
  const [ags, setAgs] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [negocioId, setNegocioId] = useState(null);
  const [totalClientes, setTotalClientes] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [aba, setAba] = useState("hoje");
  const [modal, setModal] = useState(false);

  async function carregar() {
    setCarregando(true);
    const { data: neg } = await supabase.from("negocios").select("id").limit(1).maybeSingle();
    setNegocioId(neg?.id || null);

    const { data } = await supabase
      .from("agendamentos")
      .select("id, inicio, fim, status, valor, clientes(nome), servicos(nome)")
      .order("inicio", { ascending: true });
    setAgs(data || []);

    const [{ data: cli }, { data: srv }, { count }] = await Promise.all([
      supabase.from("clientes").select("id, nome").order("nome"),
      supabase.from("servicos").select("id, nome, preco, duracao_min").eq("ativo", true).order("nome"),
      supabase.from("clientes").select("*", { count: "exact", head: true }),
    ]);
    setClientes(cli || []);
    setServicos(srv || []);
    setTotalClientes(count || 0);
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, []);

  const hojeStr = ymd(new Date());
  const amanhaStr = ymd(new Date(Date.now() + 86400000));

  const kpis = useMemo(() => {
    const agendamentosHoje = ags.filter((a) => ymd(a.inicio) === hojeStr).length;
    const mes = new Date().getMonth();
    const ano = new Date().getFullYear();
    const faturamentoMes = ags
      .filter((a) => {
        const d = new Date(a.inicio);
        return a.status === "concluido" && d.getMonth() === mes && d.getFullYear() === ano;
      })
      .reduce((s, a) => s + (Number(a.valor) || 0), 0);
    return { agendamentosHoje, faturamentoMes };
  }, [ags, hojeStr]);

  const diaSelecionado = aba === "hoje" ? hojeStr : amanhaStr;
  const lista = ags.filter((a) => ymd(a.inicio) === diaSelecionado);

  async function concluir(id) {
    await supabase.from("agendamentos").update({ status: "concluido" }).eq("id", id);
    carregar();
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Agenda</h1>
          <p>Seus horários e o resumo do dia.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          <Plus size={16} /> Novo agendamento
        </button>
      </div>

      <div className="kpis">
        <div className="kpi">
          <span className="kpi-label"><CalendarDays size={16} /> Agendamentos hoje</span>
          <div className="kpi-value">{kpis.agendamentosHoje}</div>
        </div>
        <div className="kpi">
          <span className="kpi-label"><Wallet size={16} /> Faturamento do mês</span>
          <div className="kpi-value">{BRL(kpis.faturamentoMes)}</div>
        </div>
        <div className="kpi">
          <span className="kpi-label"><Users size={16} /> Clientes cadastrados</span>
          <div className="kpi-value">{totalClientes}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3>Horários</h3>
          <div className="tabs">
            <button className={"tab" + (aba === "hoje" ? " active" : "")} onClick={() => setAba("hoje")}>Hoje</button>
            <button className={"tab" + (aba === "amanha" ? " active" : "")} onClick={() => setAba("amanha")}>Amanhã</button>
          </div>
        </div>

        {carregando ? (
          <div className="loading">Carregando…</div>
        ) : lista.length === 0 ? (
          <div className="empty">Nenhum horário marcado para este dia.</div>
        ) : (
          lista.map((a) => (
            <div className="row" key={a.id}>
              <span className="row-time">{horaDe(a.inicio)}</span>
              <div className="row-main">
                <div className="row-title">{a.servicos?.nome || "Serviço"}</div>
                <div className="row-sub">{a.clientes?.nome || "Cliente"}</div>
              </div>
              <span className="row-val">{BRL(a.valor)}</span>
              <span className={`badge badge-${a.status}`}>{STATUS_LABEL[a.status] || a.status}</span>
              {a.status !== "concluido" && a.status !== "cancelado" && (
                <button className="btn btn-ghost" style={{ padding: "8px 12px" }} onClick={() => concluir(a.id)}>
                  <Check size={15} /> Concluir
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {modal && (
        <ModalNovo
          clientes={clientes}
          servicos={servicos}
          negocioId={negocioId}
          onClose={() => setModal(false)}
          onSalvo={() => { setModal(false); carregar(); }}
        />
      )}
    </>
  );
}

function ModalNovo({ clientes, servicos, negocioId, onClose, onSalvo }) {
  const [clienteId, setClienteId] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [data, setData] = useState(ymd(new Date()));
  const [hora, setHora] = useState("09:00");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function salvar(e) {
    e.preventDefault();
    setErro("");
    if (!clienteId || !servicoId) {
      setErro("Escolha o cliente e o serviço.");
      return;
    }
    const servico = servicos.find((s) => s.id === servicoId);
    const inicio = new Date(`${data}T${hora}:00`);
    const fim = new Date(inicio.getTime() + (servico?.duracao_min || 30) * 60000);

    setSalvando(true);
    const { error } = await supabase.from("agendamentos").insert({
      negocio_id: negocioId,
      cliente_id: clienteId,
      servico_id: servicoId,
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
      status: "confirmado",
      valor: servico?.preco ?? null,
    });
    setSalvando(false);
    if (error) { setErro("Não foi possível salvar. Tente de novo."); return; }
    onSalvo();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3>Novo agendamento</h3>
          <button className="btn btn-ghost" style={{ padding: 8 }} onClick={onClose}><X size={16} /></button>
        </div>

        {erro && <div className="auth-err">{erro}</div>}

        <form onSubmit={salvar}>
          <div className="field">
            <label>Cliente</label>
            <select className="input" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
              <option value="">Selecione…</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Serviço</label>
            <select className="input" value={servicoId} onChange={(e) => setServicoId(e.target.value)}>
              <option value="">Selecione…</option>
              {servicos.map((s) => (
                <option key={s.id} value={s.id}>{s.nome} — {BRL(s.preco)}</option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Data</label>
              <input className="input" type="date" value={data} onChange={(e) => setData(e.target.value)} />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Hora</label>
              <input className="input" type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={salvando}>
              {salvando ? "Salvando…" : "Agendar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
