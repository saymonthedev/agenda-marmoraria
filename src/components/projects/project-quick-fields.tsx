"use client"

import { Priority, ProjectStage } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"

import { PriorityBadge, StageBadge } from "@/components/shared/badges"
import { DatePicker } from "@/components/shared/date-picker"
import { EntityCombobox } from "@/components/shared/entity-combobox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { isOverdue } from "@/lib/dates"
import { PRIORITY_LABELS, PROJECT_STAGE_LABELS } from "@/lib/labels"
import {
  changeProjectDeadline,
  changeProjectPriority,
  changeProjectResponsible,
  changeProjectStage,
} from "@/server/actions/projects"

const EDITABLE_STAGES = [
  ProjectStage.ORCAMENTO,
  ProjectStage.APROVADO,
  ProjectStage.MEDICAO,
  ProjectStage.CORTE,
  ProjectStage.ACABAMENTO,
  ProjectStage.INSTALACAO,
  ProjectStage.CONCLUIDO,
  ProjectStage.CANCELADO,
]

export function StageQuickSelect({
  projectId,
  stage,
  canEdit,
}: {
  projectId: string
  stage: ProjectStage
  canEdit: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  if (!canEdit) return <StageBadge stage={stage} />

  return (
    <Select
      value={stage}
      disabled={isPending}
      onValueChange={(value) => {
        startTransition(async () => {
          const result = await changeProjectStage({ projectId, stage: value })
          if (!result.ok) {
            toast.error(result.error)
            return
          }
          toast.success("Etapa atualizada.")
          router.refresh()
        })
      }}
    >
      <SelectTrigger size="sm" className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {EDITABLE_STAGES.map((s) => (
          <SelectItem key={s} value={s}>
            {PROJECT_STAGE_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function PriorityQuickSelect({
  projectId,
  priority,
  canEdit,
}: {
  projectId: string
  priority: Priority
  canEdit: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  if (!canEdit) return <PriorityBadge priority={priority} />

  return (
    <Select
      value={priority}
      disabled={isPending}
      onValueChange={(value) => {
        startTransition(async () => {
          const result = await changeProjectPriority({ projectId, priority: value })
          if (!result.ok) {
            toast.error(result.error)
            return
          }
          toast.success("Prioridade atualizada.")
          router.refresh()
        })
      }}
    >
      <SelectTrigger size="sm" className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.values(Priority).map((p) => (
          <SelectItem key={p} value={p}>
            {PRIORITY_LABELS[p]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function ResponsibleQuickSelect({
  projectId,
  responsibleId,
  candidates,
  canEdit,
}: {
  projectId: string
  responsibleId: string | null
  candidates: { id: string; name: string }[]
  canEdit: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  if (!canEdit) {
    const current = candidates.find((c) => c.id === responsibleId)
    return <span className="text-sm text-foreground">{current?.name ?? "Sem responsável"}</span>
  }

  return (
    <EntityCombobox
      value={responsibleId}
      disabled={isPending}
      className="h-8 w-48"
      onChange={(value) => {
        startTransition(async () => {
          const result = await changeProjectResponsible({ projectId, responsibleId: value })
          if (!result.ok) {
            toast.error(result.error)
            return
          }
          toast.success("Responsável atualizado.")
          router.refresh()
        })
      }}
      options={candidates.map((candidate) => ({ value: candidate.id, label: candidate.name }))}
      placeholder="Sem responsável definido"
      searchPlaceholder="Pesquisar responsável..."
      emptyText="Nenhum usuário encontrado."
      clearLabel="Sem responsável definido"
    />
  )
}

export function DeadlineQuickField({
  projectId,
  deadline,
  canEdit,
}: {
  projectId: string
  deadline: Date | null
  canEdit: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  if (!canEdit) {
    return (
      <span className={isOverdue(deadline) ? "text-sm font-medium text-destructive" : "text-sm text-foreground"}>
        {deadline ? deadline.toLocaleDateString("pt-BR") : "Sem prazo definido"}
      </span>
    )
  }

  return (
    <DatePicker
      value={deadline ? deadline.toISOString().slice(0, 10) : undefined}
      disabled={isPending}
      className="h-8 w-44"
      placeholder="Sem prazo definido"
      onChange={(next) => {
        startTransition(async () => {
          const result = await changeProjectDeadline({ projectId, deadline: next ?? null })
          if (!result.ok) {
            toast.error(result.error)
            return
          }
          toast.success("Prazo atualizado.")
          router.refresh()
        })
      }}
    />
  )
}
