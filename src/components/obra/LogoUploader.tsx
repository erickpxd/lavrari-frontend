import { useRef } from "react"
import { ImagePlus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const ACCEPT = "image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"

export function LogoUploader({
  label,
  description,
  currentUrl,
  onUpload,
  isPending,
}: {
  label: string
  description?: string
  currentUrl?: string | null
  onUpload: (file: File) => void
  isPending?: boolean
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (file) onUpload(file)
  }

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
      <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-white">
        {currentUrl ? (
          <img
            src={currentUrl}
            alt={label}
            className="size-full object-contain p-1.5"
          />
        ) : (
          <ImagePlus className="size-6 text-text-muted" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-text-primary">{label}</p>
        {description && (
          <p className="text-xs text-text-muted">{description}</p>
        )}
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={handle}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          disabled={isPending}
          onClick={() => fileRef.current?.click()}
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ImagePlus className="size-4" />
          )}
          {currentUrl ? "Trocar imagem" : "Enviar imagem"}
        </Button>
      </div>
    </div>
  )
}
