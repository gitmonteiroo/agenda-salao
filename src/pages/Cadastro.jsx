import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [aguardandoEmail, setAguardandoEmail] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  async function cadastrar(e) {
    e.preventDefault();
    setErro("");
    if (senha.length < 6) {
      setErro("A senha precisa ter ao menos 6 caracteres.");
      return;
    }
    setCarregando(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { nome } }, // vira o nome do negócio (gatilho no banco)
    });
    setCarregando(false);

    if (error) {
      setErro(error.message);
      return;
    }
    if (data.session) {
      navigate("/app/agenda"); // confirmação de e-mail desativada → entra direto
    } else {
      setAguardandoEmail(true); // precisa confirmar o e-mail
    }
  }

  return (
    <div className="auth">
      <div className="auth-card">
        <Link to="/" className="auth-brand">
          <span className="brand-mark">A</span>
          <b>Agenda<span>Salão</span></b>
        </Link>

        {aguardandoEmail ? (
          <>
            <h1>Quase lá!</h1>
            <p className="sub">Enviamos um link de confirmação para o seu e-mail.</p>
            <div className="auth-ok">Confirme o cadastro pelo e-mail e depois faça login.</div>
            <p className="auth-foot"><Link to="/login">Ir para o login</Link></p>
          </>
        ) : (
          <>
            <h1>Criar conta</h1>
            <p className="sub">Comece seu teste grátis de 14 dias.</p>

            {erro && <div className="auth-err">{erro}</div>}

            <form onSubmit={cadastrar}>
              <div className="field">
                <label htmlFor="nome">Nome do seu salão / barbearia</label>
                <input id="nome" className="input" value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex.: Studio do Rafa" required />
              </div>
              <div className="field">
                <label htmlFor="email">E-mail</label>
                <input id="email" className="input" type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@salao.com.br" autoComplete="email" required />
              </div>
              <div className="field">
                <label htmlFor="senha">Senha</label>
                <input id="senha" className="input" type="password" value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="mínimo 6 caracteres" autoComplete="new-password" required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={carregando}>
                {carregando ? "Criando…" : "Criar conta grátis"}
              </button>
            </form>

            <p className="auth-foot">Já tem conta? <Link to="/login">Entrar</Link></p>
          </>
        )}
      </div>
    </div>
  );
}
