"use server"

import { HistoryAction } from "@prisma/client"
import { revalidatePath } from "next/cache"

import { fail, ok, toActionError, type ActionResult } from "@/lib/action-result"
import { requireUser } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import { noteSchema } from "@/lib/validations/note"
import { canUserAccessProject } from "@/server/queries/projects"
import { recordHistory } from "@/server/record-history"

export async function createNote(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser()
    const data = noteSchema.parse(input)

    const canAccess = await canUserAccessProject(user, data.projectId)
    if (!canAccess) return fail("Você não tem acesso a este projeto.")

    const note = await prisma.$transaction(async (tx) => {
      const created = await tx.projectNote.create({
        data: {
          projectId: data.projectId,
          authorId: user.id,
          content: data.content,
        },
      })

      await recordHistory(tx, {
        projectId: data.projectId,
        userId: user.id,
        action: HistoryAction.OBSERVACAO_ADICIONADA,
        description: "Nova observação adicionada ao projeto.",
      })

      return created
    })

    revalidatePath(`/projetos/${data.projectId}`)
    return ok({ id: note.id })
  } catch (error) {
    return toActionError(error)
  }
}

export async function deleteNote(noteId: string): Promise<ActionResult<undefined>> {
  try {
    const user = await requireUser()

    const note = await prisma.projectNote.findUniqueOrThrow({
      where: { id: noteId },
      select: { projectId: true, authorId: true },
    })

    const isAuthor = note.authorId === user.id
    const canAccess = await canUserAccessProject(user, note.projectId)
    if (!canAccess) return fail("Você não tem acesso a este projeto.")
    if (!isAuthor && user.role !== "ADMIN") {
      return fail("Você só pode remover observações que você mesmo escreveu.")
    }

    await prisma.projectNote.delete({ where: { id: noteId } })

    revalidatePath(`/projetos/${note.projectId}`)
    return ok(undefined)
  } catch (error) {
    return toActionError(error)
  }
}
