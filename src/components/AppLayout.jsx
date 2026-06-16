import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { CalendarDays, Users, Scissors, Wallet, Settings, LogOut } from "lucide-react";
import { supabase } from "../lib/supabase";

const NAV = [
  { to: "/app/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/app/clientes", label: "Clientes", icon: Users },
  { to: "/app/servicos", label: "Serviços", icon: Scissors },
  { to: "/app/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/app/perfil", label: "Perfil", icon: Settings },
];

export default function AppLayout() {
  const [negocio, setNegocio] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase
      .from("negocios")
      .select("nome")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setNegocio(data));
  }, []);

  async function sair() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <div className="shell">
      <aside className="side">
        <div className="side-brand">
          <span className="brand-mark sm">A</span>
          <span>Agenda<b>Salão</b></span>
        </div>
        <nav className="side-nav">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) => "side-link" + (isActive ? " active" : "")}
            >
              <n.icon size={18} />
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <button className="side-out" onClick={sair}>
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </aside>

      <main className="main">
        <header className="topbar">
          <span className="topbar-neg">{negocio?.nome || "Carregando…"}</span>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
