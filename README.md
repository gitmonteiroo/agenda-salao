# Agenda Salão

Sistema de agendamento online para salões, barbearias e estética.
Projeto completo (landing + sistema) já conectado ao Supabase.

## Funcionalidades

- **Landing page** de vendas (`/`)
- **Página pública de agendamento** (`/agendar/:slug`) — o cliente final marca sozinho
- **Cadastro** de novos donos com criação automática do negócio + link (`/cadastro`)
- **Login** + botão **"Entrar como demonstração"** (`/login`)
- **Agenda** — indicadores do dia + horários + **novo agendamento** + concluir
- **Clientes** — lista, busca e cadastro
- **Serviços** — lista e cadastro (preço e duração)
- **Financeiro** — recebido no mês, a receber e ticket médio
- **Perfil** — link de agendamento compartilhável + dados do negócio

Segurança por conta (RLS): cada salão enxerga apenas os próprios dados.
O agendamento público usa funções seguras (SECURITY DEFINER) que expõem só o
necessário e criam o horário como "pendente" para o dono confirmar.

## Stack

- React + Vite
- React Router
- Supabase (Postgres + Auth)
- lucide-react (ícones)
- CSS próprio (sem dependência de framework de UI)

## Rodar localmente

```bash
npm install
cp .env.example .env   # preencha a anon key
npm run dev
```

### Variáveis de ambiente (.env e Vercel)

```
VITE_SUPABASE_URL=https://vaaprybybixusxpfvksg.supabase.co
VITE_SUPABASE_ANON_KEY=<sua anon key>
```

A `anon key` está em **Supabase → Project Settings → API → Project API keys**
(chave `anon` `public`). No **Vercel**, adicione as duas em
*Settings → Environment Variables* e refaça o deploy.

## Conta de demonstração

- **E-mail:** demo@agendasalao.com.br
- **Senha:** demo123

Já vem populada com negócio, serviços, clientes e agenda de exemplo.

## Estrutura

```
.
├── index.html
├── package.json
├── vite.config.js
├── vercel.json            # rewrites para SPA (rotas funcionam no refresh)
├── .env.example
└── src/
    ├── main.jsx
    ├── App.jsx            # rotas + sessão
    ├── lib/supabase.js
    ├── styles/app.css
    ├── components/AppLayout.jsx
    └── pages/
        ├── LandingPage.jsx
        ├── AgendarPublico.jsx
        ├── Login.jsx
        ├── Cadastro.jsx
        ├── Agenda.jsx
        ├── Clientes.jsx
        ├── Servicos.jsx
        ├── Financeiro.jsx
        └── Perfil.jsx
```

## Observação sobre cadastro

Por padrão o Supabase pede confirmação de e-mail no cadastro. Para o teste grátis
entrar direto (sem confirmar e-mail), desative em **Supabase → Authentication →
Sign In / Providers → Email → Confirm email**. Com a confirmação ligada, o novo
usuário recebe um link e faz login depois de confirmar.

---

Um produto Consolidar Tech.
