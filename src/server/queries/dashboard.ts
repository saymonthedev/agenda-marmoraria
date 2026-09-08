import "server-only"

import { Priority, Prisma, ProjectStage } from "@prisma/client"

import { projectVisibilityFilter, type SessionUser } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"

const ACTIVE_STAGES: ProjectStage[] = [
  ProjectStage.ORCAMENTO,
  ProjectStage.APROVADO,
  ProjectStage.MEDICAO,
  ProjectStage.CORTE,
  ProjectStage.ACABAMENTO,
  ProjectStage.INSTALACAO,
]

export async function getDashboardData(user: SessionUser) {
  const visibility = projectVisibilityFilter(user)
  const baseWhere: Prisma.ProjectWhereInput = { AND: [visibility, { active: true }] }
  const now = new Date()
  const soonLimit = new Date()
  soonLimit.setDate(soonLimit.getDate() + 5)

  const [
    inProgress,
    overdue,
    dueSoon,
    completedTotal,
    byStage,
    highPriority,
    pendingTasks,
    overdueTasks,
    recentHistory,
    latestProjects,
  ] = await Promise.all([
    prisma.project.count({ where: { AND: [baseWhere, { stage: { in: ACTIVE_STAGES } }] } }),
    prisma.project.count({
      where: {
        AND: [
          baseWhere,
          { stage: { in: ACTIVE_STAGES } },
          { deadline: { lt: now } },
        ],
      },
    }),
    prisma.project.count({
      where: {
        AND: [
          baseWhere,
          { stage: { in: ACTIVE_STAGES } },
          { deadline: { gte: now, lte: soonLimit } },
        ],
      },
    }),
    prisma.project.count({
      where: { AND: [visibility, { stage: ProjectStage.CONCLUIDO }] },
    }),
    prisma.project.groupBy({
      by: ["stage"],
      where: baseWhere,
      _count: { _all: true },
    }),
    prisma.project.findMany({
      where: {
        AND: [
          baseWhere,
          { stage: { in: ACTIVE_STAGES } },
          { priority: { in: [Priority.ALTA, Priority.URGENTE] } },
        ],
      },
      orderBy: [{ priority: "desc" }, { deadline: "asc" }],
      take: 6,
      include: {
        customer: { select: { name: true } },
        responsible: { select: { name: true } },
      },
    }),
    prisma.task.count({
      where: {
        status: { not: "CONCLUIDA" },
        project: { AND: [visibility, { active: true }] },
      },
    }),
    prisma.task.count({
      where: {
        status: { not: "CONCLUIDA" },
        deadline: { lt: now },
        project: { AND: [visibility, { active: true }] },
      },
    }),
    prisma.projectHistory.findMany({
      where: { project: visibility },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        user: { select: { name: true } },
        project: { select: { id: true, name: true } },
      },
    }),
    prisma.project.findMany({
      where: baseWhere,
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        customer: { select: { name: true } },
        responsible: { select: { name: true } },
      },
    }),
  ])

  const stageCounts = Object.fromEntries(
    byStage.map((entry) => [entry.stage, entry._count._all])
  ) as Partial<Record<ProjectStage, number>>

  return {
    inProgress,
    overdue,
    dueSoon,
    completedTotal,
    stageCounts,
    highPriority,
    pendingTasks,
    overdueTasks,
    recentHistory,
    latestProjects,
  }
}
