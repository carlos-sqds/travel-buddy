# Flight Price Tracker for TRMNL

A flight price tracking dashboard that displays on your TRMNL e-ink device.

## Features

- Track flight prices from your home airport to multiple destinations
- View price trends and historical data
- Display on TRMNL e-ink device via polling (free) or webhook
- Mock flight data for development (real API integration planned)

## Quick Start

### Prerequisites

- Node.js >= 18.17
- PM2: `npm install -g pm2`
- ngrok: `brew install ngrok` (for exposing local server to TRMNL)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or use PM2 for process management
pm2 start pm2.config.js
```

### Connect to TRMNL

1. Start the app and ngrok tunnel:
   ```bash
   pm2 start pm2.config.js
   ./scripts/start-tunnel.sh
   ```

2. Copy the ngrok HTTPS URL

3. In TRMNL dashboard:
   - Create Private Plugin → Polling strategy
   - Enter: `https://your-ngrok-url/api/trmnl/data`

See [TRMNL_SETUP.md](./TRMNL_SETUP.md) for detailed instructions.

## Development

```bash
# Run development server
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Run tests
npm run test

# Build for production
npm run build
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health check |
| `GET /api/flights?from=BER&to=JFK` | Get flight price |
| `GET /api/flights?from=BER&to=JFK&history=true` | Get price history |
| `GET /api/airports?q=berlin` | Search airports |
| `GET /api/config` | Get app configuration |
| `POST /api/config` | Update configuration |
| `GET /api/trmnl/data` | TRMNL-formatted payload |

## Project Structure

```
src/
├── app/
│   ├── api/          # API routes
│   ├── page.tsx      # Dashboard UI
│   └── layout.tsx    # App layout
├── components/       # React components
├── lib/              # Business logic
│   ├── db.ts         # SQLite database
│   ├── mock-flight-data.ts
│   ├── price-history.ts
│   └── trmnl-payload.ts
├── types/            # TypeScript types
└── __tests__/        # Test files
```

## Configuration

Copy `.env.example` to `.env.local` and configure:

```bash
# TRMNL webhook URL (optional - for push updates)
TRMNL_WEBHOOK_URL=https://usetrmnl.com/api/custom_plugins/...

# ngrok auth token (optional)
NGROK_AUTH_TOKEN=your-token
```

## Contributing

Contributions are welcome! Here's how to get started:

### Setup

```bash
# Fork and clone the repo
git clone https://github.com/YOUR_USERNAME/travel-buddy.git
cd travel-buddy

# Install dependencies
npm install

# Start dev server
npm run dev
```

### Development Workflow

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Run all checks before committing:
   ```bash
   npm run lint        # Check code style
   npm run typecheck   # Check types
   npm run test        # Run tests (44 tests)
   npm run build       # Verify production build
   ```

4. Commit and push:
   ```bash
   git add .
   git commit -m "feat: description of your change"
   git push origin feature/your-feature-name
   ```

5. Open a Pull Request

### Key Areas to Contribute

| Area | Files | Description |
|------|-------|-------------|
| **Real Flight API** | `src/lib/flight-api.ts` (new) | Replace mock data with SerpApi/Skyscanner |
| **More Airlines** | `src/lib/mock-flight-data.ts` | Add airlines, routes, booking sites |
| **UI Improvements** | `src/components/*` | Better styling, charts, mobile support |
| **TRMNL Templates** | `TRMNL_SETUP.md` | Alternative layouts (half, quadrant) |
| **Database** | `src/lib/db.ts` | Migrate to Supabase/Postgres |
| **Tests** | `src/__tests__/*` | Increase coverage |

### Code Style

- TypeScript strict mode enabled
- ESLint with Next.js config
- Prefer named exports
- Keep components small and focused
- Add tests for new functionality

### Commit Messages

Follow conventional commits:
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation
- `test:` adding tests
- `refactor:` code change without feature/fix

### Need Help?

- Check existing issues for context
- Open an issue to discuss larger changes before implementing
- Ask questions in PR comments

## License

MIT
