import { ChatPanel } from "@/components/shared/ChatPanel"

export function Chat() {
  return (
    <div className="mx-auto h-[calc(100vh-7rem)] max-w-3xl overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <ChatPanel className="h-full" />
    </div>
  )
}
