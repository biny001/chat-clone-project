# LiveObjects Examples

⚠️ **Public Preview**: APIs may change before general availability.

Complete examples using LiveObjects for real-world use cases.

## Voting/Polling Application

```typescript
import { useEffect, useState } from 'react';
import { LiveCounter, LiveMap } from 'ably/liveobjects';
import * as Ably from 'ably';

const realtime = new Ably.Realtime({ key: apiKey, clientId: 'user-123' });

interface PollOption {
  label: string;
  votes: number;
}

function VotingPoll({ pollId }: { pollId: string }) {
  const [options, setOptions] = useState<Map<string, PollOption>>(new Map());
  const [totalVotes, setTotalVotes] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    let poll: any;
    const unsubscribers: Array<() => void> = [];

    async function init() {
      const channel = realtime.channels.get(`poll:${pollId}`);
      const root = await channel.object.get();

      // Initialize poll structure if it doesn't exist
      if (!root.get('poll').instance()) {
        await root.set('poll', LiveMap.create({
          question: 'What is your favorite programming language?',
          options: LiveMap.create({
            javascript: LiveCounter.create(0),
            typescript: LiveCounter.create(0),
            python: LiveCounter.create(0),
            rust: LiveCounter.create(0)
          }),
          totalVotes: LiveCounter.create(0)
        }));
      }

      poll = root.get('poll');

      // Subscribe to vote changes
      const optionKeys = ['javascript', 'typescript', 'python', 'rust'];
      optionKeys.forEach(key => {
        const sub = poll.get('options').get(key).subscribe(() => {
          updateOptions();
        });
        unsubscribers.push(sub.unsubscribe);
      });

      // Subscribe to total votes
      const totalSub = poll.get('totalVotes').subscribe(() => {
        setTotalVotes(poll.get('totalVotes').value());
      });
      unsubscribers.push(totalSub.unsubscribe);

      // Initial load
      updateOptions();
      setTotalVotes(poll.get('totalVotes').value());
    }

    function updateOptions() {
      const opts = new Map<string, PollOption>();
      ['javascript', 'typescript', 'python', 'rust'].forEach(key => {
        opts.set(key, {
          label: key.charAt(0).toUpperCase() + key.slice(1),
          votes: poll.get('options').get(key).value()
        });
      });
      setOptions(opts);
    }

    init();

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [pollId]);

  const handleVote = async (option: string) => {
    if (hasVoted) return;

    const channel = realtime.channels.get(`poll:${pollId}`);
    const root = await channel.object.get();
    const poll = root.get('poll');

    await poll.get('options').get(option).increment(1);
    await poll.get('totalVotes').increment(1);
    setHasVoted(true);
  };

  return (
    <div className="poll">
      <h2>Vote for your favorite language</h2>
      <p>Total votes: {totalVotes}</p>

      <div className="options">
        {Array.from(options.entries()).map(([key, option]) => {
          const percentage = totalVotes > 0
            ? Math.round((option.votes / totalVotes) * 100)
            : 0;

          return (
            <div key={key} className="option">
              <button
                onClick={() => handleVote(key)}
                disabled={hasVoted}
              >
                {option.label}
              </button>
              <div className="votes">
                <div
                  className="bar"
                  style={{ width: `${percentage}%` }}
                />
                <span>{option.votes} votes ({percentage}%)</span>
              </div>
            </div>
          );
        })}
      </div>

      {hasVoted && <p>Thanks for voting!</p>}
    </div>
  );
}
```

## Game Leaderboard

```typescript
interface Player {
  name: string;
  score: number;
}

function Leaderboard({ gameId }: { gameId: string }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [myScore, setMyScore] = useState(0);
  const myPlayerId = 'player-' + userId;

  useEffect(() => {
    let game: any;
    const unsubscribers: Array<() => void> = [];

    async function init() {
      const channel = realtime.channels.get(`game:${gameId}`);
      const root = await channel.object.get();

      if (!root.get('game').instance()) {
        await root.set('game', LiveMap.create({
          players: LiveMap.create({}),
          scores: LiveMap.create({})
        }));
      }

      game = root.get('game');

      // Subscribe to score changes
      const scoreSub = game.get('scores').subscribe(() => {
        updateLeaderboard();
      });
      unsubscribers.push(scoreSub.unsubscribe);

      // Initialize self if not exists
      if (!game.get('players').has(myPlayerId)) {
        await game.get('players').set(myPlayerId, { name: 'Player ' + userId });
        await game.get('scores').set(myPlayerId, LiveCounter.create(0));
      }

      // Subscribe to my score
      const myScoreSub = game.get('scores').get(myPlayerId).subscribe(() => {
        setMyScore(game.get('scores').get(myPlayerId).value());
      });
      unsubscribers.push(myScoreSub.unsubscribe);

      updateLeaderboard();
      setMyScore(game.get('scores').get(myPlayerId).value());
    }

    function updateLeaderboard() {
      const playersList: Player[] = [];
      const playersMap = game.get('players').value();

      Object.keys(playersMap).forEach(playerId => {
        const player = playersMap[playerId];
        const score = game.get('scores').get(playerId).value();
        playersList.push({ name: player.name, score });
      });

      playersList.sort((a, b) => b.score - a.score);
      setPlayers(playersList);
    }

    init();

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [gameId]);

  const addPoints = async (points: number) => {
    const channel = realtime.channels.get(`game:${gameId}`);
    const root = await channel.object.get();
    await root.get('game').get('scores').get(myPlayerId).increment(points);
  };

  return (
    <div className="leaderboard">
      <h2>Leaderboard</h2>

      <div className="my-score">
        <p>Your Score: {myScore}</p>
        <button onClick={() => addPoints(10)}>+10 Points</button>
        <button onClick={() => addPoints(50)}>+50 Points</button>
      </div>

      <ol>
        {players.map((player, index) => (
          <li key={index} className={player.name.includes(userId) ? 'me' : ''}>
            <span className="rank">#{index + 1}</span>
            <span className="name">{player.name}</span>
            <span className="score">{player.score}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
```

## Shared Configuration/Settings

```typescript
interface AppSettings {
  theme: 'light' | 'dark';
  fontSize: number;
  autoSave: boolean;
  language: string;
}

function SharedSettings({ teamId }: { teamId: string }) {
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'light',
    fontSize: 14,
    autoSave: true,
    language: 'en'
  });

  useEffect(() => {
    let settingsMap: any;
    let unsubscribe: (() => void) | undefined;

    async function init() {
      const channel = realtime.channels.get(`team:${teamId}:settings`);
      const root = await channel.object.get();

      if (!root.get('settings').instance()) {
        await root.set('settings', LiveMap.create<AppSettings>({
          theme: 'light',
          fontSize: 14,
          autoSave: true,
          language: 'en'
        }));
      }

      settingsMap = root.get('settings');

      const sub = settingsMap.subscribe(() => {
        setSettings(settingsMap.value());
      });
      unsubscribe = sub.unsubscribe;

      setSettings(settingsMap.value());
    }

    init();

    return () => {
      unsubscribe?.();
    };
  }, [teamId]);

  const updateSetting = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    const channel = realtime.channels.get(`team:${teamId}:settings`);
    const root = await channel.object.get();
    await root.get('settings').set(key, value);
  };

  return (
    <div className="settings-panel">
      <h2>Team Settings</h2>

      <div className="setting">
        <label>Theme</label>
        <select
          value={settings.theme}
          onChange={(e) => updateSetting('theme', e.target.value as 'light' | 'dark')}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div className="setting">
        <label>Font Size: {settings.fontSize}px</label>
        <input
          type="range"
          min="12"
          max="24"
          value={settings.fontSize}
          onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
        />
      </div>

      <div className="setting">
        <label>
          <input
            type="checkbox"
            checked={settings.autoSave}
            onChange={(e) => updateSetting('autoSave', e.target.checked)}
          />
          Auto-save
        </label>
      </div>

      <div className="setting">
        <label>Language</label>
        <select
          value={settings.language}
          onChange={(e) => updateSetting('language', e.target.value)}
        >
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
        </select>
      </div>
    </div>
  );
}
```

## Real-time Counter Dashboard

```typescript
function Analytics({ dashboardId }: { dashboardId: string }) {
  const [metrics, setMetrics] = useState({
    pageViews: 0,
    activeUsers: 0,
    conversions: 0,
    revenue: 0
  });

  useEffect(() => {
    let dashboard: any;
    const unsubscribers: Array<() => void> = [];

    async function init() {
      const channel = realtime.channels.get(`analytics:${dashboardId}`);
      const root = await channel.object.get();

      if (!root.get('metrics').instance()) {
        await root.set('metrics', LiveMap.create({
          pageViews: LiveCounter.create(0),
          activeUsers: LiveCounter.create(0),
          conversions: LiveCounter.create(0),
          revenue: LiveCounter.create(0)
        }));
      }

      dashboard = root.get('metrics');

      // Subscribe to all metrics
      ['pageViews', 'activeUsers', 'conversions', 'revenue'].forEach(metric => {
        const sub = dashboard.get(metric).subscribe(() => {
          updateMetrics();
        });
        unsubscribers.push(sub.unsubscribe);
      });

      updateMetrics();
    }

    function updateMetrics() {
      setMetrics({
        pageViews: dashboard.get('pageViews').value(),
        activeUsers: dashboard.get('activeUsers').value(),
        conversions: dashboard.get('conversions').value(),
        revenue: dashboard.get('revenue').value()
      });
    }

    init();

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [dashboardId]);

  // Simulate events (in real app, backend would increment)
  const simulatePageView = async () => {
    const channel = realtime.channels.get(`analytics:${dashboardId}`);
    const root = await channel.object.get();
    await root.get('metrics').get('pageViews').increment(1);
  };

  return (
    <div className="dashboard">
      <h2>Real-time Analytics</h2>

      <div className="metrics">
        <div className="metric">
          <h3>{metrics.pageViews.toLocaleString()}</h3>
          <p>Page Views</p>
        </div>

        <div className="metric">
          <h3>{metrics.activeUsers.toLocaleString()}</h3>
          <p>Active Users</p>
        </div>

        <div className="metric">
          <h3>{metrics.conversions.toLocaleString()}</h3>
          <p>Conversions</p>
        </div>

        <div className="metric">
          <h3>${(metrics.revenue / 100).toFixed(2)}</h3>
          <p>Revenue</p>
        </div>
      </div>

      <button onClick={simulatePageView}>Simulate Page View</button>
    </div>
  );
}
```

## Feature Flags

```typescript
interface FeatureFlags {
  [key: string]: boolean;
}

function FeatureFlagManager({ appId }: { appId: string }) {
  const [flags, setFlags] = useState<FeatureFlags>({});
  const [newFlagName, setNewFlagName] = useState('');

  useEffect(() => {
    let flagsMap: any;
    let unsubscribe: (() => void) | undefined;

    async function init() {
      const channel = realtime.channels.get(`app:${appId}:features`);
      const root = await channel.object.get();

      if (!root.get('flags').instance()) {
        await root.set('flags', LiveMap.create({
          darkMode: true,
          betaFeatures: false,
          analytics: true
        }));
      }

      flagsMap = root.get('flags');

      const sub = flagsMap.subscribe(() => {
        setFlags(flagsMap.value());
      });
      unsubscribe = sub.unsubscribe;

      setFlags(flagsMap.value());
    }

    init();

    return () => {
      unsubscribe?.();
    };
  }, [appId]);

  const toggleFlag = async (flagName: string) => {
    const channel = realtime.channels.get(`app:${appId}:features`);
    const root = await channel.object.get();
    const current = flags[flagName];
    await root.get('flags').set(flagName, !current);
  };

  const addFlag = async () => {
    if (!newFlagName) return;
    const channel = realtime.channels.get(`app:${appId}:features`);
    const root = await channel.object.get();
    await root.get('flags').set(newFlagName, false);
    setNewFlagName('');
  };

  return (
    <div className="feature-flags">
      <h2>Feature Flags</h2>

      <div className="flags-list">
        {Object.entries(flags).map(([name, enabled]) => (
          <div key={name} className="flag">
            <label>
              <input
                type="checkbox"
                checked={enabled}
                onChange={() => toggleFlag(name)}
              />
              {name}
            </label>
            <span className={enabled ? 'enabled' : 'disabled'}>
              {enabled ? '✓ Enabled' : '✗ Disabled'}
            </span>
          </div>
        ))}
      </div>

      <div className="add-flag">
        <input
          type="text"
          placeholder="New flag name"
          value={newFlagName}
          onChange={(e) => setNewFlagName(e.target.value)}
        />
        <button onClick={addFlag}>Add Flag</button>
      </div>
    </div>
  );
}
```

## Best Practices Demonstrated

1. **Initialization**: Check existence with `instance()` before creating objects
2. **Subscription Management**: Store unsubscribe functions and call in cleanup
3. **Batch Updates**: Use `batch()` for related changes (not shown in simple examples)
4. **Error Handling**: Wrap async operations in try-catch (simplified in examples)
5. **Type Safety**: Use TypeScript interfaces for data structures
6. **Atomic Operations**: Use `increment()` for counters, not manual read-write
7. **Nested Structures**: Organize related data in LiveMaps
8. **State Synchronization**: Update React state when LiveObjects change

## See Also

- [Overview](overview.md) - LiveObjects concepts
- [API Reference](api-reference.md) - Detailed API documentation
- [LiveObjects Documentation](https://ably.com/docs/products/liveobjects)
