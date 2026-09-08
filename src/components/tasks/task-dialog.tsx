"use client"

import { Priority } from "@prisma/client"
import { useState } from "react"

import { TaskForm } from "@/components/tasks/task-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function TaskDialog({
  projectId,
  task,
  candidates,
  trigger,
}: {
  projectId: string
  task?: {
    id: string
    title: string
    description: string | null
    responsibleId: string | null
    priority: Priority
    deadline: Date | null
  }
  candidates: { id: string; name: string }[]
  trigger: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? "Editar tarefa" : "Nova tarefa"}</DialogTitle>
          <DialogDescription>
            {task ? "Atualize os detalhes desta tarefa." : "Adicione uma nova tarefa a este projeto."}
          </DialogDescription>
        </DialogHeader>
        <TaskForm
          projectId={projectId}
          task={task}
          candidates={candidates}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
