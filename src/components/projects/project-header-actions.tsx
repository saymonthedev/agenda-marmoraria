"use client"

import { ArchiveRestore, Archive, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { deleteProjectPermanently, toggleProjectActive } from "@/server/actions/projects"

export function ProjectHeaderActions({
  projectId,
  active,
  canEdit,
  canDelete,
  canHardDelete,
}: {
  projectId: string
  active: boolean
  canEdit: boolean
  canDelete: boolean
  canHardDelete: boolean
}) {
  const router = useRouter()
  const [toggleOpen, setToggleOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canEdit && (
        <Button variant="outline" size="sm" asChild>
          <Link href={`/projetos/${projectId}/editar`}>
            <Pencil className="size-4" />
            Editar
          </Link>
        </Button>
      )}

      {canDelete && (
        <Button variant="outline" size="sm" onClick={() => setToggleOpen(true)}>
          {active ? <Archive className="size-4" /> : <ArchiveRestore className="size-4" />}
          {active ? "Desativar" : "Reativar"}
        </Button>
      )}

      {canHardDelete && (
        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="size-4" />
          Excluir definitivamente
        </Button>
      )}

      <ConfirmDialog
        open={toggleOpen}
        onOpenChange={setToggleOpen}
        title={active ? "Desativar projeto" : "Reativar projeto"}
        description={
          active
            ? "O projeto será removido das listagens ativas, mas todo o histórico será preservado."
            : "O projeto voltará a aparecer normalmente nas listagens e no Kanban."
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
        description="Essa ação é irreversível: o projeto, suas tarefas, observações e histórico serão apagados permanentemente."
        confirmLabel="Excluir definitivamente"
        destructive
        onConfirm={async () => {
          const result = await deleteProjectPermanently(projectId)
          if (!result.ok) {
            toast.error(result.error)
            return
          }
          toast.success("Projeto excluído permanentemente.")
          router.push("/projetos")
          router.refresh()
        }}
      />
    </div>
  )
}
