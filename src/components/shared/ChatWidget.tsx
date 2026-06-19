import { useState } from "react"
import { useLocation } from "react-router-dom"
import { MessageSquare, X } from "lucide-react"
import { ChatPanel } from "./ChatPanel"
import { cn } from "@/lib/utils"

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  // Não exibir o widget na página de chat full-screen
  if (location.pathname === "/ia/chat") return null

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Abrir assistente IA"
        className={cn(
          "fixed bottom-5 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105",
          open && "rotate-90"
        )}
      >
        {open ? <X className="size-6" /> : <MessageSquare className="size-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-40 flex h-[70vh] max-h-[600px] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
          <ChatPanel className="h-full" />
        </div>
      )}
    </>
  )
}
