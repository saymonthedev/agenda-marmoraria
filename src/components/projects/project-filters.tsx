"use client"

import { Priority, ProjectStage } from "@prisma/client"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PRIORITY_LABELS, PROJECT_STAGE_LABELS } from "@/lib/labels"

export function ProjectFilters({
  responsibleOptions,
}: {
  responsibleOptions: { id: string; name: string }[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Select value={searchParams.get("stage") ?? "all"} onValueChange={(v) => setParam("stage", v)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Etapa" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as etapas</SelectItem>
          {Object.values(ProjectStage).map((stage) => (
            <SelectItem key={stage} value={stage}>
              {PROJECT_STAGE_LABELS[stage]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("priority") ?? "all"}
        onValueChange={(v) => setParam("priority", v)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Prioridade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as prioridades</SelectItem>
          {Object.values(Priority).map((priority) => (
            <SelectItem key={priority} value={priority}>
              {PRIORITY_LABELS[priority]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {responsibleOptions.length > 0 && (
        <Select
          value={searchParams.get("responsibleId") ?? "all"}
          onValueChange={(v) => setParam("responsibleId", v)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Responsável" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os responsáveis</SelectItem>
            {responsibleOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}
