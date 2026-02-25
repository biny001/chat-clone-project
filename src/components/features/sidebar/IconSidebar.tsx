"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HomeIcon, ChatCircleIcon, CompassIcon, FolderIcon, ImagesIcon, StarFourIcon, LogoIcon } from "@/components/icons";
import { LogoMenu } from "./LogoMenu";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  { icon: HomeIcon, label: "Home" },
  { icon: ChatCircleIcon, label: "Messages" },
  { icon: CompassIcon, label: "Explore" },
  { icon: FolderIcon, label: "Files" },
  { icon: ImagesIcon, label: "Media" },
];

export const IconSidebar = () => {
  const [activeNav, setActiveNav] = useState("Messages");
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, userInitials } = useAuth();

  return (
    <div className="relative flex h-full w-[76px] flex-col items-center justify-between py-6 px-4">
      {/* Top section */}
      <div className="flex flex-col items-center gap-8">
        <button onClick={() => setMenuOpen(!menuOpen)} className="cursor-pointer">
          <LogoIcon />
        </button>

        <nav className="flex flex-col items-center gap-2">
          {navItems.map((item) => (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setActiveNav(item.label)}
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-lg transition-colors",
                    activeNav === item.label
                      ? "bg-[#F0FDF4] border border-[#1E9A80]"
                      : "hover:bg-muted"
                  )}
                >
                  <item.icon />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="flex flex-col items-center gap-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-muted transition-colors">
              <StarFourIcon />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">AI</TooltipContent>
        </Tooltip>
        <Avatar className="h-11 w-11 cursor-pointer">
          <AvatarImage src={user?.image || undefined} />
          <AvatarFallback className="bg-muted text-xs font-medium">{userInitials || "?"}</AvatarFallback>
        </Avatar>
      </div>

      <LogoMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
};

export default IconSidebar;
