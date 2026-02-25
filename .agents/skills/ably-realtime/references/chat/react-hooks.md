# Chat SDK React Hooks

All React hooks for Ably Chat SDK. See [setup-react.md](setup-react.md) for provider configuration.

## useMessages

Send, receive, update, delete messages with history.

```typescript
import { useMessages, ChatMessageEventType } from "@ably/chat/react";

const { send, updateMessage, deleteMessage, getPreviousMessages } = useMessages(
  {
    listener: (event) => {
      if (event.type === ChatMessageEventType.Created) {
        // Handle new message
      }
    },
  },
);

// Send
await send({ text: "Hello!", metadata: { priority: "high" } });

// Update
await updateMessage(messageSerial, { text: "Updated text" });

// Delete
await deleteMessage(messageSerial);

// Load history
const history = await getPreviousMessages({ limit: 50 });
```

## useTyping

Typing indicators with auto-timeout.

```typescript
import { useTyping } from '@ably/chat/react';

const { currentlyTyping, keystroke, stop } = useTyping();

// On keypress
<input onKeyPress={keystroke} />

// On send
stop();

// Display
{currentlyTyping.map(u => u.clientId).join(', ')} typing...
```

## usePresence & usePresenceListener

Track online users.

```typescript
// Enter presence
usePresence({ username: "Alice", avatar: "/avatar.jpg" });

// Listen
const { presenceData } = usePresenceListener();
// presenceData: array of online members
```

## useRoomReactions

Ephemeral emoji reactions.

```typescript
const { send } = useRoomReactions({
  listener: (reaction) => showAnimation(reaction.type),
});

send({ type: "👍" });
```

## See Also

- [Setup](setup-react.md) - Providers
- [Messages](messages.md) - Message CRUD
- [Features](features.md) - All features
