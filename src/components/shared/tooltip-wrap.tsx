import type { ReactElement } from "react"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

/**
 * Envolve um único elemento clicável (botão, trigger de diálogo, etc.) com
 * uma tooltip explicando a ação. Funciona encadeado com outros componentes
 * `asChild` (ex.: DialogTrigger, Button asChild) — o Slot do Radix repassa
 * as props de cada camada até o elemento real.
 */
export function TooltipWrap({
  label,
  side = "top",
  children,
}: {
  label: string
  side?: "top" | "bottom" | "left" | "right"
  children: ReactElement
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side}>{label}</TooltipContent>
    </Tooltip>
  )
}
