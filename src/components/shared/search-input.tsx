"use client"

import { Search, X } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"

import { Input } from "@/components/ui/input"

export function SearchInput({
  placeholder = "Pesquisar...",
  paramName = "q",
}: {
  placeholder?: string
  paramName?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get(paramName) ?? "")
  const [, startTransition] = useTransition()

  function updateParams(next: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (next) {
      params.set(paramName, next)
    } else {
      params.delete(paramName)
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <div className="relative w-full sm:w-72">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        autoComplete="off"
        placeholder={placeholder}
        className="pl-9 pr-9"
        onChange={(event) => {
          setValue(event.target.value)
          updateParams(event.target.value)
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            setValue("")
            updateParams("")
          }}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Limpar pesquisa"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
