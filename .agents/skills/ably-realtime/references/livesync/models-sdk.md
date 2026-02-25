# LiveSync Models SDK

`@ably-labs/models` provides optimistic updates and state synchronization on top of LiveSync.

## Installation

```bash
npm install @ably-labs/models
```

## Basic Setup

```typescript
import ModelsClient from "@ably-labs/models";
import * as Ably from "ably";

const realtimeClient = new Ably.Realtime({ key: apiKey, clientId: userId });
const modelsClient = new ModelsClient({ ably: realtimeClient });

const model = modelsClient.models.get({
  channelName: "post:123",
  sync: async () => fetchPostFromAPI(),
  merge: (state, event) => applyEventToState(state, event),
});
```

## Sync Function

Load initial state from backend:

```typescript
const model = modelsClient.models.get({
  channelName: `post:${postId}`,
  sync: async () => {
    const response = await fetch(`/api/posts/${postId}`);
    return await response.json();
  },
  merge,
});

// Trigger sync
await model.sync(postId);
```

## Merge Function

Apply events to state:

```typescript
import { cloneDeep } from "lodash";

interface PostState {
  id: string;
  title: string;
  comments: Comment[];
}

function merge(state: PostState | null, event: any): PostState {
  const newState = state
    ? cloneDeep(state)
    : { id: "", title: "", comments: [] };

  switch (event.name) {
    case "comment.added":
      newState.comments.push(event.data.comment);
      break;

    case "comment.updated":
      const idx = newState.comments.findIndex(
        (c) => c.id === event.data.comment.id,
      );
      if (idx >= 0) newState.comments[idx] = event.data.comment;
      break;

    case "comment.deleted":
      newState.comments = newState.comments.filter(
        (c) => c.id !== event.data.commentId,
      );
      break;

    default:
      console.warn("Unknown event:", event.name);
  }

  return newState;
}
```

## Optimistic Updates

Apply changes immediately, confirm from server:

```typescript
const model = modelsClient.models.get({ channelName, sync, merge });

// Optimistic update
const mutationId = crypto.randomUUID();
await model.optimistic(mutationId, {
  name: "comment.added",
  data: { comment: { id: tempId, text: "New comment" } },
});

// Send to backend (which writes to outbox)
await fetch("/api/comments", {
  method: "POST",
  body: JSON.stringify({ mutationId, postId, text: "New comment" }),
});

// Server writes to outbox with same mutationId
// LiveSync broadcasts to all clients
// Model confirms optimistic update when server event arrives
```

## Subscribe to State

```typescript
const unsubscribe = model.subscribe((err, state) => {
  if (err) {
    console.error("Model error:", err);
    return;
  }

  console.log("State updated:", state);
  // Update React state
  setState(state);
});

// Cleanup
unsubscribe();
```

## React Hook Pattern

```typescript
export function useModel<T>(channelName: string, sync: () => Promise<T>, merge: (state: T | null, event: any) => T) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [model, setModel] = useState<any>(null);

  useEffect(() => {
    const m = modelsClient.models.get({ channelName, sync, merge });
    setModel(m);

    m.sync().catch(setError);

    const unsubscribe = m.subscribe((err: Error | null, state: T) => {
      if (err) {
        setError(err);
      } else {
        setData(state);
        setError(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [channelName]);

  return { data, error, model };
}

// Usage
function PostComments({ postId }: { postId: string }) {
  const { data, error, model } = useModel(
    `post:${postId}`,
    () => fetchPost(postId),
    mergePostEvents
  );

  const addComment = async (text: string) => {
    const mutationId = crypto.randomUUID();
    await model.optimistic(mutationId, {
      name: 'comment.added',
      data: { comment: { id: mutationId, text, pending: true } }
    });

    await fetch('/api/comments', {
      method: 'POST',
      body: JSON.stringify({ mutationId, postId, text })
    });
  };

  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div>
      {data.comments.map(comment => (
        <Comment key={comment.id} {...comment} />
      ))}
      <CommentInput onSubmit={addComment} />
    </div>
  );
}
```

## Confirmation Flow

1. **Optimistic**: Client applies event with `mutationId`
2. **Backend**: API writes to DB + outbox with same `mutationId`
3. **LiveSync**: Connector publishes event to Ably
4. **Confirmation**: Models SDK matches `mutationId`, confirms optimistic update
5. **Rollback**: If `mutationId` doesn't match after timeout, rollback optimistic change

## Best Practices

1. **Unique Mutation IDs**: Use `crypto.randomUUID()` for correlation
2. **Immutable Merge**: Always return new state object (use `cloneDeep`)
3. **Error Handling**: Handle both optimistic and sync errors
4. **Timeouts**: Set reasonable timeout for confirmation (default: 5s)
5. **Pending States**: Show UI indicators for optimistic/pending items
6. **Sync on Mount**: Call `model.sync()` to load initial state
7. **Cleanup**: Unsubscribe when component unmounts
8. **State Structure**: Design state for easy event application

## See Also

- [Outbox Pattern](outbox-pattern.md) - Backend implementation
- [React Patterns](react-patterns.md) - Frontend examples
- [Integration Setup](integration-setup.md) - Dashboard configuration
