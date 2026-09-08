"use server"

import { HistoryAction, Permission, TaskStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"

import { fail, ok, toActionError, type ActionResult } from "@/lib/action-result"
import { assertPermission, requireUser } from "@/lib/authorization"
import { TASK_STATUS_LABELS } from "@/lib/labels"
import { prisma } from "@/lib/prisma"
import { emptyToUndefined } from "@/lib/utils"
import { taskSchema, taskStatusSchema } from "@/lib/validations/task"
import { canUserAccessProject } from "@/server/queries/projects"
import { recordHistory } from "@/server/record-history"

function revalidateProject(projectId: string) {
  revalidatePath(`/projetos/${projectId}`)
  revalidatePath("/dashboard")
}

export async function createTask(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser()
    assertPermission(user, Permission.TASKS_MANAGE)

    const data = taskSchema.parse(input)

    const canAccess = await canUserAccessProject(user, data.projectId)
    if (!canAccess) return fail("Você não tem acesso a este projeto.")

    const task = await prisma.$transaction(async (tx) => {
      const created = await tx.task.create({
        data: {
          projectId: data.projectId,
          title: data.title,
          description: emptyToUndefined(data.description),
          responsibleId: emptyToUndefined(data.responsibleId),
          priority: data.priority,
          deadline: data.deadline ? new Date(data.deadline) : undefined,
        },
      })

      await recordHistory(tx, {
        projectId: data.projectId,
        userId: user.id,
        action: HistoryAction.TAREFA_CRIADA,
        description: `Tarefa "${created.title}" criada.`,
      })

      return created
    })

    revalidateProject(data.projectId)
    return ok({ id: task.id })
  } catch (error) {
    return toActionError(error)
  }
}

export async function updateTask(
  taskId: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser()
    assertPermission(user, Permission.TASKS_MANAGE)

    const data = taskSchema.parse(input)

    const canAccess = await canUserAccessProject(user, data.projectId)
    if (!canAccess) return fail("Você não tem acesso a este projeto.")

    await prisma.$transaction(async (tx) => {
      await tx.task.update({
        where: { id: taskId },
        data: {
          title: data.title,
          description: emptyToUndefined(data.description),
          responsibleId: emptyToUndefined(data.responsibleId) ?? null,
          priority: data.priority,
          deadline: data.deadline ? new Date(data.deadline) : null,
        },
      })

      await recordHistory(tx, {
        projectId: data.projectId,
        userId: user.id,
        action: HistoryAction.TAREFA_ATUALIZADA,
        description: `Tarefa "${data.title}" atualizada.`,
      })
    })

    revalidateProject(data.projectId)
    return ok({ id: taskId })
  } catch (error) {
    return toActionError(error)
  }
}

export async function updateTaskStatus(input: unknown): Promise<ActionResult<undefined>> {
  try {
    const user = await requireUser()
    assertPermission(user, Permission.TASKS_MANAGE)

    const { taskId, status } = taskStatusSchema.parse(input)

    const task = await prisma.task.findUniqueOrThrow({
      where: { id: taskId },
      select: { projectId: true, title: true },
    })

    const canAccess = await canUserAccessProject(user, task.projectId)
    if (!canAccess) return fail("Você não tem acesso a este projeto.")

    await prisma.$transaction(async (tx) => {
      await tx.task.update({
        where: { id: taskId },
        data: {
          status,
          completedAt: status === TaskStatus.CONCLUIDA ? new Date() : null,
        },
      })

      await recordHistory(tx, {
        projectId: task.projectId,
        userId: user.id,
        action:
          status === TaskStatus.CONCLUIDA
            ? HistoryAction.TAREFA_CONCLUIDA
            : HistoryAction.TAREFA_ATUALIZADA,
        description:
          status === TaskStatus.CONCLUIDA
            ? `Tarefa "${task.title}" concluída.`
            : `Tarefa "${task.title}" marcada como ${TASK_STATUS_LABELS[status].toLowerCase()}.`,
      })
    })

    revalidateProject(task.projectId)
    return ok(undefined)
  } catch (error) {
    return toActionError(error)
  }
}

export async function deleteTask(taskId: string): Promise<ActionResult<undefined>> {
  try {
    const user = await requireUser()
    assertPermission(user, Permission.TASKS_MANAGE)

    const task = await prisma.task.findUniqueOrThrow({
      where: { id: taskId },
      select: { projectId: true },
    })

    const canAccess = await canUserAccessProject(user, task.projectId)
    if (!canAccess) return fail("Você não tem acesso a este projeto.")

    await prisma.task.delete({ where: { id: taskId } })

    revalidateProject(task.projectId)
    return ok(undefined)
  } catch (error) {
    return toActionError(error)
  }
}
