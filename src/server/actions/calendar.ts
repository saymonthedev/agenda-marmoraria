"use server"

import { HistoryAction, Permission } from "@prisma/client"
import { revalidatePath } from "next/cache"

import { fail, ok, toActionError, type ActionResult } from "@/lib/action-result"
import { assertPermission, requireUser } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import { emptyToUndefined } from "@/lib/utils"
import { calendarEventSchema } from "@/lib/validations/calendar"
import { canUserAccessProject } from "@/server/queries/projects"
import { recordHistory } from "@/server/record-history"

export async function createCalendarEvent(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser()
    assertPermission(user, Permission.AGENDA_MANAGE)

    const data = calendarEventSchema.parse(input)

    if (data.projectId) {
      const canAccess = await canUserAccessProject(user, data.projectId)
      if (!canAccess) return fail("Você não tem acesso a este projeto.")
    }

    const event = await prisma.$transaction(async (tx) => {
      const created = await tx.calendarEvent.create({
        data: {
          title: data.title,
          type: data.type,
          description: emptyToUndefined(data.description),
          location: emptyToUndefined(data.location),
          startAt: new Date(data.startAt),
          endAt: data.endAt ? new Date(data.endAt) : undefined,
          projectId: emptyToUndefined(data.projectId),
          createdById: user.id,
        },
      })

      if (data.projectId) {
        await recordHistory(tx, {
          projectId: data.projectId,
          userId: user.id,
          action: HistoryAction.EVENTO_AGENDADO,
          description: `Evento "${created.title}" agendado na agenda.`,
        })
      }

      return created
    })

    revalidatePath("/agenda")
    revalidatePath("/dashboard")
    if (data.projectId) revalidatePath(`/projetos/${data.projectId}`)
    return ok({ id: event.id })
  } catch (error) {
    return toActionError(error)
  }
}

export async function updateCalendarEvent(
  eventId: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser()
    assertPermission(user, Permission.AGENDA_MANAGE)

    const data = calendarEventSchema.parse(input)

    if (data.projectId) {
      const canAccess = await canUserAccessProject(user, data.projectId)
      if (!canAccess) return fail("Você não tem acesso a este projeto.")
    }

    await prisma.calendarEvent.update({
      where: { id: eventId },
      data: {
        title: data.title,
        type: data.type,
        description: emptyToUndefined(data.description),
        location: emptyToUndefined(data.location),
        startAt: new Date(data.startAt),
        endAt: data.endAt ? new Date(data.endAt) : null,
        projectId: emptyToUndefined(data.projectId) ?? null,
      },
    })

    revalidatePath("/agenda")
    revalidatePath("/dashboard")
    return ok({ id: eventId })
  } catch (error) {
    return toActionError(error)
  }
}

export async function deleteCalendarEvent(eventId: string): Promise<ActionResult<undefined>> {
  try {
    const user = await requireUser()
    assertPermission(user, Permission.AGENDA_MANAGE)

    await prisma.calendarEvent.delete({ where: { id: eventId } })

    revalidatePath("/agenda")
    revalidatePath("/dashboard")
    return ok(undefined)
  } catch (error) {
    return toActionError(error)
  }
}
