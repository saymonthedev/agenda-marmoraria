"use client"

import { Loader2, MessageSquareText, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { formatDateTime } from "@/lib/dates"
import { createNote, deleteNote } from "@/server/actions/notes"

type Note = {
  id: string
  content: string
  createdAt: Date
  author: { id: string; name: string }
}

export function NotesPanel({
  projectId,
  notes,
  currentUserId,
  isAdmin,
}: {
  projectId: string
  notes: Note[]
  currentUserId: string
  isAdmin: boolean
}) {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!content.trim()) return

    setIsSubmitting(true)
    const result = await createNote({ projectId, content })
    setIsSubmitting(false)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    setContent("")
    toast.success("Observação adicionada.")
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-lg font-medium">Observações ({notes.length})</h2>

      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          placeholder="Registre um detalhe importante sobre este projeto..."
          rows={3}
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={isSubmitting || !content.trim()}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Adicionar observação
          </Button>
        </div>
      </form>

      {notes.length === 0 ? (
        <EmptyState
          icon={MessageSquareText}
          title="Nenhuma observação registrada"
          description="Use este espaço para anotar detalhes combinados com o cliente ou a equipe."
        />
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li key={note.id} className="rounded-lg border border-border bg-card p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {note.author.name} · {formatDateTime(note.createdAt)}
                  </p>
                </div>
                {(isAdmin || note.author.id === currentUserId) && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Excluir observação"
                    onClick={async () => {
                      const result = await deleteNote(note.id)
                      if (!result.ok) {
                        toast.error(result.error)
                        return
                      }
                      toast.success("Observação removida.")
                      router.refresh()
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
