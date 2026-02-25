# Chat Features

Typing indicators, reactions, presence, and room lifecycle.

## Typing Indicators

Auto-timeout after 5 seconds of inactivity.

```typescript
const { currentlyTyping, keystroke, stop } = useTyping();

// Trigger on each keypress
<input onKeyPress={keystroke} />

// Stop when sending
stop();

// Display
{currentlyTyping.length > 0 && (
  <div>{currentlyTyping.map(u => u.clientId).join(', ')} typing...</div>
)}
```

## Room Reactions

Ephemeral emoji reactions broadcast to entire room.

```typescript
const { send } = useRoomReactions({
  listener: (reaction) => {
    showFloatingEmoji(reaction.type);
  }
});

<button onClick={() => send({ type: '👍' })}>👍</button>
<button onClick={() => send({ type: '❤️' })}>❤️</button>
```

## Presence

Track who's online in the room.

```typescript
// Enter with profile
usePresence({
  username: 'Alice',
  avatar: '/avatars/alice.jpg',
  status: 'active'
});

// Listen to changes
const { presenceData } = usePresenceListener();

presenceData.map(member => (
  <div>{member.data?.username} - {member.data?.status}</div>
))
```

## Room Lifecycle

```typescript
const { room, roomStatus } = useRoom();

// roomStatus: 'initialized' | 'attaching' | 'attached' | 'detaching' | 'detached' | 'failed'

if (roomStatus === "attached") {
  // Room ready
}
```

## Message Reactions (Per-Message)

Add reactions to specific messages:

```typescript
// Note: Not yet available via hooks in current version
// Use room instance directly
const { room } = useRoom();
await room?.messages.react(messageSerial, { type: "👍" });
```

## See Also

- [React Hooks](react-hooks.md)
- [Messages](messages.md)
- [Setup](setup-react.md)
