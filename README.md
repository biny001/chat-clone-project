# Chatly

A modern, real-time chat application built with Next.js. Chatly delivers a seamless messaging experience with features like file sharing, voice messages, read receipts, and message replies — all in a responsive interface that works across desktop and mobile.

## Features

- **Real-time messaging** — Instant message delivery powered by Ably
- **File sharing** — Send images, videos, documents, and audio files with in-chat upload progress
- **Voice messages** — Record and send voice notes directly from the chat
- **Message replies** — Reply to specific messages with quoted context
- **Message editing** — Edit sent messages with an "(edited)" indicator
- **Read receipts** — Double-check marks when messages are read
- **Typing indicators** — See when the other person is typing
- **Online status** — Green/grey dots showing user availability
- **Unread counts** — Badge counts on conversations with new messages
- **Link previews** — Automatic Open Graph previews for shared URLs
- **In-chat search** — Filter messages within a conversation
- **Image preview overlay** — WhatsApp-style media staging before sending
- **User profiles** — Upload and manage profile avatars
- **Responsive design** — Full mobile support with conversation list/chat toggle

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | React 18, Tailwind CSS, shadcn/ui, Radix UI |
| State | TanStack React Query |
| Real-time | Ably |
| Auth | Better Auth (email/password + Google OAuth) |
| Database | PostgreSQL (Neon) via Prisma 7 |
| File uploads | UploadThing |
| Animations | Framer Motion |
| Icons | Lucide React |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database (Neon recommended)
- Ably account
- UploadThing account
- Google OAuth credentials (optional, for social login)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/chatly.git
   cd chatly
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a `.env` file with the following variables:
   ```
   DATABASE_URL="your-neon-connection-string"
   BETTER_AUTH_SECRET="your-auth-secret"
   NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ABLY_API_KEY="your-ably-api-key"
   UPLOADTHING_TOKEN="your-uploadthing-token"
   ```

4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Scripts

| Command | Description |
|---------|------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |

## Project Structure

```
app/                  # Next.js App Router (pages, API routes)
├── api/              # REST API endpoints
│   ├── messages/     # Send, edit messages
│   ├── conversations/# List, create, read receipts
│   ├── uploadthing/  # File upload handler
│   └── ...
src/
├── components/
│   ├── features/     # Feature-grouped components
│   │   ├── chat/     # ChatArea, MessageBubble, ChatInput, etc.
│   │   ├── conversations/ # ConversationList, ConversationItem
│   │   ├── contact-info/  # ContactInfoPanel, shared media tabs
│   │   ├── auth/     # Login/signup form
│   │   └── ...
│   └── ui/           # shadcn/ui primitives
├── hooks/            # Custom React hooks
├── lib/              # Utilities, auth config, Prisma client
└── types/            # TypeScript interfaces
prisma/
└── schema.prisma     # Database schema
```

## License

MIT
