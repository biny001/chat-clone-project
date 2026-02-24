import { Search, Bell, Settings, ChevronDown, MessageSquareMore } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const TopBar = () => {
  return (
    <div className="flex items-center justify-between px-6 py-3 bg-card rounded-2xl">
      {/* Left: Page label */}
      <div className="flex items-center gap-2">
        <MessageSquareMore size={20} className="text-muted-foreground" strokeWidth={1.875} />
        <span className="text-sm font-medium text-foreground tracking-tight">Message</span>
      </div>

      {/* Right: Search + icons + profile */}
      <div className="flex items-center gap-4">
        {/* Search bar */}
        <div className="flex items-center gap-2 h-8 w-[300px] rounded-[10px] border border-border px-2.5">
          <Search size={14} className="text-muted-foreground shrink-0" />
          <span className="flex-1 text-xs text-muted-foreground">Search</span>
          <span className="flex items-center px-1.5 py-0.5 rounded-md bg-secondary text-xs text-foreground/80">⌘+K</span>
        </div>

        {/* Bell icon */}
        <button className="flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-card hover:bg-muted transition-colors">
          <Bell size={16} className="text-foreground" strokeWidth={1.5} />
        </button>

        {/* Settings icon */}
        <button className="flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-card hover:bg-muted transition-colors">
          <Settings size={16} className="text-foreground" strokeWidth={1.5} />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-border" />

        {/* Profile */}
        <div className="flex items-center gap-2 cursor-pointer">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-muted text-xs font-medium text-foreground">JD</AvatarFallback>
          </Avatar>
          <ChevronDown size={16} className="text-foreground" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
};

export default TopBar;
