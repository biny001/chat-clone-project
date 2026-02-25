# Spaces React Hooks

Spaces provides React hooks for managing participant state in collaborative applications.

## useSpace

Access the Space instance and subscribe to space-level updates.

```typescript
import { useSpace } from '@ably/spaces/react';

function MyComponent() {
  const { space, error } = useSpace((update) => {
    console.log('Space update:', update);
  });

  return <div>Space: {space?.name}</div>;
}
```

**Parameters**:

- `listener?: (update: SpaceUpdate) => void` - Optional callback for space updates

**Returns**:

```typescript
{
  space: Space | undefined;
  error?: Error;
}
```

## useMembers

Build avatar stacks and track online participants.

```typescript
import { useMembers } from '@ably/spaces/react';

function AvatarStack() {
  const { self, others, members } = useMembers();

  return (
    <div>
      <h3>Online ({members.length})</h3>

      {/* Your avatar */}
      {self && (
        <div className="self">
          <img src={self.profileData?.avatar} alt="You" />
          <span>You</span>
        </div>
      )}

      {/* Other members */}
      {others.map((member) => (
        <div key={member.connectionId}>
          <img src={member.profileData?.avatar} alt={member.profileData?.name} />
          <span>{member.profileData?.name}</span>
        </div>
      ))}
    </div>
  );
}
```

**Parameters**:

- `initialProfileData?: ProfileData` - Initial profile data for self

**Returns**:

```typescript
{
  self: SpaceMember | undefined;        // Current user
  others: SpaceMember[];                 // All other members
  members: SpaceMember[];                // All members (self + others)
  error?: Error;
}
```

**SpaceMember Interface**:

```typescript
interface SpaceMember {
  clientId: string;
  connectionId: string;
  isConnected: boolean;
  profileData?: {
    [key: string]: any; // Custom profile data
  };
  location?: unknown; // Current location (if using locations)
  lastEvent: {
    name: "enter" | "leave" | "update";
    timestamp: number;
  };
}
```

### Setting Profile Data

```typescript
function UserProfile() {
  const { self } = useMembers({
    name: 'Alice',
    avatar: '/avatars/alice.jpg',
    email: 'alice@example.com',
    status: 'active'
  });

  return (
    <div>
      Welcome, {self?.profileData?.name}!
    </div>
  );
}
```

### Subscribing to Member Events

```typescript
function MemberNotifications() {
  const { members } = useMembers((memberUpdate) => {
    switch (memberUpdate.member.lastEvent.name) {
      case 'enter':
        console.log(`${memberUpdate.member.profileData?.name} joined`);
        break;
      case 'leave':
        console.log(`${memberUpdate.member.profileData?.name} left`);
        break;
      case 'update':
        console.log(`${memberUpdate.member.profileData?.name} updated`);
        break;
    }
  });

  return <div>{members.length} online</div>;
}
```

## useCursors

Track cursor positions across participants.

```typescript
import { useCursors } from '@ably/spaces/react';

function CollaborativeCursors() {
  const { set: setCursor } = useCursors((cursorUpdate) => {
    const { connectionId, position, data } = cursorUpdate;

    // Render other users' cursors
    renderCursor(connectionId, position, data);
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursor({
        position: { x: e.clientX, y: e.clientY },
        data: { color: '#ff0000', name: 'Alice' }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [setCursor]);

  return <canvas id="cursor-layer" />;
}
```

**Parameters**:

- `listener?: (cursorUpdate: CursorUpdate) => void` - Callback for cursor updates

**Returns**:

```typescript
{
  set: (cursor: CursorPosition) => void;   // Set your cursor position
  error?: Error;
}
```

**CursorPosition Interface**:

```typescript
interface CursorPosition {
  position: { x: number; y: number };
  data?: {
    [key: string]: any; // Custom cursor data (color, name, etc.)
  };
}
```

**CursorUpdate Interface**:

```typescript
interface CursorUpdate {
  connectionId: string;
  clientId: string;
  position: { x: number; y: number };
  data?: any;
}
```

### Complete Cursor Example

```typescript
function CursorTracking() {
  const [cursors, setCursors] = useState<Map<string, CursorUpdate>>(new Map());
  const { self } = useMembers();

  useCursors((update) => {
    // Update other users' cursors
    setCursors(prev => {
      const next = new Map(prev);
      next.set(update.connectionId, update);
      return next;
    });
  });

  const handleMouseMove = (e: MouseEvent) => {
    setCursor({
      position: { x: e.clientX, y: e.clientY },
      data: {
        color: self?.profileData?.color || '#000',
        name: self?.profileData?.name || 'Anonymous'
      }
    });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{ position: 'relative', width: '100%', height: '100vh' }}
    >
      {Array.from(cursors.values()).map((cursor) => (
        <div
          key={cursor.connectionId}
          style={{
            position: 'absolute',
            left: cursor.position.x,
            top: cursor.position.y,
            pointerEvents: 'none'
          }}
        >
          <div style={{ color: cursor.data?.color }}>
            ▲ {cursor.data?.name}
          </div>
        </div>
      ))}
    </div>
  );
}
```

## useLocations

Track which UI component or page each member is viewing.

```typescript
import { useLocations } from '@ably/spaces/react';

function SlideViewer({ slideId }: { slideId: number }) {
  const { update } = useLocations((locationUpdate) => {
    console.log(
      `${locationUpdate.member.profileData?.name} is on slide ${locationUpdate.location?.slide}`
    );
  });

  useEffect(() => {
    // Update location when slide changes
    update({ slide: slideId });
  }, [slideId, update]);

  return <div>Viewing slide {slideId}</div>;
}
```

**Parameters**:

- `listener?: (locationUpdate: LocationUpdate) => void` - Callback for location updates

**Returns**:

```typescript
{
  update: (location: any) => void;   // Update your location
  error?: Error;
}
```

**LocationUpdate Interface**:

```typescript
interface LocationUpdate {
  member: SpaceMember;
  location: any; // Your custom location data
  previousLocation?: any;
}
```

### Complete Location Example

```typescript
interface Location {
  page: string;
  section?: string;
  scrollPosition?: number;
}

function DocumentViewer() {
  const [page, setPage] = useState('intro');
  const [memberLocations, setMemberLocations] = useState<Map<string, Location>>(new Map());

  const { update } = useLocations((locationUpdate) => {
    setMemberLocations(prev => {
      const next = new Map(prev);
      next.set(locationUpdate.member.connectionId, locationUpdate.location);
      return next;
    });
  });

  useEffect(() => {
    update({ page, section: 'main', scrollPosition: window.scrollY });
  }, [page, update]);

  return (
    <div>
      <h2>Current Page: {page}</h2>

      <div className="member-locations">
        <h3>Member Locations</h3>
        {Array.from(memberLocations.entries()).map(([connectionId, location]) => (
          <div key={connectionId}>
            Viewing: {location.page} - {location.section}
          </div>
        ))}
      </div>

      <button onClick={() => setPage('chapter-1')}>Go to Chapter 1</button>
      <button onClick={() => setPage('chapter-2')}>Go to Chapter 2</button>
    </div>
  );
}
```

## useLocks

Lock UI components to prevent simultaneous editing.

```typescript
import { useLocks } from '@ably/spaces/react';

function EditableSection({ sectionId }: { sectionId: string }) {
  const { acquire, release, getLock } = useLocks();
  const [isLocked, setIsLocked] = useState(false);
  const [lockedBy, setLockedBy] = useState<SpaceMember | null>(null);

  const lock = getLock(sectionId);

  useEffect(() => {
    if (lock) {
      setIsLocked(true);
      setLockedBy(lock.member);
    } else {
      setIsLocked(false);
      setLockedBy(null);
    }
  }, [lock]);

  const handleEdit = async () => {
    const acquired = await acquire(sectionId);
    if (acquired) {
      // Start editing
    }
  };

  const handleSave = async () => {
    // Save changes
    await release(sectionId);
  };

  return (
    <div>
      {isLocked && lockedBy ? (
        <div>Locked by {lockedBy.profileData?.name}</div>
      ) : (
        <button onClick={handleEdit}>Edit</button>
      )}
    </div>
  );
}
```

**Returns**:

```typescript
{
  acquire: (id: string) => Promise<boolean>;   // Acquire lock
  release: (id: string) => Promise<void>;      // Release lock
  getLock: (id: string) => Lock | undefined;   // Get lock status
  getAllLocks: () => Lock[];                    // Get all locks
  error?: Error;
}
```

**Lock Interface**:

```typescript
interface Lock {
  id: string; // Lock identifier
  member: SpaceMember; // Member holding the lock
  timestamp: number; // When lock was acquired
  reason?: string; // Optional reason for lock
}
```

### useLock (Single Component)

For locking a single component, use the simpler `useLock` hook:

```typescript
import { useLock } from '@ably/spaces/react';

function EditableComponent({ componentId }: { componentId: string }) {
  const { acquire, release, lock } = useLock(componentId);
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = async () => {
    const acquired = await acquire();
    if (acquired) {
      setIsEditing(true);
    } else {
      alert(`Component locked by ${lock?.member.profileData?.name}`);
    }
  };

  const handleSave = async () => {
    await saveChanges();
    await release();
    setIsEditing(false);
  };

  return (
    <div>
      {lock && lock.member.connectionId !== self?.connectionId ? (
        <div className="locked">
          🔒 Locked by {lock.member.profileData?.name}
        </div>
      ) : isEditing ? (
        <>
          <textarea />
          <button onClick={handleSave}>Save</button>
        </>
      ) : (
        <button onClick={handleEdit}>Edit</button>
      )}
    </div>
  );
}
```

**Parameters**:

- `id: string` - Lock identifier

**Returns**:

```typescript
{
  acquire: (reason?: string) => Promise<boolean>;
  release: () => Promise<void>;
  lock: Lock | undefined;
  error?: Error;
}
```

## useConnectionStateListener

Monitor Ably connection state (from core Ably, works with Spaces).

```typescript
import { useConnectionStateListener, useAbly } from 'ably/react';

function ConnectionStatus() {
  const ably = useAbly();
  const [state, setState] = useState(ably.connection.state);

  useConnectionStateListener((stateChange) => {
    setState(stateChange.current);

    if (stateChange.current === 'connected') {
      console.log('Connected to Ably');
    } else if (stateChange.current === 'disconnected') {
      console.log('Disconnected from Ably');
    }
  });

  return (
    <div className={`connection-${state}`}>
      {state === 'connected' ? '🟢' : '🔴'} {state}
    </div>
  );
}
```

## Combined Patterns

### Complete Collaborative Editor

```typescript
function CollaborativeEditor({ documentId }: { documentId: string }) {
  const [content, setContent] = useState('');

  // Track online users
  const { self, others } = useMembers({
    name: 'Alice',
    avatar: '/avatars/alice.jpg',
    color: '#ff6b6b'
  });

  // Track cursors
  const { set: setCursor } = useCursors((update) => {
    renderCursor(update);
  });

  // Track locations (which section)
  const { update: updateLocation } = useLocations();

  // Lock editing
  const { acquire, release, lock } = useLock('content');

  const handleMouseMove = (e: MouseEvent) => {
    setCursor({
      position: { x: e.clientX, y: e.clientY },
      data: { color: self?.profileData?.color }
    });
  };

  const handleEdit = async () => {
    const acquired = await acquire();
    if (acquired) {
      // Can edit
    } else {
      alert(`Locked by ${lock?.member.profileData?.name}`);
    }
  };

  useEffect(() => {
    updateLocation({ section: 'main-content' });
  }, []);

  return (
    <div onMouseMove={handleMouseMove}>
      <AvatarStack users={others} />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={lock && lock.member.connectionId !== self?.connectionId}
      />
      <button onClick={handleEdit}>Edit</button>
    </div>
  );
}
```

## TypeScript Types

```typescript
import type {
  Space,
  SpaceMember,
  CursorUpdate,
  LocationUpdate,
  Lock,
} from "@ably/spaces";

// Profile data (custom structure)
interface ProfileData {
  name: string;
  avatar: string;
  email?: string;
  status: "active" | "away" | "busy";
}

// Location data (custom structure)
interface LocationData {
  page: string;
  section: string;
  coordinates?: { x: number; y: number };
}

// Type-safe hooks
const { self, others } = useMembers<ProfileData>();
const name: string | undefined = self?.profileData?.name;

const { update } = useLocations<LocationData>();
update({ page: "home", section: "hero" });
```

## Hook Lifecycle

All Spaces hooks automatically:

1. **Subscribe** when component mounts
2. **Unsubscribe** when component unmounts
3. **Clean up** resources (locks, presence, etc.)

```typescript
function AutoCleanupExample() {
  const { acquire } = useLock('my-component');

  useEffect(() => {
    acquire();
    // Lock is automatically released when component unmounts
  }, []);

  return <div>Editing...</div>;
}
```

## Best Practices

1. **Memoize Callbacks**: Wrap listener functions in `useCallback` to prevent re-renders
2. **Profile Data Size**: Keep profile data small (< 1KB)
3. **Cursor Throttling**: Throttle cursor updates (every 50-100ms) for performance
4. **Lock Cleanup**: Always release locks after editing or on unmount
5. **Location Updates**: Update locations on meaningful navigation, not every scroll
6. **Connection Monitoring**: Show connection status to users for better UX
7. **Error Handling**: Handle errors from all hooks gracefully
8. **TypeScript**: Define custom interfaces for profileData and location data
9. **Testing**: Mock Spaces hooks for unit tests
10. **Performance**: Use `React.memo` for components rendering many members/cursors

## See Also

- [Setup](setup.md) - Provider configuration
- [Patterns](patterns.md) - Common collaborative patterns
- [Spaces Documentation](https://ably.com/docs/products/spaces)
