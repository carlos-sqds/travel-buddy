## Multi-user Support via UUID

### How It Works

```
Homepage (/)
    │
    ▼ Auto-generate UUID
    │
    ▼ Redirect to /dashboard/[uuid]
    │
┌───┴────────────────────────────────────────┐
│  /dashboard/abc123-def456                  │
│  ├── Set home airport                      │
│  ├── Add destinations                      │
│  ├── See polling URL:                      │
│  │   https://your-app.com/api/trmnl/abc123 │
│  └── Copy URL → paste in TRMNL            │
└────────────────────────────────────────────┘
```

### Database Changes

```sql
-- Add user_id column to all tables
CREATE TABLE users (
  id TEXT PRIMARY KEY,  -- UUID
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE config (
  id INTEGER PRIMARY KEY,
  user_id TEXT NOT NULL,      -- NEW
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE destinations (
  id INTEGER PRIMARY KEY,
  user_id TEXT NOT NULL,      -- NEW
  code TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE price_history (
  id INTEGER PRIMARY KEY,
  user_id TEXT NOT NULL,      -- NEW
  destination_code TEXT NOT NULL,
  price REAL NOT NULL,
  ...
);
```

### New Routes

| Route | Purpose |
|-------|---------|
| `GET /` | Generate UUID, redirect to `/dashboard/[uuid]` |
| `GET /dashboard/[uuid]` | User's dashboard |
| `GET /api/trmnl/[uuid]` | TRMNL polling endpoint per user |
| `GET /api/config/[uuid]` | Get user's config |
| `POST /api/config/[uuid]` | Update user's config |

### Files to Change

| File | Change |
|------|--------|
| `src/app/page.tsx` | Redirect to new UUID dashboard |
| `src/app/dashboard/[uuid]/page.tsx` | NEW - move dashboard here |
| `src/app/api/trmnl/[uuid]/route.ts` | NEW - per-user TRMNL endpoint |
| `src/app/api/config/[uuid]/route.ts` | NEW - per-user config |
| `src/lib/db.ts` | Add users table, update schema |
| `src/lib/price-history.ts` | Add user_id to all queries |

### User Flow

1. User visits `/` 
2. App generates UUID (e.g., `crypto.randomUUID()`)
3. Redirects to `/dashboard/abc123-def456`
4. User configures their flights
5. User copies their unique TRMNL URL: `/api/trmnl/abc123-def456`
6. User bookmarks their dashboard URL to return later

### Security Note

- UUIDs are unguessable (128-bit random)
- No authentication needed for MVP
- Users should bookmark their URL
- Optional: Add cookie to remember UUID on same device