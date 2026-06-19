import { useNavigate } from "react-router-dom"
import { Plus, Building2 } from "lucide-react"
import { useObras } from "@/hooks/useObras"
import { useAuth } from "@/hooks/useAuth"
import { ObraCardSmart } from "@/components/obra/ObraCardSmart"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ObraLoader } from "@/components/ui/loaders"

export function ObrasList() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { data: obras, isLoading } = useObras()

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Obras</h1>
          <p className="text-sm text-text-secondary">
            {obras?.length ?? 0} obra(s) acessível(is)
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => navigate("/obras/nova")}>
            <Plus className="size-4" /> Nova Obra
          </Button>
        )}
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
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {obras.map((obra) => (
            <ObraCardSmart key={obra.id_obra} obra={obra} />
          ))}
        </div>
      )}
    </div>
  )
}
