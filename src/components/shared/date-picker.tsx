"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Clock } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

function parseDateOnly(value?: string | null): Date | undefined {
  if (!value) return undefined
  const parsed = new Date(`${value}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

/** Seletor de data (sem horário) — usado em prazos de projetos e tarefas. */
export function DatePicker({
  value,
  onChange,
  placeholder = "Selecionar data",
  disabled,
  className,
}: {
  value?: string | null
  onChange: (value: string | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const selected = parseDateOnly(value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start font-normal",
            !selected && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="size-4 shrink-0" />
          <span className="truncate">
            {selected ? format(selected, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={ptBR}
          selected={selected}
          defaultMonth={selected}
          onSelect={(date) => {
            onChange(date ? format(date, "yyyy-MM-dd") : undefined)
            setOpen(false)
          }}
          autoFocus
        />
        {selected && (
          <div className="border-t border-border p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                onChange(undefined)
                setOpen(false)
              }}
            >
              Limpar data
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

/** Seletor de data e horário — usado nos compromissos da agenda. */
export function DateTimePicker({
  value,
  onChange,
  placeholder = "Selecionar data e horário",
  disabled,
  className,
}: {
  value?: string | null
  onChange: (value: string | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const selected = value && !Number.isNaN(new Date(value).getTime()) ? new Date(value) : undefined
  const timeValue = selected ? format(selected, "HH:mm") : "09:00"

  function commit(date: Date | undefined, time: string) {
    if (!date) {
      onChange(undefined)
      return
    }
    const [hours, minutes] = time.split(":").map(Number)
    const combined = new Date(date)
    combined.setHours(hours || 0, minutes || 0, 0, 0)
    onChange(format(combined, "yyyy-MM-dd'T'HH:mm"))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start font-normal",
            !selected && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="size-4 shrink-0" />
          <span className="truncate">
            {selected
              ? format(selected, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
              : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={ptBR}
          selected={selected}
          defaultMonth={selected}
          onSelect={(date) => commit(date, timeValue)}
        />
        <div className="flex items-center gap-2 border-t border-border p-3">
          <Clock className="size-4 shrink-0 text-muted-foreground" />
          <Input
            type="time"
            autoComplete="off"
            value={timeValue}
            onChange={(event) => commit(selected ?? new Date(), event.target.value)}
            className="h-8"
          />
          {selected && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange(undefined)
                setOpen(false)
              }}
            >
              Limpar
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
