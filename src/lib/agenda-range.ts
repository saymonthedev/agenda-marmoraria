import {
  addDays,
  addMonths,
  addWeeks,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import { ptBR } from "date-fns/locale"

export type AgendaView = "dia" | "semana" | "mes"

export function parseAgendaView(value?: string): AgendaView {
  return value === "dia" || value === "semana" ? value : "mes"
}

export function parseAgendaDate(value?: string): Date {
  if (value) {
    const parsed = new Date(`${value}T00:00:00`)
    if (!Number.isNaN(parsed.getTime())) return parsed
  }
  return new Date()
}

export function getAgendaRange(view: AgendaView, date: Date) {
  switch (view) {
    case "dia":
      return { from: startOfDay(date), to: endOfDay(date) }
    case "semana":
      return {
        from: startOfWeek(date, { weekStartsOn: 0 }),
        to: endOfWeek(date, { weekStartsOn: 0 }),
      }
    case "mes":
    default:
      return {
        from: startOfWeek(startOfMonth(date), { weekStartsOn: 0 }),
        to: endOfWeek(endOfMonth(date), { weekStartsOn: 0 }),
      }
  }
}

export function shiftAgendaDate(view: AgendaView, date: Date, direction: 1 | -1): Date {
  switch (view) {
    case "dia":
      return addDays(date, direction)
    case "semana":
      return addWeeks(date, direction)
    case "mes":
    default:
      return addMonths(date, direction)
  }
}

export function formatAgendaDateParam(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

export function formatAgendaTitle(view: AgendaView, date: Date): string {
  if (view === "dia") {
    return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR })
  }
  if (view === "semana") {
    const { from, to } = getAgendaRange(view, date)
    return `${format(from, "d 'de' MMM", { locale: ptBR })} – ${format(to, "d 'de' MMM 'de' yyyy", { locale: ptBR })}`
  }
  // Só a primeira letra em maiúscula ("Outubro de 2026"); a classe CSS
  // `capitalize` deixava "De" maiúsculo no meio da frase.
  const month = format(date, "MMMM 'de' yyyy", { locale: ptBR })
  return month.charAt(0).toUpperCase() + month.slice(1)
}
