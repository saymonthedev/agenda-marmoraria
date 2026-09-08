"use client"

import { Priority } from "@prisma/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { DatePicker } from "@/components/shared/date-picker"
import { EntityCombobox } from "@/components/shared/entity-combobox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PRIORITY_LABELS } from "@/lib/labels"
import { taskSchema, type TaskInput } from "@/lib/validations/task"
import { createTask, updateTask } from "@/server/actions/tasks"

type TaskFormProps = {
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
  onSuccess?: () => void
}

export function TaskForm({ projectId, task, candidates, onSuccess }: TaskFormProps) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      projectId,
      title: task?.title ?? "",
      description: task?.description ?? "",
      responsibleId: task?.responsibleId ?? undefined,
      priority: task?.priority ?? Priority.MEDIA,
      deadline: task?.deadline ? task.deadline.toISOString().slice(0, 10) : undefined,
    },
  })

  async function onSubmit(values: TaskInput) {
    const result = task ? await updateTask(task.id, values) : await createTask(values)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    toast.success(task ? "Tarefa atualizada." : "Tarefa criada.")
    router.refresh()
    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off" className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">Título</Label>
        <Input id="title" autoComplete="off" placeholder="Ex.: Realizar medição no local" {...register("title")} />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" rows={3} placeholder="Detalhes da tarefa (opcional)" {...register("description")} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Responsável</Label>
          <Controller
            control={control}
            name="responsibleId"
            render={({ field }) => (
              <EntityCombobox
                value={field.value}
                onChange={(value) => field.onChange(value ?? undefined)}
                options={candidates.map((candidate) => ({
                  value: candidate.id,
                  label: candidate.name,
                }))}
                placeholder="Sem responsável"
                searchPlaceholder="Pesquisar responsável..."
                emptyText="Nenhum usuário encontrado."
                clearLabel="Sem responsável"
              />
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Prioridade</Label>
          <Controller
            control={control}
            name="priority"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Priority).map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {PRIORITY_LABELS[priority]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Prazo</Label>
          <Controller
            control={control}
            name="deadline"
            render={({ field }) => (
              <DatePicker value={field.value} onChange={field.onChange} placeholder="Selecionar prazo" />
            )}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {task ? "Salvar alterações" : "Criar tarefa"}
        </Button>
      </div>
    </form>
  )
}
