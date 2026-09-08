"use client"

import { Archive, ArchiveRestore, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { TooltipWrap } from "@/components/shared/tooltip-wrap"
import { Button } from "@/components/ui/button"
import { deleteProjectPermanently, toggleProjectActive } from "@/server/actions/projects"

export function ProjectRowActions({
  projectId,
  projectName,
  active,
  canEdit,
  canDelete,
  canHardDelete,
}: {
  projectId: string
  projectName: string
  active: boolean
  canEdit: boolean
  canDelete: boolean
  canHardDelete: boolean
}) {
  const router = useRouter()
  const [toggleOpen, setToggleOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (!canEdit && !canDelete && !canHardDelete) return null

  return (
    <div
      className="flex items-center justify-end gap-1"
      onClick={(event) => event.stopPropagation()}
    >
      {canEdit && (
        <TooltipWrap label="Editar projeto">
          <Button variant="ghost" size="icon-sm" aria-label="Editar projeto" asChild>
            <Link href={`/projetos/${projectId}/editar`}>
              <Pencil className="size-4" />
            </Link>
          </Button>
        </TooltipWrap>
      )}

      {canDelete && (
        <TooltipWrap label={active ? "Desativar projeto" : "Reativar projeto"}>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={active ? "Desativar projeto" : "Reativar projeto"}
            onClick={() => setToggleOpen(true)}
          >
            {active ? <Archive className="size-4" /> : <ArchiveRestore className="size-4" />}
          </Button>
        </TooltipWrap>
      )}

      {canHardDelete && (
        <TooltipWrap label="Excluir definitivamente">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Excluir projeto definitivamente"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-4" />
          </Button>
        </TooltipWrap>
      )}

      <ConfirmDialog
        open={toggleOpen}
        onOpenChange={setToggleOpen}
        title={active ? "Desativar projeto" : "Reativar projeto"}
        description={
          active
            ? `"${projectName}" será removido das listagens ativas, mas todo o histórico será preservado.`
            : `"${projectName}" voltará a aparecer normalmente nas listagens e no Kanban.`
        }
        confirmLabel={active ? "Desativar" : "Reativar"}
        destructive={active}
        onConfirm={async () => {
          const result = await toggleProjectActive(projectId, !active)
          if (!result.ok) {
            toast.error(result.error)
            return
          }
          toast.success(active ? "Projeto desativado." : "Projeto reativado.")
          router.refresh()
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir projeto definitivamente"
        description={`Essa ação é irreversível: "${projectName}", suas tarefas, observações e histórico serão apagados permanentemente.`}
        confirmLabel="Excluir definitivamente"
        destructive
        onConfirm={async () => {
          const result = await deleteProjectPermanently(projectId)
          if (!result.ok) {
            toast.error(result.error)
            return
          }
          toast.success("Projeto excluído permanentemente.")
          router.refresh()
        }}
      />
    </div>
  )
}
