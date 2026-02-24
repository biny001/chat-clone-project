import { Home, MessageSquare, FileText, FolderOpen, Image, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { icon: Home, label: "Home", active: false },
  { icon: MessageSquare, label: "Messages", active: true },
  { icon: FileText, label: "Notes", active: false },
  { icon: FolderOpen, label: "Files", active: false },
  { icon: Image, label: "Media", active: false },
];

const IconSidebar = () => {
  return (
    <div className="flex h-full w-[68px] flex-col items-center justify-between bg-sidebar py-6">
      <div className="flex flex-col items-center gap-5">
        {navItems.map((item) => (
          <Tooltip key={item.label}>
            <TooltipTrigger asChild>
              <button
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                  item.active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/10 hover:text-sidebar-primary"
                )}
              >
                <item.icon size={20} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="flex h-10 w-10 items-center justify-center rounded-xl text-sidebar-foreground hover:bg-sidebar-accent/10">
              <Settings size={20} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Settings</TooltipContent>
        </Tooltip>
        <Avatar className="h-9 w-9 cursor-pointer">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
            JD
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

export default IconSidebar;
