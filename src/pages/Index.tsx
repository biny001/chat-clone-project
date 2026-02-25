import ChatLayout from "@/app/chat/layout";
import ChatPage from "@/app/chat/page";

/**
 * Index route — composes the chat layout with the chat page,
 * mirroring how Next.js App Router would render layout.tsx + page.tsx.
 */
const Index = () => {
  return (
    <ChatLayout>
      <ChatPage />
    </ChatLayout>
  );
};

export default Index;
