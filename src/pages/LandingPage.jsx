import { useState, useEffect, useRef } from "react";
import {
  CalendarCheck, BellRing, Wallet, UserRound, Clock, Smartphone,
  Check, ChevronDown, ArrowRight, MessageCircle, Instagram, Star,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Agendi — Landing page
// Ajuste antes do deploy:
//   WHATSAPP  → seu número com DDI (ex.: 5575999999999)
//   LOGIN_URL → rota da tela de login (padrão "/login")
//   DEMO_URL  → rota que faz login automático na conta demo
// ─────────────────────────────────────────────────────────────
const WHATSAPP = "5575992520543";
const LOGIN_URL = "/login";
const DEMO_URL = "/login";
const CADASTRO_URL = "/cadastro";
const WPP_MSG = encodeURIComponent(
  "Olá! Vi o Agendi e quero testar 7 dias grátis."
);
const wppLink = `https://wa.me/${WHATSAPP}?text=${WPP_MSG}`;

const PUBLICOS = [
  "Cabeleireiro", "Barbearia", "Estética", "Manicure",
  "Sobrancelha & Cílios", "Maquiagem",
];

const DORES = [
  {
    dor: "Cliente que some na hora do horário",
    fix: "Lembretes automáticos no WhatsApp um dia antes. Menos faltas, agenda cheia.",
  },
  {
    dor: "Agenda no caderno (ou na cabeça)",
    fix: "Tudo num lugar só, acessível do celular a qualquer hora, de onde você estiver.",
  },
  {
    dor: "Mês fechando sem saber quanto entrou",
    fix: "Você vê o que recebeu, o que falta receber e quanto faturou — sem planilha.",
  },
];

const FEATURES = [
  { icon: CalendarCheck, t: "Agendamento online", d: "Seu link na bio. O cliente escolhe o horário sozinho, sem trocar dez mensagens." },
  { icon: BellRing, t: "Lembretes automáticos", d: "Confirmação e lembrete por WhatsApp. Cada falta a menos é dinheiro no seu caixa." },
  { icon: UserRound, t: "Ficha do cliente", d: "Histórico, serviços preferidos e aniversário. Atendimento que faz ele voltar." },
  { icon: Wallet, t: "Controle financeiro", d: "Quanto entrou, quanto falta receber e seu faturamento do mês, sempre à mão." },
  { icon: Clock, t: "Serviços e horários", d: "Preço e duração de cada serviço. Sua agenda só abre nos horários que você quer." },
  { icon: Smartphone, t: "De qualquer lugar", d: "Funciona no celular, tablet ou computador. Nada para instalar, nada para baixar." },
];

const PASSOS = [
  { n: "01", t: "Crie sua conta", d: "Cadastre seus serviços, preços e os horários que você atende." },
  { n: "02", t: "Compartilhe seu link", d: "Coloque na bio do Instagram e mande no WhatsApp dos clientes." },
  { n: "03", t: "Receba e confirme", d: "As marcações caem na sua agenda e os lembretes saem sozinhos." },
];

const PLANOS = [
  {
    nome: "Profissional", preco: "49,90", destaque: false,
    para: "Para quem atende sozinho",
    itens: ["1 profissional", "Agendamentos ilimitados", "Lembretes no WhatsApp", "Ficha de clientes", "Controle financeiro"],
  },
  {
    nome: "Equipe", preco: "99,90", destaque: true,
    para: "Para salões e barbearias de até 5 pessoas",
    itens: ["Até 5 profissionais", "Tudo do Profissional", "Agenda por profissional", "Relatórios por pessoa", "Suporte prioritário"],
  },
];

const FAQ = [
  { q: "Preciso instalar algum programa?", a: "Não. O Agendi funciona direto pelo navegador do celular ou do computador. É só entrar e usar." },
  { q: "Meus clientes precisam baixar um aplicativo?", a: "Não. Eles agendam por um link — abre no navegador, escolhem o horário e pronto." },
  { q: "Consigo testar antes de pagar?", a: "Sim. São 7 dias grátis, sem precisar cadastrar cartão. Se gostar, é só assinar." },
  { q: "Meus dados e os dos meus clientes ficam seguros?", a: "Sim. Cada conta tem seus dados isolados e protegidos. Ninguém vê a sua agenda além de você." },
  { q: "E se eu precisar de ajuda?", a: "Você fala direto com a gente pelo WhatsApp. Ajudamos a configurar tudo no começo." },
];

function useReveal() {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && (setShown(true), io.disconnect()),
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, shown];
}

function Reveal({ children, delay = 0, className = "" }) {
  const [ref, shown] = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(20px)",
        transition: `opacity .6s ease ${delay}ms, transform .6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// Agenda "viva" do hero — horários sendo confirmados (mix salão + barbearia)
function AgendaViva() {
  const slots = [
    { h: "09:00", s: "Corte + Barba", c: "Rafael S." },
    { h: "10:30", s: "Escova", c: "Marina L." },
    { h: "13:00", s: "Corte masculino", c: "Diego A." },
    { h: "15:00", s: "Coloração", c: "Patrícia R." },
  ];
  const [n, setN] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(slots.length);
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setN(i);
      if (i >= slots.length) clearInterval(id);
    }, 700);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="agenda-card">
      <div className="agenda-top">
        <div>
          <p className="agenda-day">Hoje · Quinta</p>
          <p className="agenda-sub">4 horários confirmados</p>
        </div>
        <span className="agenda-pill">100% confirmado</span>
      </div>
      <div className="agenda-list">
        {slots.map((s, i) => (
          <div
            key={s.h}
            className="agenda-row"
            style={{
              opacity: i < n ? 1 : 0.25,
              transform: i < n ? "none" : "translateX(8px)",
              transition: "opacity .4s ease, transform .4s ease",
            }}
          >
            <span className="agenda-time">{s.h}</span>
            <div className="agenda-info">
              <span className="agenda-serv">{s.s}</span>
              <span className="agenda-cli">{s.c}</span>
            </div>
            {i < n && <Check size={16} className="agenda-check" />}
          </div>
        ))}
      </div>
      <div className="agenda-foot">
        <BellRing size={14} />
        <span>Lembrete enviado no WhatsApp</span>
      </div>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button className="faq-q" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span>{q}</span>
        <ChevronDown size={20} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .3s" }} />
      </button>
      <div className="faq-a" style={{ maxHeight: open ? 200 : 0 }}>
        <p>{a}</p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="as-root">
      <style>{CSS}</style>

      {/* NAV */}
      <header className="nav">
        <a href="#topo" className="brand">
          <span className="brand-mark">A</span>
          <span className="brand-name">Agend<span>i</span></span>
        </a>
        <nav className="nav-links">
          <a href="#recursos">Recursos</a>
          <a href="#como">Como funciona</a>
          <a href="#planos">Planos</a>
        </nav>
        <div className="nav-cta">
          <a href={LOGIN_URL} className="btn-ghost">Entrar</a>
          <a href={wppLink} className="btn-primary btn-sm" target="_blank" rel="noreferrer">Teste grátis</a>
        </div>
      </header>

      {/* HERO */}
      <section className="hero" id="topo">
        <div className="hero-text">
          <span className="eyebrow">Para salões, barbearias e estética</span>
          <h1>
            Sua agenda cheia.<br />
            <em>Sem furo, sem caderno,</em><br />
            sem bagunça no WhatsApp.
          </h1>
          <p className="hero-sub">
            O Agendi organiza seus horários, confirma seus clientes
            automaticamente e mostra quanto você fatura — tudo num lugar só.
          </p>
          <div className="hero-btns">
            <a href={wppLink} className="btn-primary" target="_blank" rel="noreferrer">
              Começar teste grátis <ArrowRight size={18} />
            </a>
            <a href={DEMO_URL} className="btn-line">Ver demonstração</a>
          </div>
          <p className="hero-note">7 dias grátis · sem cartão · cancela quando quiser</p>
        </div>
        <div className="hero-visual">
          <AgendaViva />
        </div>
      </section>

      {/* PÚBLICOS */}
      <div className="publicos">
        <span>Feito para profissionais de</span>
        <div className="publicos-list">
          {PUBLICOS.map((p) => <span key={p} className="tag">{p}</span>)}
        </div>
      </div>

      {/* DORES */}
      <section className="dores">
        <Reveal>
          <h2 className="sec-title">Você reconhece o seu dia aqui?</h2>
        </Reveal>
        <div className="dores-grid">
          {DORES.map((d, i) => (
            <Reveal key={d.dor} delay={i * 100}>
              <div className="dor-card">
                <p className="dor-x">{d.dor}</p>
                <div className="dor-arrow"><ArrowRight size={18} /></div>
                <p className="dor-fix">{d.fix}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* RECURSOS */}
      <section className="recursos" id="recursos">
        <Reveal>
          <span className="eyebrow center">Tudo o que você precisa</span>
          <h2 className="sec-title center">Menos tempo na organização,<br /> mais tempo atendendo</h2>
        </Reveal>
        <div className="feat-grid">
          {FEATURES.map((f, i) => (
            <Reveal key={f.t} delay={(i % 3) * 80}>
              <div className="feat-card">
                <div className="feat-icon"><f.icon size={22} /></div>
                <h3>{f.t}</h3>
                <p>{f.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="como" id="como">
        <Reveal>
          <h2 className="sec-title center light">Comece em três passos</h2>
        </Reveal>
        <div className="passos">
          {PASSOS.map((p, i) => (
            <Reveal key={p.n} delay={i * 120}>
              <div className="passo">
                <span className="passo-n">{p.n}</span>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* DEPOIMENTO */}
      <section className="depo">
        <Reveal>
          <div className="depo-card">
            <div className="stars">{[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}</div>
            <p className="depo-txt">
              “Parei de perder horário com cliente que não aparecia. Agora a agenda
              fecha sozinha e eu vejo quanto faturei no mês sem fazer conta.”
            </p>
            <p className="depo-aut">— em breve, o depoimento do seu negócio aqui</p>
          </div>
        </Reveal>
      </section>

      {/* PLANOS */}
      <section className="planos" id="planos">
        <Reveal>
          <span className="eyebrow center">Planos simples</span>
          <h2 className="sec-title center">Escolha e comece hoje</h2>
        </Reveal>
        <div className="planos-grid">
          {PLANOS.map((p, i) => (
            <Reveal key={p.nome} delay={i * 100}>
              <div className={`plano ${p.destaque ? "plano-top" : ""}`}>
                {p.destaque && <span className="plano-badge">Mais escolhido</span>}
                <h3>{p.nome}</h3>
                <p className="plano-para">{p.para}</p>
                <p className="plano-preco"><span>R$</span>{p.preco}<small>/mês</small></p>
                <ul>
                  {p.itens.map((it) => (
                    <li key={it}><Check size={16} /> {it}</li>
                  ))}
                </ul>
                <a href={wppLink} target="_blank" rel="noreferrer"
                   className={p.destaque ? "btn-primary full" : "btn-line full"}>
                  Começar teste grátis
                </a>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="planos-note">Todos os planos com 7 dias grátis. Sem fidelidade.</p>
      </section>

      {/* FAQ */}
      <section className="faq">
        <Reveal>
          <h2 className="sec-title center">Perguntas frequentes</h2>
        </Reveal>
        <div className="faq-list">
          {FAQ.map((f) => <FaqItem key={f.q} {...f} />)}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="cta-final">
        <Reveal>
          <h2>Seu próximo cliente já quer marcar.<br />Deixe a agenda trabalhar por você.</h2>
          <a href={wppLink} className="btn-primary big" target="_blank" rel="noreferrer">
            Começar teste grátis <ArrowRight size={20} />
          </a>
          <p className="hero-note light">7 dias grátis · sem cartão</p>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="foot-brand">
          <span className="brand-mark sm">A</span>
          <span className="brand-name light">Agend<span>i</span></span>
        </div>
        <p className="foot-by">
          Um produto <a href="https://instagram.com/agenciacsld" target="_blank" rel="noreferrer">Consolidar Tech</a>
        </p>
        <div className="foot-social">
          <a href="https://instagram.com/agenciacsld" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={18} /></a>
          <a href={wppLink} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={18} /></a>
        </div>
        <p className="foot-copy">© 2026 Agendi · Todos os direitos reservados</p>
      </footer>

      {/* WHATSAPP FLUTUANTE */}
      <a href={wppLink} className="wpp-float" target="_blank" rel="noreferrer" aria-label="Falar no WhatsApp">
        <MessageCircle size={26} />
      </a>
    </div>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700&family=Inter:wght@400;500;600;700&display=swap');

.as-root{
  --ink:#181C1E; --teal:#0F8A78; --teal-d:#0B6E60; --teal-soft:#E4F1EE;
  --paper:#F2F4F3; --stone:#5C6764; --amber:#C28A3C;
  --text:#1E2624; --line:rgba(24,28,30,.08);
  font-family:'Inter',system-ui,sans-serif; color:var(--text);
  background:var(--paper); line-height:1.5; overflow-x:hidden;
}
.as-root *{box-sizing:border-box;margin:0}
.as-root h1,.as-root h2,.as-root h3{font-family:'Bricolage Grotesque',sans-serif;font-weight:600;line-height:1.08;letter-spacing:-.02em}
.as-root em{font-style:normal;color:var(--teal)}
.as-root a{text-decoration:none;color:inherit}

/* NAV */
.nav{position:sticky;top:0;z-index:50;display:flex;align-items:center;justify-content:space-between;
  padding:18px 6vw;background:rgba(242,244,243,.85);backdrop-filter:blur(10px);
  border-bottom:1px solid var(--line)}
.brand{display:flex;align-items:center;gap:10px}
.brand-mark{display:grid;place-items:center;width:38px;height:38px;border-radius:11px;
  background:var(--ink);color:#fff;font-family:'Bricolage Grotesque',sans-serif;font-size:20px;font-weight:700}
.brand-mark.sm{width:32px;height:32px;font-size:17px;border-radius:9px}
.brand-name{font-family:'Bricolage Grotesque',sans-serif;font-size:21px;font-weight:700}
.brand-name span{color:var(--teal)}
.brand-name.light{color:#fff}.brand-name.light span{color:var(--teal)}
.nav-links{display:flex;gap:28px;font-size:15px;font-weight:500}
.nav-links a{color:var(--stone);transition:color .2s}
.nav-links a:hover{color:var(--text)}
.nav-cta{display:flex;align-items:center;gap:14px}
.btn-ghost{font-weight:600;font-size:15px}
.btn-primary{display:inline-flex;align-items:center;gap:8px;background:var(--teal);color:#fff;
  font-weight:600;padding:13px 24px;border-radius:10px;font-size:15px;
  box-shadow:0 8px 22px -8px rgba(15,138,120,.55);transition:transform .2s,background .2s}
.btn-primary:hover{background:var(--teal-d);transform:translateY(-2px)}
.btn-primary.btn-sm{padding:9px 18px;font-size:14px}
.btn-primary.full,.btn-line.full{width:100%;justify-content:center}
.btn-primary.big{padding:17px 34px;font-size:17px}
.btn-line{display:inline-flex;align-items:center;gap:8px;border:1.5px solid rgba(24,28,30,.18);
  color:var(--text);font-weight:600;padding:12px 24px;border-radius:10px;font-size:15px;transition:border-color .2s,background .2s}
.btn-line:hover{border-color:var(--ink);background:rgba(24,28,30,.03)}

/* HERO */
.hero{display:grid;grid-template-columns:1.1fr .9fr;gap:54px;align-items:center;
  padding:74px 6vw 64px;max-width:1240px;margin:0 auto}
.eyebrow{display:inline-block;font-size:12.5px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;
  color:var(--teal-d);background:var(--teal-soft);padding:6px 14px;border-radius:8px;margin-bottom:22px}
.eyebrow.center{display:block;width:max-content;margin:0 auto 18px}
.hero h1{font-size:clamp(34px,5vw,55px)}
.hero-sub{font-size:18px;color:var(--stone);margin:22px 0 30px;max-width:30em}
.hero-btns{display:flex;gap:14px;flex-wrap:wrap}
.hero-note{font-size:13px;color:var(--stone);margin-top:18px}
.hero-note.light{color:rgba(255,255,255,.7)}

/* AGENDA VIVA */
.hero-visual{display:flex;justify-content:center}
.agenda-card{width:100%;max-width:360px;background:#fff;border-radius:20px;padding:22px;
  box-shadow:0 30px 60px -26px rgba(24,28,30,.35);border:1px solid var(--line)}
.agenda-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px}
.agenda-day{font-family:'Bricolage Grotesque',sans-serif;font-size:19px;font-weight:600}
.agenda-sub{font-size:13px;color:var(--stone)}
.agenda-pill{font-size:11px;font-weight:600;color:var(--teal-d);background:var(--teal-soft);padding:5px 11px;border-radius:999px}
.agenda-list{display:flex;flex-direction:column;gap:10px}
.agenda-row{display:flex;align-items:center;gap:13px;padding:13px;border-radius:12px;background:var(--paper)}
.agenda-time{font-weight:700;font-size:14px;color:var(--teal-d);min-width:42px}
.agenda-info{display:flex;flex-direction:column;flex:1}
.agenda-serv{font-size:14px;font-weight:600}
.agenda-cli{font-size:12px;color:var(--stone)}
.agenda-check{color:#fff;background:var(--teal);border-radius:50%;padding:2px}
.agenda-foot{display:flex;align-items:center;gap:8px;margin-top:16px;padding-top:15px;
  border-top:1px solid var(--line);font-size:13px;color:var(--teal-d);font-weight:500}

/* PÚBLICOS */
.publicos{display:flex;align-items:center;gap:20px;flex-wrap:wrap;justify-content:center;
  padding:26px 6vw;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.publicos>span{font-size:13px;color:var(--stone);font-weight:500}
.publicos-list{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
.tag{font-size:13px;font-weight:600;color:var(--teal-d);background:var(--teal-soft);padding:7px 15px;border-radius:8px}

/* SEÇÕES */
.sec-title{font-size:clamp(27px,3.4vw,40px)}
.sec-title.center{text-align:center}
.sec-title.light{color:#fff}
.dores{padding:78px 6vw;max-width:1180px;margin:0 auto}
.dores .sec-title{text-align:center;margin-bottom:42px}
.dores-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.dor-card{background:#fff;border-radius:16px;padding:30px;border:1px solid var(--line);height:100%}
.dor-x{font-family:'Bricolage Grotesque',sans-serif;font-size:19px;font-weight:600;color:var(--text)}
.dor-arrow{width:34px;height:34px;border-radius:9px;background:var(--teal-soft);display:grid;place-items:center;
  color:var(--teal);margin:16px 0}
.dor-fix{font-size:15px;color:var(--stone)}

.recursos{padding:80px 6vw;max-width:1180px;margin:0 auto}
.recursos .sec-title{margin-bottom:50px}
.feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.feat-card{background:#fff;border-radius:16px;padding:30px;border:1px solid var(--line);
  transition:transform .25s,box-shadow .25s;height:100%}
.feat-card:hover{transform:translateY(-4px);box-shadow:0 20px 40px -22px rgba(24,28,30,.2)}
.feat-icon{width:48px;height:48px;border-radius:12px;background:var(--ink);color:var(--teal);
  display:grid;place-items:center;margin-bottom:18px}
.feat-card h3{font-size:19px;margin-bottom:9px}
.feat-card p{font-size:15px;color:var(--stone)}

/* COMO */
.como{background:var(--ink);color:#fff;padding:80px 6vw}
.como .sec-title{margin-bottom:50px}
.passos{display:grid;grid-template-columns:repeat(3,1fr);gap:34px;max-width:980px;margin:0 auto}
.passo-n{font-family:'Bricolage Grotesque',sans-serif;font-size:38px;color:var(--teal);font-weight:700}
.passo h3{font-size:21px;margin:12px 0 8px}
.passo p{font-size:15px;color:rgba(255,255,255,.68)}

/* DEPOIMENTO */
.depo{padding:70px 6vw;display:flex;justify-content:center}
.depo-card{max-width:680px;text-align:center;background:var(--teal-soft);border-radius:22px;padding:46px 40px}
.stars{display:flex;gap:4px;justify-content:center;color:var(--amber);margin-bottom:20px}
.depo-txt{font-family:'Bricolage Grotesque',sans-serif;font-size:clamp(20px,2.4vw,26px);
  font-weight:500;line-height:1.35;color:var(--text)}
.depo-aut{margin-top:20px;font-size:14px;color:var(--teal-d);font-weight:600}

/* PLANOS */
.planos{padding:80px 6vw;max-width:920px;margin:0 auto}
.planos .sec-title{margin-bottom:46px}
.planos-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
.plano{position:relative;background:#fff;border-radius:18px;padding:34px;border:1px solid var(--line)}
.plano-top{border:2px solid var(--teal);box-shadow:0 24px 50px -26px rgba(15,138,120,.4)}
.plano-badge{position:absolute;top:-13px;left:34px;background:var(--teal);color:#fff;font-size:12px;
  font-weight:600;padding:5px 14px;border-radius:8px}
.plano h3{font-size:24px}
.plano-para{font-size:14px;color:var(--stone);margin:4px 0 18px}
.plano-preco{font-family:'Bricolage Grotesque',sans-serif;font-size:46px;font-weight:700;color:var(--text);margin-bottom:22px}
.plano-preco span{font-size:20px;vertical-align:super;margin-right:3px}
.plano-preco small{font-size:16px;color:var(--stone);font-weight:400}
.plano ul{list-style:none;display:flex;flex-direction:column;gap:11px;margin-bottom:26px}
.plano li{display:flex;align-items:center;gap:10px;font-size:15px}
.plano li svg{color:var(--teal);flex-shrink:0}
.planos-note{text-align:center;font-size:14px;color:var(--stone);margin-top:26px}

/* FAQ */
.faq{padding:72px 6vw;max-width:760px;margin:0 auto}
.faq .sec-title{margin-bottom:36px}
.faq-list{display:flex;flex-direction:column;gap:12px}
.faq-item{background:#fff;border-radius:14px;border:1px solid var(--line);overflow:hidden}
.faq-q{width:100%;display:flex;justify-content:space-between;align-items:center;gap:16px;
  padding:20px 24px;background:none;border:none;cursor:pointer;font-family:'Inter';
  font-size:16px;font-weight:600;color:var(--text);text-align:left}
.faq-q svg{color:var(--teal);flex-shrink:0}
.faq-a{overflow:hidden;transition:max-height .3s ease}
.faq-a p{padding:0 24px 20px;font-size:15px;color:var(--stone)}

/* CTA FINAL */
.cta-final{background:linear-gradient(135deg,var(--teal),#0B5E54);color:#fff;
  text-align:center;padding:84px 6vw;border-radius:26px;max-width:1100px;
  margin:0 auto}
.cta-final h2{font-size:clamp(26px,3.6vw,42px);margin-bottom:30px}
.cta-final .btn-primary{background:#fff;color:var(--teal-d);box-shadow:0 14px 34px -10px rgba(0,0,0,.3)}
.cta-final .btn-primary:hover{background:#fff;transform:translateY(-2px)}

/* FOOTER */
.footer{background:var(--ink);color:#fff;text-align:center;padding:50px 6vw 40px;margin-top:74px}
.foot-brand{display:flex;align-items:center;gap:9px;justify-content:center;margin-bottom:14px}
.foot-by{font-size:14px;color:rgba(255,255,255,.65)}
.foot-by a{color:var(--teal);font-weight:600}
.foot-social{display:flex;gap:14px;justify-content:center;margin:20px 0}
.foot-social a{width:40px;height:40px;border-radius:10px;border:1px solid rgba(255,255,255,.2);
  display:grid;place-items:center;color:#fff;transition:background .2s}
.foot-social a:hover{background:rgba(255,255,255,.12)}
.foot-copy{font-size:12px;color:rgba(255,255,255,.4)}

/* WPP FLUTUANTE */
.wpp-float{position:fixed;bottom:24px;right:24px;z-index:60;width:58px;height:58px;border-radius:50%;
  background:#25D366;color:#fff;display:grid;place-items:center;
  box-shadow:0 10px 28px -6px rgba(37,211,102,.6);transition:transform .2s}
.wpp-float:hover{transform:scale(1.08)}

/* RESPONSIVO */
@media(max-width:900px){
  .hero{grid-template-columns:1fr;gap:40px;text-align:center;padding-top:48px}
  .hero-sub{margin-left:auto;margin-right:auto}
  .hero-btns{justify-content:center}
  .eyebrow.center{margin:0 auto 18px}
  .nav-links{display:none}
  .dores-grid,.feat-grid,.passos,.planos-grid{grid-template-columns:1fr}
}
@media(max-width:520px){
  .nav{padding:14px 5vw}
  .brand-name{font-size:18px}
  .nav-cta .btn-ghost{display:none}
}
@media(prefers-reduced-motion:reduce){
  *{animation:none!important;transition:none!important}
}
`;
