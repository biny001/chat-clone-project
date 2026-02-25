# Chat SDK Setup for React

Complete chat solution with rooms, messages, typing indicators, presence, and reactions.

## Installation

```bash
npm install @ably/chat ably
```

**Requirements**:

- React 16.8.0 or later
- Ably Realtime client
- `clientId` must be set (required for chat)

## Basic Setup

Chat SDK requires both Ably Realtime and Chat clients:

```typescript
// main.tsx or app.tsx
import * as Ably from 'ably';
import { ChatClient } from '@ably/chat';
import { AblyProvider } from 'ably/react';
import { ChatClientProvider, ChatRoomProvider } from '@ably/chat/react';

// 1. Create Realtime client (outside component)
const realtimeClient = new Ably.Realtime({
  key: import.meta.env.VITE_ABLY_API_KEY,
  clientId: 'user-123', // Required
});

// 2. Create Chat client
const chatClient = new ChatClient(realtimeClient);

// 3. Wrap app with providers
function Root() {
  return (
    <AblyProvider client={realtimeClient}>
      <ChatClientProvider client={chatClient}>
        <ChatRoomProvider name="support:ticket-123">
          <App />
        </ChatRoomProvider>
      </ChatClientProvider>
    </AblyProvider>
  );
}
```

## Provider Hierarchy

Chat requires a specific provider hierarchy:

```
AblyProvider (Ably Realtime client)
  └─ ChatClientProvider (Chat client)
       └─ ChatRoomProvider (specific room name)
            └─ Your components using Chat hooks
```

```typescript
import { AblyProvider } from 'ably/react';
import { ChatClientProvider, ChatRoomProvider } from '@ably/chat/react';

<AblyProvider client={realtimeClient}>
  <ChatClientProvider client={chatClient}>
    {/* You can have multiple ChatRoomProviders */}
    <ChatRoomProvider name="support:ticket-123">
      <SupportChat />
    </ChatRoomProvider>

    <ChatRoomProvider name="team:general">
      <TeamChat />
    </ChatRoomProvider>
  </ChatClientProvider>
</AblyProvider>
```

## Room Naming

Room names follow channel naming conventions:

- Hierarchical with `:` separator: `'support:ticket-123'`, `'team:general'`
- Case-sensitive
- Alphanumeric, hyphens, underscores allowed
- Maximum 512 characters

```typescript
// Good room names
<ChatRoomProvider name="support:ticket-123" />
<ChatRoomProvider name="team:engineering:general" />
<ChatRoomProvider name="dm:user-123:user-456" />
```

## Client Configuration

### Realtime Client Options

```typescript
const realtimeClient = new Ably.Realtime({
  key: apiKey,
  clientId: "user-123", // Required for chat

  // Optional configuration
  authUrl: "/api/auth/token", // Token auth (production)
  echoMessages: false, // Don't receive own messages
  connectionStateTtl: 120000, // Connection timeout
});
```

### Chat Client Options

```typescript
import { ChatClient } from "@ably/chat";

const chatClient = new ChatClient(realtimeClient, {
  // Currently no additional options
  // Future releases may add configuration
});
```

## Message Persistence

Chat messages persist by default:

- **Default retention**: 30 days
- **Maximum retention**: 365 days (configurable in dashboard)
- **History available**: Via `getPreviousMessages()` hook method

Enable extended retention in Ably Dashboard:

1. Go to Settings → Channels
2. Configure message retention (up to 365 days)
3. Save changes

## Dynamic Rooms

Switch between rooms dynamically:

```typescript
function ChatApp() {
  const [roomId, setRoomId] = useState('general');

  return (
    <ChatClientProvider client={chatClient}>
      <ChatRoomProvider name={`team:${roomId}`}>
        <ChatInterface />
      </ChatRoomProvider>

      <button onClick={() => setRoomId('general')}>General</button>
      <button onClick={() => setRoomId('random')}>Random</button>
    </ChatClientProvider>
  );
}
```

When `roomId` changes, the old room is automatically detached and a new room is attached.

## Multiple Rooms

User can be in multiple rooms simultaneously:

```typescript
function MultiRoomChat() {
  return (
    <ChatClientProvider client={chatClient}>
      <div className="chat-layout">
        <div className="chat-pane">
          <ChatRoomProvider name="team:general">
            <ChatRoom title="General" />
          </ChatRoomProvider>
        </div>

        <div className="chat-pane">
          <ChatRoomProvider name="team:engineering">
            <ChatRoom title="Engineering" />
          </ChatRoomProvider>
        </div>
      </div>
    </ChatClientProvider>
  );
}
```

Each `ChatRoomProvider` creates an isolated room context.

## Room Options

Configure room behavior with options:

```typescript
<ChatRoomProvider
  name="support:ticket-123"
  options={{
    reactions: { enabled: true },
    typing: { timeoutMs: 5000 },
    presence: { subscribeOnly: false }
  }}
>
  <ChatInterface />
</ChatRoomProvider>
```

**Available Options**:

```typescript
interface RoomOptions {
  reactions?: {
    enabled: boolean; // Enable room reactions
  };
  typing?: {
    timeoutMs: number; // Typing indicator timeout (default: 5000)
  };
  presence?: {
    subscribeOnly: boolean; // Only subscribe, don't enter presence
  };
}
```

## Authentication

Chat requires `clientId` for message attribution and presence:

```typescript
// Development: API key with clientId
const client = new Ably.Realtime({
  key: 'api-key',
  clientId: 'user-123'
});

// Production: Token auth
const client = new Ably.Realtime({
  authUrl: '/api/auth/token',
  authParams: { userId: '123' }
});

// Token endpoint returns:
{
  "token": "xVLyHw.abc123...",
  "clientId": "user-123"
}
```

See [Authentication](../auth-security.md) for production setup.

## useRoom Hook

Access room instance directly:

```typescript
import { useRoom } from '@ably/chat/react';

function RoomInfo() {
  const { room, roomStatus, roomError } = useRoom();

  useEffect(() => {
    console.log('Room name:', room?.name);
    console.log('Room status:', roomStatus);
  }, [room, roomStatus]);

  if (roomError) {
    return <div>Error: {roomError.message}</div>;
  }

  if (roomStatus === 'attached') {
    return <div>Connected to {room?.name}</div>;
  }

  return <div>Connecting...</div>;
}
```

**Returns**:

```typescript
{
  room: Room | undefined;
  roomStatus: RoomStatus;
  roomError?: Error;
}
```

**RoomStatus Values**:

- `'initialized'` - Room created but not attached
- `'attaching'` - Connecting to room
- `'attached'` - Connected and ready
- `'detaching'` - Disconnecting
- `'detached'` - Disconnected
- `'failed'` - Connection failed

## useChatConnection Hook

Monitor connection status:

```typescript
import { useChatConnection } from '@ably/chat/react';

function ConnectionStatus() {
  const { currentStatus, error } = useChatConnection();

  return (
    <div className={`status-${currentStatus}`}>
      {currentStatus === 'connected' ? '🟢' : '🔴'} {currentStatus}
      {error && <span>Error: {error.message}</span>}
    </div>
  );
}
```

**Returns**:

```typescript
{
  currentStatus: ConnectionStatus;
  error?: Error;
}
```

**ConnectionStatus Values**:

- `'connected'` - Connected to Ably
- `'connecting'` - Establishing connection
- `'disconnected'` - Temporarily disconnected
- `'suspended'` - Connection suspended
- `'failed'` - Connection failed

## Error Handling

```typescript
function SafeChatRoom() {
  const { room, roomStatus, roomError } = useRoom();

  if (roomError) {
    return (
      <div className="error">
        <h3>Failed to connect to chat</h3>
        <p>{roomError.message}</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  if (roomStatus !== 'attached') {
    return <div>Connecting to chat...</div>;
  }

  return <ChatInterface />;
}
```

## Testing Setup

Mock Chat client for testing:

```typescript
// test-utils.tsx
import { ChatClientProvider } from '@ably/chat/react';
import { ChatClient } from '@ably/chat';

export function createMockChatClient() {
  return {
    // Mock Chat methods
  } as unknown as ChatClient;
}

export function renderWithChat(ui: React.ReactElement) {
  const mockClient = createMockChatClient();

  return render(
    <ChatClientProvider client={mockClient}>
      <ChatRoomProvider name="test-room">
        {ui}
      </ChatRoomProvider>
    </ChatClientProvider>
  );
}
```

## Best Practices

1. **Single Client Instance**: Create Chat client once, outside components
2. **ClientId Required**: Always set `clientId` in Realtime config
3. **Provider Hierarchy**: Maintain correct provider nesting order
4. **Room Naming**: Use hierarchical names for organization
5. **Dynamic Rooms**: Let React handle room cleanup on name changes
6. **Token Auth**: Use token auth in production
7. **Error Boundaries**: Wrap Chat components with error boundaries
8. **Connection Monitoring**: Show connection status to users
9. **Message Persistence**: Configure retention based on requirements
10. **Multiple Rooms**: One room provider per conversation context

## Common Errors

### "ClientId must be set"

```typescript
// ❌ Wrong
const client = new Ably.Realtime({ key: apiKey });

// ✅ Correct
const client = new Ably.Realtime({
  key: apiKey,
  clientId: "user-123",
});
```

### "Room provider not found"

```typescript
// ❌ Wrong - using hook outside provider
function App() {
  const { send } = useMessages(); // Error!
}

// ✅ Correct - hook inside provider
<ChatRoomProvider name="room">
  <App />
</ChatRoomProvider>
```

### "Multiple Chat clients detected"

```typescript
// ❌ Wrong - creating client inside component
function App() {
  const client = new ChatClient(realtimeClient);
  return <ChatClientProvider client={client}>...</ChatClientProvider>;
}

// ✅ Correct - client outside component
const chatClient = new ChatClient(realtimeClient);
function App() {
  return <ChatClientProvider client={chatClient}>...</ChatClientProvider>;
}
```

## Next Steps

- [React Hooks](react-hooks.md) - All Chat hooks
- [Messages](messages.md) - Message CRUD operations
- [Features](features.md) - Typing, reactions, presence
- [Authentication](../auth-security.md) - Production token auth

## See Also

- [Chat SDK Documentation](https://ably.com/docs/products/chat)
- [Ably Realtime Setup](https://ably.com/docs/getting-started/setup)
