import { useRef } from "react";
import { Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useClickOutside } from "@/hooks/use-click-outside";
import type { Contact } from "@/types/chat";

interface NewMessagePopupProps {
  open: boolean;
  onClose: () => void;
  contacts: Contact[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const NewMessagePopup = ({ open, onClose, contacts, searchQuery, onSearchChange }: NewMessagePopupProps) => {
  const popupRef = useRef<HTMLDivElement>(null);
  useClickOutside(popupRef, onClose, open);

  if (!open) return null;

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      ref={popupRef}
      className="absolute right-0 top-full mt-2 z-50 flex flex-col items-center p-3 w-[273px] bg-card border border-border rounded-2xl shadow-[0px_0px_24px_rgba(0,0,0,0.06)]"
    >
      <div className="flex flex-col w-full gap-4">
        <h3 className="text-sm font-semibold text-foreground px-2">New Message</h3>

        <div className="flex items-center gap-2 h-8 rounded-[10px] border border-border px-2.5">
          <Search size={14} className="shrink-0 text-muted-foreground" />
          <input
            placeholder="Search name or email"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            autoFocus
          />
        </div>

        <ScrollArea className="max-h-[328px]">
          <div className="flex flex-col gap-1">
            {filtered.map((contact) => (
              <button
                key={contact.id}
                onClick={onClose}
                className="flex items-center gap-2.5 px-2 py-[6px] rounded-lg hover:bg-[hsl(60,14%,94%)] transition-colors w-full text-left"
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="text-[10px] font-semibold text-foreground bg-muted">
                    {contact.avatar}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground">{contact.name}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
