"use client"

import { useEffect } from "react"

export default function GlobalError({
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
    <html lang="pt-BR">
      <body>
        <div
          style={{
            minHeight: "100svh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "1.5rem",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
            background: "#f4f2ed",
            color: "#211f1c",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Erro inesperado</h1>
          <p style={{ color: "#6b6660" }}>
            Ocorreu um erro ao carregar o sistema. Tente recarregar a página.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: "0.5rem",
              background: "#221f1b",
              color: "#f4f2ed",
              border: "none",
              cursor: "pointer",
            }}
          >
            Recarregar
          </button>
        </div>
      </body>
    </html>
  )
}
