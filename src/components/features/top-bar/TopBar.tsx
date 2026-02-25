"use client";

import { Search, Bell, Settings, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageIcon } from "@/components/icons";
import { useAuth } from "@/hooks/use-auth";

interface TopBarProps {
  onProfileClick?: () => void;
}

export const TopBar = ({ onProfileClick }: TopBarProps) => {
  const { user, userInitials } = useAuth();

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-card rounded-2xl">
      {/* Left: Page label */}
      <div className="flex items-center gap-2">
        <MessageIcon />
        <span className="text-sm font-medium text-foreground tracking-tight">Message</span>
      </div>

      {/* Right: Search + icons + profile */}
      <div className="flex items-center gap-2 lg:gap-4">
        <div className="hidden md:flex items-center gap-2 h-8 w-[200px] lg:w-[300px] rounded-[10px] border border-border px-2.5">
          <Search size={14} className="text-muted-foreground shrink-0" />
          <span className="flex-1 text-xs text-muted-foreground">Search</span>
          <span className="hidden lg:flex items-center px-1.5 py-0.5 rounded-md bg-secondary text-xs text-foreground/80">⌘+K</span>
        </div>

        <button className="flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-card hover:bg-muted transition-colors">
          <Bell size={16} className="text-foreground" strokeWidth={1.5} />
        </button>
        <button className="flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-card hover:bg-muted transition-colors">
          <Settings size={16} className="text-foreground" strokeWidth={1.5} />
        </button>

        <div className="w-px h-5 bg-border" />

        <button onClick={onProfileClick} className="flex items-center gap-2 cursor-pointer">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.image ?? undefined} />
            <AvatarFallback className="bg-muted text-xs font-medium text-foreground">{userInitials || "?"}</AvatarFallback>
          </Avatar>
          <ChevronDown size={16} className="text-foreground hidden md:block" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};

export default TopBar;
