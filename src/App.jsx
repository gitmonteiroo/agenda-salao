import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./lib/supabase";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import AppLayout from "./components/AppLayout";
import Agenda from "./pages/Agenda";
import Clientes from "./pages/Clientes";
import Servicos from "./pages/Servicos";
import Financeiro from "./pages/Financeiro";
import Perfil from "./pages/Perfil";
import AgendarPublico from "./pages/AgendarPublico";
import Assinar from "./pages/Assinar";
import SubscriptionGuard from "./components/SubscriptionGuard";

function useSession() {
  const [session, setSession] = useState(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);
  return session;
}

export default function App() {
  const session = useSession();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/agendar/:slug" element={<AgendarPublico />} />
      <Route
        path="/assinar"
        element={session ? <Assinar /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/login"
        element={session ? <Navigate to="/app/agenda" replace /> : <Login />}
      />
      <Route
        path="/cadastro"
        element={session ? <Navigate to="/app/agenda" replace /> : <Cadastro />}
      />
      <Route
        path="/app"
        element={
          session === undefined ? null
          : session ? (
            <SubscriptionGuard>
              <AppLayout />
            </SubscriptionGuard>
          )
          : <Navigate to="/login" replace />
        }
      >
        <Route index element={<Navigate to="agenda" replace />} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="servicos" element={<Servicos />} />
        <Route path="financeiro" element={<Financeiro />} />
        <Route path="perfil" element={<Perfil />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
                                          }
