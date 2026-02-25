# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev           # Start Next.js dev server (port 3000)
npm run build         # Production build
npm run start         # Start production server
npm run lint          # Run ESLint
```

## Architecture

**Stack:** Next.js 16 (App Router) + React 18 + TypeScript, with shadcn/ui components and Tailwind CSS for styling.

**Routing (Next.js App Router in `app/`):**
- `/` → Chat interface (ChatLayout + ChatPage)
- `/auth` → Login/signup page
- `not-found.tsx` → 404

**Providers** are in `app/providers.tsx` (client component wrapping QueryClientProvider, TooltipProvider, Toasters).

**Component Layout Hierarchy:**
```
RootLayout (app/layout.tsx — Inter font, global CSS, Providers)
└── ChatLayout (IconSidebar + TopBar shell)
    └── ChatPage (state owner: activeConversation, messages, contactInfo toggle)
        ├── ConversationList (left panel)
        ├── ChatArea → ChatHeader + MessageBubble groups + ChatInput (center)
        └── ContactInfoPanel (right, toggled)
```

**Key directories:**
- `app/` — Next.js App Router pages and layout
- `src/components/features/` — Feature-grouped components (chat, chat-layout, conversations, contact-info, sidebar, top-bar, auth, not-found)
- `src/components/ui/` — shadcn/ui primitives (don't edit directly unless customizing)
- `src/components/icons/` — Custom SVG icon components
- `src/data/mock/` — Mock conversations, messages, contacts, media data
- `src/types/chat.ts` — All TypeScript interfaces (Conversation, Message, Contact, etc.)
- `src/hooks/` — Custom hooks (use-toast, use-click-outside, use-mobile)

**Client vs Server components:** All interactive components under `src/components/features/` and `src/components/ui/` have `"use client"` directives. The `app/` route files are server components that import client components.

**State management:** Local React state in ChatPage; React Query infrastructure is set up but not deeply used yet. No global store.

**Data:** All data is currently mock (in-memory from `src/data/mock/`). Auth form submit is a placeholder. Backend integration is not yet implemented.

## Styling Conventions

- Tailwind utility classes with CSS variables for theming (HSL format in `src/index.css`)
- Primary color: `#1E9A80` (teal). Custom chat colors: `--chat-sent`, `--chat-received`, `--chat-bg`
- Dark mode via class-based `.dark` toggle (next-themes)
- Use `cn()` from `src/lib/utils.ts` to merge conditional Tailwind classes
- shadcn/ui components configured via `components.json` (default style, CSS variables enabled)
- Static assets go in `public/`
