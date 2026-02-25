"use client";

import { useState } from "react";
import IconSidebar from "@/components/features/sidebar/IconSidebar";
import TopBar from "@/components/features/top-bar/TopBar";
import { ProfileModal } from "@/components/features/profile/ProfileModal";

interface ChatLayoutProps {
  children: React.ReactNode;
}

/**
 * Chat layout — wraps all chat-related pages with the sidebar + top bar shell.
 */
const ChatLayout = ({ children }: ChatLayoutProps) => {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-secondary">
      <IconSidebar onProfileClick={() => setProfileOpen(true)} />
      <div className="flex flex-1 flex-col p-3 pl-0 gap-3">
        <TopBar onProfileClick={() => setProfileOpen(true)} />
        <div className="flex flex-1 gap-3 overflow-hidden">
          {children}
        </div>
      </div>
      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
    </div>
  );
};

export default ChatLayout;
