# Manual de uso

Guia para quem opera o sistema no dia a dia, sem precisar entender de
programação. Para instalar e configurar, veja o [README](../README.md).

## Telas

A navegação principal fica na barra lateral (no celular, ela vira um menu
que abre pelo ícone de "hambúrguer" no topo).

### Login (`/login`)

Tela de entrada do sistema. Pede e-mail e senha, com opção de mostrar/ocultar
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
administrador pronto" e, se você não definiu `SEED_ADMIN_PASSWORD`, a senha
gerada). Se perdeu a senha gerada, peça a outro administrador para
redefini-la em **Usuários** ou, sem outro administrador, apague o usuário
pelo Prisma Studio e rode o seed de novo.

**"Erro inesperado" ao salvar algo no sistema**
Normalmente indica um problema de conexão com o banco ou uma permissão
insuficiente do usuário logado para aquela ação. Veja os logs do servidor
(`npm run dev` no terminal, ou os logs da função na Vercel) para o detalhe
técnico.
