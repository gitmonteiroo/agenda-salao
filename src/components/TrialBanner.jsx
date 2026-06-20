import { useNavigate } from "react-router-dom";
import { useSubscription } from "../hooks/useSubscription";

export default function TrialBanner() {
  const { status, diasRestantesTrial } = useSubscription();
  const navigate = useNavigate();

  if (status !== "trial") return null;

  const urgente = diasRestantesTrial <= 2;

  const bannerStyle = {
    width: "100%",
    padding: "8px 16px",
    textAlign: "center",
    fontSize: "13px",
    fontWeight: 500,
    background: urgente ? "#ef4444" : "#f59e0b",
    color: urgente ? "#fff" : "#78350f",
    boxSizing: "border-box",
  };

  const btnStyle = {
    background: "none",
    border: "none",
    textDecoration: "underline",
    fontWeight: "bold",
    cursor: "pointer",
    color: "inherit",
    fontSize: "inherit",
    padding: 0,
  };

  return (
    <div style={bannerStyle}>
      {diasRestantesTrial > 0 ? (
        <>
          ⏳ Período de teste:{" "}
          <strong>
            {diasRestantesTrial} dia{diasRestantesTrial !== 1 ? "s" : ""}
          </strong>{" "}
          restante{diasRestantesTrial !== 1 ? "s" : ""}.{" "}
          <button style={btnStyle} onClick={() => navigate("/assinar")}>
            Assinar agora — R$ 49,90/mês
          </button>
        </>
      ) : (
        <>
          🔒 Período de teste encerrado.{" "}
          <button style={btnStyle} onClick={() => navigate("/assinar")}>
            Assine para continuar
          </button>
        </>
      )}
    </div>
  );
            }
