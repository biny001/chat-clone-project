import { Search, Bell, Settings, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const MessageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.5 16.6666L3.58333 13.4166C2.64704 12.0319 2.30833 10.392 2.63018 8.80188C2.95204 7.21179 3.91255 5.77969 5.33314 4.77186C6.75373 3.76403 8.53772 3.24905 10.3534 3.32266C12.1691 3.39628 13.8929 4.05349 15.2044 5.1721C16.5159 6.2907 17.3257 7.79458 17.4834 9.40412C17.641 11.0137 17.1358 12.6193 16.0616 13.9226C14.9873 15.2258 13.4172 16.138 11.6432 16.4894C9.86911 16.8409 8.01183 16.6077 6.41667 15.8333L2.5 16.6666Z" stroke="#596881" strokeWidth="1.875" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TopBar = () => {
  return (
    <div className="flex items-center justify-between px-6 py-3 bg-card rounded-2xl">
      {/* Left: Page label */}
      <div className="flex items-center gap-2">
        <MessageIcon />
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
