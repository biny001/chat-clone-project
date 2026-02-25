import type { MediaGroup, LinkGroup, DocGroup } from "@/types/chat";

export const mediaByMonth: MediaGroup[] = [
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

export const linksByMonth: LinkGroup[] = [
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

export const docsByMonth: DocGroup[] = [
  {
    month: "May",
    docs: [
      { name: "Document Requirement.pdf", pages: "10 pages", size: "16 MB", type: "pdf", tagColor: "#FF1607" },
      { name: "User Flow.pdf", pages: "7 pages", size: "32 MB", type: "pdf", tagColor: "#FF1607" },
      { name: "Existing App.fig", size: "213 MB", type: "fig", tagColor: "#6E45F0" },
      { name: "Product Illustrations.ai", size: "72 MB", type: "ai", tagColor: "#FF5C00" },
      { name: "Quotation-Hikariworks-May.pdf", pages: "2 pages", size: "329 KB", type: "pdf", tagColor: "#FF1607" },
    ],
  },
];
