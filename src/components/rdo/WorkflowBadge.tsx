import { Badge } from "@/components/ui/badge"
import { STATUS_RDO, PIPELINE_ORDER } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { StatusRDO } from "@/lib/types"

export function WorkflowBadge({ status }: { status: StatusRDO }) {
  const cfg = STATUS_RDO[status]
  return (
    <Badge className={cfg.badge}>
      <span className={cn("size-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </Badge>
  )
}

export function WorkflowPipeline({ status }: { status: StatusRDO }) {
  const currentIdx = PIPELINE_ORDER.indexOf(status)

  return (
    <div className="flex items-center overflow-x-auto py-2 scrollbar-thin">
      {PIPELINE_ORDER.map((s, i) => {
        const past = i < currentIdx
        const current = i === currentIdx
        const cfg = STATUS_RDO[s]
        return (
          <div key={s} className="flex shrink-0 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
                  current &&
                    "border-primary bg-primary text-white ring-2 ring-primary/30",
                  past && "border-primary bg-primary text-white",
                  !past && !current &&
                    "border-slate-300 bg-white text-slate-300 opacity-50"
                )}
              >
                {past ? "✓" : i + 1}
              </span>
              <span
                className={cn(
                  "max-w-[64px] text-center text-[10px] font-medium leading-tight",
                  current ? "text-primary" : "text-text-muted"
                )}
              >
                {cfg.label}
              </span>
            </div>
            {i < PIPELINE_ORDER.length - 1 && (
              <span
                className={cn(
                  "mx-1 h-0.5 w-8 rounded-full sm:w-10",
                  i < currentIdx ? "bg-primary" : "bg-slate-200"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
