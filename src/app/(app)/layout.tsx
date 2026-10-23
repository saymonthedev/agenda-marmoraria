import { AppShell } from "@/components/layout/app-shell"
import { requireUser } from "@/lib/authorization"
import { DEMO_MODE } from "@/lib/demo"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser()

  return (
    <AppShell user={user} demo={DEMO_MODE}>
      {children}
    </AppShell>
  )
}
