"use client"

import { AlertTriangle } from "lucide-react"
import { useEffect } from "react"

import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <EmptyState
        icon={AlertTriangle}
        title="Algo deu errado"
        description="Não foi possível carregar esta página. Tente novamente em instantes."
        action={<Button onClick={reset}>Tentar novamente</Button>}
      />
    </div>
  )
}
