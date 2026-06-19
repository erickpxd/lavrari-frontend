import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FONTE_DADO, EVENTOS_RESTRICAO_FLAGS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { RDOResponse, CondicaoClimatica, EventosRestricao } from "@/lib/types"

export function RDOReadView({ rdo }: { rdo: RDOResponse }) {
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Condições climáticas</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <ClimaView titulo="Manhã" clima={rdo.clima_manha} />
          <ClimaView titulo="Tarde" clima={rdo.clima_tarde} />
        </CardContent>
      </Card>

      <ListTable
        title="Pessoal Direto"
        rows={rdo.pessoal_direto ?? []}
        cols={["funcao", "quantidade"]}
        labels={["Função", "Qtd"]}
      />
      <ListTable
        title="Pessoal Indireto"
        rows={rdo.pessoal_indireto ?? []}
        cols={["funcao", "quantidade"]}
        labels={["Função", "Qtd"]}
      />
      <ListTable
        title="Equipamentos"
        rows={rdo.equipamentos ?? []}
        cols={["nome", "quantidade"]}
        labels={["Nome", "Qtd"]}
      />
      <ListTable
        title="Serviços"
        rows={rdo.servicos ?? []}
        cols={["descricao", "grupo", "situacao"]}
        labels={["Descrição", "Grupo", "Situação"]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Eventos com Restrição</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {EVENTOS_RESTRICAO_FLAGS.map((f) => {
              const active = rdo.eventos_restricao?.[
                f.key as keyof EventosRestricao
              ] as boolean | undefined
              return (
                <Badge
                  key={f.key}
                  className={cn(
                    active
                      ? "border-danger/30 bg-red-50 text-danger"
                      : "border-border bg-slate-50 text-text-muted"
                  )}
                >
                  {f.label}
                </Badge>
              )
            })}
          </div>
          {rdo.eventos_restricao?.descricao && (
            <p className="text-sm text-text-secondary">
              {rdo.eventos_restricao.descricao}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ocorrências & Resumo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <TextBlock label="Ocorrências" value={rdo.ocorrencias} />
          <TextBlock label="Resumo do dia" value={rdo.resumo_dia} />
        </CardContent>
      </Card>
    </div>
  )
}

function ClimaView({
  titulo,
  clima,
}: {
  titulo: string
  clima?: CondicaoClimatica | null
}) {
  const fonteCfg = clima?.fonte ? FONTE_DADO[clima.fonte] : null
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-medium">{titulo}</span>
        {fonteCfg && (
          <Badge className={cn("border-transparent", fonteCfg.badge)}>
            {fonteCfg.label}
          </Badge>
        )}
      </div>
      <p className="text-sm">{clima?.tempo || "—"}</p>
      {clima && (
        <Badge
          className={cn(
            "mt-1",
            clima.praticavel
              ? "border-success/30 bg-green-50 text-success"
              : "border-danger/30 bg-red-50 text-danger"
          )}
        >
          {clima.praticavel ? "Praticável" : "Não praticável"}
        </Badge>
      )}
    </div>
  )
}

function ListTable({
  title,
  rows,
  cols,
  labels,
}: {
  title: string
  rows: readonly unknown[]
  cols: string[]
  labels: string[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-text-muted">Nenhum item.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {labels.map((l) => (
                  <TableHead key={l}>{l}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r, i) => (
                <TableRow key={i}>
                  {cols.map((c) => (
                    <TableCell key={c}>
                      {String((r as Record<string, unknown>)[c] ?? "—")}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

function TextBlock({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-text-muted">{label}</p>
      <p className="whitespace-pre-wrap text-sm">{value || "—"}</p>
    </div>
  )
}
