"use client"

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { Priority, ProjectStage } from "@prisma/client"
import Link from "next/link"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { OverdueBadge, PriorityBadge } from "@/components/shared/badges"
import { formatDate } from "@/lib/dates"
import { PROJECT_STAGE_LABELS, PROJECT_STAGE_ORDER } from "@/lib/labels"
import { cn } from "@/lib/utils"
import { changeProjectStage } from "@/server/actions/projects"

type KanbanProject = {
  id: string
  name: string
  stage: ProjectStage
  priority: Priority
  deadline: Date | null
  customer: { id: string; name: string }
  responsible: { id: string; name: string } | null
}

function KanbanCard({ project }: { project: KanbanProject }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: project.id,
  })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "touch-none rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow",
        isDragging ? "z-10 opacity-50 shadow-md" : "hover:shadow-md"
      )}
    >
      <Link href={`/projetos/${project.id}`} className="block space-y-2">
        <p className="text-sm leading-snug font-medium text-foreground">{project.name}</p>
        <p className="truncate text-xs text-muted-foreground">{project.customer.name}</p>
        <div className="flex flex-wrap items-center gap-1.5">
          <PriorityBadge priority={project.priority} className="text-[11px]" />
          <OverdueBadge deadline={project.deadline} className="text-[11px]" />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{project.responsible?.name ?? "Sem responsável"}</span>
          {project.deadline && <span>{formatDate(project.deadline)}</span>}
        </div>
      </Link>
    </div>
  )
}

function KanbanColumn({
  stage,
  projects,
}: {
  stage: ProjectStage
  projects: KanbanProject[]
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })

  return (
    <div className="flex h-fit w-72 shrink-0 flex-col rounded-xl bg-muted/40">
      <div className="flex items-center justify-between px-3 py-2.5">
        <span className="text-sm font-medium text-foreground">{PROJECT_STAGE_LABELS[stage]}</span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {projects.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-24 flex-1 flex-col gap-2 rounded-b-xl p-2 transition-colors",
          isOver && "bg-accent/10 outline-2 outline-dashed outline-accent/40"
        )}
      >
        {projects.length === 0 ? (
          <p className="px-1 py-2 text-center text-xs text-muted-foreground/70">
            Nenhum projeto nesta etapa
          </p>
        ) : (
          projects.map((project) => <KanbanCard key={project.id} project={project} />)
        )}
      </div>
    </div>
  )
}

export function KanbanBoard({
  initialProjects,
  canChangeStage,
}: {
  initialProjects: KanbanProject[]
  canChangeStage: boolean
}) {
  const [projects, setProjects] = useState(initialProjects)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const columns = useMemo(() => {
    const grouped = new Map<ProjectStage, KanbanProject[]>()
    for (const stage of PROJECT_STAGE_ORDER) grouped.set(stage, [])
    for (const project of projects) {
      grouped.get(project.stage)?.push(project)
    }
    return grouped
  }, [projects])

  const activeProject = projects.find((p) => p.id === activeId)

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event
    if (!over || !canChangeStage) return

    const projectId = String(active.id)
    const newStage = over.id as ProjectStage
    const current = projects.find((p) => p.id === projectId)
    if (!current || current.stage === newStage) return

    const previousStage = current.stage
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, stage: newStage } : p))
    )

    const result = await changeProjectStage({ projectId, stage: newStage })
    if (!result.ok) {
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, stage: previousStage } : p))
      )
      toast.error(result.error)
      return
    }

    toast.success(`Projeto movido para "${PROJECT_STAGE_LABELS[newStage]}".`)
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex items-start gap-4 overflow-x-auto pb-4">
        {PROJECT_STAGE_ORDER.map((stage) => (
          <KanbanColumn key={stage} stage={stage} projects={columns.get(stage) ?? []} />
        ))}
      </div>
      <DragOverlay>
        {activeProject ? (
          <div className="w-64 rounded-lg border border-accent bg-card p-3 shadow-lg">
            <p className="text-sm font-medium text-foreground">{activeProject.name}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
