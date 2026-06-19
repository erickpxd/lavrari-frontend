import { useEffect, useState } from "react"
import { ImageOff } from "lucide-react"
import { useAuthStore } from "@/stores/authStore"
import { mediaUrl } from "@/lib/api"
import { cn } from "@/lib/utils"

/**
 * Carrega imagens de mídia que podem estar atrás de autenticação.
 * Tenta primeiro o <img> direto; se falhar, busca o arquivo com o token
 * (Authorization: Bearer) e exibe via blob URL. Mostra placeholder ao falhar.
 */
export function AuthImage({
  src,
  alt = "",
  className,
}: {
  src?: string | null
  alt?: string
  className?: string
}) {
  const url = mediaUrl(src)
  const [resolved, setResolved] = useState<string | null>(url || null)
  const [state, setState] = useState<"loading" | "ok" | "error">(
    url ? "loading" : "error"
  )

  // Fallback: rebusca ignorando cache (HTTP e service worker) e com o token,
  // pra contornar uma resposta de erro (403/401) cacheada anteriormente.
  async function fetchFresh() {
    try {
      const token = useAuthStore.getState().access_token
      const bust = `${url.includes("?") ? "&" : "?"}_cb=${Date.now()}`
      const res = await fetch(`${url}${bust}`, {
        cache: "reload",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) throw new Error(String(res.status))
      const blob = await res.blob()
      return URL.createObjectURL(blob)
    } catch {
      return null
    }
  }

  useEffect(() => {
    setResolved(url || null)
    setState(url ? "loading" : "error")
  }, [url])

  if (state === "error") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-1 bg-muted text-text-muted",
          className
        )}
      >
        <ImageOff className="size-6" />
        <span className="text-[11px]">imagem indisponível</span>
      </div>
    )
  }

  return (
    <>
      {state === "loading" && (
        <div className={cn("animate-pulse bg-muted", className)} />
      )}
      <img
        src={resolved ?? url}
        alt={alt}
        loading="lazy"
        referrerPolicy="no-referrer"
        className={cn(className, state === "loading" && "hidden")}
        onLoad={() => setState("ok")}
        onError={async () => {
          // tenta novamente ignorando cache antes de desistir
          const blobUrl = await fetchFresh()
          if (blobUrl) {
            setResolved(blobUrl)
            setState("ok")
          } else {
            setState("error")
          }
        }}
      />
    </>
  )
}
