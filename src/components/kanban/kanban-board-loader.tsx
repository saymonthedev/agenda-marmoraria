"use client"

import dynamic from "next/dynamic"

import { PROJECT_STAGE_ORDER } from "@/lib/labels"
import { Skeleton } from "@/components/ui/skeleton"

// O quadro Kanban usa @dnd-kit, que gera identificadores internos de
// acessibilidade não determinísticos entre servidor e cliente. Carregamos o
// board somente no cliente para evitar warnings de hidratação por causa disso.
export const KanbanBoardClient = dynamic(
  () => import("@/components/kanban/kanban-board").then((mod) => mod.KanbanBoard),
  {
    ssr: false,
    loading: () => (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {PROJECT_STAGE_ORDER.map((stage) => (
          <div key={stage} className="w-72 shrink-0 space-y-2 rounded-xl bg-muted/40 p-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    ),
  }
)
