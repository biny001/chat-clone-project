import type { MediaGroup } from "@/types/chat";

interface MediaTabProps {
  mediaByMonth: MediaGroup[];
}

export const MediaTab = ({ mediaByMonth }: MediaTabProps) => {
  return (
    <div className="flex flex-col gap-3">
      {mediaByMonth.map((group) => (
        <div key={group.month} className="flex flex-col gap-1">
          <MonthHeader month={group.month} />
          <div className="grid grid-cols-4 gap-1">
            {group.items.map((bg, i) => (
              <div key={i} className="aspect-square rounded-lg" style={{ background: bg }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

interface LinkTabProps {
  linksByMonth: { month: string; links: { url: string; description: string; color: string }[] }[];
}

export const LinksTab = ({ linksByMonth }: LinkTabProps) => {
  return (
    <div className="flex flex-col gap-3">
      {linksByMonth.map((group) => (
        <div key={group.month} className="flex flex-col gap-3">
          <MonthHeader month={group.month} variant="secondary" />
          <div className="flex flex-col gap-4">
            {group.links.map((link, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-[60px] h-[60px] shrink-0 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: link.color }}
                >
                  {new URL(link.url).hostname.split(".")[0].charAt(0).toUpperCase()}
                </div>
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
  );
};

interface DocsTabProps {
  docsByMonth: { month: string; docs: { name: string; pages?: string; size: string; type: string; tagColor: string }[] }[];
}

export const DocsTab = ({ docsByMonth }: DocsTabProps) => {
  const FileIcon = ({ type, tagColor }: { type: string; tagColor: string }) => (
    <svg width="32" height="36" viewBox="0 0 32 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip-file)">
        <path d="M8.09961 0.674805H19.9697L30.8252 11.5303V32.4004C30.825 34.0155 29.5155 35.325 27.9004 35.3252H8.09961C6.48449 35.325 5.17502 34.0155 5.1748 32.4004V3.59961C5.17502 1.98449 6.48449 0.675016 8.09961 0.674805Z" fill="white" stroke="#E8E5DF" strokeWidth="1.35"/>
        <path d="M19.7998 0.900002V9C19.7998 10.4912 21.0086 11.7 22.4998 11.7H30.5998" stroke="#E8E5DF" strokeWidth="1.35" strokeLinecap="round"/>
      </g>
      <rect y="16.9" width="22.5" height="14.6" rx="1.8" fill={tagColor}/>
      <text x="11.25" y="26.5" fill="white" fontFamily="Inter" fontWeight="700" fontSize="9" letterSpacing="-0.02em" textAnchor="middle" dominantBaseline="central" style={{ textTransform: "uppercase" as const }}>
        {type}
      </text>
      <defs>
        <clipPath id="clip-file">
          <rect width="27" height="36" fill="white" transform="translate(4.5)"/>
        </clipPath>
      </defs>
    </svg>
  );

  return (
    <div className="flex flex-col gap-3">
      {docsByMonth.map((group) => (
        <div key={group.month} className="flex flex-col gap-3">
          <MonthHeader month={group.month} variant="secondary" />
          <div className="flex flex-col gap-3">
            {group.docs.map((doc, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-[60px] h-[60px] shrink-0 rounded-xl bg-[#F3F3EE] flex items-center justify-center">
                  <FileIcon type={doc.type} tagColor={doc.tagColor} />
                </div>
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <span className="text-sm font-medium leading-5 tracking-[-0.006em] truncate" style={{ color: "#1C1C1C" }}>
                    {doc.name}
                  </span>
                  <div className="flex items-center gap-2">
                    {doc.pages && (
                      <>
                        <span className="text-xs font-normal leading-4" style={{ color: "#8B8B8B" }}>{doc.pages}</span>
                        <span className="text-xs font-normal leading-4" style={{ color: "#8B8B8B" }}>•</span>
                      </>
                    )}
                    <span className="text-xs font-normal leading-4" style={{ color: "#8B8B8B" }}>{doc.size}</span>
                    <span className="text-xs font-normal leading-4" style={{ color: "#8B8B8B" }}>•</span>
                    <span className="text-xs font-normal leading-4" style={{ color: "#8B8B8B" }}>{doc.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

/** Reusable month header pill */
function MonthHeader({ month, variant = "primary" }: { month: string; variant?: "primary" | "secondary" }) {
  return (
    <div className="flex items-center px-3 py-2 h-8 rounded-lg bg-[#F8F8F5]">
      <span
        className="text-xs font-medium leading-4"
        style={{ color: variant === "secondary" ? "#596881" : "#8B8B8B" }}
      >
        {month}
      </span>
    </div>
  );
}
