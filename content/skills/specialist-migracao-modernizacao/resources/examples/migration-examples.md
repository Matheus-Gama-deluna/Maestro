# Exemplos - Migração

## Strangler Fig Pattern
```typescript
// Legacy route
app.get('/old-api/users', legacyHandler);

// New route (parallel)
app.get('/api/v2/users', newHandler);

// Gradual migration with feature flag
app.get('/users', (req, res) => {
  if (featureFlags.newAPI) {
    return newHandler(req, res);
  }
  return legacyHandler(req, res);
});
```

## Database Migration
```sql
-- Phase 1: Add new column
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;

-- Phase 2: Migrate data
UPDATE users SET email_verified = TRUE WHERE verified_at IS NOT NULL;

-- Phase 3: Remove old column
ALTER TABLE users DROP COLUMN verified_at;
```
