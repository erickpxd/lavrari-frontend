import { useState, useRef, useCallback, useEffect } from "react"
import { api } from "@/lib/api"

export function useVoice() {
  const [recording, setRecording] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  useEffect(() => cleanup, [cleanup])

  const start = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []
      const rec = new MediaRecorder(stream)
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      rec.start()
      mediaRef.current = rec
      setRecording(true)
      setSeconds(0)
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    } catch {
      setError("Microfone indisponível — verifique as permissões")
    }
  }, [])

  const stop = useCallback(async (): Promise<string | null> => {
    const rec = mediaRef.current
    if (!rec) return null
    return new Promise((resolve) => {
      rec.onstop = async () => {
        cleanup()
        setRecording(false)
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        if (blob.size === 0) {
          resolve(null)
          return
        }
        setTranscribing(true)
        try {
          const form = new FormData()
          form.append("arquivo", blob, "audio.webm")
          const res = await api.postForm<{ texto: string }>(
            "/ia/transcricao",
            form
          )
          resolve(res.texto)
        } catch {
          setError("Falha na transcrição")
          resolve(null)
        } finally {
          setTranscribing(false)
        }
      }
      rec.stop()
    })
  }, [cleanup])

  return { recording, transcribing, seconds, error, start, stop }
}
