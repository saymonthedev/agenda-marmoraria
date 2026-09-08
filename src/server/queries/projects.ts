import "server-only"

import { Priority, Prisma, ProjectStage } from "@prisma/client"

import { canViewAllProjects, projectVisibilityFilter, type SessionUser } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"

export type ProjectFilters = {
  search?: string
  stage?: ProjectStage
  priority?: Priority
  responsibleId?: string
  customerId?: string
  includeInactive?: boolean
}

function buildWhere(user: SessionUser, filters: ProjectFilters): Prisma.ProjectWhereInput {
  const visibility = projectVisibilityFilter(user)

  const conditions: Prisma.ProjectWhereInput[] = [visibility]

  if (!filters.includeInactive) {
    conditions.push({ active: true })
  }

  if (filters.search) {
    conditions.push({
      OR: [
        { name: { contains: filters.search, mode: "insensitive" } },
        { customer: { name: { contains: filters.search, mode: "insensitive" } } },
      ],
    })
  }

  if (filters.stage) conditions.push({ stage: filters.stage })
  if (filters.priority) conditions.push({ priority: filters.priority })
  if (filters.responsibleId) conditions.push({ responsibleId: filters.responsibleId })
  if (filters.customerId) conditions.push({ customerId: filters.customerId })

  return { AND: conditions }
}

const projectListInclude = {
  customer: { select: { id: true, name: true } },
  responsible: { select: { id: true, name: true } },
  _count: { select: { tasks: true } },
} satisfies Prisma.ProjectInclude

export async function listProjects(user: SessionUser, filters: ProjectFilters = {}) {
  return prisma.project.findMany({
    where: buildWhere(user, filters),
    include: projectListInclude,
    orderBy: [{ deadline: "asc" }, { createdAt: "desc" }],
  })
}

export async function listProjectsForKanban(user: SessionUser, filters: ProjectFilters = {}) {
  return prisma.project.findMany({
    where: {
      AND: [
        buildWhere(user, { ...filters, includeInactive: false }),
        { stage: { not: ProjectStage.CANCELADO } },
      ],
    },
    include: projectListInclude,
    orderBy: [{ priority: "desc" }, { deadline: "asc" }],
  })
}

export async function getProjectById(user: SessionUser, id: string) {
  const project = await prisma.project.findFirst({
    where: { id, ...buildWhere(user, { includeInactive: true }) },
    include: {
      customer: true,
      responsible: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true } },
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      tasks: {
        orderBy: [{ status: "asc" }, { deadline: "asc" }],
        include: { responsible: { select: { id: true, name: true } } },
      },
      notes: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { id: true, name: true } } },
      },
      history: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, name: true } } },
        take: 50,
      },
      events: {
        orderBy: { startAt: "asc" },
      },
    },
  })

  return project
}

export async function canUserAccessProject(user: SessionUser, projectId: string) {
  if (canViewAllProjects(user)) return true

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [{ responsibleId: user.id }, { members: { some: { userId: user.id } } }],
    },
    select: { id: true },
  })

  return !!project
}

export async function listResponsibleCandidates() {
  return prisma.user.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, role: true },
  })
}
