import {
  EventType,
  HistoryAction,
  Permission,
  PrismaClient,
  Priority,
  ProjectStage,
  ProjectType,
  TaskStatus,
  UserRole,
} from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

const ADMIN_EMAIL = "admin@admin.com"
const ADMIN_PASSWORD = "root"

async function seedAdmin() {
  const passwordHash = await hash(ADMIN_PASSWORD, 12)

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      name: "Administrador",
      email: ADMIN_EMAIL,
      passwordHash,
      role: UserRole.ADMIN,
      permissions: [],
      active: true,
    },
  })

  console.log(`Usuário administrador pronto: ${admin.email}`)
  return admin
}

async function seedDemoData(adminId: string) {
  const existingCustomers = await prisma.customer.count()
  if (existingCustomers > 0) {
    console.log("Dados demonstrativos já existem, seed de exemplo ignorado.")
    return
  }

  const collaborator = await prisma.user.upsert({
    where: { email: "producao@lithos.com.br" },
    update: {},
    create: {
      name: "Carlos Medeiros",
      email: "producao@lithos.com.br",
      passwordHash: await hash("colaborador123", 12),
      role: UserRole.COLLABORATOR,
      permissions: [
        Permission.PROJECTS_VIEW_ALL,
        Permission.TASKS_MANAGE,
        Permission.PROJECTS_CHANGE_STAGE,
        Permission.AGENDA_MANAGE,
      ],
      active: true,
      createdById: adminId,
    },
  })

  const customerAna = await prisma.customer.create({
    data: {
      name: "Ana Beatriz Ferreira",
      phone: "(11) 98765-4321",
      email: "ana.ferreira@email.com",
      address: "Rua das Palmeiras, 245 - Jardim Europa, São Paulo/SP",
      notes: "Prefere contato por WhatsApp. Reforma completa de apartamento.",
    },
  })

  const customerConstrutora = await prisma.customer.create({
    data: {
      name: "Construtora Horizonte Ltda.",
      phone: "(11) 3344-5566",
      email: "obras@horizonte.com.br",
      address: "Av. Engenheiro Luís Carlos Berrini, 1200 - São Paulo/SP",
      notes: "Cliente recorrente. Obras em condomínios residenciais.",
    },
  })

  const project1 = await prisma.project.create({
    data: {
      name: "Bancada de cozinha - Cobertura Jardim Europa",
      type: ProjectType.BANCADA_COZINHA,
      description:
        "Bancada em granito Branco Siena com cuba dupla esculpida e acabamento boleado.",
      stage: ProjectStage.CORTE,
      priority: Priority.ALTA,
      deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      customerId: customerAna.id,
      responsibleId: collaborator.id,
      createdById: adminId,
    },
  })

  const project2 = await prisma.project.create({
    data: {
      name: "Soleiras e peitoris - Edifício Horizonte Bloco B",
      type: ProjectType.SOLEIRA,
      description: "Fornecimento e instalação de soleiras e peitoris em granito cinza corumbá.",
      stage: ProjectStage.ORCAMENTO,
      priority: Priority.MEDIA,
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      customerId: customerConstrutora.id,
      createdById: adminId,
    },
  })

  const project3 = await prisma.project.create({
    data: {
      name: "Banheiro social - Residência Ana Beatriz",
      type: ProjectType.BANHEIRO,
      description: "Revestimento de bancada e box em mármore travertino.",
      stage: ProjectStage.CONCLUIDO,
      priority: Priority.MEDIA,
      deadline: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      customerId: customerAna.id,
      responsibleId: collaborator.id,
      createdById: adminId,
    },
  })

  await prisma.projectMember.create({
    data: { projectId: project1.id, userId: collaborator.id },
  })

  await prisma.task.createMany({
    data: [
      {
        projectId: project1.id,
        title: "Confirmar medidas finais no local",
        description: "Revisar medidas antes de liberar o corte definitivo.",
        status: TaskStatus.CONCLUIDA,
        priority: Priority.ALTA,
        responsibleId: collaborator.id,
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        projectId: project1.id,
        title: "Realizar corte da chapa",
        status: TaskStatus.EM_ANDAMENTO,
        priority: Priority.ALTA,
        responsibleId: collaborator.id,
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
      {
        projectId: project1.id,
        title: "Agendar instalação com o cliente",
        status: TaskStatus.PENDENTE,
        priority: Priority.MEDIA,
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
      {
        projectId: project2.id,
        title: "Elaborar orçamento detalhado",
        status: TaskStatus.PENDENTE,
        priority: Priority.MEDIA,
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    ],
  })

  await prisma.projectNote.create({
    data: {
      projectId: project1.id,
      authorId: collaborator.id,
      content: "Cliente solicitou reforço na área da cuba devido ao peso do sistema hidráulico.",
    },
  })

  await prisma.projectHistory.createMany({
    data: [
      {
        projectId: project1.id,
        userId: adminId,
        action: HistoryAction.PROJETO_CRIADO,
        description: "Projeto criado a partir do orçamento aprovado pelo cliente.",
      },
      {
        projectId: project1.id,
        userId: adminId,
        action: HistoryAction.ETAPA_ALTERADA,
        description: "Etapa alterada de Medição para Corte.",
      },
      {
        projectId: project2.id,
        userId: adminId,
        action: HistoryAction.PROJETO_CRIADO,
        description: "Projeto criado para atender pedido da Construtora Horizonte.",
      },
      {
        projectId: project3.id,
        userId: adminId,
        action: HistoryAction.PROJETO_CONCLUIDO,
        description: "Instalação finalizada e aprovada pela cliente.",
      },
    ],
  })

  const measurementDate = new Date()
  measurementDate.setDate(measurementDate.getDate() + 2)
  measurementDate.setHours(9, 0, 0, 0)

  const installationDate = new Date()
  installationDate.setDate(installationDate.getDate() + 5)
  installationDate.setHours(14, 0, 0, 0)

  await prisma.calendarEvent.createMany({
    data: [
      {
        title: "Medição - Edifício Horizonte Bloco B",
        type: EventType.MEDICAO,
        location: "Av. Engenheiro Luís Carlos Berrini, 1200",
        startAt: measurementDate,
        projectId: project2.id,
        createdById: adminId,
      },
      {
        title: "Instalação da bancada - Ana Beatriz",
        type: EventType.INSTALACAO,
        location: "Rua das Palmeiras, 245",
        startAt: installationDate,
        projectId: project1.id,
        createdById: adminId,
      },
    ],
  })

  console.log("Dados demonstrativos criados com sucesso.")
}

async function main() {
  const admin = await seedAdmin()
  await seedDemoData(admin.id)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
