import { useState } from "react";
import { X, Phone, Video } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

interface ContactInfoPanelProps {
  name: string;
  avatar: string;
  email?: string;
  onClose: () => void;
}

const tabs = ["Media", "Link", "Docs"] as const;
type Tab = typeof tabs[number];

const mediaByMonth = [
  {
    month: "May",
    items: [
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
      "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    ],
  },
  {
    month: "April",
    items: [
      "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
      "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
      "linear-gradient(135deg, #0250c5 0%, #d43f8d 100%)",
      "linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)",
      "linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)",
    ],
  },
  {
    month: "March",
    items: [
      "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)",
      "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      "linear-gradient(135deg, #e44d26 0%, #f16529 100%)",
      "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
      "linear-gradient(135deg, #c1dfc4 0%, #deecdd 100%)",
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    ],
  },
];

const linksByMonth = [
  {
    month: "May",
    links: [
      { url: "https://basecamp.net/", description: "Discover thousands of premium UI kits, templates, and design resources tailored for designers, developers, and...", color: "#1D1D1F" },
      { url: "https://notion.com/", description: "A new tool that blends your everyday work apps into one. It's the all-in-one workspace for you and your team.", color: "#E8E5DF" },
      { url: "https://asana.com/", description: "Work anytime, anywhere with Asana. Keep remote and distributed teams, and your entire organization, focused...", color: "#F06A6A" },
      { url: "https://trello.com/", description: "Make the impossible, possible with Trello. The ultimate teamwork project management tool. Start up board in se...", color: "#0079BF" },
    ],
  },
];

const ContactInfoPanel = ({ name, avatar, email, onClose }: ContactInfoPanelProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("Media");

  return (
    <div className="flex flex-col w-[450px] h-full bg-card rounded-3xl p-6 gap-6 shadow-[0px_4px_32px_rgba(0,0,0,0.12)] animate-in slide-in-from-right duration-300">
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
        {/* Switch group - exact Figma: w-[167px] h-10 p-[2px] rounded-xl */}
        <div className="flex items-center justify-center p-[2px] rounded-xl bg-[#F3F3EE] w-[167px] h-10">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex items-center justify-center px-2.5 py-2 h-9 rounded-[10px] text-sm font-medium leading-5 tracking-[-0.006em] transition-all",
                activeTab === tab
                  ? "bg-card shadow-[0px_0px_16px_rgba(0,0,0,0.06)]"
                  : ""
              )}
              style={{ color: activeTab === tab ? "#111625" : "#8B8B8B" }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <ScrollArea className="flex-1">
          {activeTab === "Media" && (
            <div className="flex flex-col gap-3">
              {mediaByMonth.map((group) => (
                <div key={group.month} className="flex flex-col gap-1">
                  <div className="flex items-center px-3 py-2 h-8 rounded-lg bg-[#F8F8F5]">
                    <span className="text-xs font-medium leading-4" style={{ color: "#8B8B8B" }}>
                      {group.month}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {group.items.map((bg, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-lg"
                        style={{ background: bg }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "Link" && (
            <div className="flex flex-col gap-3">
              {linksByMonth.map((group) => (
                <div key={group.month} className="flex flex-col gap-3">
                  <div className="flex items-center px-3 py-2 h-8 rounded-lg bg-[#F8F8F5]">
                    <span className="text-xs font-medium leading-4" style={{ color: "#596881" }}>
                      {group.month}
                    </span>
                  </div>
                  <div className="flex flex-col gap-4">
                    {group.links.map((link, i) => (
                      <div key={i} className="flex items-center gap-3">
                        {/* Logo */}
                        <div
                          className="w-[60px] h-[60px] shrink-0 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: link.color }}
                        >
                          {new URL(link.url).hostname.split(".")[0].charAt(0).toUpperCase()}
                        </div>
                        {/* Descriptions */}
                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                          <span className="text-sm font-medium leading-5 tracking-[-0.006em] truncate" style={{ color: "#111625" }}>
                            {link.url}
                          </span>
                          <span className="text-xs font-normal leading-4 line-clamp-2" style={{ color: "#8B8B8B" }}>
                            {link.description}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "Docs" && (
            <div className="flex items-center justify-center py-12">
              <span className="text-sm" style={{ color: "#8B8B8B" }}>No documents shared yet</span>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default ContactInfoPanel;
