"use client"

import { EventType } from "@prisma/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { DateTimePicker } from "@/components/shared/date-picker"
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
import { EVENT_TYPE_LABELS } from "@/lib/labels"
import { calendarEventSchema, type CalendarEventInput } from "@/lib/validations/calendar"
import { createCalendarEvent, updateCalendarEvent } from "@/server/actions/calendar"

function toLocalInputValue(date: Date) {
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60_000)
  return local.toISOString().slice(0, 16)
}

type CalendarEventFormProps = {
  event?: {
    id: string
    title: string
    type: EventType
    description: string | null
    location: string | null
    startAt: Date
    endAt: Date | null
    projectId: string | null
  }
  defaultProjectId?: string
  projects: { id: string; name: string }[]
  onSuccess?: () => void
}

export function CalendarEventForm({
  event,
  defaultProjectId,
  projects,
  onSuccess,
}: CalendarEventFormProps) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CalendarEventInput>({
    resolver: zodResolver(calendarEventSchema),
    defaultValues: {
      title: event?.title ?? "",
      type: event?.type ?? EventType.VISITA,
      description: event?.description ?? "",
      location: event?.location ?? "",
      startAt: event ? toLocalInputValue(event.startAt) : "",
      endAt: event?.endAt ? toLocalInputValue(event.endAt) : undefined,
      projectId: event?.projectId ?? defaultProjectId,
    },
  })

  async function onSubmit(values: CalendarEventInput) {
    const result = event
      ? await updateCalendarEvent(event.id, values)
      : await createCalendarEvent(values)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    toast.success(event ? "Evento atualizado." : "Evento agendado.")
    router.refresh()
    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off" className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">Título</Label>
        <Input id="title" autoComplete="off" placeholder="Ex.: Medição no apartamento" {...register("title")} />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Tipo</Label>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(EventType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {EVENT_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Projeto relacionado</Label>
          <Controller
            control={control}
            name="projectId"
            render={({ field }) => (
              <EntityCombobox
                value={field.value}
                onChange={(value) => field.onChange(value ?? undefined)}
                options={projects.map((project) => ({ value: project.id, label: project.name }))}
                placeholder="Nenhum"
                searchPlaceholder="Pesquisar projeto..."
                emptyText="Nenhum projeto encontrado."
                clearLabel="Nenhum"
              />
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Início</Label>
          <Controller
            control={control}
            name="startAt"
            render={({ field }) => (
              <DateTimePicker
                value={field.value}
                onChange={(value) => field.onChange(value ?? "")}
                placeholder="Selecionar início"
              />
            )}
          />
          {errors.startAt && <p className="text-sm text-destructive">{errors.startAt.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Término (opcional)</Label>
          <Controller
            control={control}
            name="endAt"
            render={({ field }) => (
              <DateTimePicker
                value={field.value}
                onChange={field.onChange}
                placeholder="Selecionar término"
              />
            )}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="location">Local</Label>
        <Input id="location" autoComplete="off" placeholder="Endereço do compromisso" {...register("location")} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Observações</Label>
        <Textarea id="description" rows={3} placeholder="Detalhes adicionais (opcional)" {...register("description")} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {event ? "Salvar alterações" : "Agendar evento"}
        </Button>
      </div>
    </form>
  )
}
