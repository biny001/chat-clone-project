"use client";

import { useRef, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useUserSearch } from "@/hooks/use-user-search";
import { useCreateConversation } from "@/hooks/use-conversations";

interface NewMessagePopupProps {
  open: boolean;
  onClose: () => void;
  onConversationCreated: (id: string) => void;
}

export const NewMessagePopup = ({ open, onClose, onConversationCreated }: NewMessagePopupProps) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  useClickOutside(popupRef, onClose, open);
  const { data: contacts = [], isLoading } = useUserSearch(searchQuery);
  const createConversation = useCreateConversation();

  if (!open) return null;

  const handleContactClick = async (userId: string) => {
    const result = await createConversation.mutateAsync(userId);
    onConversationCreated(result.chatSession.id);
    setSearchQuery("");
    onClose();
  };

  return (
    <div
      ref={popupRef}
      className="absolute right-0 top-full mt-2 z-50 flex flex-col items-center p-3 w-[calc(100vw-2rem)] md:w-[273px] max-w-[273px] bg-card border border-border rounded-2xl shadow-[0px_0px_24px_rgba(0,0,0,0.06)]"
    >
      <div className="flex flex-col w-full gap-4">
        <h3 className="text-sm font-semibold text-foreground px-2">New Message</h3>

        <div className="flex items-center gap-2 h-8 rounded-[10px] border border-border px-2.5">
          <Search size={14} className="shrink-0 text-muted-foreground" />
          <input
            placeholder="Search name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            autoFocus
          />
        </div>

        <ScrollArea className="max-h-[328px]">
          <div className="flex flex-col gap-1">
            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 size={16} className="animate-spin text-muted-foreground" />
              </div>
            )}
            {!isLoading && searchQuery && contacts.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No users found</p>
            )}
            {contacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => handleContactClick(contact.id)}
                disabled={createConversation.isPending}
                className="flex items-center gap-2.5 px-2 py-[6px] rounded-lg hover:bg-[hsl(60,14%,94%)] transition-colors w-full text-left disabled:opacity-50"
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
