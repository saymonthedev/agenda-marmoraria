import {
  EventType,
  HistoryAction,
  Permission,
  Priority,
  ProjectStage,
  ProjectType,
  TaskStatus,
  UserRole,
  type PrismaClient,
} from "@prisma/client"
import { hash } from "bcryptjs"
import { randomBytes } from "node:crypto"

import { DEMO_ACCOUNTS } from "../../lib/demo"
import { PROJECT_STAGE_LABELS, PROJECT_STAGE_ORDER, PROJECT_TYPE_LABELS } from "../../lib/labels"

/**
 * Dados fictícios do modo demonstração. Clientes, obras, telefones e e-mails
 * são inventados (e-mails em example.com, domínio reservado para exemplos).
 * As datas são relativas ao dia em que o reset roda, para que o dashboard e a
 * agenda sempre tenham algo acontecendo "hoje" e "nesta semana".
 *
 * Usado pelo script `npm run db:seed:demo` e pela rotina diária quando
 * `DEMO_MODE=true`. Este arquivo usa imports relativos para rodar também fora
 * do Next (via tsx).
 */

const DAY = 24 * 60 * 60 * 1000

/** Meia-noite de hoje + `days`, no horário `hour:minute` (fuso do processo). */
function at(days: number, hour = 9, minute = 0) {
  const date = new Date()
  date.setHours(hour, minute, 0, 0)
  return new Date(date.getTime() + days * DAY)
}

type StaffKey = "admin" | "rafael" | "marcos" | "juliana"

const STAFF: Record<Exclude<StaffKey, "admin" | "rafael">, { name: string; email: string; permissions: Permission[] }> = {
  marcos: {
    name: "Marcos Vieira",
    email: "producao@example.com",
    permissions: [
      Permission.PROJECTS_VIEW_ALL,
      Permission.PROJECTS_EDIT,
      Permission.PROJECTS_CHANGE_STAGE,
      Permission.TASKS_MANAGE,
      Permission.AGENDA_MANAGE,
      Permission.HISTORY_VIEW,
    ],
  },
  juliana: {
    name: "Juliana Hornburg",
    email: "comercial@example.com",
    permissions: [
      Permission.PROJECTS_VIEW_ALL,
      Permission.PROJECTS_CREATE,
      Permission.PROJECTS_EDIT,
      Permission.CUSTOMERS_MANAGE,
      Permission.AGENDA_MANAGE,
      Permission.HISTORY_VIEW,
    ],
  },
}

const COLLABORATOR_PERMISSIONS: Permission[] = [
  Permission.PROJECTS_CHANGE_STAGE,
  Permission.TASKS_MANAGE,
  Permission.AGENDA_MANAGE,
  Permission.HISTORY_VIEW,
]

type CustomerKey =
  | "construtora"
  | "lessmann"
  | "incorporadora"
  | "bistro"
  | "clinica"
  | "petry"
  | "studio"
  | "weege"

const CUSTOMERS: Record<CustomerKey, { name: string; phone: string; email?: string; address: string; notes?: string }> = {
  construtora: {
    name: "Construtora Vale do Itapocu",
    phone: "(47) 3000-0101",
    email: "obras@example.com",
    address: "Rua das Indústrias, 800 - Vila Lalau, Jaraguá do Sul/SC",
    notes: "Cliente recorrente. Pede romaneio por pavimento e entrega em lotes.",
  },
  lessmann: {
    name: "Mariana e Diego Lessmann",
    phone: "(47) 99000-0102",
    email: "mariana.lessmann@example.com",
    address: "Rua das Araucárias, 120, ap. 802 - Centro, Jaraguá do Sul/SC",
    notes: "Prefere contato por WhatsApp no fim da tarde.",
  },
  incorporadora: {
    name: "Incorporadora Morro da Boa Vista",
    phone: "(47) 3000-0103",
    email: "suprimentos@example.com",
    address: "Av. dos Imigrantes, 1500 - Vila Nova, Jaraguá do Sul/SC",
  },
  bistro: {
    name: "Bistrô Trilha do Vale",
    phone: "(47) 99000-0104",
    address: "Rua do Comércio, 45 - Centro, Corupá/SC",
    notes: "Obra só pode acontecer de segunda, com o restaurante fechado.",
  },
  clinica: {
    name: "Clínica Bem Viver",
    phone: "(47) 3000-0105",
    email: "administrativo@example.com",
    address: "Rua das Hortênsias, 300 - Baependi, Jaraguá do Sul/SC",
  },
  petry: {
    name: "Família Petry",
    phone: "(47) 99000-0106",
    address: "Estrada Rio da Luz, km 4 - Rio da Luz, Jaraguá do Sul/SC",
    notes: "Sítio. Confirmar acesso do caminhão em dia de chuva.",
  },
  studio: {
    name: "Studio Linha Arquitetura",
    phone: "(47) 99000-0107",
    email: "projetos@example.com",
    address: "Rua Expedicionário, 210, sala 5 - Czerniewicz, Jaraguá do Sul/SC",
    notes: "Escritório parceiro. Manda os projetos em DWG com as cotas finais.",
  },
  weege: {
    name: "Paulo Henrique Weege",
    phone: "(47) 99000-0108",
    address: "Rua dos Ipês, 77 - Amizade, Guaramirim/SC",
  },
}

type TaskSeed = {
  title: string
  status: TaskStatus
  priority?: Priority
  deadline?: Date
  responsible?: StaffKey
  description?: string
}

type EventSeed = {
  title: string
  type: EventType
  start: Date
  hours?: number
  location?: string
  description?: string
}

type ProjectSeed = {
  name: string
  type: ProjectType
  customer: CustomerKey
  stage: ProjectStage
  priority: Priority
  deadline?: Date
  responsible?: StaffKey
  members?: StaffKey[]
  active?: boolean
  createdDaysAgo: number
  description: string
  tasks?: TaskSeed[]
  notes?: { author: StaffKey; daysAgo: number; content: string }[]
  events?: EventSeed[]
}

// Funções, e não constantes: as datas precisam ser calculadas na hora do reset,
// já com o fuso de Brasília aplicado, e não quando o módulo é carregado.
const buildProjects = (): ProjectSeed[] => [
  {
    name: "Bancada da cozinha - Apto 802",
    type: ProjectType.BANCADA_COZINHA,
    customer: "lessmann",
    stage: ProjectStage.CORTE,
    priority: Priority.ALTA,
    deadline: at(4),
    responsible: "rafael",
    createdDaysAgo: 21,
    description:
      "Bancada em L em quartzo branco com cuba esculpida, frontão de 10 cm e ilha com borda reta.",
    tasks: [
      { title: "Conferir gabarito da ilha", status: TaskStatus.CONCLUIDA, responsible: "rafael" },
      { title: "Cortar chapa de quartzo", status: TaskStatus.EM_ANDAMENTO, priority: Priority.ALTA, deadline: at(1), responsible: "rafael" },
      { title: "Esculpir cuba e furo da torneira", status: TaskStatus.PENDENTE, deadline: at(2), responsible: "marcos" },
    ],
    notes: [
      { author: "juliana", daysAgo: 12, content: "Cliente aprovou o quartzo branco na amostra. Torneira será de bica alta, furo de 35 mm." },
      { author: "rafael", daysAgo: 3, content: "Gabarito conferido no local. Parede tem 6 mm fora de esquadro, compensar no frontão." },
    ],
    events: [
      { title: "Instalação da bancada - Apto 802", type: EventType.INSTALACAO, start: at(4, 8), hours: 4, location: "Rua das Araucárias, 120 - Centro" },
    ],
  },
  {
    name: "Soleiras e peitoris - Residencial Bloco B",
    type: ProjectType.SOLEIRA,
    customer: "construtora",
    stage: ProjectStage.ACABAMENTO,
    priority: Priority.MEDIA,
    deadline: at(9),
    responsible: "marcos",
    createdDaysAgo: 35,
    description: "48 soleiras e 32 peitoris em granito cinza andorinha, polidos e com pingadeira.",
    tasks: [
      { title: "Polir lote do 1º ao 4º andar", status: TaskStatus.CONCLUIDA, responsible: "marcos" },
      { title: "Polir lote do 5º ao 8º andar", status: TaskStatus.EM_ANDAMENTO, deadline: at(3), responsible: "marcos" },
      { title: "Separar romaneio por pavimento", status: TaskStatus.PENDENTE, deadline: at(7), responsible: "juliana" },
    ],
    events: [
      { title: "Entrega do 1º lote de soleiras", type: EventType.ENTREGA, start: at(1, 7, 30), hours: 2, location: "Rua das Indústrias, 800 - Vila Lalau" },
    ],
  },
  {
    name: "Escada em granito - Sobrado Weege",
    type: ProjectType.ESCADA,
    customer: "weege",
    stage: ProjectStage.MEDICAO,
    priority: Priority.MEDIA,
    deadline: at(18),
    responsible: "rafael",
    createdDaysAgo: 9,
    description: "Escada em U com 17 degraus e patamar em granito preto São Gabriel escovado.",
    tasks: [
      { title: "Medir degraus e patamar", status: TaskStatus.PENDENTE, deadline: at(0), responsible: "rafael" },
      { title: "Enviar desenho para aprovação", status: TaskStatus.PENDENTE, deadline: at(3), responsible: "juliana" },
    ],
    events: [
      { title: "Medição da escada - Sobrado Weege", type: EventType.MEDICAO, start: at(0, 14), hours: 2, location: "Rua dos Ipês, 77 - Amizade, Guaramirim" },
    ],
  },
  {
    name: "Área gourmet com churrasqueira",
    type: ProjectType.AREA_GOURMET,
    customer: "petry",
    stage: ProjectStage.APROVADO,
    priority: Priority.ALTA,
    deadline: at(25),
    responsible: "marcos",
    members: ["rafael"],
    createdDaysAgo: 14,
    description: "Bancada de 3,2 m em granito verde ubatuba, revestimento da churrasqueira e pia com cuba inox.",
    tasks: [
      { title: "Agendar medição no sítio", status: TaskStatus.CONCLUIDA, responsible: "juliana" },
      { title: "Reservar chapa de verde ubatuba", status: TaskStatus.PENDENTE, priority: Priority.ALTA, deadline: at(2), responsible: "marcos" },
    ],
    notes: [{ author: "juliana", daysAgo: 2, content: "Orçamento aprovado com 50% de entrada. Restante na instalação." }],
    events: [
      { title: "Medição - área gourmet Petry", type: EventType.MEDICAO, start: at(2, 9), hours: 3, location: "Estrada Rio da Luz, km 4" },
    ],
  },
  {
    name: "Lavabos da recepção",
    type: ProjectType.LAVABO,
    customer: "clinica",
    stage: ProjectStage.INSTALACAO,
    priority: Priority.URGENTE,
    deadline: at(1),
    responsible: "rafael",
    createdDaysAgo: 28,
    description: "Dois lavabos suspensos em mármore travertino com cuba esculpida e saia de 15 cm.",
    tasks: [
      { title: "Fixar suportes ocultos", status: TaskStatus.CONCLUIDA, responsible: "rafael" },
      { title: "Instalar tampos e rejuntar", status: TaskStatus.EM_ANDAMENTO, priority: Priority.URGENTE, deadline: at(1), responsible: "rafael" },
      { title: "Impermeabilizar travertino", status: TaskStatus.PENDENTE, deadline: at(1), responsible: "marcos" },
    ],
    events: [
      { title: "Instalação dos lavabos - Clínica Bem Viver", type: EventType.INSTALACAO, start: at(1, 13, 30), hours: 3, location: "Rua das Hortênsias, 300 - Baependi" },
    ],
  },
  {
    name: "Bancadas dos banheiros - Torre Norte",
    type: ProjectType.BANHEIRO,
    customer: "incorporadora",
    stage: ProjectStage.ORCAMENTO,
    priority: Priority.MEDIA,
    deadline: at(40),
    responsible: "juliana",
    createdDaysAgo: 4,
    description: "Orçamento de 64 bancadas de banheiro em granito branco itaúnas, com e sem rodabanca.",
    tasks: [
      { title: "Levantar quantitativo pelo projeto", status: TaskStatus.EM_ANDAMENTO, deadline: at(2), responsible: "juliana" },
      { title: "Cotar chapas com dois fornecedores", status: TaskStatus.PENDENTE, deadline: at(5), responsible: "juliana" },
    ],
    events: [
      { title: "Visita técnica - Torre Norte", type: EventType.VISITA, start: at(3, 10), hours: 1, location: "Av. dos Imigrantes, 1500 - Vila Nova" },
    ],
  },
  {
    name: "Balcão do bar",
    type: ProjectType.PERSONALIZADO,
    customer: "bistro",
    stage: ProjectStage.CORTE,
    priority: Priority.ALTA,
    deadline: at(-2),
    responsible: "marcos",
    createdDaysAgo: 24,
    description: "Balcão de 4 m em granito preto absoluto flameado, com recorte para chopeira.",
    tasks: [
      { title: "Cortar tampo em duas peças", status: TaskStatus.EM_ANDAMENTO, priority: Priority.ALTA, deadline: at(-1), responsible: "marcos" },
      { title: "Fazer recorte da chopeira", status: TaskStatus.PENDENTE, deadline: at(1), responsible: "marcos" },
    ],
    notes: [{ author: "marcos", daysAgo: 1, content: "Atrasou porque a chapa chegou com uma fissura. Fornecedor trocou, corte retomado hoje." }],
  },
  {
    name: "Nichos e prateleiras - Showroom",
    type: ProjectType.NICHO,
    customer: "studio",
    stage: ProjectStage.APROVADO,
    priority: Priority.BAIXA,
    deadline: at(30),
    createdDaysAgo: 6,
    description: "Seis nichos e quatro prateleiras em mármore Carrara para o showroom do escritório.",
    tasks: [{ title: "Receber DWG com cotas finais", status: TaskStatus.PENDENTE, deadline: at(4), responsible: "juliana" }],
  },
  {
    name: "Bancada do banheiro da suíte",
    type: ProjectType.BANHEIRO,
    customer: "lessmann",
    stage: ProjectStage.CONCLUIDO,
    priority: Priority.MEDIA,
    deadline: at(-12),
    responsible: "rafael",
    createdDaysAgo: 45,
    description: "Bancada em quartzo cinza com cuba de apoio e nicho no box.",
    tasks: [
      { title: "Instalar bancada", status: TaskStatus.CONCLUIDA, responsible: "rafael" },
      { title: "Entregar termo de garantia", status: TaskStatus.CONCLUIDA, responsible: "juliana" },
    ],
  },
  {
    name: "Peitoris - Casa modelo",
    type: ProjectType.PEITORIL,
    customer: "construtora",
    stage: ProjectStage.CONCLUIDO,
    priority: Priority.BAIXA,
    deadline: at(-20),
    responsible: "marcos",
    createdDaysAgo: 52,
    description: "Dez peitoris em granito cinza corumbá para a casa modelo do loteamento.",
  },
  {
    name: "Churrasqueira pré-moldada revestida",
    type: ProjectType.CHURRASQUEIRA,
    customer: "weege",
    stage: ProjectStage.CANCELADO,
    priority: Priority.BAIXA,
    createdDaysAgo: 30,
    active: false,
    description: "Revestimento em granito da churrasqueira. Cliente desistiu e vai fazer só a escada.",
  },
]

const buildGeneralEvents = (): EventSeed[] => [
  { title: "Recebimento de chapas - fornecedor", type: EventType.ENTREGA, start: at(0, 8), hours: 1, location: "Pátio da marmoraria", description: "Conferir espessura e lote das chapas de granito." },
  { title: "Reunião de produção da semana", type: EventType.OUTRO, start: at(5, 7, 30), hours: 1, location: "Escritório" },
  { title: "Manutenção da ponte rolante", type: EventType.OUTRO, start: at(8, 13), hours: 4, description: "Produção sem corte de chapas grandes nesse período." },
]

function stagePath(stage: ProjectStage): ProjectStage[] {
  if (stage === ProjectStage.CANCELADO) return [ProjectStage.ORCAMENTO, ProjectStage.CANCELADO]
  return PROJECT_STAGE_ORDER.slice(0, PROJECT_STAGE_ORDER.indexOf(stage) + 1)
}

/** Apaga tudo e recria o cenário de demonstração. */
export async function resetDemoData(prisma: PrismaClient) {
  await prisma.$transaction([
    prisma.projectHistory.deleteMany(),
    prisma.calendarEvent.deleteMany(),
    prisma.projectNote.deleteMany(),
    prisma.task.deleteMany(),
    prisma.projectMember.deleteMany(),
    prisma.project.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.loginAttempt.deleteMany(),
    prisma.user.deleteMany(),
    prisma.settings.deleteMany(),
  ])

  await prisma.settings.create({
    data: {
      dueSoonDays: 5,
      companyName: "Stainhaus Marmoraria",
      companyPhone: "(47) 3370-0180",
      companyAddress: "Jaraguá do Sul/SC",
    },
  })

  const [adminAccount, collaboratorAccount] = DEMO_ACCOUNTS
  const users = {} as Record<StaffKey, { id: string; name: string }>

  users.admin = await prisma.user.create({
    data: {
      name: adminAccount.name,
      email: adminAccount.email,
      passwordHash: await hash(adminAccount.password, 10),
      role: UserRole.ADMIN,
      permissions: [],
    },
  })
  users.rafael = await prisma.user.create({
    data: {
      name: collaboratorAccount.name,
      email: collaboratorAccount.email,
      passwordHash: await hash(collaboratorAccount.password, 10),
      role: UserRole.COLLABORATOR,
      permissions: COLLABORATOR_PERMISSIONS,
      createdById: users.admin.id,
    },
  })
  for (const key of ["marcos", "juliana"] as const) {
    const staff = STAFF[key]
    // Contas da equipe fictícia: existem para dar nome aos responsáveis, mas
    // ninguém entra com elas (a senha é aleatória e descartada).
    users[key] = await prisma.user.create({
      data: {
        name: staff.name,
        email: staff.email,
        passwordHash: await hash(randomBytes(24).toString("base64url"), 10),
        role: UserRole.COLLABORATOR,
        permissions: staff.permissions,
        createdById: users.admin.id,
      },
    })
  }

  const customers = {} as Record<CustomerKey, string>
  for (const [key, customer] of Object.entries(CUSTOMERS) as [CustomerKey, (typeof CUSTOMERS)[CustomerKey]][]) {
    const created = await prisma.customer.create({ data: customer })
    customers[key] = created.id
  }

  for (const seed of buildProjects()) {
    const createdAt = at(-seed.createdDaysAgo, 10)
    const project = await prisma.project.create({
      data: {
        name: seed.name,
        type: seed.type,
        description: seed.description,
        stage: seed.stage,
        priority: seed.priority,
        deadline: seed.deadline,
        active: seed.active ?? true,
        customerId: customers[seed.customer],
        responsibleId: seed.responsible ? users[seed.responsible].id : undefined,
        createdById: users.juliana.id,
        createdAt,
        members: seed.members
          ? { create: seed.members.map((member) => ({ userId: users[member].id })) }
          : undefined,
      },
    })

    // Histórico coerente com a etapa atual: criação e cada mudança de etapa,
    // espalhadas entre a criação do projeto e hoje.
    const path = stagePath(seed.stage)
    const span = seed.createdDaysAgo * DAY
    const history: { action: HistoryAction; description: string; createdAt: Date; userId: string }[] = [
      {
        action: HistoryAction.PROJETO_CRIADO,
        description: `Projeto "${seed.name}" (${PROJECT_TYPE_LABELS[seed.type]}) criado.`,
        createdAt,
        userId: users.juliana.id,
      },
    ]
    path.slice(1).forEach((stage, index) => {
      const previous = path[index]
      const action =
        stage === ProjectStage.CONCLUIDO
          ? HistoryAction.PROJETO_CONCLUIDO
          : stage === ProjectStage.CANCELADO
            ? HistoryAction.PROJETO_CANCELADO
            : HistoryAction.ETAPA_ALTERADA
      history.push({
        action,
        description: `Etapa alterada de "${PROJECT_STAGE_LABELS[previous]}" para "${PROJECT_STAGE_LABELS[stage]}".`,
        createdAt: new Date(createdAt.getTime() + (span * (index + 1)) / path.length),
        userId: (index % 2 === 0 ? users.marcos : users.rafael).id,
      })
    })

    for (const task of seed.tasks ?? []) {
      const completed = task.status === TaskStatus.CONCLUIDA
      const completedAt = completed ? new Date(Date.now() - 2 * DAY) : undefined
      await prisma.task.create({
        data: {
          projectId: project.id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority ?? Priority.MEDIA,
          deadline: task.deadline,
          completedAt,
          responsibleId: task.responsible ? users[task.responsible].id : undefined,
        },
      })
      history.push({
        action: completed ? HistoryAction.TAREFA_CONCLUIDA : HistoryAction.TAREFA_CRIADA,
        description: completed ? `Tarefa "${task.title}" concluída.` : `Tarefa "${task.title}" criada.`,
        createdAt: completedAt ?? new Date(Date.now() - DAY),
        userId: users[task.responsible ?? "juliana"].id,
      })
    }

    for (const note of seed.notes ?? []) {
      const noteDate = at(-note.daysAgo, 16)
      await prisma.projectNote.create({
        data: { projectId: project.id, authorId: users[note.author].id, content: note.content, createdAt: noteDate },
      })
      history.push({
        action: HistoryAction.OBSERVACAO_ADICIONADA,
        description: "Nova observação adicionada ao projeto.",
        createdAt: noteDate,
        userId: users[note.author].id,
      })
    }

    for (const event of seed.events ?? []) {
      await prisma.calendarEvent.create({
        data: {
          title: event.title,
          type: event.type,
          location: event.location,
          description: event.description,
          startAt: event.start,
          endAt: new Date(event.start.getTime() + (event.hours ?? 1) * 60 * 60 * 1000),
          projectId: project.id,
          createdById: users.juliana.id,
        },
      })
      history.push({
        action: HistoryAction.EVENTO_AGENDADO,
        description: `Evento "${event.title}" agendado na agenda.`,
        createdAt: new Date(Math.min(Date.now() - 60 * 60 * 1000, event.start.getTime() - 3 * DAY)),
        userId: users.juliana.id,
      })
    }

    await prisma.projectHistory.createMany({
      data: history.map((entry) => ({ ...entry, projectId: project.id })),
    })
  }

  for (const event of buildGeneralEvents()) {
    await prisma.calendarEvent.create({
      data: {
        title: event.title,
        type: event.type,
        location: event.location,
        description: event.description,
        startAt: event.start,
        endAt: new Date(event.start.getTime() + (event.hours ?? 1) * 60 * 60 * 1000),
        createdById: users.admin.id,
      },
    })
  }
}
