"use client";

import { useState } from "react";
import { X, Phone, Video } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useSharedMedia } from "@/hooks/use-shared-media";
import { MediaTab, LinksTab, DocsTab } from "./ContactInfoTabs";

interface ContactInfoPanelProps {
  name: string;
  avatar: string;
  email?: string;
  chatSessionId?: string;
  onClose: () => void;
}

const tabs = ["Media", "Link", "Docs"] as const;
type Tab = typeof tabs[number];

export const ContactInfoPanel = ({ name, avatar, email, chatSessionId, onClose }: ContactInfoPanelProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("Media");
  const { data: sharedMedia } = useSharedMedia(chatSessionId ?? null);

  return (
    <div className="flex flex-col w-full md:w-[450px] h-full bg-card rounded-none md:rounded-3xl p-4 md:p-6 gap-4 md:gap-6 shadow-[0px_4px_32px_rgba(0,0,0,0.12)] animate-in slide-in-from-right duration-300">
      {/* Title */}
      <div className="flex items-center gap-2.5">
        <h2 className="flex-1 text-xl font-semibold leading-7" style={{ color: "#111625" }}>
          Contact Info
        </h2>
        <button onClick={onClose} className="w-6 h-6 flex items-center justify-center">
          <X size={16} strokeWidth={1.5} style={{ color: "#596881" }} />
        </button>
      </div>

      {/* Profile */}
      <div className="flex flex-col items-center gap-4">
        <Avatar className="h-[72px] w-[72px]">
          <AvatarFallback className="bg-[#F7F9FB] text-foreground text-lg font-semibold">
            {avatar}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-center gap-1">
          <span className="text-base font-medium leading-6 tracking-[-0.011em]" style={{ color: "#111625" }}>
            {name}
          </span>
          <span className="text-xs font-normal leading-4" style={{ color: "#8B8B8B" }}>
            {email || `${name.toLowerCase().replace(/\s/g, "")}@shipz.com`}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg border border-[#E8E5DF] bg-card">
          <Phone size={18} strokeWidth={0.975} style={{ color: "#111625" }} />
          <span className="text-sm font-medium leading-5 tracking-[-0.006em]" style={{ color: "#111625" }}>Audio</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg border border-[#E8E5DF] bg-card">
          <Video size={18} strokeWidth={0.975} style={{ color: "#111625" }} />
          <span className="text-sm font-medium leading-5 tracking-[-0.006em]" style={{ color: "#111625" }}>Video</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-col gap-3 flex-1 min-h-0">
        <div className="flex items-center justify-center p-[2px] rounded-xl bg-[#F3F3EE] w-[167px] h-10">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex items-center justify-center px-2.5 py-2 h-9 rounded-[10px] text-sm font-medium leading-5 tracking-[-0.006em] transition-all",
                activeTab === tab ? "bg-card shadow-[0px_0px_16px_rgba(0,0,0,0.06)]" : ""
              )}
              style={{ color: activeTab === tab ? "#111625" : "#8B8B8B" }}
            >
              {tab}
            </button>
          ))}
        </div>

        <ScrollArea className="flex-1">
          {activeTab === "Media" && (
            <MediaTab mediaByMonth={sharedMedia?.media ?? []} />
          )}
          {activeTab === "Link" && (
            <LinksTab linksByMonth={sharedMedia?.links ?? []} />
          )}
          {activeTab === "Docs" && (
            <DocsTab filesByMonth={sharedMedia?.files ?? []} />
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default ContactInfoPanel;
