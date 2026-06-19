import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

const MAX_MS = 6000

export function Splash({ onFinish }: { onFinish: () => void }) {
  const [leaving, setLeaving] = useState(false)
  const finishedRef = useRef(false)

  function finish() {
    if (finishedRef.current) return
    finishedRef.current = true
    setLeaving(true)
    window.setTimeout(onFinish, 700)
  }

  useEffect(() => {
    const t = window.setTimeout(finish, MAX_MS)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-white transition-all duration-700 ease-out",
        leaving ? "scale-105 opacity-0" : "scale-100 opacity-100"
      )}
    >
      <video
        src="/assets/videos/motion-logo.mp4"
        autoPlay
        muted
        playsInline
        onEnded={finish}
        onError={finish}
        className={cn(
          "w-[85vw] max-w-2xl transition-all duration-700 ease-out",
          leaving ? "scale-95" : "scale-100"
        )}
      />
    </div>
  )
}
