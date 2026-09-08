import { Priority, ProjectStage, ProjectType } from "@prisma/client"
import { z } from "zod"

export const projectSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do projeto"),
  type: z.nativeEnum(ProjectType),
  customerId: z.string().min(1, "Selecione o cliente"),
  description: z.string().trim().optional(),
  responsibleId: z.string().optional(),
  priority: z.nativeEnum(Priority),
  deadline: z.string().optional(),
  memberIds: z.array(z.string()),
})

export type ProjectInput = z.infer<typeof projectSchema>

export const projectStageSchema = z.object({
  projectId: z.string().min(1),
  stage: z.nativeEnum(ProjectStage),
})

export const projectPrioritySchema = z.object({
  projectId: z.string().min(1),
  priority: z.nativeEnum(Priority),
})

export const projectResponsibleSchema = z.object({
  projectId: z.string().min(1),
  responsibleId: z.string().nullable(),
})

export const projectDeadlineSchema = z.object({
  projectId: z.string().min(1),
  deadline: z.string().nullable(),
})
