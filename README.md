# Stainhaus — Sistema de Gestão para Marmorarias

> **Software proprietário e confidencial.** Este sistema foi desenvolvido sob
> encomenda, exclusivamente para uso interno da **Stainhaus Marmoraria**. O
> código, o design e esta documentação não são de uso público, não devem ser
> redistribuídos e não estão licenciados para uso por terceiros. Todos os
> direitos reservados.

Sistema interno de gestão desenvolvido especificamente para o dia a dia de uma
marmoraria: controle de clientes, projetos (bancadas, banheiros, soleiras,
áreas gourmet e outros serviços em pedra), tarefas, agenda de medições e
instalações, usuários e permissões, e histórico de tudo o que acontece em
cada projeto.

Este documento serve tanto como **manual técnico** (para quem for instalar
ou manter o sistema) quanto como **manual de uso** (para quem vai operar o
sistema no dia a dia, sem precisar entender de programação).

---

## Índice

1. [Visão geral](#visão-geral)
2. [Tecnologias](#tecnologias)
3. [Requisitos](#requisitos)
4. [Instalação](#instalação)
5. [Banco de dados](#banco-de-dados)
6. [Primeiro acesso](#primeiro-acesso)
7. [Como utilizar o sistema](#como-utilizar-o-sistema)
8. [Fluxo recomendado de utilização](#fluxo-recomendado-de-utilização)
9. [Como testar o sistema](#como-testar-o-sistema)
10. [Variáveis de ambiente](#variáveis-de-ambiente)
11. [Manter o banco ativo (keep-alive)](#manter-o-banco-ativo-keep-alive)
12. [Deploy na Vercel](#deploy-na-vercel)
13. [Segurança](#segurança)
14. [Estrutura do projeto](#estrutura-do-projeto)
15. [Solução de problemas](#solução-de-problemas)
16. [Credenciais iniciais](#credenciais-iniciais)

---

## Visão geral

O Stainhaus organiza o fluxo real de uma marmoraria: um cliente pede um
orçamento, o orçamento é aprovado, a peça é medida, cortada, acabada,
instalada e o projeto é concluído. O sistema acompanha cada uma dessas
etapas, quem é responsável, o que falta fazer e quando cada compromisso
(medição, instalação, visita, entrega) está agendado.

Principais funcionalidades:

- **Clientes** — cadastro completo com histórico de projetos.
- **Projetos** — nome, tipo de serviço, cliente, responsável, prazo,
  prioridade, etapa, descrição, tarefas, observações e histórico.
- **Tarefas** — divisão de cada projeto em atividades menores.
- **Agenda** — compromissos (medição, instalação, visita, entrega) em
  visualização diária, semanal e mensal, vinculados a projetos.
- **Usuários e permissões** — o administrador cria e controla exatamente o
  que cada colaborador pode ver e fazer.
- **Histórico** — auditoria de tudo o que acontece em cada projeto.
- **Dashboard** — panorama do que está acontecendo hoje na marmoraria.

---

## Tecnologias

- [Next.js 16](https://nextjs.org/) (App Router, Server Actions)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) sobre [Radix UI](https://www.radix-ui.com/)
- [PostgreSQL](https://www.postgresql.org/) + [Prisma ORM](https://www.prisma.io/)
- [Auth.js (NextAuth v5)](https://authjs.dev/) com login por credenciais
- [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/) para validação de formulários
- [Vercel](https://vercel.com/) como plataforma de deploy

---

## Requisitos

Para rodar o projeto localmente você precisa ter instalado:

- **Node.js** 20 ou superior
- **npm** (vem junto com o Node.js)
- Um banco de dados **PostgreSQL** — local ou de um provedor gerenciado
  (ex.: [Neon](https://neon.tech), Supabase, Railway, Vercel Postgres)

Não é necessário Docker: o projeto foi feito para rodar localmente com
Node.js e ser publicado diretamente na Vercel, conectado a um Postgres
gerenciado na nuvem.

---

## Instalação

```bash
# 1. Clonar o projeto
git clone <url-do-repositorio>
cd agenda-marmoraria

# 2. Instalar as dependências
npm install

# 3. Configurar as variáveis de ambiente
cp .env.example .env
# edite o arquivo .env com os valores corretos (veja a seção "Variáveis de ambiente")

# 4. Gerar o Prisma Client
npx prisma generate

# 5. Rodar as migrations (cria as tabelas no banco)
npx prisma migrate deploy

# 6. Popular o banco com o usuário administrador inicial
npx prisma db seed

# 7. Iniciar a aplicação em modo desenvolvimento
npm run dev
```

Acesse **http://localhost:3000** — você será redirecionado para a tela de
login.

Para gerar a versão de produção localmente:

```bash
npm run build
npm run start
```

---

## Banco de dados

O schema completo está em [`prisma/schema.prisma`](prisma/schema.prisma).

### Configurar o PostgreSQL

- **Opção 1 — Provedor gerenciado (recomendado):** crie um banco gratuito no
  [Neon](https://neon.tech) (ou Supabase/Railway/Vercel Postgres) e copie a
  connection string para `DATABASE_URL` no `.env`. Se o provedor fornecer uma
  URL "pooled" (com pooler/pgbouncer) e uma URL direta, use a pooled em
  `DATABASE_URL` e a direta em `DIRECT_URL` (usada só para migrations).
- **Opção 2 — PostgreSQL local:** instale o PostgreSQL na sua máquina, crie
  um banco (ex.: `stainhaus`) e aponte `DATABASE_URL` (e `DIRECT_URL`, com o
  mesmo valor) para ele.

### Comandos úteis

```bash
# Aplicar migrations em produção/homologação (não cria novas migrations)
npx prisma migrate deploy

# Criar uma nova migration durante o desenvolvimento (quando o schema muda)
npx prisma migrate dev --name descricao_da_mudanca

# Rodar o seed manualmente (cria apenas o usuário administrador inicial)
npx prisma db seed

# Abrir o Prisma Studio (interface visual para ver/editar os dados)
npx prisma studio
```

### Resetar o banco em desenvolvimento

Se precisar zerar tudo e recomeçar (⚠️ apaga todos os dados):

```bash
npx prisma migrate reset
```

Esse comando reaplica todas as migrations do zero e roda o seed
automaticamente ao final, recriando o usuário administrador.

---

## Primeiro acesso

O sistema **não possui cadastro público**. O seed cria automaticamente um
único usuário administrador:

- **E-mail:** `admin@admin.com`
- **Senha:** `root`

Esse é o único usuário que existe logo após a instalação. A partir dele, o
administrador acessa **Usuários** e cria as contas dos demais colaboradores,
definindo o perfil (Administrador ou Colaborador) e, para colaboradores,
quais permissões cada um tem.

> **Importante:** altere a senha do administrador assim que possível pela
> tela **Minha conta** (menu do usuário, no canto superior direito).

---

## Como utilizar o sistema

A navegação principal fica na barra lateral (no celular, ela vira um menu
que abre pelo ícone de "hambúrguer" no topo).

### Login (`/login`)

Tela de entrada do sistema. Peça e-mail e senha, com opção de mostrar/ocultar
a senha, mensagens de erro claras quando as credenciais estão erradas, e
redireciona automaticamente para o Dashboard após o login. Não existe opção
de "criar conta" — isso é intencional.

### Dashboard (`/dashboard`)

Primeira tela após o login. Responde "o que está acontecendo na marmoraria
hoje":

- **Cartões de indicadores:** projetos em andamento, projetos atrasados,
  projetos com prazo próximo (o número de dias é configurável em
  Configurações → Geral) e projetos concluídos.
- **Prioridade em aberto:** projetos de prioridade alta/urgente que ainda
  não foram concluídos.
- **Projetos por etapa:** quantos projetos existem em cada etapa do fluxo.
- **Próximos compromissos:** os próximos eventos da agenda.
- **Atividade recente:** últimas ações registradas nos projetos.

### Clientes (`/clientes`)

Cadastro de clientes (pessoas físicas ou empresas atendidas pela
marmoraria).

- **Novo cliente:** abre um formulário (nome, telefone, e-mail, endereço,
  observações).
- **Editar:** ícone de lápis na listagem.
- **Excluir:** ícone de lixeira — pede confirmação e **bloqueia a exclusão**
  se o cliente tiver projetos vinculados (é preciso remover ou transferir os
  projetos antes).
- **Ver detalhes:** clique no nome do cliente para ver seus dados completos
  e a lista de projetos relacionados.

### Projetos (`/projetos`)

Listagem de todos os projetos (bancadas, banheiros, soleiras, áreas
gourmet, etc.), com pesquisa por nome/cliente e filtros por etapa,
prioridade e responsável. Cada linha tem atalhos para **ver detalhes**,
**editar**, **desativar/reativar** e (administradores) **excluir
definitivamente**, sem precisar abrir o projeto.

- **Novo projeto** (`/projetos/novo`): formulário completo — nome, tipo de
  serviço, cliente, responsável, prioridade, prazo, descrição e quais
  colaboradores têm acesso a esse projeto específico. Cliente e responsável
  são escolhidos por um campo de busca (útil quando a lista crescer).
- **Detalhe do projeto** (`/projetos/[id]`): tela central do sistema.
  Mostra e permite alterar diretamente a etapa, prioridade, responsável e
  prazo, além de uma barra de progresso visual. Contém quatro abas:
  - **Tarefas** — criar, editar, concluir e excluir tarefas do projeto.
  - **Observações** — anotações de texto livre sobre o projeto.
  - **Agenda** — compromissos vinculados a este projeto, com atalho para
    agendar um novo.
  - **Histórico** — linha do tempo com tudo o que já aconteceu no projeto.
  - Botões de **Editar**, **Desativar/Reativar** e (só para administradores)
    **Excluir definitivamente**.
- **Editar projeto** (`/projetos/[id]/editar`): mesmo formulário de criação,
  pré-preenchido.

### Agenda (`/agenda`)

Compromissos da operação: medições, instalações, visitas e entregas.
Alterne entre visualização **Dia**, **Semana** e **Mês** pelos botões no
topo, e navegue entre períodos com as setas ou o botão "Hoje". Um evento
pode ou não estar vinculado a um projeto — ao vincular, ele também aparece
na aba "Agenda" do projeto correspondente.

### Usuários (`/usuarios` — apenas administradores)

- **Novo usuário:** define nome, e-mail, senha provisória, perfil
  (Administrador ou Colaborador) e, para colaboradores, quais permissões
  específicas ele recebe (ver todos os projetos, criar/editar/excluir
  projetos, alterar etapas, gerenciar clientes, tarefas, agenda, usuários,
  ver histórico, configurações).
- **Editar:** altera nome, e-mail, perfil e permissões.
- **Redefinir senha:** define uma nova senha provisória para o usuário.
- **Desativar/Reativar:** um usuário desativado não consegue mais entrar no
  sistema (a sessão dele é invalidada em até 5 minutos, mesmo que já esteja
  logado).
- **Excluir definitivamente:** remove o usuário por completo. Projetos e
  tarefas em que ele era responsável continuam existindo, apenas sem
  responsável definido.
- Por segurança, você não pode desativar/excluir a própria conta nem
  desativar/rebaixar/excluir o último administrador ativo do sistema.

### Histórico (`/historico`)

Lista de todas as ações registradas nos projetos que o usuário tem acesso:
criação, mudança de etapa, de prioridade, de responsável, de prazo, tarefas
criadas/concluídas, observações adicionadas, projetos concluídos/cancelados,
entre outras.

### Minha conta (`/conta`)

Qualquer usuário pode ver seus próprios dados e alterar sua senha aqui.

### Configurações (`/configuracoes` — administradores)

Dividida em duas abas:

- **Geral** — ajustes reais do sistema: quantos dias de antecedência um
  projeto passa a aparecer como "prazo próximo" no dashboard e nas
  listagens, e os dados de contato da marmoraria (nome, telefone, e-mail,
  endereço).
- **Referência** — consulta rápida do fluxo de etapas dos projetos e do
  catálogo de permissões disponíveis para colaboradores.

---

## Fluxo recomendado de utilização

Um exemplo completo do dia a dia:

1. **Cliente entra em contato** pedindo uma bancada de cozinha.
2. **Cadastrar o cliente** em Clientes (se ainda não existir).
3. **Criar o projeto** em Projetos → Novo projeto, com etapa inicial
   "Orçamento", prioridade e prazo estimado.
4. **Orçamento aprovado** → mover o projeto para a etapa "Aprovado"
   diretamente na tela do projeto.
5. **Agendar a medição** na Agenda, vinculada a este projeto, e mover o
   projeto para "Medição".
6. Após a medição, criar tarefas como "Confirmar medidas" e "Separar
   material", e mover o projeto para **"Corte"**.
7. Concluídas as tarefas de corte, mover para **"Acabamento"**.
8. **Agendar a instalação** na Agenda e mover o projeto para
   **"Instalação"**.
9. Após a instalação confirmada com o cliente, mover o projeto para
   **"Concluído"**.
10. A qualquer momento, registrar **observações** relevantes e consultar o
    **histórico** para entender o que já foi feito.

---

## Como testar o sistema

Um roteiro simples para verificar que tudo está funcionando, sem precisar
entender de programação:

1. Acesse a tela de **login**.
2. Entre com `admin@admin.com` / `root`.
3. Você deve cair no **Dashboard**.
4. Vá em **Clientes** → **Novo cliente** e cadastre um cliente de teste.
5. Vá em **Projetos** → **Novo projeto**, selecione o cliente criado e salve.
6. Na página do projeto criado, altere a **etapa** pelo seletor (ex.: de
   "Orçamento" para "Aprovado") e confirme que aparece uma notificação de
   sucesso.
7. Na aba **Tarefas**, clique em **Nova tarefa**, preencha o título e salve.
   Marque essa tarefa como **Concluída** no seletor de status.
8. Na aba **Histórico**, confirme que aparecem as ações que você acabou de
   fazer (projeto criado, etapa alterada, tarefa criada, tarefa concluída).
9. Vá em **Usuários** → **Novo usuário**, crie um colaborador de teste com
   apenas a permissão "Visualizar todos os projetos" e uma senha provisória.
10. Saia do sistema (menu do usuário → **Sair**) e entre com o colaborador
    recém-criado. Confirme que os menus **Usuários** e **Configurações**
    não aparecem para ele (permissões funcionando).
11. Acesse **Projetos** e confirme que a lista aparece com as etapas de cada
    projeto. Abra um projeto pelo botão **Detalhe** e verifique as abas de
    tarefas, observações, agenda e histórico.
12. Acesse a **Agenda**, crie um evento de teste (ex.: tipo "Visita") e
    confirme que ele aparece na visualização do dia/semana/mês.
13. Volte para o **Dashboard** e confira se os números dos cartões mudaram
    de acordo com o que foi criado.

Se todos os passos acima funcionarem sem erros, o sistema está operando
corretamente.

---

## Variáveis de ambiente

Veja também [`.env.example`](.env.example).

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | Sim | Connection string do PostgreSQL usada pela aplicação em tempo de execução. |
| `DIRECT_URL` | Sim | Connection string direta (sem pooler), usada apenas para rodar migrations. Em bancos sem pooler, pode ser igual à `DATABASE_URL`. |
| `AUTH_SECRET` | Sim | Chave secreta usada para assinar as sessões. Gere uma com `npx auth secret` ou `openssl rand -base64 32`. |
| `AUTH_URL` | Em produção | URL pública onde a aplicação está rodando (ex.: `https://seu-dominio.vercel.app`). |
| `CRON_SECRET` | Recomendada | Token usado para proteger o endpoint de keep-alive do banco de dados (ver seção abaixo). |

Nunca compartilhe o conteúdo real do seu `.env` — ele fica de fora do
controle de versão (`.gitignore`) propositalmente.

---

## Manter o banco ativo (keep-alive)

Provedores serverless de PostgreSQL (Neon, Vercel Postgres e similares)
colocam o banco em repouso após um período sem uso, o que causa um pequeno
atraso ("cold start") na primeira requisição depois da inatividade.

O projeto inclui um endpoint (`/api/cron/keep-alive`) que apenas executa uma
consulta leve (`SELECT 1`) para manter o banco "acordado", protegido por um
token (`CRON_SECRET`) para que não possa ser chamado por qualquer pessoa.

Ao publicar na Vercel, o arquivo [`vercel.json`](vercel.json) já configura um
**Vercel Cron Job** que chama esse endpoint automaticamente uma vez por dia —
não é necessário nenhum serviço externo. Basta garantir que a variável
`CRON_SECRET` esteja definida nas variáveis de ambiente do projeto na
Vercel (Cron Jobs da Vercel enviam esse mesmo valor automaticamente no
cabeçalho de autorização).

> No plano gratuito (Hobby) da Vercel, Cron Jobs só podem rodar no máximo uma
> vez por dia — por isso o agendamento padrão é diário. Em um plano Pro, o
> intervalo pode ser reduzido editando o campo `schedule` em `vercel.json`.

Se o seu provedor de banco não sofrer com esse tipo de suspensão, esse
endpoint é inofensivo e pode ser ignorado ou removido do `vercel.json`.

---

## Deploy na Vercel

1. Suba o projeto para um repositório Git (GitHub, GitLab ou Bitbucket).
2. Na [Vercel](https://vercel.com), clique em **Add New → Project** e
   importe o repositório.
3. Configure as variáveis de ambiente do projeto (mesmas do `.env.example`):
   `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `AUTH_URL` (a URL final do
   projeto na Vercel) e `CRON_SECRET`.
   - Se o banco Postgres já estiver conectado ao seu projeto/conta na
     Vercel (aba **Storage**), basta vinculá-lo ao projeto que a Vercel
     preenche essas variáveis automaticamente.
4. Antes do primeiro deploy funcionar de ponta a ponta, rode as migrations
   contra o banco de produção (uma única vez):
   ```bash
   DATABASE_URL="<connection-string-de-produção>" npx prisma migrate deploy
   DATABASE_URL="<connection-string-de-produção>" npx prisma db seed
   ```
5. Clique em **Deploy**. A cada novo push no branch principal, a Vercel
   publica automaticamente uma nova versão.

---

## Segurança

O sistema foi construído para uso interno de uma empresa, com várias camadas
de proteção:

- **Sem cadastro público.** Só o administrador cria contas. A tela de login é
  a única página pública.
- **Senhas com hash.** As senhas nunca são guardadas em texto puro — são
  gravadas com hash bcrypt. O mínimo é de 8 caracteres.
- **Autorização no servidor, não na tela.** Esconder um botão não basta:
  toda ação sensível (criar, editar, excluir, mudar etapa, mexer na agenda)
  revalida o perfil e as permissões do usuário no servidor antes de executar.
- **Isolamento de projetos.** Um colaborador sem a permissão "Visualizar
  todos os projetos" só enxerga e altera os projetos em que é responsável ou
  membro. O acesso é sempre derivado do banco de dados, nunca de um
  identificador enviado pelo navegador — isso evita que alguém edite um
  projeto de outra pessoa apenas trocando o ID na requisição.
- **Sessão revalidada periodicamente.** Se uma conta é desativada ou tem as
  permissões alteradas, a sessão passa a refletir isso em poucos minutos, sem
  precisar de logout manual. Contas desativadas ou excluídas são
  desconectadas automaticamente.
- **Proteção contra força bruta no login.** Tentativas malsucedidas são
  registradas; após 5 erros para o mesmo e-mail (ou 20 do mesmo endereço de
  rede) em 15 minutos, novas tentativas são bloqueadas temporariamente. Um
  login correto zera o bloqueio daquele e-mail.
- **Cabeçalhos de segurança HTTP.** A aplicação envia `X-Frame-Options`,
  `Content-Security-Policy` (bloqueando incorporação em iframes),
  `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` e HSTS.
- **Endpoint de manutenção protegido.** A rotina de keep-alive só executa com
  o segredo correto (`CRON_SECRET`); sem ele, o endpoint fica indisponível.

---

## Estrutura do projeto

```
prisma/
  schema.prisma        # Modelo de dados (usuários, clientes, projetos, tarefas, agenda, histórico)
  seed.ts               # Cria apenas o usuário administrador inicial
src/
  app/
    login/               # Tela de login (pública)
    (app)/                # Área autenticada (protegida pelo proxy/middleware)
      dashboard/
      clientes/
      projetos/
      agenda/
      usuarios/
      historico/
      conta/
      configuracoes/
    api/
      auth/[...nextauth]/ # Rotas do Auth.js
      cron/keep-alive/    # Endpoint de keep-alive do banco
  components/
    ui/                  # Componentes de interface (shadcn/ui)
    brand/               # Logo e identidade visual
    layout/              # Sidebar, header, menu do usuário
    shared/               # Componentes reutilizáveis (badges, empty state, confirmação, etc.)
    customers/ projects/ tasks/ notes/ calendar/ users/ history/
  lib/
    auth.ts               # Configuração do Auth.js
    authorization.ts       # Autorização server-side (sessão, permissões, redirecionamentos)
    access.ts              # Regras puras de permissão (compartilhadas com o cliente)
    permissions.ts         # Catálogo e descrições das permissões
    labels.ts              # Traduções e estilos dos enums (etapas, prioridades, status)
    validations/           # Schemas de validação (Zod) de cada formulário
  server/
    actions/               # Server Actions (mutações: criar, editar, excluir)
    queries/                # Consultas ao banco (Prisma) usadas pelas páginas
    record-history.ts       # Helper para registrar entradas no histórico
  middleware / proxy.ts     # Proteção de rotas (redireciona usuários não autenticados)
```

---

## Solução de problemas

**O banco não conecta / erro "Can't reach database server"**
Confirme se `DATABASE_URL` está correta e se o banco está acessível a
partir da máquina/ambiente atual (firewall, IP liberado, etc.). Em
provedores como o Neon, confirme se está usando a connection string
completa, com `sslmode=require`.

**Erro ao rodar migrations**
Verifique se `DIRECT_URL` aponta para uma conexão direta (sem pooler). Em
bancos com pgbouncer/pooler, migrations podem falhar se apontarem para a
URL "pooled".

**Variável de ambiente ausente**
O erro costuma indicar exatamente qual variável falta. Confira o `.env`
contra o `.env.example` — todas as variáveis marcadas como obrigatórias
precisam estar preenchidas.

**Seed não executado / usuário admin não existe**
Rode `npx prisma db seed` manualmente. Se o comando não for encontrado,
confirme que as dependências foram instaladas (`npm install`) — o seed
depende do pacote `tsx`.

**Login inicial não funciona**
Confirme que o seed foi executado com sucesso (ele imprime "Usuário
administrador pronto: admin@admin.com" no terminal). Verifique também se
não há espaços extras ao digitar o e-mail/senha.

**"Erro inesperado" ao salvar algo no sistema**
Normalmente indica um problema de conexão com o banco ou uma permissão
insuficiente do usuário logado para aquela ação. Veja os logs do servidor
(`npm run dev` no terminal, ou os logs da função na Vercel) para o detalhe
técnico.

---

## Credenciais iniciais

| Campo | Valor |
|---|---|
| E-mail | `admin@admin.com` |
| Senha | `root` |
| Perfil | Administrador |

**Altere essa senha assim que possível** pela tela **Minha conta**, e
utilize essa conta apenas para configurar os demais usuários do sistema.
