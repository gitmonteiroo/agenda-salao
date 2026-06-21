import { useState } from "react";
import { supabase } from "../lib/supabase";

const SUPABASE_URL = "https://vaaprybybixusxpfvksg.supabase.co";

export default function Assinar() {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  async function handleAssinar() {
    setLoading(true);
    setErro(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Você precisa estar logado.");

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/mp-criar-assinatura`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({}),
        }
      );

      const text = await response.text();
      let data = {};
      try { data = JSON.parse(text); } catch { data = { error: "Resposta invalida: " + text.substring(0, 100) }; }

      if (!response.ok || !data.init_point) {
        throw new Error(data.error || JSON.stringify(data) || "Erro desconhecido");
      }
      window.location.href = data.init_point;
    } catch (err) {
      setErro(err.message || "Erro inesperado.");
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.10)", maxWidth: 420, width: "100%", padding: 40, textAlign: "center" }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 32, fontWeight: 700, color: "#7c3aed" }}>Agend<b>i</b></span>
        </div>
        <p style={{ color: "#6b7280", marginBottom: 32, fontSize: 15 }}>
          Sistema de agendamento para salões de beleza
        </p>
        <div style={{ border: "2px solid #7c3aed", borderRadius: 12, padding: 24, marginBottom: 24, textAlign: "left" }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Plano Profissional</p>
          <p style={{ fontSize: 36, fontWeight: 700, color: "#111", marginBottom: 4 }}>
            R$ 49,90<span style={{ fontSize: 16, fontWeight: 400, color: "#6b7280" }}>/mês</span>
          </p>
          <ul style={{ fontSize: 14, color: "#374151", marginTop: 12, paddingLeft: 0, listStyle: "none", lineHeight: 2 }}>
            <li>✅ Agendamentos ilimitados</li>
            <li>✅ Página pública de agendamento</li>
            <li>✅ Cadastro de clientes e serviços</li>
            <li>✅ Fotos nos serviços</li>
            <li>✅ Suporte via WhatsApp</li>
          </ul>
        </div>
        {erro && (
          <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 12, wordBreak: "break-word" }}>{erro}</p>
        )}
        <button
          onClick={handleAssinar}
          disabled={loading}
          style={{ width: "100%", background: loading ? "#a78bfa" : "#7c3aed", color: "#fff", fontWeight: 700, padding: "14px 24px", borderRadius: 12, border: "none", fontSize: 16, cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "Aguarde..." : "💳 Assinar com Mercado Pago"}
        </button>
        <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 16 }}>
          Pagamento 100% seguro via Mercado Pago. Cancele quando quiser.
        </p>
      </div>
    </div>
  );
}
