# Chat Messages

Message CRUD operations, ordering, and history.

## Message Structure

```typescript
interface Message {
  serial: string; // Unique ID (use as React key)
  clientId: string; // Sender
  roomId: string; // Room name
  text: string; // Content
  createdAt: Date; // Timestamp
  metadata?: Record<string, any>;
  headers?: Record<string, string>;
}
```

## Sending Messages

```typescript
const { send } = useMessages();

// Simple
await send({ text: "Hello world!" });

// With metadata
await send({
  text: "Important message",
  metadata: { priority: "high", category: "announcement" },
});

// With headers
await send({
  text: "Message",
  headers: { "x-custom": "value" },
});
```

## Updating Messages

```typescript
const { updateMessage } = useMessages();

await updateMessage(messageSerial, {
  text: "Updated text",
  metadata: { edited: true },
});
```

Messages are versioned - updates create new versions with same serial.

## Deleting Messages

```typescript
const { deleteMessage } = useMessages();

await deleteMessage(messageSerial, {
  description: "Inappropriate content",
});
```

Soft delete - message marked as deleted but retained for audit.

## Message History

```typescript
const { getPreviousMessages } = useMessages();

// Load last 50
const result = await getPreviousMessages({ limit: 50 });
setMessages(result.items.reverse()); // Oldest first

// Pagination
if (result.hasNext()) {
  const nextPage = await result.next();
}

// Time-based
const recent = await getPreviousMessages({
  start: Date.now() - 3600000, // Last hour
  limit: 100,
});
```

## Message Ordering

Messages ordered by `serial` (server timestamp + sequence).

## See Also

- [React Hooks](react-hooks.md)
- [Features](features.md)
