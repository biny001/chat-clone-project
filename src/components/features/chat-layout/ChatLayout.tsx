"use client";

import IconSidebar from "@/components/features/sidebar/IconSidebar";
import TopBar from "@/components/features/top-bar/TopBar";

interface ChatLayoutProps {
  children: React.ReactNode;
}

/**
 * Chat layout — wraps all chat-related pages with the sidebar + top bar shell.
 */
const ChatLayout = ({ children }: ChatLayoutProps) => {
  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-secondary">
      <IconSidebar />
      <div className="flex flex-1 flex-col p-3 pl-0 gap-3">
        <TopBar />
        <div className="flex flex-1 gap-3 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;
