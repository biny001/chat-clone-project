# LiveSync Integration Setup

Configure Ably dashboard to connect to your PostgreSQL/Neon database.

## Prerequisites

1. Ably account with LiveSync enabled
2. PostgreSQL/Neon database
3. Outbox and nodes tables created
4. Database accessible from internet (or use Ably private networking)

## Dashboard Configuration

### Step 1: Create Integration Rule

1. Go to Ably Dashboard
2. Select your app
3. Navigate to **Integrations**
4. Click **New Integration Rule**
5. Select **Postgres**

### Step 2: Configure Connection

**Connection String**:

```
postgresql://user:password@host:5432/database?sslmode=require
```

For Neon:

```
postgresql://[user]:[password]@[endpoint].neon.tech/[dbname]?sslmode=require
```

**Tables Configuration**:

- Outbox table: `outbox` (or your table name)
- Nodes table: `nodes` (or your table name)
- Outbox schema: `public` (default)
- Nodes schema: `public` (default)

### Step 3: SSL Configuration

For Neon and most cloud databases:

- SSL Mode: `require`
- Server CA: (leave empty, uses system certs)

For custom SSL:

- Upload server CA certificate
- Configure client certificate/key if needed

### Step 4: Primary Region

Select primary data center closest to your database for lowest latency.

### Step 5: Test Connection

Click **Test Connection** to verify:

- Database reachable
- Tables exist with correct schema
- Permissions are correct

### Step 6: Save and Enable

- Save integration rule
- Enable rule
- Connector starts processing outbox entries

## API Key Configuration

Integration requires API key with:

- `subscribe` capability
- `publish` capability
- `history` capability (optional, for message history)

Create key in Dashboard → API Keys → Create new key

## Monitoring

### Integration Status

Dashboard shows:

- Connection status (connected/disconnected)
- Messages processed
- Error rate
- Latency

### Logs

View connector logs in Dashboard → Integrations → [Your Integration] → Logs

Common issues:

- Connection timeouts
- Permission errors
- Schema mismatches
- SSL certificate errors

## Environment Variables

Store connection details securely:

```bash
# .env
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
ABLY_API_KEY="your-api-key"
```

## Neon-Specific Setup

Neon provides connection pooling and serverless access:

```typescript
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
```

## Security Best Practices

1. **Read-Only User**: Create database user with minimal permissions:

```sql
CREATE USER ably_connector WITH PASSWORD 'secure_password';
GRANT SELECT, INSERT, UPDATE ON outbox TO ably_connector;
GRANT SELECT, INSERT, UPDATE, DELETE ON nodes TO ably_connector;
```

2. **Firewall**: Whitelist Ably IP addresses (provided in dashboard)

3. **SSL Required**: Always use SSL for database connections

4. **Secrets Management**: Store credentials in secure vault (AWS Secrets Manager, etc.)

## Troubleshooting

### Connection Fails

- Check database is internet-accessible
- Verify firewall rules
- Test connection string with `psql` or database client
- Check SSL configuration

### No Messages Flowing

- Verify outbox trigger is created and working
- Check outbox entries exist (`processed = false`)
- Review connector logs for errors
- Ensure API key has required capabilities

### High Latency

- Move integration to region closer to database
- Check database query performance
- Monitor network latency
- Consider increasing connector instances (enterprise feature)

## See Also

- [Outbox Pattern](outbox-pattern.md) - Database schema
- [Models SDK](models-sdk.md) - Frontend optimistic updates
- [LiveSync Documentation](https://ably.com/docs/livesync)
