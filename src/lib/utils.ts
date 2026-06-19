import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(iso?: string | null): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function formatDateTime(iso?: string | null): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (isNaN(d.getTime())) return "—"
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function toISODate(d: Date): string {
  return d.toISOString().split("T")[0]
}

export function truncateHash(hash?: string | null, len = 8): string {
  if (!hash) return "—"
  if (hash.length <= len * 2) return hash
  return `${hash.slice(0, len)}…${hash.slice(-4)}`
}

export function healthColor(score: number): {
  text: string
  bg: string
  border: string
  hex: string
} {
  if (score > 70)
    return {
      text: "text-success",
      bg: "bg-green-50",
      border: "border-success",
      hex: "#16A34A",
    }
  if (score >= 40)
    return {
      text: "text-warning",
      bg: "bg-amber-50",
      border: "border-warning",
      hex: "#D97706",
    }
  return {
    text: "text-danger",
    bg: "bg-red-50",
    border: "border-danger",
    hex: "#DC2626",
  }
}

export function cnpjMask(value: string): string {
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .slice(0, 18)
}

/**
 * Lê um arquivo de imagem e o redimensiona para um quadrado padrão (contain,
 * sem esticar), centralizado sobre fundo branco. Retorna um data URL PNG.
 */
export function resizeImageToDataURL(file: File, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error("Falha ao ler a imagem"))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error("Imagem inválida"))
      img.onload = () => {
        const canvas = document.createElement("canvas")
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext("2d")
        if (!ctx) return reject(new Error("Canvas indisponível"))
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, size, size)
        const scale = Math.min(size / img.width, size / img.height)
        const w = img.width * scale
        const h = img.height * scale
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h)
        resolve(canvas.toDataURL("image/png"))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

export function getInitials(nome?: string): string {
  if (!nome) return "?"
  const parts = nome.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
