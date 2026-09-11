import { LogOut, Settings, UserCircle } from "lucide-react"
import Link from "next/link"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { isAdmin, type SessionUser } from "@/lib/access"
import { USER_ROLE_LABELS } from "@/lib/labels"
import { logoutAction } from "@/server/actions/auth"

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  )
}

export function UserMenu({ user }: { user: SessionUser }) {
  const initials = getInitials(user.name ?? user.email ?? "?")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-full outline-none ring-offset-2 ring-offset-background transition-[box-shadow] focus-visible:ring-2 focus-visible:ring-ring/50">
        <Avatar className="size-9 ring-1 ring-accent/40 transition-transform hover:scale-105">
          <AvatarFallback className="bg-accent text-sm font-medium text-accent-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72 overflow-hidden p-0">
        {/* Faixa de destaque da marca */}
        <div className="h-1 bg-[linear-gradient(90deg,color-mix(in_oklch,var(--accent),transparent_45%),var(--accent),color-mix(in_oklch,var(--accent),transparent_45%))]" />

        {/* Cabeçalho com avatar, identidade e perfil */}
        <div className="border-b border-border bg-[linear-gradient(135deg,color-mix(in_oklch,var(--accent),transparent_88%),transparent_60%)] px-3 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 shrink-0 ring-1 ring-accent/30">
              <AvatarFallback className="bg-accent text-sm font-medium text-accent-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <span className="mt-2.5 inline-flex items-center rounded-full bg-accent/12 px-2.5 py-0.5 text-xs font-medium tracking-wide text-accent ring-1 ring-accent/25">
            {USER_ROLE_LABELS[user.role]}
          </span>
        </div>

        {/* Ações de navegação */}
        <div className="p-1.5">
          <DropdownMenuItem asChild className="gap-2.5 px-2 py-2">
            <Link href="/conta">
              <span className="flex size-8 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-focus/dropdown-menu-item:bg-accent-foreground/15 group-focus/dropdown-menu-item:text-accent-foreground">
                <UserCircle className="size-4" />
              </span>
              <span className="font-medium">Minha conta</span>
            </Link>
          </DropdownMenuItem>

          {isAdmin(user) && (
            <DropdownMenuItem asChild className="gap-2.5 px-2 py-2">
              <Link href="/configuracoes">
                <span className="flex size-8 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-focus/dropdown-menu-item:bg-accent-foreground/15 group-focus/dropdown-menu-item:text-accent-foreground">
                  <Settings className="size-4" />
                </span>
                <span className="font-medium">Configurações</span>
              </Link>
            </DropdownMenuItem>
          )}
        </div>

        <DropdownMenuSeparator />

        <div className="p-1.5">
          <form action={logoutAction} className="w-full">
            <DropdownMenuItem variant="destructive" asChild className="gap-2.5 px-2 py-2">
              <button type="submit" className="w-full">
                <span className="flex size-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive transition-colors group-focus/dropdown-menu-item:bg-destructive/15">
                  <LogOut className="size-4" />
                </span>
                <span className="font-medium">Sair</span>
              </button>
            </DropdownMenuItem>
          </form>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
