import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts"
import { healthColor } from "@/lib/utils"

interface HealthGaugeProps {
  score: number
  classificacao?: string
  periodo?: string
  rdos_analisados?: number
  size?: number
  compact?: boolean
}

export function HealthGauge({
  score,
  classificacao,
  periodo,
  rdos_analisados,
  size = 160,
  compact = false,
}: HealthGaugeProps) {
  const color = healthColor(score)
  const data = [{ name: "saude", value: score, fill: color.hex }]

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <RadialBarChart
          width={size}
          height={size}
          cx="50%"
          cy="50%"
          innerRadius="72%"
          outerRadius="100%"
          barSize={12}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background={{ fill: "#E2E8F0" }}
            dataKey="value"
            cornerRadius={8}
            angleAxisId={0}
            isAnimationActive
            animationDuration={800}
            animationEasing="ease-out"
          />
        </RadialBarChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-heading font-bold leading-none"
            style={{ color: color.hex, fontSize: size * 0.28 }}
          >
            {score}
          </span>
          {!compact && (
            <span className="mt-0.5 text-[10px] uppercase tracking-wide text-text-muted">
              / 100
            </span>
          )}
        </div>
      </div>
      {!compact && (
        <div className="mt-2 text-center">
          {classificacao && (
            <p
              className="font-heading text-sm font-semibold uppercase tracking-wide"
              style={{ color: color.hex }}
            >
              {classificacao}
            </p>
          )}
          {periodo && (
            <p className="text-xs text-text-muted">{periodo}</p>
          )}
          {rdos_analisados !== undefined && (
            <p className="text-xs text-text-muted">
              {rdos_analisados} RDOs analisados
            </p>
          )}
        </div>
      )}
    </div>
  )
}
