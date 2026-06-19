import exifr from "exifr"

export interface PhotoMeta {
  lat: number | null
  lon: number | null
  date: string // ISO — sempre presente (EXIF, data do arquivo ou agora)
}

/**
 * Lê os metadados da foto: data de captura e coordenadas GPS (quando existirem).
 * A data sempre é resolvida — EXIF DateTimeOriginal → data do arquivo → agora.
 */
export async function readPhotoMeta(file: File): Promise<PhotoMeta> {
  let lat: number | null = null
  let lon: number | null = null
  let exifDate: Date | null = null

  try {
    const data = await exifr.parse(file, { gps: true })
    if (data) {
      if (
        typeof data.latitude === "number" &&
        typeof data.longitude === "number" &&
        !(data.latitude === 0 && data.longitude === 0)
      ) {
        lat = data.latitude
        lon = data.longitude
      }
      exifDate = data.DateTimeOriginal ?? data.CreateDate ?? null
    }
  } catch {
    // sem EXIF — segue com fallbacks
  }

  const fallback = file.lastModified ? new Date(file.lastModified) : new Date()
  const d =
    exifDate && !isNaN(exifDate.getTime()) ? exifDate : fallback
  return { lat, lon, date: d.toISOString() }
}

/**
 * Grava as linhas de texto como marca d'água no rodapé da imagem e devolve um
 * novo arquivo JPEG (a imagem é redimensionada para no máx. 1600px no maior lado).
 */
export async function stampWatermark(
  file: File,
  lines: string[]
): Promise<File> {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  }).catch(() => createImageBitmap(file))

  const MAX = 1600
  const scale = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))

  const ctx = canvas.getContext("2d")
  if (!ctx) return file
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

  const pad = Math.round(canvas.width * 0.022)
  const fontSize = Math.max(13, Math.round(canvas.width * 0.026))
  const lineH = fontSize * 1.32
  const barH = lineH * lines.length + pad

  ctx.fillStyle = "rgba(0,0,0,0.55)"
  ctx.fillRect(0, canvas.height - barH, canvas.width, barH)

  ctx.font = `600 ${fontSize}px system-ui, sans-serif`
  ctx.fillStyle = "#ffffff"
  ctx.textBaseline = "top"
  lines.forEach((ln, i) => {
    ctx.fillText(ln, pad, canvas.height - barH + pad / 2 + i * lineH)
  })

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/jpeg", 0.9)
  )
  if (!blob) return file
  const name = file.name.replace(/\.[^.]+$/, "") + ".jpg"
  return new File([blob], name, { type: "image/jpeg" })
}
