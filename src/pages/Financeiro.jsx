import { useEffect, useMemo, useState } from "react";
import { Wallet, Clock, TrendingUp } from "lucide-react";
import { supabase } from "../lib/supabase";

const BRL = (v) =>
  (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const dataDe = (iso) => new Date(iso).toLocaleDateString("pt-BR");

export default function Financeiro() {
  const [ags, setAgs] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("agendamentos")
        .select("id, inicio, status, valor, clientes(nome), servicos(nome)")
        .order("inicio", { ascending: false });
      setAgs(data || []);
      setCarregando(false);
    })();
  }, []);

  const resumo = useMemo(() => {
    const agora = new Date();
    const mes = agora.getMonth();
    const ano = agora.getFullYear();

    const concluidosMes = ags.filter((a) => {
      const d = new Date(a.inicio);
      return a.status === "concluido" && d.getMonth() === mes && d.getFullYear() === ano;
    });
    const recebido = concluidosMes.reduce((s, a) => s + (Number(a.valor) || 0), 0);

    const aReceber = ags
      .filter((a) => ["confirmado", "pendente"].includes(a.status) && new Date(a.inicio) >= agora)
      .reduce((s, a) => s + (Number(a.valor) || 0), 0);

    const ticket = concluidosMes.length ? recebido / concluidosMes.length : 0;

    return { recebido, aReceber, ticket };
  }, [ags]);

  const concluidos = ags.filter((a) => a.status === "concluido").slice(0, 12);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Financeiro</h1>
          <p>Quanto entrou, quanto falta receber e seu ticket médio.</p>
        </div>
      </div>

      <div className="kpis">
        <div className="kpi">
          <span className="kpi-label"><Wallet size={16} /> Recebido no mês</span>
          <div className="kpi-value">{BRL(resumo.recebido)}</div>
        </div>
        <div className="kpi">
          <span className="kpi-label"><Clock size={16} /> A receber</span>
          <div className="kpi-value">{BRL(resumo.aReceber)}</div>
        </div>
        <div className="kpi">
          <span className="kpi-label"><TrendingUp size={16} /> Ticket médio</span>
          <div className="kpi-value">{BRL(resumo.ticket)}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h3>Atendimentos concluídos</h3></div>
        {carregando ? (
          <div className="loading">Carregando…</div>
        ) : concluidos.length === 0 ? (
          <div className="empty">Nenhum atendimento concluído ainda.</div>
        ) : (
          <table className="tbl">
            <thead>
              <tr><th>Data</th><th>Cliente</th><th>Serviço</th><th>Valor</th></tr>
            </thead>
            <tbody>
              {concluidos.map((a) => (
                <tr key={a.id}>
                  <td>{dataDe(a.inicio)}</td>
                  <td style={{ fontWeight: 600 }}>{a.clientes?.nome || "—"}</td>
                  <td>{a.servicos?.nome || "—"}</td>
                  <td>{BRL(a.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
