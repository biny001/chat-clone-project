# Channels API Reference

Channels are the foundation of Ably's pub-sub messaging system. All other features (Spaces, Chat, LiveSync) are built on top of channels.

## Getting a Channel

```typescript
import * as Ably from "ably";

const realtime = new Ably.Realtime({ key: apiKey });
const channel = realtime.channels.get("channel-name");
```

Channel names:

- Case-sensitive
- Can include alphanumeric characters, hyphens, underscores
- Support hierarchical namespaces with `:` separator: `'chat:room-1'`, `'user:123:notifications'`
- Maximum length: 512 characters

## Publishing Messages

```typescript
// Simple publish
await channel.publish("event-name", { message: "Hello World" });

// Publish with metadata
await channel.publish("event-name", data, {
  extras: {
    headers: { priority: "high" },
  },
});

// Publish multiple messages atomically
await channel.publish([
  { name: "event1", data: { value: 1 } },
  { name: "event2", data: { value: 2 } },
]);

// Publish callback style
channel.publish("event", data, (err) => {
  if (err) console.error("Publish failed:", err);
});
```

### Message Structure

```typescript
interface Message {
  name: string; // Event name
  data: any; // Message payload (JSON-serializable)
  id: string; // Unique message ID
  timestamp: number; // Server timestamp (milliseconds since epoch)
  clientId?: string; // Publisher's client ID (if authenticated)
  connectionId: string; // Publisher's connection ID
  encoding?: string; // Data encoding/encryption info
  extras?: {
    headers?: Record<string, string>;
    [key: string]: any;
  };
}
```

## Subscribing to Messages

```typescript
// Subscribe to all events
channel.subscribe((message: Ably.Message) => {
  console.log("Received:", message.name, message.data);
});

// Subscribe to specific event
channel.subscribe("event-name", (message) => {
  console.log("Event data:", message.data);
});

// Multiple event handlers
const handler1 = (msg) => console.log("Handler 1:", msg.data);
const handler2 = (msg) => console.log("Handler 2:", msg.data);

channel.subscribe("event", handler1);
channel.subscribe("event", handler2);

// Unsubscribe specific handler
channel.unsubscribe("event", handler1);

// Unsubscribe all handlers for event
channel.unsubscribe("event");

// Unsubscribe all handlers
channel.unsubscribe();
```

### React Hook: useChannel

```typescript
import { useChannel } from 'ably/react';

function MyComponent() {
  const { channel, publish, ably } = useChannel('my-channel', (message) => {
    console.log('Message received:', message);
  });

  const handleSend = () => {
    publish('greet', { text: 'Hello!' });
  };

  return <button onClick={handleSend}>Send</button>;
}

// Subscribe to specific event
useChannel({ channelName: 'my-channel', events: ['user-joined'] }, (message) => {
  console.log('User joined:', message.data);
});

// Skip subscription (only get channel instance)
const { channel } = useChannel({ channelName: 'my-channel', skip: true });
```

**Return Values**:

- `channel`: Channel instance for direct API access
- `publish`: Convenience function for publishing (same as `channel.publish`)
- `ably`: Realtime client instance

## Channel History

Retrieve past messages (stored for 2 minutes by default, extendable to 365 days):

```typescript
// Get last 50 messages
const history = await channel.history({ limit: 50 });

console.log(history.items); // Array of messages (reverse chronological)
console.log(history.hasNext()); // More pages available?

if (history.hasNext()) {
  const nextPage = await history.next();
  console.log(nextPage.items);
}

// Get messages from specific time
const since = Date.now() - 3600000; // Last hour
const recent = await channel.history({
  limit: 100,
  start: since,
});

// Direction control
const oldest = await channel.history({
  limit: 10,
  direction: "forwards", // 'backwards' (default) or 'forwards'
});
```

**History Options**:

```typescript
interface HistoryOptions {
  start?: number; // Timestamp (ms) - earliest message
  end?: number; // Timestamp (ms) - latest message
  direction?: "forwards" | "backwards";
  limit?: number; // Max messages (default 100, max 1000)
}
```

### Pattern: Load History Before Live Updates

```typescript
function ChatWithHistory() {
  const [messages, setMessages] = useState<Ably.Message[]>([]);
  const [loading, setLoading] = useState(true);

  const { channel } = useChannel('chat', (message) => {
    setMessages(prev => [...prev, message]);
  });

  useEffect(() => {
    async function loadHistory() {
      try {
        const history = await channel.history({ limit: 50 });
        setMessages(history.items.reverse()); // Oldest first
      } catch (error) {
        console.error('Failed to load history:', error);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [channel]);

  if (loading) return <div>Loading history...</div>;

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>
          {msg.data.text} <small>{new Date(msg.timestamp).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}
```

## Channel States and Lifecycle

Channels have distinct states:

```typescript
type ChannelState =
  | "initialized" // Created but not attached
  | "attaching" // Connecting to Ably
  | "attached" // Connected and ready
  | "detaching" // Disconnecting
  | "detached" // Disconnected
  | "suspended" // Temporarily disconnected
  | "failed"; // Permanent failure

console.log(channel.state); // Current state
```

### State Change Listeners

```typescript
channel.on("attached", () => {
  console.log("Channel attached");
});

channel.on("failed", (error) => {
  console.error("Channel failed:", error);
});

channel.on((stateChange) => {
  console.log("State change:", stateChange.previous, "->", stateChange.current);
  if (stateChange.reason) {
    console.log("Reason:", stateChange.reason.message);
  }
});

// Remove listener
const listener = (stateChange) => console.log(stateChange);
channel.on(listener);
channel.off(listener);
```

### Attach and Detach

```typescript
// Explicitly attach
await channel.attach();
console.log("Channel attached");

// Detach when done
await channel.detach();
console.log("Channel detached");

// Check if attached
if (channel.state === "attached") {
  await channel.publish("event", data);
}
```

**Note**: `subscribe()` automatically attaches the channel. Explicit `attach()` is only needed when you want to establish the channel without subscribing.

## Channel Options

Configure channels with options:

```typescript
const channel = realtime.channels.get("my-channel", {
  params: {
    rewind: "10m", // Replay messages from last 10 minutes on attach
    delta: "vcdiff", // Enable delta compression
  },
  modes: [
    "PUBLISH", // Can publish
    "SUBSCRIBE", // Can subscribe
    "PRESENCE", // Can use presence
    "PRESENCE_SUBSCRIBE", // Can subscribe to presence
  ],
});
```

**Rewind Options**:

- `'1'` - Replay last message
- `'10'` - Replay last 10 messages
- `'5m'` - Replay last 5 minutes
- `'1h'` - Replay last hour

**Channel Modes**:

- `PUBLISH` - Publishing capability
- `SUBSCRIBE` - Subscribing capability
- `PRESENCE` - Presence enter/update/leave
- `PRESENCE_SUBSCRIBE` - Presence event subscription

## ChannelProvider (React)

Provide channel context to nested components:

```typescript
import { ChannelProvider, useChannel } from 'ably/react';

function App() {
  return (
    <ChannelProvider channelName="notifications">
      <NotificationList />
      <NotificationSender />
    </ChannelProvider>
  );
}

// Both components access the same channel
function NotificationList() {
  const { channel } = useChannel('notifications', (msg) => {
    // Handle message
  });
  return <div>Listening on channel: {channel.name}</div>;
}

function NotificationSender() {
  const { publish } = useChannel('notifications');
  return <button onClick={() => publish('alert', { text: 'Hi' })}>Send</button>;
}
```

**ChannelProvider Props**:

```typescript
interface ChannelProviderProps {
  channelName: string;
  options?: ChannelOptions;
  children: React.ReactNode;
  id?: string; // Optional ID for multiple providers
  ablyId?: string; // Specific Ably client ID (if multiple clients)
}
```

## Message Queuing and Ordering

Ably guarantees message ordering per publisher:

```typescript
// These messages will arrive in order
await channel.publish("event1", { seq: 1 });
await channel.publish("event2", { seq: 2 });
await channel.publish("event3", { seq: 3 });
```

When offline, messages are queued automatically:

```typescript
// Configure queue size
const realtime = new Ably.Realtime({
  key: apiKey,
  queueMessages: true, // Queue messages when disconnected (default: true)
  maxMessageSize: 65536, // Max message size (bytes)
});

// Messages published while offline are queued
channel.publish("event", data); // Queued if disconnected
```

## Error Handling

```typescript
// Promise-based error handling
try {
  await channel.publish("event", data);
} catch (error) {
  console.error("Publish failed:", error);
  // error.code - Ably error code
  // error.statusCode - HTTP status code
  // error.message - Error description
}

// Callback-based error handling
channel.publish("event", data, (error) => {
  if (error) {
    console.error("Publish failed:", error);
  }
});

// Subscribe errors (connection issues)
channel.subscribe(
  (message) => {
    // Handle message
  },
  (error) => {
    if (error) {
      console.error("Subscription error:", error);
    }
  },
);
```

## TypeScript Types

```typescript
import type * as Ably from "ably";

// Channel types
const channel: Ably.RealtimeChannel = realtime.channels.get("my-channel");

// Message handler
const handleMessage = (message: Ably.Message) => {
  const data: MessageData = message.data;
  const timestamp: number = message.timestamp;
  const clientId: string | undefined = message.clientId;
};

// History result
const history: Ably.PaginatedResult<Ably.Message> = await channel.history();
const messages: Ably.Message[] = history.items;

// State change
channel.on((stateChange: Ably.ChannelStateChange) => {
  const current: Ably.ChannelState = stateChange.current;
  const previous: Ably.ChannelState = stateChange.previous;
  const reason: Ably.ErrorInfo | null = stateChange.reason;
});
```

## Best Practices

1. **Channel Naming**: Use hierarchical names for organization and filtering: `'user:123:notifications'`, `'room:lobby-1'`
2. **Message Size**: Keep messages under 64KB. Use references/URLs for large data.
3. **Event Names**: Use descriptive event names for filtering: `'user-joined'`, `'message-sent'`
4. **Unsubscribe**: Clean up subscriptions in component unmount (React hooks handle this)
5. **Error Handling**: Always handle publish errors, especially for critical operations
6. **History Limits**: Request only necessary history to reduce latency and bandwidth
7. **State Monitoring**: Listen to channel state changes for better UX during connection issues
8. **Rewind**: Use rewind parameter instead of explicit history call when possible for efficiency
9. **Batching**: Publish multiple messages in one call for better performance
10. **Idempotency**: Use unique message IDs in data for deduplication if needed

## See Also

- [Presence](presence.md) - Track member online status
- [Authentication](../auth-security.md) - Secure channel access
- [Connection Management](../auth-security.md#connection-management) - Handle reconnection
