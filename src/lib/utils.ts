export { cn } from "cn"

/** Converte string vazia/ausente em `undefined`, para não gravar campos opcionais em branco no banco. */
export function emptyToUndefined(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}
