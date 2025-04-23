import { ChatContainer } from "@/components/chat-container"

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Chat Dashboard</h1>
      <ChatContainer />
    </div>
  )
}

