"use client";

import { useState } from "react";
import IconSidebar from "@/components/features/sidebar/IconSidebar";
import TopBar from "@/components/features/top-bar/TopBar";
import { ProfileModal } from "@/components/features/profile/ProfileModal";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatLayoutProps {
  children: React.ReactNode;
}

/**
 * Chat layout — wraps all chat-related pages with the sidebar + top bar shell.
 */
const ChatLayout = ({ children }: ChatLayoutProps) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-secondary">
      {!isMobile && <IconSidebar onProfileClick={() => setProfileOpen(true)} />}
      <div className={`flex flex-1 flex-col gap-3 ${isMobile ? "p-0" : "p-3 pl-0"}`}>
        {!isMobile && <TopBar onProfileClick={() => setProfileOpen(true)} />}
        <div className={`flex flex-1 overflow-hidden ${isMobile ? "" : "gap-3"}`}>
          {children}
        </div>
      </div>
      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
    </div>
  );
};

export default ChatLayout;
