# Spaces Setup

Spaces is built on top of Ably Realtime and provides purpose-built abstractions for managing participant state in collaborative applications.

## Installation

```bash
npm install @ably/spaces ably
```

**Requirements**:

- React 16.8.0 or later (for React hooks)
- Ably Realtime client
- `clientId` must be set (required for identifying participants)

## Basic Setup

Spaces requires both the Ably Realtime client and the Spaces client:

```typescript
// main.tsx or app.tsx
import * as Ably from 'ably';
import Spaces from '@ably/spaces';
import { AblyProvider } from 'ably/react';
import { SpacesProvider, SpaceProvider } from '@ably/spaces/react';

// 1. Create Realtime client (outside component)
const realtimeClient = new Ably.Realtime({
  key: import.meta.env.VITE_ABLY_API_KEY,
  clientId: 'user-123', // Required for Spaces
});

// 2. Create Spaces client
const spacesClient = new Spaces(realtimeClient);

// 3. Wrap app with providers
function Root() {
  return (
    <AblyProvider client={realtimeClient}>
      <SpacesProvider client={spacesClient}>
        <SpaceProvider name="my-collaborative-space">
          <App />
        </SpaceProvider>
      </SpacesProvider>
    </AblyProvider>
  );
}
```

## Provider Hierarchy

Spaces requires a specific provider hierarchy:

```
AblyProvider (Ably Realtime client)
  └─ SpacesProvider (Spaces client)
       └─ SpaceProvider (specific space name)
            └─ Your components using Spaces hooks
```

```typescript
import { AblyProvider } from 'ably/react';
import { SpacesProvider, SpaceProvider } from '@ably/spaces/react';

<AblyProvider client={realtimeClient}>
  <SpacesProvider client={spacesClient}>
    {/* You can have multiple SpaceProviders */}
    <SpaceProvider name="document:123">
      <DocumentEditor />
    </SpaceProvider>

    <SpaceProvider name="whiteboard:abc">
      <WhiteboardCanvas />
    </SpaceProvider>
  </SpacesProvider>
</AblyProvider>
```

## Space Naming

Space names follow similar conventions to channel names:

- Hierarchical naming with `:` separator: `'document:123'`, `'room:lobby'`
- Case-sensitive
- Alphanumeric, hyphens, underscores allowed
- Maximum 512 characters

```typescript
// Good space names
<SpaceProvider name="document:doc-123" />
<SpaceProvider name="slide:presentation-abc:slide-5" />
<SpaceProvider name="canvas:board-xyz" />

// Each space name gets its own Ably channel:
// Space "document:123" → Channel "document:123::$space"
```

## Client Configuration

### Realtime Client Options

```typescript
const realtimeClient = new Ably.Realtime({
  key: apiKey,
  clientId: "user-123", // Required

  // Optional configuration
  authUrl: "/api/auth/token", // Token auth endpoint (production)
  echoMessages: false, // Don't receive own messages
  connectionStateTtl: 120000, // Connection state timeout (ms)
  disconnectedRetryTimeout: 15000, // Retry delay when disconnected
});
```

### Spaces Client Options

```typescript
const spacesClient = new Spaces(realtimeClient, {
  // Currently no additional options
  // Future releases may add configuration
});
```

## Multiple Spaces

You can create multiple space instances in an application:

```typescript
function MultiSpaceApp() {
  return (
    <SpacesProvider client={spacesClient}>
      {/* Document editing space */}
      <SpaceProvider name="document:123">
        <DocumentEditor />
      </SpaceProvider>

      {/* Comments space (separate from document) */}
      <SpaceProvider name="comments:document-123">
        <CommentPanel />
      </SpaceProvider>
    </SpacesProvider>
  );
}
```

Each `SpaceProvider` creates an isolated space context. Components under different providers don't share state.

## Dynamic Spaces

Create spaces dynamically based on props or state:

```typescript
function DocumentSpace({ documentId }: { documentId: string }) {
  return (
    <SpaceProvider name={`document:${documentId}`}>
      <DocumentEditor />
    </SpaceProvider>
  );
}

// Usage
function App() {
  const [currentDoc, setCurrentDoc] = useState('doc-123');

  return (
    <SpacesProvider client={spacesClient}>
      <DocumentSpace documentId={currentDoc} />
      <button onClick={() => setCurrentDoc('doc-456')}>
        Switch Document
      </button>
    </SpacesProvider>
  );
}
```

When `documentId` changes, the old space is automatically cleaned up and a new space is created.

## useSpace Hook

Access the Space instance directly:

```typescript
import { useSpace } from '@ably/spaces/react';

function MyComponent() {
  const { space } = useSpace((update) => {
    console.log('Space state updated:', update);
  });

  useEffect(() => {
    console.log('Space name:', space?.name);
    console.log('Space state:', space?.state);
  }, [space]);

  return <div>Connected to space: {space?.name}</div>;
}
```

**Return Values**:

- `space: Space | undefined` - Space instance
- `error?: Error` - Error if space creation failed

## Space Lifecycle

Spaces have similar lifecycle states to channels:

```typescript
type SpaceState =
  | "initialized"
  | "attaching"
  | "attached"
  | "detaching"
  | "detached"
  | "suspended"
  | "failed";

const { space } = useSpace();

useEffect(() => {
  console.log("Space state:", space?.state);
}, [space?.state]);
```

## Authentication

Spaces requires `clientId` for participant identification:

```typescript
// Development: API key with clientId
const client = new Ably.Realtime({
  key: 'api-key',
  clientId: 'user-123'
});

// Production: Token auth with clientId
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

See [Authentication](../auth-security.md) for production token auth setup.

## Error Handling

```typescript
function SafeSpaceComponent() {
  const { space, error } = useSpace();

  if (error) {
    return <div>Failed to connect to space: {error.message}</div>;
  }

  if (!space) {
    return <div>Connecting to space...</div>;
  }

  return <div>Connected to {space.name}</div>;
}
```

## Space vs Channel

**Spaces** are an abstraction built on Ably channels:

- One Space = Multiple underlying channels (members, cursors, locations, locks)
- Optimized for collaborative UI patterns
- Purpose-built hooks: `useMembers`, `useCursors`, `useLocations`, `useLocks`
- Automatic lifecycle management

**Channels** are lower-level:

- Direct pub-sub messaging
- Custom message formats
- Manual state management
- Use when Spaces abstractions don't fit your use case

```typescript
// Space approach
<SpaceProvider name="document:123">
  <Editor />
</SpaceProvider>

// Equivalent channel approach (more manual work)
<ChannelProvider channelName="document:123::members">
  <ChannelProvider channelName="document:123::cursors">
    <ChannelProvider channelName="document:123::locations">
      <Editor />
    </ChannelProvider>
  </ChannelProvider>
</ChannelProvider>
```

## Testing Setup

For testing, mock the Spaces client:

```typescript
// test-utils.tsx
import { SpacesProvider } from '@ably/spaces/react';

export function createMockSpacesClient() {
  return {
    // Mock Spaces methods
  } as unknown as Spaces;
}

export function renderWithSpaces(ui: React.ReactElement) {
  const mockClient = createMockSpacesClient();

  return render(
    <SpacesProvider client={mockClient}>
      <SpaceProvider name="test-space">
        {ui}
      </SpaceProvider>
    </SpacesProvider>
  );
}
```

## TypeScript Types

```typescript
import Spaces from "@ably/spaces";
import type { Space, SpaceState } from "@ably/spaces";

const spacesClient: Spaces = new Spaces(realtimeClient);

const handleSpaceUpdate = (space: Space) => {
  const name: string = space.name;
  const state: SpaceState = space.state;
};
```

## Best Practices

1. **Single Client Instance**: Create Spaces client once, outside components
2. **ClientId Required**: Always set `clientId` in Realtime config
3. **Provider Hierarchy**: Maintain correct provider nesting order
4. **Space Naming**: Use hierarchical names to organize related spaces
5. **Dynamic Spaces**: Let React handle space cleanup on name changes
6. **Token Auth**: Use token auth in production, never expose API keys
7. **Error Boundaries**: Wrap Spaces components with error boundaries
8. **Testing**: Mock Spaces client for unit tests
9. **Multiple Spaces**: One space per collaborative context (document, room, canvas)
10. **State Monitoring**: Listen to space state for connection status

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

### "Space provider not found"

```typescript
// ❌ Wrong - using hook outside provider
function App() {
  const { space } = useSpace(); // Error!
  return <div>{space?.name}</div>;
}

// ✅ Correct - hook inside provider
<SpaceProvider name="my-space">
  <App />
</SpaceProvider>
```

### "Multiple Ably clients detected"

```typescript
// ❌ Wrong - creating client inside component
function App() {
  const client = new Ably.Realtime({ key, clientId });
  return <AblyProvider client={client}>...</AblyProvider>;
}

// ✅ Correct - client outside component
const client = new Ably.Realtime({ key, clientId });
function App() {
  return <AblyProvider client={client}>...</AblyProvider>;
}
```

## Next Steps

- [React Hooks](react-hooks.md) - All Spaces hooks with examples
- [Patterns](patterns.md) - Common collaborative patterns
- [Authentication](../auth-security.md) - Production token auth

## See Also

- [Ably Realtime Documentation](https://ably.com/docs/getting-started/setup)
- [Spaces Documentation](https://ably.com/docs/products/spaces)
