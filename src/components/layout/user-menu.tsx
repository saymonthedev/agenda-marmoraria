import { LogOut, Settings, UserCircle } from "lucide-react"
import Link from "next/link"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { isAdmin, type SessionUser } from "@/lib/access"
import { USER_ROLE_LABELS } from "@/lib/labels"
import { logoutAction } from "@/server/actions/auth"

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export function UserMenu({ user }: { user: SessionUser }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
        <Avatar className="size-9">
          <AvatarFallback className="bg-accent text-accent-foreground text-sm font-medium">
            {getInitials(user.name ?? user.email ?? "?")}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-1 font-normal">
          <span className="text-sm font-medium text-foreground">{user.name}</span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
          <Badge variant="outline" className="mt-1 w-fit text-xs">
            {USER_ROLE_LABELS[user.role]}
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/conta">
            <UserCircle className="size-4" />
            Minha conta
          </Link>
        </DropdownMenuItem>
        {isAdmin(user) && (
          <DropdownMenuItem asChild>
            <Link href="/configuracoes">
              <Settings className="size-4" />
              Configurações
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <form action={logoutAction} className="w-full">
          <DropdownMenuItem variant="destructive" asChild>
            <button type="submit" className="w-full">
              <LogOut className="size-4" />
              Sair
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
