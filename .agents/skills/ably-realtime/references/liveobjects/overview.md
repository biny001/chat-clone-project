# LiveObjects Overview

⚠️ **Public Preview**: LiveObjects is currently in public preview. APIs may change before general availability. Not recommended for production use without understanding stability implications.

## What are LiveObjects?

LiveObjects provide a conflict-free, durable shared data layer for real-time state synchronization across clients. Unlike channels (which send discrete messages), LiveObjects maintain synchronized state that all clients can read and update.

## Key Characteristics

- **Conflict-Free**: Last-write-wins (LWW) semantics with eventual consistency
- **Durable**: State persists for 90 days by default
- **Structured Types**: Purpose-built `LiveCounter` and `LiveMap` types
- **Composable**: Nest LiveMaps and LiveCounters to build complex structures
- **Real-time**: Changes propagate instantly to all connected clients
- **Serverless**: No backend code required for state synchronization

## When to Use LiveObjects

**Use LiveObjects for**:

- Shared counters (votes, likes, view counts)
- Collaborative configurations (settings, preferences)
- Game state (scores, player positions)
- Polling/voting systems
- Leaderboards
- AI agent state
- Form state synchronization

**Don't use LiveObjects for**:

- Chat messages (use Chat SDK)
- Event notifications (use Channels)
- Participant state (use Spaces)
- Large datasets (> 64KB per object)
- High-frequency updates (> 100/second per object)

## LiveObjects vs Other Features

| Feature         | Use Case          | State Type                | Durability       |
| --------------- | ----------------- | ------------------------- | ---------------- |
| **LiveObjects** | Application state | Structured (Counter, Map) | 90 days          |
| **Channels**    | Messages/events   | Ephemeral messages        | 2 min - 365 days |
| **Spaces**      | Participant state | Ephemeral profiles        | Session-based    |
| **Chat**        | Messaging apps    | Messages with metadata    | 30-365 days      |
| **LiveSync**    | Database sync     | Database records          | Permanent (DB)   |

## Supported Types

### LiveCounter

Numeric counter with atomic increment/decrement operations:

```typescript
import { LiveCounter } from "ably/liveobjects";

const counter = LiveCounter.create(0);
await counter.increment(5);
await counter.decrement(2);
console.log(counter.value()); // 3
```

**Use cases**: Vote counts, page views, active users, inventory quantities

### LiveMap

Key-value store for primitives, JSON objects, or nested LiveObjects:

```typescript
import { LiveMap } from "ably/liveobjects";

const settings = LiveMap.create({
  theme: "dark",
  fontSize: 14,
  autoSave: true,
});

await settings.set("theme", "light");
await settings.remove("autoSave");
console.log(settings.get("fontSize")); // 14
```

**Use cases**: User preferences, game state, form data, feature flags

## Basic Workflow

1. **Get channel**: Access an Ably channel
2. **Get object**: Retrieve the root LiveObject for the channel
3. **Create/Update**: Set LiveCounters or LiveMaps
4. **Subscribe**: Listen for changes
5. **Read**: Access current values

```typescript
// 1. Get channel
const channel = realtime.channels.get("game:room-1");

// 2. Get root object
const gameState = await channel.object.get();

// 3. Create LiveCounter
await gameState.set("score", LiveCounter.create(0));

// 4. Subscribe to changes
gameState.get("score").subscribe(() => {
  console.log("Score:", gameState.get("score").value());
});

// 5. Update value
await gameState.get("score").increment(10);
```

## Conflict Resolution

LiveObjects use **Last-Write-Wins (LWW)** semantics:

- Each update has a timestamp from Ably servers
- Latest timestamp wins in conflicts
- Eventually consistent across all clients
- No manual conflict resolution needed

```typescript
// Client A
await settings.set("theme", "dark");

// Client B (simultaneously)
await settings.set("theme", "light");

// Result: Whichever write reached the server last wins
// All clients eventually see the same value
```

For counters, use atomic operations to avoid conflicts:

```typescript
// ❌ Wrong - may lose updates
const current = counter.value();
await counter.set(current + 1);

// ✅ Correct - atomic operation
await counter.increment(1);
```

## Enabling LiveObjects

LiveObjects must be enabled in your Ably app:

1. Go to Ably Dashboard
2. Select your app
3. Navigate to Settings → Features
4. Enable "LiveObjects" (Public Preview)
5. Save changes

## Channel Object Access

Each channel has exactly one root object:

```typescript
const channel = realtime.channels.get("my-channel");
const root = await channel.object.get();

// Root object is a LiveMap
await root.set("counter", LiveCounter.create(0));
await root.set("settings", LiveMap.create({ theme: "dark" }));
```

The root object is automatically created when first accessed.

## Data Persistence

- **Retention**: 90 days by default
- **Storage**: Stored on Ably's infrastructure
- **Limits**: Max 64KB per channel object
- **Cleanup**: Automatically deleted after retention period

## Performance Characteristics

- **Latency**: ~50-150ms for updates to propagate
- **Throughput**: Up to 100 updates/second per object
- **Size**: Keep total object size under 64KB
- **Connections**: Supports 1000s of concurrent subscribers

## React Integration

LiveObjects work with React using state management:

```typescript
function VotingComponent() {
  const [votes, setVotes] = useState(0);

  useEffect(() => {
    let voteCounter: any;

    async function init() {
      const channel = realtimeClient.channels.get('poll:question-1');
      const pollState = await channel.object.get();

      // Create or get counter
      if (!pollState.get('votes').instance()) {
        await pollState.set('votes', LiveCounter.create(0));
      }

      voteCounter = pollState.get('votes');
      setVotes(voteCounter.value());

      // Subscribe to updates
      voteCounter.subscribe(() => {
        setVotes(voteCounter.value());
      });
    }

    init();

    return () => {
      voteCounter?.unsubscribe();
    };
  }, []);

  const handleVote = async () => {
    const channel = realtimeClient.channels.get('poll:question-1');
    const pollState = await channel.object.get();
    await pollState.get('votes').increment(1);
  };

  return (
    <div>
      <p>Votes: {votes}</p>
      <button onClick={handleVote}>Vote</button>
    </div>
  );
}
```

## Migration Path

If using channels for state synchronization, consider migrating to LiveObjects:

**Before (Channels)**:

```typescript
// Manual state sync with channels
channel.subscribe("state-update", (msg) => {
  setState(msg.data);
});

channel.publish("state-update", newState);
```

**After (LiveObjects)**:

```typescript
// Automatic state sync with LiveObjects
const root = await channel.object.get();
root.get("state").subscribe(() => {
  setState(root.get("state").value());
});

await root.get("state").set("key", value);
```

## Limitations

- **Public Preview**: API stability not guaranteed
- **No custom types**: Only LiveCounter and LiveMap (no custom classes)
- **Size limit**: 64KB per channel object
- **Update rate**: Max ~100 updates/second per object
- **No transactions**: Updates are individual operations
- **Browser only**: Limited Node.js support during preview

## Next Steps

- [API Reference](api-reference.md) - Detailed API documentation
- [Examples](examples.md) - Complete code examples
- [LiveObjects Documentation](https://ably.com/docs/products/liveobjects)

## See Also

- [Channels](../channels/api-reference.md) - For discrete messages
- [Spaces](../spaces/) - For participant state
- [LiveSync](../livesync/) - For database synchronization
