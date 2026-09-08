import { EventType } from "@prisma/client"
import { z } from "zod"

export const calendarEventSchema = z.object({
  title: z.string().trim().min(2, "Informe um título para o evento"),
  type: z.nativeEnum(EventType),
  description: z.string().trim().optional(),
  location: z.string().trim().optional(),
  startAt: z.string().min(1, "Informe a data e hora de início"),
  endAt: z.string().optional(),
  projectId: z.string().optional(),
})

export type CalendarEventInput = z.infer<typeof calendarEventSchema>
