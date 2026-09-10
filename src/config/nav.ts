import { Permission } from "@prisma/client"
import {
  BookUser,
  CalendarDays,
  FolderKanban,
  History,
  LayoutDashboard,
  Settings,
  UserCog,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { hasPermission, isAdmin, type SessionUser } from "@/lib/access"

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  isVisible: (user: SessionUser) => boolean
}

export const NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    isVisible: () => true,
  },
  {
    title: "Projetos",
    href: "/projetos",
    icon: FolderKanban,
    isVisible: () => true,
  },
  {
    title: "Clientes",
    href: "/clientes",
    icon: BookUser,
    isVisible: () => true,
  },
  {
    title: "Agenda",
    href: "/agenda",
    icon: CalendarDays,
    isVisible: () => true,
  },
  {
    title: "Histórico",
    href: "/historico",
    icon: History,
    isVisible: (user) => isAdmin(user) || hasPermission(user, Permission.HISTORY_VIEW),
  },
  {
    title: "Usuários",
    href: "/usuarios",
    icon: UserCog,
    isVisible: (user) => isAdmin(user),
  },
  {
    title: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    isVisible: (user) => isAdmin(user) || hasPermission(user, Permission.SETTINGS_MANAGE),
  },
]
