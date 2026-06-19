import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Building2, LayoutGrid, List } from "lucide-react"
import { useObras } from "@/hooks/useObras"
import { useAuth } from "@/hooks/useAuth"
import { ObraCardSmart } from "@/components/obra/ObraCardSmart"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ObraLoader } from "@/components/ui/loaders"
import { cn } from "@/lib/utils"

type View = "card" | "list"

export function ObrasList() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { data: obras, isLoading } = useObras()
  const [view, setView] = useState<View>(
    () => (localStorage.getItem("obras_view") as View) || "card"
  )

  function changeView(v: View) {
    setView(v)
    localStorage.setItem("obras_view", v)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">Obras</h1>
          <p className="text-sm text-text-secondary">
            {obras?.length ?? 0} obra(s) acessível(is)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border bg-surface p-0.5">
            <button
              onClick={() => changeView("card")}
              aria-label="Visualização em cards"
              aria-pressed={view === "card"}
              className={cn(
                "flex size-9 items-center justify-center rounded-md transition-colors",
                view === "card"
                  ? "bg-primary-surface text-primary"
                  : "text-text-muted hover:text-text-secondary"
              )}
            >
              <LayoutGrid className="size-[18px]" />
            </button>
            <button
              onClick={() => changeView("list")}
              aria-label="Visualização em lista"
              aria-pressed={view === "list"}
              className={cn(
                "flex size-9 items-center justify-center rounded-md transition-colors",
                view === "list"
                  ? "bg-primary-surface text-primary"
                  : "text-text-muted hover:text-text-secondary"
              )}
            >
              <List className="size-[18px]" />
            </button>
          </div>
          {isAdmin && (
            <Button onClick={() => navigate("/obras/nova")}>
              <Plus className="size-4" /> Nova Obra
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <ObraLoader />
      ) : !obras || obras.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Building2 className="size-10 text-text-muted" />
            <p className="text-sm text-text-secondary">
              Nenhuma obra cadastrada.
            </p>
            {isAdmin && (
              <Button onClick={() => navigate("/obras/nova")}>
                <Plus className="size-4" /> Criar primeira obra
              </Button>
            )}
          </CardContent>
        </Card>
      ) : view === "card" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {obras.map((obra) => (
            <ObraCardSmart key={obra.id_obra} obra={obra} view="card" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {obras.map((obra) => (
            <ObraCardSmart key={obra.id_obra} obra={obra} view="list" />
          ))}
        </div>
      )}
    </div>
  )
}
