import { format, formatDistanceToNow, isBefore, isToday, startOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"

export function formatDate(date: Date | string): string {
  return format(new Date(date), "dd/MM/yyyy", { locale: ptBR })
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

export function formatTime(date: Date | string): string {
  return format(new Date(date), "HH:mm", { locale: ptBR })
}

export function formatRelative(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { locale: ptBR, addSuffix: true })
}

/** Um prazo é considerado vencido quando já passou e ainda não chegou ao fim do dia atual. */
export function isOverdue(date: Date | string | null | undefined): boolean {
  if (!date) return false
  return isBefore(new Date(date), startOfDay(new Date()))
}

export function isDueToday(date: Date | string | null | undefined): boolean {
  if (!date) return false
  return isToday(new Date(date))
}

export function isDueSoon(date: Date | string | null | undefined, days = 3): boolean {
  if (!date) return false
  const target = new Date(date)
  const limit = new Date()
  limit.setDate(limit.getDate() + days)
  return !isOverdue(target) && isBefore(target, limit)
}
