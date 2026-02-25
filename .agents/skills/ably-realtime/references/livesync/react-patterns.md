# LiveSync React Patterns

Frontend patterns for real-time database synchronization with optimistic updates.

## useModel Hook (Complete)

```typescript
import { useState, useEffect } from "react";
import ModelsClient from "@ably-labs/models";

const modelsClient = new ModelsClient({ ably: realtimeClient });

export function useModel<T>(
  channelName: string,
  sync: () => Promise<T>,
  merge: (state: T | null, event: any) => T,
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const modelRef = useRef<any>(null);

  useEffect(() => {
    const model = modelsClient.models.get({ channelName, sync, merge });
    modelRef.current = model;

    model
      .sync()
      .then(() => {
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });

    const unsubscribe = model.subscribe((err: Error | null, state: T) => {
      if (err) {
        setError(err);
      } else {
        setData(state);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [channelName]);

  const optimistic = useCallback(async (mutationId: string, event: any) => {
    if (modelRef.current) {
      await modelRef.current.optimistic(mutationId, event);
    }
  }, []);

  return { data, loading, error, optimistic };
}
```

## Real-Time Comments

```typescript
interface Comment {
  id: string;
  text: string;
  authorId: string;
  createdAt: Date;
  pending?: boolean;
}

interface PostState {
  id: string;
  title: string;
  comments: Comment[];
}

function mergeComments(state: PostState | null, event: any): PostState {
  const newState = state ? { ...state, comments: [...state.comments] } :
    { id: '', title: '', comments: [] };

  switch (event.name) {
    case 'comment.added':
      newState.comments.push(event.data.comment);
      break;
    case 'comment.deleted':
      newState.comments = newState.comments.filter(c => c.id !== event.data.id);
      break;
  }

  return newState;
}

function PostComments({ postId }: { postId: string }) {
  const { data, loading, error, optimistic } = useModel<PostState>(
    `post:${postId}`,
    () => fetch(`/api/posts/${postId}`).then(r => r.json()),
    mergeComments
  );

  const addComment = async (text: string) => {
    const mutationId = crypto.randomUUID();

    // Optimistic update
    await optimistic(mutationId, {
      name: 'comment.added',
      data: {
        comment: {
          id: mutationId,
          text,
          authorId: currentUserId,
          createdAt: new Date(),
          pending: true
        }
      }
    });

    // Send to server
    try {
      await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mutationId, postId, text })
      });
    } catch (err) {
      // Server will rollback optimistic update on timeout
      console.error('Failed to save comment:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;

  return (
    <div>
      <h2>{data.title}</h2>
      <div className="comments">
        {data.comments.map(comment => (
          <div key={comment.id} className={comment.pending ? 'pending' : ''}>
            {comment.text}
            {comment.pending && <span>Saving...</span>}
          </div>
        ))}
      </div>
      <CommentInput onSubmit={addComment} />
    </div>
  );
}
```

## Live Document Editing

```typescript
function LiveDocument({ docId }: { docId: string }) {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useChannel(`document:${docId}`, (message) => {
    if (message.name === 'document.updated') {
      setContent(message.data.content);
      setIsSaving(false);
    }
  });

  useEffect(() => {
    fetch(`/api/documents/${docId}`)
      .then(r => r.json())
      .then(doc => setContent(doc.content));
  }, [docId]);

  const handleSave = async (newContent: string) => {
    setContent(newContent);
    setIsSaving(true);

    try {
      await fetch(`/api/documents/${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mutation_id: crypto.randomUUID(),
          content: newContent
        })
      });
    } catch (err) {
      console.error('Save failed:', err);
      setIsSaving(false);
    }
  };

  return (
    <div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={(e) => handleSave(e.target.value)}
      />
      {isSaving && <span>Saving...</span>}
    </div>
  );
}
```

## Best Practices

1. **Show Pending States**: Indicate optimistic updates with UI feedback
2. **Error Recovery**: Handle failed saves gracefully
3. **Debounce Saves**: For frequent updates (typing), debounce API calls
4. **Conflict Resolution**: Design merge functions to handle conflicts
5. **Offline Support**: Queue mutations when offline, retry when reconnected

## See Also

- [Outbox Pattern](outbox-pattern.md)
- [Models SDK](models-sdk.md)
- [Integration Setup](integration-setup.md)
