import { Priority, TaskStatus } from "@prisma/client"
import { z } from "zod"

export const taskSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().trim().min(2, "Informe o título da tarefa"),
  description: z.string().trim().optional(),
  responsibleId: z.string().optional(),
  priority: z.nativeEnum(Priority),
  deadline: z.string().optional(),
})

export type TaskInput = z.infer<typeof taskSchema>

export const taskStatusSchema = z.object({
  taskId: z.string().min(1),
  status: z.nativeEnum(TaskStatus),
})
