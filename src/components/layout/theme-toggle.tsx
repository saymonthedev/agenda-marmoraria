"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"

import { TooltipWrap } from "@/components/shared/tooltip-wrap"
import { Button } from "@/components/ui/button"

function subscribeNoop() {
  return () => {}
}

/** Evita divergência de hidratação: no servidor sempre "false", no cliente "true" após montar. */
function useHasMounted() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  )
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useHasMounted()
  const isDark = mounted && resolvedTheme === "dark"
  const label = isDark ? "Ativar modo claro" : "Ativar modo escuro"

  return (
    <TooltipWrap label={label}>
      <Button
        variant="ghost"
        size="icon"
        aria-label={label}
        onClick={() => setTheme(isDark ? "light" : "dark")}
      >
        {isDark ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
      </Button>
    </TooltipWrap>
  )
}
