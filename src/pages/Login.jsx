import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  async function entrar(e) {
    e?.preventDefault();
    setErro("");
    setCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });
    setCarregando(false);
    if (error) {
      setErro("E-mail ou senha incorretos.");
      return;
    }
    navigate("/app/agenda");
  }

  async function entrarComoDemo() {
    setErro("");
    setCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: "demo@agendasalao.com.br",
      password: "demo123",
    });
    setCarregando(false);
    if (error) {
      setErro("Demonstração indisponível no momento.");
      return;
    }
    navigate("/app/agenda");
  }

  return (
    <div className="auth">
      <div className="auth-card">
        <Link to="/" className="auth-brand">
          <span className="brand-mark">A</span>
          <b>Agend<span>i</span></b>
        </Link>

        <h1>Entrar na conta</h1>
        <p className="sub">Acesse sua agenda e gerencie tudo num lugar só.</p>

        {erro && <div className="auth-err">{erro}</div>}

        <form onSubmit={entrar}>
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input
              id="email" className="input" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@salao.com.br" autoComplete="email" required
            />
          </div>
          <div className="field">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha" className="input" type="password" value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••" autoComplete="current-password" required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={carregando}>
            {carregando ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <div className="auth-divider">ou</div>

        <button className="btn btn-ghost" style={{ width: "100%" }} onClick={entrarComoDemo} disabled={carregando}>
          Entrar como demonstração
        </button>
        <p className="demo-hint">Veja o sistema funcionando com dados de exemplo, sem cadastro.</p>

        <p className="auth-foot">Ainda não tem conta? <Link to="/cadastro">Criar conta grátis</Link></p>
      </div>
    </div>
  );
}
