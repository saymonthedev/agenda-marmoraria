import Image from "next/image"

import { cn } from "@/lib/utils"

type LogoMarkProps = {
  className?: string
  plateClassName?: string
}

/**
 * Símbolo da marca Stainhaus. O ícone tem fundo próprio escuro, por isso é
 * sempre exibido sobre uma pequena "placa" clara — garante contraste tanto
 * na sidebar escura quanto no modo claro/escuro do sistema.
 */
export function LogoMark({ className, plateClassName }: LogoMarkProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md bg-white p-1 ring-1 ring-black/5",
        plateClassName
      )}
    >
      <Image
        src="/icon-stainhaus.png"
        alt="Stainhaus Marmoraria"
        width={176}
        height={176}
        className={cn("size-5", className)}
        priority
      />
    </span>
  )
}
