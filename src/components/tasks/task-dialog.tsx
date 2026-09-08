"use client"

import { Priority } from "@prisma/client"
import type { ReactElement } from "react"
import { useState } from "react"

import { TooltipWrap } from "@/components/shared/tooltip-wrap"
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
  tooltip,
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
  trigger: ReactElement
  tooltip?: string
}) {
  const [open, setOpen] = useState(false)
  const triggerElement = <DialogTrigger asChild>{trigger}</DialogTrigger>

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {tooltip ? <TooltipWrap label={tooltip}>{triggerElement}</TooltipWrap> : triggerElement}
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
