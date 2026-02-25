# LiveSync Outbox Pattern

Broadcast database changes from Postgres/Neon to Ably channels using the outbox pattern.

## Overview

LiveSync uses an **outbox table** to capture database changes and stream them to Ably channels via a database connector.

**Benefits**:

- Transactional consistency (outbox + data in same transaction)
- Exactly-once delivery guarantees
- Ordered message delivery per channel
- Works with existing database workflows

## Database Schema

### Outbox Table

```sql
CREATE TABLE outbox (
  sequence_id serial PRIMARY KEY,
  mutation_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  name TEXT NOT NULL,
  rejected boolean DEFAULT false,
  data JSONB,
  headers JSONB,
  locked_by TEXT,
  lock_expiry TIMESTAMP,
  processed BOOLEAN DEFAULT false
);

-- Index for performance
CREATE INDEX idx_outbox_processed ON outbox(processed) WHERE NOT processed;
```

### Nodes Table (for connector coordination)

```sql
CREATE TABLE nodes (
  id TEXT PRIMARY KEY,
  expiry TIMESTAMP NOT NULL
);
```

### Trigger for Change Notification

```sql
CREATE FUNCTION outbox_notify() RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify('ably_adbc', '');
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER outbox_trigger
  AFTER INSERT ON outbox
  FOR EACH STATEMENT
  EXECUTE PROCEDURE outbox_notify();
```

## Transactional Writes

Always write to outbox within same transaction as application data:

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateDocument(docId: string, content: string) {
  await prisma.$transaction(async (tx) => {
    // 1. Update application data
    await tx.documents.update({
      where: { id: docId },
      data: { content, updatedAt: new Date() },
    });

    // 2. Insert change event to outbox
    await tx.outbox.create({
      data: {
        mutation_id: crypto.randomUUID(),
        channel: `document:${docId}`,
        name: "document.updated",
        data: { id: docId, content },
        headers: { source: "api" },
      },
    });
  });
}
```

## With Neon Serverless

```typescript
import { neon, neonConfig } from "@neondatabase/serverless";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const sql = neon(process.env.DATABASE_URL!);
const adapter = new PrismaNeon(sql);
const prisma = new PrismaClient({ adapter });

export async function POST(req: Request) {
  const { mutationId, postId, content } = await req.json();

  await prisma.$transaction(async (tx) => {
    const comment = await tx.comments.create({
      data: { postId, content, authorId: userId },
    });

    await tx.outbox.create({
      data: {
        mutation_id: mutationId,
        channel: `post:${postId}`,
        name: "comment.added",
        data: { comment },
        processed: false,
      },
    });
  });

  return Response.json({ success: true });
}
```

## Helper Function Pattern

```typescript
async function withOutboxWrite<T>(
  operation: (tx: any, ...args: any[]) => Promise<T>,
  ...args: any[]
): Promise<T> {
  return await prisma.$transaction(async (tx) => {
    const result = await operation(tx, ...args);

    // Operation returns outbox entry details
    if (result && typeof result === "object" && "mutation_id" in result) {
      await tx.outbox.create({
        data: {
          mutation_id: result.mutation_id,
          channel: result.channel,
          name: result.name,
          data: result.data,
          headers: result.headers,
        },
      });
    }

    return result;
  });
}

// Usage
await withOutboxWrite(
  async (tx, docId, content) => {
    await tx.documents.update({
      where: { id: docId },
      data: { content },
    });

    return {
      mutation_id: crypto.randomUUID(),
      channel: `document:${docId}`,
      name: "document.updated",
      data: { id: docId, content },
    };
  },
  documentId,
  newContent,
);
```

## Frontend Subscription

Subscribe to channels to receive database changes:

```typescript
import { useChannel } from 'ably/react';

function DocumentViewer({ documentId }: { documentId: string }) {
  const [content, setContent] = useState('');

  useChannel(`document:${documentId}`, (message) => {
    if (message.name === 'document.updated') {
      setContent(message.data.content);
    }
  });

  useEffect(() => {
    // Load initial state
    fetch(`/api/documents/${documentId}`)
      .then(r => r.json())
      .then(doc => setContent(doc.content));
  }, [documentId]);

  return <div>{content}</div>;
}
```

## Best Practices

1. **Always Transactional**: Outbox write must be in same transaction as data change
2. **Unique Mutation IDs**: Use UUIDs for mutation_id to correlate client/server events
3. **Channel Naming**: Use hierarchical names: `post:123`, `user:456:notifications`
4. **Event Names**: Descriptive names: `comment.added`, `document.updated`
5. **Data Payload**: Include full object or reference ID (keep under 64KB)
6. **Headers**: Use for metadata (source, user, timestamp)
7. **Cleanup**: Regularly delete processed outbox entries (retention policy)
8. **Error Handling**: Catch transaction failures, don't leave partial writes

## See Also

- [Integration Setup](integration-setup.md) - Ably dashboard configuration
- [Models SDK](models-sdk.md) - Optimistic updates
- [React Patterns](react-patterns.md) - Frontend integration
