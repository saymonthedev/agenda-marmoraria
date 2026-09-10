"use server"

import { HistoryAction, Permission, ProjectStage } from "@prisma/client"
import { revalidatePath } from "next/cache"

import { fail, ok, toActionError, type ActionResult } from "@/lib/action-result"
import { assertAdmin, assertPermission, requireUser } from "@/lib/authorization"
import { formatDate } from "@/lib/dates"
import {
  PRIORITY_LABELS,
  PROJECT_STAGE_LABELS,
  PROJECT_TYPE_LABELS,
} from "@/lib/labels"
import { prisma } from "@/lib/prisma"
import { emptyToUndefined } from "@/lib/utils"
import {
  projectDeadlineSchema,
  projectPrioritySchema,
  projectResponsibleSchema,
  projectSchema,
  projectStageSchema,
} from "@/lib/validations/project"
import { canUserAccessProject } from "@/server/queries/projects"
import { recordHistory } from "@/server/record-history"

function revalidateProject(id: string) {
  revalidatePath("/projetos")
  revalidatePath("/dashboard")
  revalidatePath(`/projetos/${id}`)
}

export async function createProject(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser()
    assertPermission(user, Permission.PROJECTS_CREATE)

    const data = projectSchema.parse(input)

    const project = await prisma.$transaction(async (tx) => {
      const created = await tx.project.create({
        data: {
          name: data.name,
          type: data.type,
          description: emptyToUndefined(data.description),
          customerId: data.customerId,
          responsibleId: emptyToUndefined(data.responsibleId),
          priority: data.priority,
          deadline: data.deadline ? new Date(data.deadline) : undefined,
          createdById: user.id,
          members: data.memberIds?.length
            ? { create: data.memberIds.map((userId) => ({ userId })) }
            : undefined,
        },
      })

      await recordHistory(tx, {
        projectId: created.id,
        userId: user.id,
        action: HistoryAction.PROJETO_CRIADO,
        description: `Projeto "${created.name}" (${PROJECT_TYPE_LABELS[created.type]}) criado.`,
      })

      return created
    })

    revalidateProject(project.id)
    return ok({ id: project.id })
  } catch (error) {
    return toActionError(error)
  }
}

export async function updateProject(
  projectId: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser()
    assertPermission(user, Permission.PROJECTS_EDIT)

    const canAccess = await canUserAccessProject(user, projectId)
    if (!canAccess) return fail("Você não tem acesso a este projeto.")

    const data = projectSchema.parse(input)

    await prisma.$transaction(async (tx) => {
      await tx.project.update({
        where: { id: projectId },
        data: {
          name: data.name,
          type: data.type,
          description: emptyToUndefined(data.description),
          customerId: data.customerId,
          responsibleId: emptyToUndefined(data.responsibleId) ?? null,
          priority: data.priority,
          deadline: data.deadline ? new Date(data.deadline) : null,
        },
      })

      if (data.memberIds) {
        await tx.projectMember.deleteMany({ where: { projectId } })
        if (data.memberIds.length) {
          await tx.projectMember.createMany({
            data: data.memberIds.map((userId) => ({ projectId, userId })),
            skipDuplicates: true,
          })
        }
      }

      await recordHistory(tx, {
        projectId,
        userId: user.id,
        action: HistoryAction.PROJETO_ATUALIZADO,
        description: "Informações do projeto atualizadas.",
      })
    })

    revalidateProject(projectId)
    return ok({ id: projectId })
  } catch (error) {
    return toActionError(error)
  }
}

export async function changeProjectStage(input: unknown): Promise<ActionResult<undefined>> {
  try {
    const user = await requireUser()
    assertPermission(user, Permission.PROJECTS_CHANGE_STAGE)

    const { projectId, stage } = projectStageSchema.parse(input)

    const canAccess = await canUserAccessProject(user, projectId)
    if (!canAccess) return fail("Você não tem acesso a este projeto.")

    const current = await prisma.project.findUniqueOrThrow({
      where: { id: projectId },
      select: { stage: true, name: true },
    })

    if (current.stage === stage) return ok(undefined)

    await prisma.$transaction(async (tx) => {
      await tx.project.update({ where: { id: projectId }, data: { stage } })

      const action =
        stage === ProjectStage.CONCLUIDO
          ? HistoryAction.PROJETO_CONCLUIDO
          : stage === ProjectStage.CANCELADO
            ? HistoryAction.PROJETO_CANCELADO
            : HistoryAction.ETAPA_ALTERADA

      await recordHistory(tx, {
        projectId,
        userId: user.id,
        action,
        description: `Etapa alterada de "${PROJECT_STAGE_LABELS[current.stage]}" para "${PROJECT_STAGE_LABELS[stage]}".`,
      })
    })

    revalidateProject(projectId)
    return ok(undefined)
  } catch (error) {
    return toActionError(error)
  }
}

export async function changeProjectPriority(input: unknown): Promise<ActionResult<undefined>> {
  try {
    const user = await requireUser()
    assertPermission(user, Permission.PROJECTS_EDIT)

    const { projectId, priority } = projectPrioritySchema.parse(input)

    const canAccess = await canUserAccessProject(user, projectId)
    if (!canAccess) return fail("Você não tem acesso a este projeto.")

    const current = await prisma.project.findUniqueOrThrow({
      where: { id: projectId },
      select: { priority: true },
    })

    if (current.priority === priority) return ok(undefined)

    await prisma.$transaction(async (tx) => {
      await tx.project.update({ where: { id: projectId }, data: { priority } })
      await recordHistory(tx, {
        projectId,
        userId: user.id,
        action: HistoryAction.PRIORIDADE_ALTERADA,
        description: `Prioridade alterada de "${PRIORITY_LABELS[current.priority]}" para "${PRIORITY_LABELS[priority]}".`,
      })
    })

    revalidateProject(projectId)
    return ok(undefined)
  } catch (error) {
    return toActionError(error)
  }
}

export async function changeProjectResponsible(input: unknown): Promise<ActionResult<undefined>> {
  try {
    const user = await requireUser()
    assertPermission(user, Permission.PROJECTS_EDIT)

    const { projectId, responsibleId } = projectResponsibleSchema.parse(input)

    const canAccess = await canUserAccessProject(user, projectId)
    if (!canAccess) return fail("Você não tem acesso a este projeto.")

    const [current, nextResponsible] = await Promise.all([
      prisma.project.findUniqueOrThrow({
        where: { id: projectId },
        include: { responsible: { select: { name: true } } },
      }),
      responsibleId
        ? prisma.user.findUnique({ where: { id: responsibleId }, select: { name: true } })
        : Promise.resolve(null),
    ])

    await prisma.$transaction(async (tx) => {
      await tx.project.update({ where: { id: projectId }, data: { responsibleId } })
      await recordHistory(tx, {
        projectId,
        userId: user.id,
        action: HistoryAction.RESPONSAVEL_ALTERADO,
        description: `Responsável alterado de "${current.responsible?.name ?? "Nenhum"}" para "${nextResponsible?.name ?? "Nenhum"}".`,
      })
    })

    revalidateProject(projectId)
    return ok(undefined)
  } catch (error) {
    return toActionError(error)
  }
}

export async function changeProjectDeadline(input: unknown): Promise<ActionResult<undefined>> {
  try {
    const user = await requireUser()
    assertPermission(user, Permission.PROJECTS_EDIT)

    const { projectId, deadline } = projectDeadlineSchema.parse(input)

    const canAccess = await canUserAccessProject(user, projectId)
    if (!canAccess) return fail("Você não tem acesso a este projeto.")

    await prisma.$transaction(async (tx) => {
      await tx.project.update({
        where: { id: projectId },
        data: { deadline: deadline ? new Date(deadline) : null },
      })
      await recordHistory(tx, {
        projectId,
        userId: user.id,
        action: HistoryAction.PRAZO_ALTERADO,
        description: deadline
          ? `Prazo definido para ${formatDate(deadline)}.`
          : "Prazo removido do projeto.",
      })
    })

    revalidateProject(projectId)
    return ok(undefined)
  } catch (error) {
    return toActionError(error)
  }
}

export async function toggleProjectActive(
  projectId: string,
  active: boolean
): Promise<ActionResult<undefined>> {
  try {
    const user = await requireUser()
    assertPermission(user, Permission.PROJECTS_DELETE)

    const canAccess = await canUserAccessProject(user, projectId)
    if (!canAccess) return fail("Você não tem acesso a este projeto.")

    await prisma.$transaction(async (tx) => {
      await tx.project.update({ where: { id: projectId }, data: { active } })
      await recordHistory(tx, {
        projectId,
        userId: user.id,
        action: active ? HistoryAction.PROJETO_REATIVADO : HistoryAction.PROJETO_EXCLUIDO,
        description: active
          ? "Projeto reativado."
          : "Projeto desativado (removido das listagens ativas).",
      })
    })

    revalidateProject(projectId)
    return ok(undefined)
  } catch (error) {
    return toActionError(error)
  }
}

export async function deleteProjectPermanently(projectId: string): Promise<ActionResult<undefined>> {
  try {
    const user = await requireUser()
    assertAdmin(user)

    await prisma.project.delete({ where: { id: projectId } })

    revalidatePath("/projetos")
    revalidatePath("/kanban")
    revalidatePath("/dashboard")
    return ok(undefined)
  } catch (error) {
    return toActionError(error)
  }
}
