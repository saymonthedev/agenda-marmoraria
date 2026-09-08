import Link from "next/link"
import { FileQuestion } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"

export default function AppNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <EmptyState
        icon={FileQuestion}
        title="Página não encontrada"
        description="O item que você procura pode ter sido removido ou o endereço está incorreto."
        action={
          <Button asChild>
            <Link href="/dashboard">Voltar ao dashboard</Link>
          </Button>
        }
      />
    </div>
  )
}
