import ChatLayout from "@/components/features/chat-layout/ChatLayout";
import ChatPage from "@/components/features/chat-layout/ChatPage";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <ChatLayout>
      <ChatPage />
    </ChatLayout>
  );
}
