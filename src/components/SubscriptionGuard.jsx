import { Navigate } from "react-router-dom";
import { useSubscription } from "../hooks/useSubscription";

export default function SubscriptionGuard({ children }) {
  const { assinaturaAtiva, loading } = useSubscription();

  if (loading) return null;

  if (!assinaturaAtiva) {
    return <Navigate to="/assinar" replace />;
  }

  return children;
}
