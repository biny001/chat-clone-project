# LiveObjects API Reference

⚠️ **Public Preview**: APIs may change before general availability.

## Channel Object Access

### get()

Get the root LiveObject for a channel:

```typescript
const channel = realtime.channels.get("my-channel");
const root = await channel.object.get();
```

**Returns**: `Promise<LiveMap>` - Root LiveMap object

## LiveCounter

### Creating a Counter

```typescript
import { LiveCounter } from "ably/liveobjects";

// Create with initial value
const counter = LiveCounter.create(0);
const visits = LiveCounter.create(100);
```

### increment()

Atomically increment the counter:

```typescript
await counter.increment(5); // Add 5
await counter.increment(1); // Add 1 (default)
await counter.increment(-3); // Subtract 3
```

**Parameters**:

- `amount?: number` - Amount to increment (can be negative), default: 1

**Returns**: `Promise<void>`

### decrement()

Atomically decrement the counter:

```typescript
await counter.decrement(5); // Subtract 5
await counter.decrement(1); // Subtract 1 (default)
```

**Parameters**:

- `amount?: number` - Amount to decrement, default: 1

**Returns**: `Promise<void>`

### value()

Get the current value:

```typescript
const current = counter.value();
console.log("Current count:", current);
```

**Returns**: `number`

### subscribe()

Subscribe to value changes:

```typescript
const { unsubscribe } = counter.subscribe(() => {
  console.log("Counter updated:", counter.value());
});

// Later: cleanup
unsubscribe();
```

**Parameters**:

- `callback: () => void` - Called when value changes

**Returns**: `{ unsubscribe: () => void }`

## LiveMap

### Creating a Map

```typescript
import { LiveMap } from "ably/liveobjects";

// Create with initial data
const settings = LiveMap.create({
  theme: "dark",
  fontSize: 14,
  autoSave: true,
});

// Create empty
const empty = LiveMap.create({});
```

### set()

Set or update a key:

```typescript
await settings.set("theme", "light");
await settings.set("fontSize", 16);
await settings.set("newKey", "value");

// Set nested LiveObject
await settings.set("counter", LiveCounter.create(0));
await settings.set("nested", LiveMap.create({ a: 1 }));
```

**Parameters**:

- `key: string` - Key to set
- `value: any` - Value (primitive, object, or LiveObject)

**Returns**: `Promise<void>`

### get()

Get a value by key:

```typescript
const theme = settings.get("theme"); // 'light'
const fontSize = settings.get("fontSize"); // 16
const missing = settings.get("unknown"); // undefined
```

**Returns**: `any` - Value or undefined if key doesn't exist

### remove()

Remove a key:

```typescript
await settings.remove("autoSave");
```

**Parameters**:

- `key: string` - Key to remove

**Returns**: `Promise<void>`

### has()

Check if key exists:

```typescript
if (settings.has("theme")) {
  console.log("Theme is set");
}
```

**Parameters**:

- `key: string` - Key to check

**Returns**: `boolean`

### keys()

Get all keys:

```typescript
const allKeys = settings.keys();
console.log(allKeys); // ['theme', 'fontSize', ...]
```

**Returns**: `string[]`

### value()

Get the entire map as plain object:

```typescript
const all = settings.value();
console.log(all); // { theme: 'light', fontSize: 16 }
```

**Returns**: `Record<string, any>`

### subscribe()

Subscribe to changes:

```typescript
const { unsubscribe } = settings.subscribe(() => {
  console.log("Settings updated:", settings.value());
});

// Later: cleanup
unsubscribe();
```

**Parameters**:

- `callback: () => void` - Called when map changes

**Returns**: `{ unsubscribe: () => void }`

### batch()

Group multiple operations atomically:

```typescript
await settings.batch((ctx) => {
  ctx.set("theme", "dark");
  ctx.set("fontSize", 14);
  ctx.remove("outdated");
});
```

**Parameters**:

- `callback: (ctx: BatchContext) => void` - Batch operations context

**Returns**: `Promise<void>`

**BatchContext Methods**:

- `ctx.set(key, value)` - Set a key
- `ctx.remove(key)` - Remove a key

All operations within the batch are applied together. Subscribers are notified once after all operations complete.

## PathObject vs Instance

LiveObjects supports two access patterns:

### PathObject (Recommended)

Access via path string - always returns a reference:

```typescript
const root = await channel.object.get();
await root.set("counter", LiveCounter.create(0));

// PathObject access
const counter = root.get("counter");
await counter.increment(5);
console.log(counter.value());
```

### Instance Access

Get the actual LiveObject instance:

```typescript
const counterInstance = root.get("counter").instance();

if (counterInstance) {
  await counterInstance.increment(5);
  console.log(counterInstance.value());
} else {
  console.log("Counter does not exist");
}
```

**When to use**:

- PathObject: Default, cleaner syntax, automatic error handling
- Instance: When you need to check existence before operations

## Composability

Nest LiveMaps and LiveCounters to build complex structures:

```typescript
const root = await channel.object.get();

// Create nested structure
await root.set(
  "game",
  LiveMap.create({
    players: LiveMap.create({}),
    scores: LiveMap.create({}),
    round: LiveCounter.create(1),
  }),
);

// Access nested objects
const game = root.get("game");
await game.get("players").set("player1", { name: "Alice" });
await game.get("scores").set("player1", LiveCounter.create(0));
await game.get("round").increment(1);

// Read nested values
const round = game.get("round").value();
const player1Score = game.get("scores").get("player1").value();
```

### Complex Example

```typescript
// Voting application structure
await root.set(
  "poll",
  LiveMap.create({
    question: "Favorite color?",
    options: LiveMap.create({
      red: LiveCounter.create(0),
      blue: LiveCounter.create(0),
      green: LiveCounter.create(0),
    }),
    totalVotes: LiveCounter.create(0),
    isActive: true,
  }),
);

// Cast vote
const poll = root.get("poll");
await poll.get("options").get("blue").increment(1);
await poll.get("totalVotes").increment(1);

// Get results
const results = {
  question: poll.get("question"),
  red: poll.get("options").get("red").value(),
  blue: poll.get("options").get("blue").value(),
  green: poll.get("options").get("green").value(),
  total: poll.get("totalVotes").value(),
};
```

## TypeScript Types

```typescript
import type { LiveCounter, LiveMap } from "ably/liveobjects";

// LiveCounter type
const counter: LiveCounter = LiveCounter.create(0);
const value: number = counter.value();

// LiveMap type
interface Settings {
  theme: string;
  fontSize: number;
  autoSave: boolean;
}

const settings: LiveMap = LiveMap.create<Settings>({
  theme: "dark",
  fontSize: 14,
  autoSave: true,
});

const theme: string = settings.get("theme");

// Nested structure type
interface GameState {
  players: Record<string, { name: string; ready: boolean }>;
  round: number;
  score: number;
}
```

## Error Handling

```typescript
try {
  const root = await channel.object.get();
  await root.set("counter", LiveCounter.create(0));
  await root.get("counter").increment(5);
} catch (error) {
  if (error.code === 40150) {
    console.error("LiveObjects not enabled");
  } else if (error.code === 40160) {
    console.error("Object too large (>64KB)");
  } else {
    console.error("LiveObjects error:", error);
  }
}

// Common error codes:
// 40150 - LiveObjects not enabled in app
// 40160 - Object size exceeds 64KB
// 40170 - Invalid operation on LiveObject
// 80000 - Connection/network error
```

## Subscription Management

```typescript
function GameScore() {
  const [score, setScore] = useState(0);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function init() {
      const channel = realtimeClient.channels.get('game:123');
      const root = await channel.object.get();

      // Initialize if needed
      if (!root.get('score').instance()) {
        await root.set('score', LiveCounter.create(0));
      }

      // Subscribe
      const subscription = root.get('score').subscribe(() => {
        setScore(root.get('score').value());
      });
      unsubscribe = subscription.unsubscribe;

      // Set initial value
      setScore(root.get('score').value());
    }

    init();

    return () => {
      unsubscribe?.();
    };
  }, []);

  return <div>Score: {score}</div>;
}
```

## Best Practices

1. **Use Atomic Operations**: Use `increment()`/`decrement()` for counters, not manual read-write
2. **Batch Updates**: Group related changes with `batch()` for efficiency
3. **Subscribe Early**: Subscribe before making updates to avoid missing changes
4. **Cleanup Subscriptions**: Always unsubscribe in component cleanup
5. **Check Existence**: Use `instance()` to check if object exists before operations
6. **Size Limits**: Keep total object size under 64KB
7. **Naming**: Use descriptive keys for nested structures
8. **Error Handling**: Handle network errors and app configuration issues
9. **Initial State**: Set initial values on first access
10. **Type Safety**: Use TypeScript interfaces for map structures

## Performance Tips

1. **Minimize Nesting**: Deep nesting increases payload size and complexity
2. **Throttle Updates**: Avoid > 100 updates/second per object
3. **Subscribe Selectively**: Subscribe only to needed objects
4. **Batch Operations**: Use `batch()` for multiple updates
5. **Cache Values**: Read `value()` once if using multiple times

## See Also

- [Overview](overview.md) - Concepts and when to use
- [Examples](examples.md) - Complete application examples
- [LiveObjects Documentation](https://ably.com/docs/products/liveobjects)
