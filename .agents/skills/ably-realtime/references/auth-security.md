# Authentication & Security

Production authentication patterns and security best practices for Ably Realtime.

## Token Authentication (Production)

Never expose API keys in client code. Use token authentication:

### Backend Token Endpoint

```typescript
// /api/auth/token
import * as Ably from "ably";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId"); // From session/JWT

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rest = new Ably.Rest({ key: process.env.ABLY_API_KEY });

  const tokenRequest = await rest.auth.createTokenRequest({
    clientId: userId,
    capability: {
      "chat:*": ["publish", "subscribe", "presence"],
      [`user:${userId}:*`]: ["publish", "subscribe"],
      "notifications:*": ["subscribe"],
    },
    ttl: 3600000, // 1 hour
  });

  return Response.json(tokenRequest);
}
```

### Frontend Token Auth

```typescript
// Client configuration
const realtimeClient = new Ably.Realtime({
  authUrl: "/api/auth/token",
  authParams: { userId: currentUser.id },
  clientId: currentUser.id,
});

// Token refresh happens automatically when expired
```

### Token Request Structure

```typescript
interface TokenRequest {
  keyName: string;
  ttl: number; // Time to live (ms)
  capability: string; // JSON capability string
  clientId?: string; // Client identifier
  timestamp: number; // Request timestamp
  nonce: string; // Random nonce
  mac: string; // Message authentication code
}
```

## Capabilities

Fine-grained permissions per channel:

```typescript
const capability = {
  // Full access to own user channels
  [`user:${userId}:*`]: ["publish", "subscribe", "presence", "history"],

  // Publish and subscribe to chat rooms
  "chat:*": ["publish", "subscribe", "presence"],

  // Subscribe-only to notifications
  "notifications:*": ["subscribe"],

  // Specific channel access
  "document:123": ["subscribe", "history"],
};
```

**Operations**:

- `publish` - Send messages
- `subscribe` - Receive messages
- `presence` - Enter/update/leave presence
- `presence-subscribe` - Subscribe to presence events
- `history` - Access message history
- `channel-metadata` - Access channel metadata
- `*` - All operations

### Wildcard Patterns

```typescript
{
  'chat:*': ['subscribe'],              // All chat channels
  'user:123:*': ['publish', 'subscribe'], // User's channels
  '*': ['subscribe']                     // All channels (avoid in production)
}
```

## ClientId

Required for Spaces, Chat, and presence features:

```typescript
// Development
const client = new Ably.Realtime({
  key: apiKey,
  clientId: "user-123",
});

// Production (token auth)
const client = new Ably.Realtime({
  authUrl: "/api/auth/token",
  // clientId comes from token
});
```

**ClientId Rules**:

- Unique per user (not per connection)
- Immutable (can't change after connection)
- Used for message attribution and presence
- Required for identified clients (Spaces/Chat)

## API Key Management

### Key Types

1. **Root Key**: Full access, never expose to clients
2. **App Key**: Scoped to specific app
3. **Token**: Time-limited, capability-restricted (use for clients)

### Creating Keys

Dashboard → API Keys → Create new key

Configure:

- Name (descriptive)
- Capabilities (restrict as needed)
- Channels (pattern matching)
- TTL (for tokens only)

### Environment Variables

```bash
# .env (server only, never commit)
ABLY_API_KEY=your-api-key
ABLY_KEY_NAME=your-key-name
ABLY_KEY_SECRET=your-key-secret
```

## Security Best Practices

### 1. Never Expose API Keys

```typescript
// ❌ Wrong - exposes API key
const client = new Ably.Realtime({ key: "xVLyHw.abc123:secrethere" });

// ✅ Correct - use token auth
const client = new Ably.Realtime({ authUrl: "/api/auth/token" });
```

### 2. Validate Users Before Issuing Tokens

```typescript
export async function GET(req: Request) {
  // Verify user session/JWT
  const session = await getSession(req);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Issue token with user's clientId
  const tokenRequest = await rest.auth.createTokenRequest({
    clientId: session.userId,
    capability: getUserCapabilities(session.userId),
  });

  return Response.json(tokenRequest);
}
```

### 3. Principle of Least Privilege

Grant minimum required capabilities:

```typescript
// Specific capabilities per user role
function getUserCapabilities(userId: string, role: string) {
  const base = {
    [`user:${userId}:*`]: ["publish", "subscribe"],
  };

  if (role === "admin") {
    return {
      ...base,
      "*": ["publish", "subscribe", "presence", "history"],
    };
  }

  if (role === "moderator") {
    return {
      ...base,
      "chat:*": ["publish", "subscribe", "presence"],
    };
  }

  return {
    ...base,
    "chat:*": ["subscribe", "presence"],
  };
}
```

### 4. Set Appropriate TTLs

```typescript
// Short-lived tokens for sensitive operations
ttl: 900000; // 15 minutes

// Longer tokens for persistent connections
ttl: 3600000; // 1 hour

// Maximum
ttl: 86400000; // 24 hours
```

### 5. Use HTTPS

Always serve token endpoints over HTTPS:

```typescript
// Enforce HTTPS in production
if (process.env.NODE_ENV === "production" && !req.url.startsWith("https://")) {
  return Response.json({ error: "HTTPS required" }, { status: 400 });
}
```

### 6. Rate Limit Token Endpoint

Prevent abuse:

```typescript
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
});

export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  // Issue token...
}
```

### 7. Audit Logging

Log authentication events:

```typescript
await logAuthEvent({
  userId: session.userId,
  action: "token_issued",
  capabilities: tokenRequest.capability,
  timestamp: new Date(),
  ip: req.headers.get("x-forwarded-for"),
});
```

## Connection Management

### Auto-Reconnection

Ably handles reconnection automatically:

```typescript
const client = new Ably.Realtime({
  authUrl: "/api/auth/token",
  disconnectedRetryTimeout: 15000, // Retry after 15s
  suspendedRetryTimeout: 30000, // Retry after 30s if suspended
  connectionStateTtl: 120000, // 2 min connection state persistence
});
```

### Monitor Connection State

```typescript
import { useConnectionStateListener } from 'ably/react';

function ConnectionMonitor() {
  const [state, setState] = useState('initialized');

  useConnectionStateListener((stateChange) => {
    setState(stateChange.current);

    if (stateChange.current === 'failed') {
      // Show error, prompt re-authentication
    }
  });

  return <div>Status: {state}</div>;
}
```

### Handle Token Expiry

Tokens refresh automatically, but handle failures:

```typescript
client.connection.on("failed", (stateChange) => {
  if (stateChange.reason?.code === 40142) {
    // Token expired and refresh failed
    redirectToLogin();
  }
});
```

## Channel Security

### Private Channels

Implement server-side authorization for sensitive channels:

```typescript
// Backend: Validate access before issuing token
function getUserCapabilities(userId: string, requestedChannels: string[]) {
  const allowed: Record<string, string[]> = {};

  for (const channel of requestedChannels) {
    if (channel.startsWith(`user:${userId}:`)) {
      // User's own channels
      allowed[channel] = ["*"];
    } else if (channel.startsWith("public:")) {
      // Public channels
      allowed[channel] = ["subscribe"];
    } else {
      // Check database for explicit grants
      const hasAccess = await checkChannelAccess(userId, channel);
      if (hasAccess) {
        allowed[channel] = ["subscribe", "presence"];
      }
    }
  }

  return allowed;
}
```

### Message Encryption

For highly sensitive data, encrypt before publishing:

```typescript
import { encrypt, decrypt } from "./crypto";

// Publish encrypted
const encrypted = await encrypt(sensitiveData, encryptionKey);
channel.publish("secure-event", { encrypted });

// Subscribe and decrypt
channel.subscribe("secure-event", async (message) => {
  const decrypted = await decrypt(message.data.encrypted, encryptionKey);
  handleData(decrypted);
});
```

## Common Error Codes

- `40100` - Invalid credentials
- `40140` - Token error
- `40142` - Token expired
- `40150` - Invalid clientId
- `40160` - ClientId mismatch
- `40300` - Rate limit exceeded
- `41000` - Unauthorized (capability)

## Testing Authentication

Mock token auth for tests:

```typescript
// test-utils.ts
export function createMockAblyClient() {
  return new Ably.Realtime({
    key: "fake.key:secret",
    clientId: "test-user",
    autoConnect: false,
  });
}
```

## Best Practices Summary

1. ✅ Use token auth in production
2. ✅ Never expose API keys in client code
3. ✅ Set clientId for identified clients (Spaces/Chat)
4. ✅ Grant minimal capabilities
5. ✅ Use short TTLs for tokens
6. ✅ Validate users before issuing tokens
7. ✅ Rate limit token endpoints
8. ✅ Monitor connection state
9. ✅ Audit authentication events
10. ✅ Use HTTPS for token endpoints

## See Also

- [Ably Authentication Documentation](https://ably.com/docs/auth)
- [Spaces Setup](../spaces/setup.md) - ClientId requirements
- [Chat Setup](../chat/setup-react.md) - Chat authentication
- [Channels API](../channels/api-reference.md) - Capabilities
