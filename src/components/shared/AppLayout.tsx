import { useState } from "react"
import { Outlet, NavLink, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Building2,
  Users,
  Briefcase,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Bell,
  HardHat,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useAlertas } from "@/hooks/useAlertas"
import { cn, getInitials } from "@/lib/utils"
import { ChatWidget } from "./ChatWidget"

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
  adminOnly?: boolean
}

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/obras", label: "Obras", icon: Building2 },
  { to: "/ia/chat", label: "Assistente IA", icon: MessageSquare },
  { to: "/admin/usuarios", label: "Usuários", icon: Users, adminOnly: true },
  { to: "/admin/empresas", label: "Empresas", icon: Briefcase, adminOnly: true },
]

export function AppLayout() {
  const { usuario, isAdmin, logout } = useAuth()
  const { data: alertas } = useAlertas()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const naoLidos = alertas?.filter((a) => !a.lido).length ?? 0
  const items = NAV.filter((n) => !n.adminOnly || isAdmin)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-gradient-to-b from-dark-bg to-dark-surface lg:flex">
        <SidebarContent items={items} onNavigate={() => {}} />
      </aside>

      {/* Sidebar mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-gradient-to-b from-dark-bg to-dark-surface">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 text-white/70"
            >
              <X className="size-6" />
            </button>
            <SidebarContent
              items={items}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        {/* Navbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border bg-dark-bg px-4 text-white">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden"
              aria-label="Menu"
            >
              <Menu className="size-6" />
            </button>
            <span className="font-heading text-lg font-bold tracking-tight lg:hidden">
              LAVRARI
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="relative"
              aria-label="Alertas"
            >
              <Bell className="size-5" />
              {naoLidos > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold">
                  {naoLidos > 9 ? "9+" : naoLidos}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate("/perfil")}
              className="flex items-center gap-2"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-accent font-heading text-sm font-semibold text-accent-foreground">
                {getInitials(usuario?.nome)}
              </span>
              <span className="hidden text-sm font-medium sm:block">
                {usuario?.nome}
              </span>
            </button>
            <button onClick={logout} aria-label="Sair" title="Sair">
              <LogOut className="size-5 text-white/70 hover:text-white" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      <ChatWidget />
    </div>
  )
}

function SidebarContent({
  items,
  onNavigate,
}: {
  items: NavItem[]
  onNavigate: () => void
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <span className="flex size-9 items-center justify-center rounded-lg bg-accent">
          <HardHat className="size-5 text-accent-foreground" />
        </span>
        <span className="font-heading text-xl font-bold tracking-tight text-white">
          LAVRARI
        </span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex min-h-[48px] items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )
            }
          >
            <item.icon className="size-5 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 px-5 py-4">
        <p className="text-xs text-white/40">SUAPE / DINFRA · 2026</p>
      </div>
    </div>
  )
}
