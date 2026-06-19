import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { cn } from "@/lib/utils"

/**
 * Renderiza texto Markdown (negrito, listas, títulos, tabelas, código)
 * com estilos consistentes para uso no chat e saídas de IA.
 */
export function Markdown({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "text-sm leading-relaxed [&_a]:text-primary [&_a]:underline",
        "[&_p]:my-1 first:[&_p]:mt-0 last:[&_p]:mb-0",
        "[&_strong]:font-semibold [&_strong]:text-text-primary",
        "[&_em]:italic",
        "[&_ul]:my-1.5 [&_ul]:list-disc [&_ul]:pl-5",
        "[&_ol]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-5",
        "[&_li]:my-0.5",
        "[&_h1]:mb-1 [&_h1]:mt-2 [&_h1]:font-heading [&_h1]:text-base [&_h1]:font-bold",
        "[&_h2]:mb-1 [&_h2]:mt-2 [&_h2]:font-heading [&_h2]:text-sm [&_h2]:font-bold",
        "[&_h3]:mb-1 [&_h3]:mt-1.5 [&_h3]:font-heading [&_h3]:text-sm [&_h3]:font-semibold",
        "[&_code]:rounded [&_code]:bg-black/5 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs",
        "[&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-slate-900 [&_pre]:p-3 [&_pre>code]:bg-transparent [&_pre>code]:text-slate-100",
        "[&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-text-secondary",
        "[&_table]:my-2 [&_table]:w-full [&_table]:border-collapse [&_table]:text-xs",
        "[&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:px-2 [&_th]:py-1 [&_th]:text-left",
        "[&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1",
        "[&_hr]:my-2 [&_hr]:border-border",
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  )
}
