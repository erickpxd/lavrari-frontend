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
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 bg-background/95 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.12)] backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* Esquerda: menu mobile + logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="text-primary lg:hidden"
              aria-label="Menu"
            >
              {mobileOpen ? (
                <X className="size-6" />
              ) : (
                <Menu className="size-6" />
              )}
            </button>
            <NavLink to="/dashboard" className="flex items-center">
              <img
                src="/assets/logos/logo-horizontal.png"
                alt="Laurari"
                className="h-20 w-auto shrink-0 translate-y-[2px]"
              />
            </NavLink>
          </div>

          {/* Centro: navegação */}
          <nav className="hidden items-center gap-1 lg:flex">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary-surface text-primary"
                      : "text-text-secondary hover:bg-primary-surface/50 hover:text-primary"
                  )
                }
              >
                <item.icon className="size-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Direita: alertas, perfil, sair */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="relative text-text-secondary transition-colors hover:text-primary"
              aria-label="Alertas"
            >
              <Bell className="size-5" />
              {naoLidos > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
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
              <span className="hidden text-sm font-medium text-text-primary sm:block">
                {usuario?.nome}
              </span>
            </button>
            <button
              onClick={logout}
              aria-label="Sair"
              title="Sair"
              className="text-text-muted transition-colors hover:text-primary"
            >
              <LogOut className="size-5" />
            </button>
          </div>
        </div>

        {/* Navegação mobile */}
        {mobileOpen && (
          <nav className="space-y-1 border-t border-border bg-background px-4 py-2 lg:hidden">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex min-h-[48px] items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary-surface text-primary"
                      : "text-text-secondary hover:bg-primary-surface/50 hover:text-primary"
                  )
                }
              >
                <item.icon className="size-5 shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">
        <Outlet />
      </main>

      <ChatWidget />
    </div>
  )
}
