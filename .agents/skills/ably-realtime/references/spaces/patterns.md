# Spaces Patterns

Common collaborative patterns using Spaces hooks.

## Avatar Stack Pattern

Display online participants with profile pictures:

```typescript
import { useMembers } from '@ably/spaces/react';

interface ProfileData {
  name: string;
  avatar: string;
  status?: 'active' | 'away' | 'busy';
}

function AvatarStack() {
  const { self, others } = useMembers<ProfileData>({
    name: 'Alice',
    avatar: '/avatars/alice.jpg',
    status: 'active'
  });

  const maxVisible = 5;
  const visible = others.slice(0, maxVisible);
  const overflow = others.length - maxVisible;

  return (
    <div className="avatar-stack">
      {/* Current user */}
      {self && (
        <div className="avatar self" title="You">
          <img src={self.profileData?.avatar} alt={self.profileData?.name} />
          <span className={`status-${self.profileData?.status}`} />
        </div>
      )}

      {/* Other users */}
      {visible.map((member, index) => (
        <div
          key={member.connectionId}
          className="avatar"
          style={{ zIndex: maxVisible - index }}
          title={member.profileData?.name}
        >
          <img src={member.profileData?.avatar} alt={member.profileData?.name} />
          <span className={`status-${member.profileData?.status}`} />
        </div>
      ))}

      {/* Overflow count */}
      {overflow > 0 && (
        <div className="avatar-overflow">+{overflow}</div>
      )}
    </div>
  );
}
```

**CSS**:

```css
.avatar-stack {
  display: flex;
  padding: 8px;
}

.avatar {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid white;
  margin-left: -8px;
}

.avatar.self {
  margin-left: 0;
  border-color: #4caf50;
}

.avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.status-active {
  background: #4caf50;
}
.status-away {
  background: #ffc107;
}
.status-busy {
  background: #f44336;
}

.avatar-overflow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e0e0e0;
  margin-left: -8px;
  font-size: 12px;
  font-weight: 600;
}
```

## Live Cursor Pattern

Track and render cursor positions:

```typescript
import { useCursors, useMembers } from '@ably/spaces/react';
import { useCallback, useEffect, useState } from 'react';

interface CursorData {
  color: string;
  name: string;
}

function LiveCursors() {
  const [cursors, setCursors] = useState<Map<string, any>>(new Map());
  const { self } = useMembers<{ name: string; color: string }>();

  const { set: setCursor } = useCursors((cursorUpdate) => {
    if (cursorUpdate.connectionId === self?.connectionId) return;

    setCursors(prev => {
      const next = new Map(prev);
      next.set(cursorUpdate.connectionId, cursorUpdate);
      return next;
    });

    // Remove cursor after inactivity
    setTimeout(() => {
      setCursors(prev => {
        const next = new Map(prev);
        next.delete(cursorUpdate.connectionId);
        return next;
      });
    }, 5000);
  });

  // Throttled cursor update
  const handleMouseMove = useCallback(
    throttle((e: MouseEvent) => {
      setCursor({
        position: { x: e.clientX, y: e.clientY },
        data: {
          color: self?.profileData?.color || '#000',
          name: self?.profileData?.name || 'Anonymous'
        }
      });
    }, 50),
    [setCursor, self]
  );

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  return (
    <div className="cursor-layer">
      {Array.from(cursors.values()).map((cursor) => (
        <Cursor
          key={cursor.connectionId}
          x={cursor.position.x}
          y={cursor.position.y}
          color={cursor.data?.color}
          name={cursor.data?.name}
        />
      ))}
    </div>
  );
}

function Cursor({ x, y, color, name }: {
  x: number;
  y: number;
  color: string;
  name: string;
}) {
  return (
    <div
      className="cursor"
      style={{
        position: 'fixed',
        left: x,
        top: y,
        pointerEvents: 'none',
        zIndex: 9999,
        transform: 'translate(-2px, -2px)'
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill={color}>
        <path d="M5.65 1.5l14.5 14.5-6.25 1.75-2.75 6.25-5.5-5.5 6.25-2.75z" />
      </svg>
      <div
        style={{
          marginLeft: '20px',
          marginTop: '5px',
          padding: '2px 8px',
          background: color,
          color: 'white',
          borderRadius: '4px',
          fontSize: '12px',
          whiteSpace: 'nowrap'
        }}
      >
        {name}
      </div>
    </div>
  );
}

// Throttle utility
function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastRan = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastRan >= delay) {
      func(...args);
      lastRan = now;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastRan = Date.now();
      }, delay - (now - lastRan));
    }
  };
}
```

## Slide Deck Collaboration Pattern

Track which slide each participant is viewing:

```typescript
import { useLocations, useMembers } from '@ably/spaces/react';

interface LocationData {
  slide: number;
  timestamp: number;
}

function SlidePresentation() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [memberLocations, setMemberLocations] = useState<Map<string, number>>(new Map());

  const { others } = useMembers<{ name: string; avatar: string }>();

  const { update } = useLocations<LocationData>((locationUpdate) => {
    const slide = locationUpdate.location?.slide;
    if (slide) {
      setMemberLocations(prev => {
        const next = new Map(prev);
        next.set(locationUpdate.member.connectionId, slide);
        return next;
      });
    }
  });

  useEffect(() => {
    update({ slide: currentSlide, timestamp: Date.now() });
  }, [currentSlide, update]);

  const nextSlide = () => setCurrentSlide(prev => prev + 1);
  const prevSlide = () => setCurrentSlide(prev => Math.max(1, prev - 1));

  // Count members per slide
  const slideCounts = Array.from(memberLocations.values()).reduce((acc, slide) => {
    acc[slide] = (acc[slide] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return (
    <div className="presentation">
      <div className="slide-viewer">
        <Slide number={currentSlide} />
      </div>

      <div className="controls">
        <button onClick={prevSlide}>← Previous</button>
        <span>Slide {currentSlide}</span>
        <button onClick={nextSlide}>Next →</button>
      </div>

      <div className="slide-nav">
        {[1, 2, 3, 4, 5].map(slideNum => (
          <div
            key={slideNum}
            className={`slide-thumb ${currentSlide === slideNum ? 'active' : ''}`}
            onClick={() => setCurrentSlide(slideNum)}
          >
            <div className="slide-number">{slideNum}</div>
            {slideCounts[slideNum] > 0 && (
              <div className="viewer-count">
                👁 {slideCounts[slideNum]}
              </div>
            )}
            <div className="viewers">
              {others
                .filter(m => memberLocations.get(m.connectionId) === slideNum)
                .slice(0, 3)
                .map(member => (
                  <img
                    key={member.connectionId}
                    src={member.profileData?.avatar}
                    alt={member.profileData?.name}
                    title={member.profileData?.name}
                  />
                ))
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Component Locking Pattern

Prevent simultaneous editing of UI sections:

```typescript
import { useLock, useMembers } from '@ably/spaces/react';

function EditableSection({ sectionId, content }: {
  sectionId: string;
  content: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(content);
  const { self } = useMembers();
  const { acquire, release, lock } = useLock(sectionId);

  const isLockedByOther = lock && lock.member.connectionId !== self?.connectionId;

  const handleEdit = async () => {
    const acquired = await acquire('Editing section');
    if (acquired) {
      setIsEditing(true);
    } else {
      alert(`Section locked by ${lock?.member.profileData?.name}`);
    }
  };

  const handleSave = async () => {
    // Save to backend
    await saveContent(sectionId, value);
    await release();
    setIsEditing(false);
  };

  const handleCancel = async () => {
    setValue(content); // Reset
    await release();
    setIsEditing(false);
  };

  return (
    <div className={`section ${isLockedByOther ? 'locked' : ''}`}>
      {isLockedByOther && (
        <div className="lock-indicator">
          🔒 {lock.member.profileData?.name} is editing
        </div>
      )}

      {isEditing ? (
        <>
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
          />
          <div className="actions">
            <button onClick={handleSave}>Save</button>
            <button onClick={handleCancel}>Cancel</button>
          </div>
        </>
      ) : (
        <>
          <div className="content">{content}</div>
          <button onClick={handleEdit} disabled={isLockedByOther}>
            Edit
          </button>
        </>
      )}
    </div>
  );
}
```

## Multi-Section Locking Pattern

Lock multiple sections independently:

```typescript
import { useLocks } from '@ably/spaces/react';

function Document({ sections }: { sections: Section[] }) {
  const { acquire, release, getLock, getAllLocks } = useLocks();
  const [editingSection, setEditingSection] = useState<string | null>(null);

  const handleEditSection = async (sectionId: string) => {
    const acquired = await acquire(sectionId);
    if (acquired) {
      setEditingSection(sectionId);
    } else {
      const lock = getLock(sectionId);
      alert(`Locked by ${lock?.member.profileData?.name}`);
    }
  };

  const handleSaveSection = async (sectionId: string) => {
    await saveSection(sectionId);
    await release(sectionId);
    setEditingSection(null);
  };

  // Show all locks
  const allLocks = getAllLocks();

  return (
    <div>
      <div className="lock-status">
        {allLocks.length > 0 && (
          <div>
            🔒 Locked sections: {allLocks.map(l => l.id).join(', ')}
          </div>
        )}
      </div>

      {sections.map(section => {
        const lock = getLock(section.id);
        const isEditing = editingSection === section.id;

        return (
          <div key={section.id} className="section">
            {lock && <LockBadge member={lock.member} />}

            {isEditing ? (
              <EditMode
                section={section}
                onSave={() => handleSaveSection(section.id)}
              />
            ) : (
              <ViewMode
                section={section}
                onEdit={() => handleEditSection(section.id)}
                disabled={!!lock}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
```

## Active Users with Status Pattern

Show online users with real-time status updates:

```typescript
import { useMembers } from '@ably/spaces/react';

interface UserStatus {
  name: string;
  avatar: string;
  status: 'active' | 'away' | 'busy';
  activity?: string;
}

function ActiveUsersList() {
  const { self, others } = useMembers<UserStatus>({
    name: 'Alice',
    avatar: '/avatars/alice.jpg',
    status: 'active',
    activity: 'Editing document'
  });

  const updateActivity = (activity: string) => {
    // Profile data updates automatically trigger re-render
    self?.profileData && (self.profileData.activity = activity);
  };

  return (
    <div className="users-panel">
      <h3>Active Users ({others.length + 1})</h3>

      {/* Current user */}
      {self && (
        <div className="user self">
          <img src={self.profileData?.avatar} alt="You" />
          <div className="info">
            <div className="name">{self.profileData?.name} (You)</div>
            <div className={`status ${self.profileData?.status}`}>
              {self.profileData?.status}
            </div>
            <input
              type="text"
              placeholder="What are you doing?"
              onChange={(e) => updateActivity(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Other users */}
      {others.map(member => (
        <div key={member.connectionId} className="user">
          <img src={member.profileData?.avatar} alt={member.profileData?.name} />
          <div className="info">
            <div className="name">{member.profileData?.name}</div>
            <div className={`status ${member.profileData?.status}`}>
              {member.profileData?.status}
            </div>
            {member.profileData?.activity && (
              <div className="activity">{member.profileData?.activity}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Real-time Notifications Pattern

Notify users when collaborators join/leave:

```typescript
import { useMembers } from '@ably/spaces/react';
import { useEffect, useRef } from 'react';

function CollaborationNotifications() {
  const previousMembersRef = useRef<Set<string>>(new Set());
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const { members } = useMembers((memberUpdate) => {
    const member = memberUpdate.member;
    const event = member.lastEvent.name;

    let message = '';
    if (event === 'enter') {
      message = `${member.profileData?.name} joined`;
    } else if (event === 'leave') {
      message = `${member.profileData?.name} left`;
    } else if (event === 'update') {
      message = `${member.profileData?.name} updated status`;
    }

    if (message) {
      const notification = {
        id: Date.now().toString(),
        message,
        timestamp: Date.now()
      };

      setNotifications(prev => [...prev, notification]);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
    }
  });

  return (
    <div className="notifications">
      {notifications.map(notif => (
        <div key={notif.id} className="notification">
          {notif.message}
        </div>
      ))}
    </div>
  );
}
```

## Whiteboard Collaboration Pattern

Combine cursors, locations, and member tracking:

```typescript
function CollaborativeWhiteboard() {
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [cursors, setCursors] = useState<Map<string, any>>(new Map());

  const { self, others } = useMembers({
    name: 'Alice',
    color: '#ff6b6b',
    tool: 'pen'
  });

  useCursors((update) => {
    setCursors(prev => {
      const next = new Map(prev);
      next.set(update.connectionId, update);
      return next;
    });
  });

  const { update: updateLocation } = useLocations<{ tool: string; zoom: number }>();

  useEffect(() => {
    updateLocation({ tool, zoom: 1.0 });
  }, [tool, updateLocation]);

  const { acquire, release, getLock } = useLocks();

  return (
    <div className="whiteboard">
      <div className="toolbar">
        <button onClick={() => setTool('pen')}>Pen</button>
        <button onClick={() => setTool('eraser')}>Eraser</button>
      </div>

      <div className="collaborators">
        <AvatarStack />
        <div>
          {others.map(member => (
            <div key={member.connectionId}>
              {member.profileData?.name} using {member.location?.tool}
            </div>
          ))}
        </div>
      </div>

      <canvas className="drawing-surface">
        {/* Render other users' cursors */}
        {Array.from(cursors.values()).map(cursor => (
          <Cursor key={cursor.connectionId} {...cursor} />
        ))}
      </canvas>
    </div>
  );
}
```

## Best Practices

1. **Throttle Updates**: Limit high-frequency updates (cursors) to 50-100ms
2. **Clean Up Cursors**: Remove inactive cursors after timeout
3. **Profile Data Size**: Keep under 1KB for performance
4. **Lock Release**: Always release locks on save/cancel/unmount
5. **Connection Status**: Show connection state for better UX
6. **Error Handling**: Handle failed lock acquisitions gracefully
7. **Typing Indicators**: Use presence updates for low-frequency typing indicators
8. **Member Limits**: Design for 10-50 concurrent users (not 1000s)
9. **Notifications**: Auto-dismiss notifications after 5 seconds
10. **Accessibility**: Ensure collaborative UI is keyboard-accessible

## See Also

- [React Hooks](react-hooks.md) - Detailed hook documentation
- [Setup](setup.md) - Provider configuration
- [Spaces Documentation](https://ably.com/docs/products/spaces)
