import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useSubscription() {
  const [info, setInfo] = useState({
    status: null,
    trialExpiresAt: null,
    diasRestantesTrial: 0,
    assinaturaAtiva: false,
    loading: true,
  });

  useEffect(() => {
    async function fetchSubscription() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setInfo((prev) => ({ ...prev, loading: false }));
        return;
      }
      const { data: negocio } = await supabase
        .from("negocios")
        .select("assinatura_status, trial_expires_at")
        .eq("owner_id", user.id)
        .single();
      if (!negocio) {
        setInfo((prev) => ({ ...prev, loading: false }));
        return;
      }
      const trialExpiresAt = negocio.trial_expires_at
        ? new Date(negocio.trial_expires_at)
        : null;
      const agora = new Date();
      const diasRestantesTrial = trialExpiresAt
        ? Math.max(0, Math.ceil((trialExpiresAt.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24)))
        : 0;
      const status = negocio.assinatura_status;
      const assinaturaAtiva =
        (status === "trial" && trialExpiresAt !== null && trialExpiresAt > agora) ||
        status === "ativa";
      setInfo({ status, trialExpiresAt, diasRestantesTrial, assinaturaAtiva, loading: false });
    }
    fetchSubscription();
  }, []);

  return info;
          }
