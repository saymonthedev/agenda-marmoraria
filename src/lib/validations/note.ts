import { z } from "zod"

export const noteSchema = z.object({
  projectId: z.string().min(1),
  content: z.string().trim().min(1, "Escreva uma observação antes de salvar"),
})

export type NoteInput = z.infer<typeof noteSchema>
