# Presence

Presence enables tracking of members on a channel - who's online, their status, and custom data.

## Overview

Presence is built on top of channels and allows clients to:

- Enter a presence set (announce they're online)
- Update their presence data (status, profile info)
- Leave the presence set (announce they're offline)
- Subscribe to presence events from other members

**Use Cases**:

- Online user lists
- Typing indicators
- Active editor indicators
- User location tracking (which page/component)
- Connection status displays

## Entering Presence

Announce presence on a channel:

```typescript
import * as Ably from "ably";

const realtime = new Ably.Realtime({
  key: apiKey,
  clientId: "user-123", // Required for presence
});

const channel = realtime.channels.get("chat:room-1");

// Enter without data
await channel.presence.enter();

// Enter with data
await channel.presence.enter({
  username: "Alice",
  avatar: "/avatars/alice.jpg",
  status: "active",
});

// Callback style
channel.presence.enter(data, (err) => {
  if (err) console.error("Failed to enter:", err);
  else console.log("Entered presence");
});
```

**Important**: `clientId` is required for presence operations. Set it in the Realtime client constructor or use token authentication.

## Updating Presence

Update presence data while remaining in the set:

```typescript
// Update status
await channel.presence.update({
  username: "Alice",
  avatar: "/avatars/alice.jpg",
  status: "away", // Changed from 'active'
});

// Update frequently (e.g., typing indicator)
const startTyping = () => {
  channel.presence.update({ typing: true });
};

const stopTyping = () => {
  channel.presence.update({ typing: false });
};
```

## Leaving Presence

Explicitly leave the presence set:

```typescript
await channel.presence.leave();

// Leave with data
await channel.presence.leave({
  reason: "User logged out",
});
```

**Auto-leave**: Presence automatically removes members when:

- Connection is lost (after timeout)
- Channel is detached
- Client is closed

## Getting Present Members

Retrieve current members in the presence set:

```typescript
// Get all present members
const members = await channel.presence.get();

members.forEach((member: Ably.PresenceMessage) => {
  console.log(member.clientId); // Client ID
  console.log(member.data); // Presence data
  console.log(member.connectionId); // Connection ID
  console.log(member.timestamp); // Last update timestamp
});

// Filter by clientId
const alice = await channel.presence.get({ clientId: "user-alice" });

// Filter by connectionId
const connection = await channel.presence.get({
  connectionId: "hd9fj3jf93",
});
```

### PresenceMessage Structure

```typescript
interface PresenceMessage {
  action: "enter" | "update" | "leave" | "present";
  clientId: string; // Member's client ID
  connectionId: string; // Connection ID
  data?: any; // Presence data
  encoding?: string; // Data encoding
  id: string; // Message ID
  timestamp: number; // Server timestamp
}
```

## Subscribing to Presence Events

Listen for presence changes:

```typescript
// Subscribe to all presence events
channel.presence.subscribe((presenceMessage) => {
  console.log(`${presenceMessage.clientId} ${presenceMessage.action}`);
  console.log("Data:", presenceMessage.data);
});

// Subscribe to specific action
channel.presence.subscribe("enter", (member) => {
  console.log(`${member.clientId} joined`);
});

channel.presence.subscribe("leave", (member) => {
  console.log(`${member.clientId} left`);
});

channel.presence.subscribe("update", (member) => {
  console.log(`${member.clientId} updated:`, member.data);
});

// Multiple handlers
const handleEnter = (member) => console.log("Enter:", member);
channel.presence.subscribe("enter", handleEnter);

// Unsubscribe specific handler
channel.presence.unsubscribe("enter", handleEnter);

// Unsubscribe all
channel.presence.unsubscribe();
```

**Presence Actions**:

- `enter` - Member entered presence
- `update` - Member updated their data
- `leave` - Member left presence
- `present` - Member was already present (used in `get()` results)

## React Hooks

### usePresence

Enter presence and automatically clean up on unmount:

```typescript
import { usePresence } from 'ably/react';

function UserOnline() {
  // Enter with data
  usePresence('chat:room-1', {
    username: 'Alice',
    avatar: '/avatars/alice.jpg',
    status: 'active'
  });

  // Component automatically leaves presence on unmount
  return <div>You are online</div>;
}

// Update based on state
function UserWithStatus() {
  const [status, setStatus] = useState('active');

  usePresence('chat:room-1', {
    username: 'Alice',
    status  // Updates automatically when status changes
  });

  return (
    <select value={status} onChange={(e) => setStatus(e.target.value)}>
      <option value="active">Active</option>
      <option value="away">Away</option>
      <option value="busy">Busy</option>
    </select>
  );
}
```

### usePresenceListener

Subscribe to presence updates:

```typescript
import { usePresenceListener } from 'ably/react';

function OnlineUserList() {
  const { presenceData, updateStatus } = usePresenceListener('chat:room-1');

  return (
    <div>
      <h3>Online ({presenceData.length})</h3>
      <ul>
        {presenceData.map((member) => (
          <li key={member.connectionId}>
            <img src={member.data?.avatar} alt="" />
            <span>{member.data?.username}</span>
            <span className={`status-${member.data?.status}`}>
              {member.data?.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Return Values**:

- `presenceData: PresenceMessage[]` - Array of current members
- `updateStatus: (status: any) => void` - Update own presence data

### Combined Pattern: Enter + Listen

```typescript
function CollaborativeEditor() {
  // Enter presence
  usePresence('document:123', {
    user: 'Alice',
    cursor: { line: 0, col: 0 }
  });

  // Listen to others
  const { presenceData } = usePresenceListener('document:123');

  return (
    <div>
      <Editor />
      <div className="collaborators">
        {presenceData
          .filter(m => m.clientId !== 'current-user-id')
          .map(member => (
            <Cursor
              key={member.connectionId}
              position={member.data?.cursor}
              user={member.data?.user}
            />
          ))}
      </div>
    </div>
  );
}
```

## Presence History

Retrieve past presence events:

```typescript
const history = await channel.presence.history({ limit: 50 });

history.items.forEach((event: Ably.PresenceMessage) => {
  console.log(`${event.clientId} ${event.action} at ${event.timestamp}`);
});

// Paginate through history
if (history.hasNext()) {
  const nextPage = await history.next();
  console.log(nextPage.items);
}

// Time-based filtering
const recent = await channel.presence.history({
  start: Date.now() - 3600000, // Last hour
  limit: 100,
});
```

## Typing Indicators Pattern

Build typing indicators with presence updates:

```typescript
function TypingIndicator() {
  const typingTimeoutRef = useRef<number>();

  const { presenceData } = usePresenceListener('chat:room-1');

  const typingUsers = presenceData.filter(m => m.data?.typing);

  const handleKeyPress = () => {
    // Update presence to typing: true
    channel.presence.update({ typing: true });

    // Reset timeout
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      channel.presence.update({ typing: false });
    }, 3000);
  };

  return (
    <div>
      <input onKeyPress={handleKeyPress} />
      {typingUsers.length > 0 && (
        <div>
          {typingUsers.map(u => u.data?.username).join(', ')}
          {typingUsers.length === 1 ? ' is' : ' are'} typing...
        </div>
      )}
    </div>
  );
}
```

**Note**: For high-frequency typing indicators, consider using Chat SDK's `useTyping()` hook which is optimized for this pattern.

## Online Status Pattern

Display online/offline status:

```typescript
function UserStatus({ userId }: { userId: string }) {
  const [isOnline, setIsOnline] = useState(false);
  const { presenceData } = usePresenceListener('global:presence');

  useEffect(() => {
    const user = presenceData.find(m => m.clientId === userId);
    setIsOnline(!!user);
  }, [presenceData, userId]);

  return (
    <span className={isOnline ? 'online' : 'offline'}>
      {isOnline ? '🟢 Online' : '⚫ Offline'}
    </span>
  );
}
```

## Avatar Stack Pattern

Display avatars of online users:

```typescript
function AvatarStack() {
  const { presenceData } = usePresenceListener('room:lobby');

  const maxVisible = 5;
  const visible = presenceData.slice(0, maxVisible);
  const overflow = presenceData.length - maxVisible;

  return (
    <div className="avatar-stack">
      {visible.map((member, i) => (
        <img
          key={member.connectionId}
          src={member.data?.avatar}
          alt={member.data?.username}
          style={{ zIndex: maxVisible - i }}
          title={member.data?.username}
        />
      ))}
      {overflow > 0 && (
        <div className="avatar-overflow">+{overflow}</div>
      )}
    </div>
  );
}
```

## Presence vs Spaces

**Use Presence when**:

- Simple online/offline tracking
- Using core Ably channels
- Need direct control over presence data
- Building custom presence UI

**Use Spaces when**:

- Building collaborative features (cursors, locations, locks)
- Need optimized high-frequency updates
- Want purpose-built React hooks
- Need component locking functionality

Spaces is built on top of Presence but provides optimized abstractions. See [Spaces documentation](../spaces/) for details.

## Limits and Quotas

- **Members per channel**: 100 by default (configurable up to 1,000)
- **Presence data size**: Keep under 1KB for efficiency
- **Update frequency**: No hard limit, but avoid excessive updates (>10/second)
- **Presence timeout**: Members auto-removed after 15 seconds of connection loss

## Error Handling

```typescript
try {
  await channel.presence.enter({ user: "Alice" });
} catch (error) {
  if (error.code === 40160) {
    console.error("ClientId required for presence");
  } else if (error.code === 40120) {
    console.error("Presence limit exceeded");
  } else {
    console.error("Presence error:", error);
  }
}

// Common error codes
// 40160 - ClientId not set
// 40120 - Presence member limit exceeded
// 91004 - Channel detached/failed
```

## TypeScript Types

```typescript
import type * as Ably from "ably";

// Presence message handler
const handlePresence = (msg: Ably.PresenceMessage) => {
  const action: "enter" | "update" | "leave" | "present" = msg.action;
  const clientId: string = msg.clientId;
  const data: any = msg.data;
};

// Presence data interface
interface PresenceData {
  username: string;
  avatar: string;
  status: "active" | "away" | "busy";
  typing?: boolean;
}

const handleTypedPresence = (msg: Ably.PresenceMessage) => {
  const data = msg.data as PresenceData;
  console.log(data.username, data.status);
};
```

## Best Practices

1. **Set clientId**: Always set `clientId` in Realtime constructor for presence
2. **Small Data**: Keep presence data under 1KB for performance
3. **Update Frequency**: Throttle high-frequency updates (e.g., cursor positions)
4. **Explicit Leave**: Call `leave()` before navigation/logout for better UX
5. **Connection Monitoring**: Show connection status to explain presence changes
6. **Deduplication**: Use `connectionId` as React keys, not `clientId` (multiple connections per user)
7. **Privacy**: Don't include sensitive data in presence (it's visible to all channel members)
8. **Timeouts**: Implement activity timeouts for auto-away status
9. **Member Limits**: Monitor member count, use pagination for large presence sets
10. **Cleanup**: React hooks auto-cleanup, but manually `unsubscribe()` in vanilla JS

## See Also

- [Channels API](api-reference.md) - Core pub-sub operations
- [Spaces](../spaces/) - Advanced collaborative presence features
- [Authentication](../auth-security.md) - Setting clientId securely
