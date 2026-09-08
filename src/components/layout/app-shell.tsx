"use client"

import { Menu } from "lucide-react"
import { useState } from "react"

import { Logo } from "@/components/brand/logo"
import { SidebarNav } from "@/components/layout/sidebar-nav"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { UserMenu } from "@/components/layout/user-menu"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import type { SessionUser } from "@/lib/access"

export function AppShell({
  user,
  children,
}: {
  user: SessionUser
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-svh">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex h-16 items-center px-5">
          <Logo className="text-sidebar-foreground" markClassName="text-sidebar-foreground" />
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <SidebarNav user={user} />
        </div>
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground">
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
          <div className="flex h-16 items-center px-5">
            <Logo className="text-sidebar-foreground" markClassName="text-sidebar-foreground" />
          </div>
          <div className="flex-1 overflow-y-auto py-4">
            <SidebarNav user={user} onNavigate={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-sm sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="size-5" />
          </Button>
          <div className="lg:hidden">
            <Logo iconOnly />
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <ThemeToggle />
            <UserMenu user={user} />
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden bg-background p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
