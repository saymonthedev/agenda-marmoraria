"use client"

import { Priority, TaskStatus } from "@prisma/client"
import { ClipboardList, Pencil, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { OverdueBadge, PriorityBadge } from "@/components/shared/badges"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { TaskDialog } from "@/components/tasks/task-dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDate } from "@/lib/dates"
import { TASK_STATUS_LABELS } from "@/lib/labels"
import { deleteTask, updateTaskStatus } from "@/server/actions/tasks"

type Task = {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: Priority
  deadline: Date | null
  responsible: { id: string; name: string } | null
}

export function TaskList({
  projectId,
  tasks,
  candidates,
  canManage,
}: {
  projectId: string
  tasks: Task[]
  candidates: { id: string; name: string }[]
  canManage: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-medium">Tarefas ({tasks.length})</h2>
        {canManage && (
          <TaskDialog
            projectId={projectId}
            candidates={candidates}
            trigger={
              <Button size="sm">
                <Plus className="size-4" />
                Nova tarefa
              </Button>
            }
          />
        )}
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nenhuma tarefa cadastrada"
          description="Divida o projeto em etapas menores criando tarefas com responsável e prazo."
        />
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-card">
          {tasks.map((task) => (
            <li key={task.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-1">
                <p
                  className={
                    task.status === TaskStatus.CONCLUIDA
                      ? "text-sm font-medium text-muted-foreground line-through"
                      : "text-sm font-medium text-foreground"
                  }
                >
                  {task.title}
                </p>
                {task.description && (
                  <p className="text-xs text-muted-foreground">{task.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <PriorityBadge priority={task.priority} />
                  {task.deadline && (
                    <span className="text-xs text-muted-foreground">
                      Prazo: {formatDate(task.deadline)}
                    </span>
                  )}
                  {task.status !== TaskStatus.CONCLUIDA && <OverdueBadge deadline={task.deadline} />}
                  {task.responsible && (
                    <span className="text-xs text-muted-foreground">{task.responsible.name}</span>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {canManage ? (
                  <Select
                    value={task.status}
                    disabled={isPending}
                    onValueChange={(value) => {
                      startTransition(async () => {
                        const result = await updateTaskStatus({ taskId: task.id, status: value })
                        if (!result.ok) {
                          toast.error(result.error)
                          return
                        }
                        toast.success("Status da tarefa atualizado.")
                        router.refresh()
                      })
                    }}
                  >
                    <SelectTrigger size="sm" className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TaskStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {TASK_STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {TASK_STATUS_LABELS[task.status]}
                  </span>
                )}

                {canManage && (
                  <>
                    <TaskDialog
                      projectId={projectId}
                      task={{ ...task, responsibleId: task.responsible?.id ?? null }}
                      candidates={candidates}
                      trigger={
                        <Button variant="ghost" size="icon-sm" aria-label="Editar tarefa">
                          <Pencil className="size-4" />
                        </Button>
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Excluir tarefa"
                      onClick={() => setTaskToDelete(task)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!taskToDelete}
        onOpenChange={(open) => !open && setTaskToDelete(null)}
        title="Excluir tarefa"
        description={`Tem certeza que deseja excluir a tarefa "${taskToDelete?.title}"? Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        destructive
        onConfirm={async () => {
          if (!taskToDelete) return
          const result = await deleteTask(taskToDelete.id)
          if (!result.ok) {
            toast.error(result.error)
            return
          }
          toast.success("Tarefa excluída.")
          router.refresh()
        }}
      />
    </div>
  )
}
