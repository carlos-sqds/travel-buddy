# TRMNL Flight Price Tracker - Implementation Task

## Task Description
Build a fully working end-to-end flight price tracker with:
- Web UI for configuration (Next.js + Supabase)
- Mock flight API for development
- TRMNL device integration with webhook push
- Local development setup with PM2 + ngrok

## User Requirements
- Start locally, push to Supabase later
- Use PM2 to manage processes
- Use ngrok for webhook testing
- Mock flight API initially
- Public/free TRMNL plugin option (Private Plugin with Webhook strategy - requires Developer addon OR use Polling strategy which is free)

## Completion Criteria
- [x] Next.js app initializes and runs locally
- [x] Dashboard UI allows: set home airport, add destinations, connect TRMNL webhook
- [x] Mock flight API returns realistic price data with trends
- [x] Webhook endpoint accepts TRMNL polling OR can push to TRMNL webhook
- [x] Historical prices stored in local SQLite
- [x] PM2 manages Next.js dev server
- [x] ngrok tunnel exposes local server for TRMNL polling
- [x] Documentation explains TRMNL device connection steps (TRMNL_SETUP.md)
- [x] All lint/typecheck passes
- [x] All tests pass (44 tests)
- [x] Production build succeeds

## Verification Method
```bash
# Start services
pm2 start pm2.config.js

# Verify app running
curl http://localhost:3000/api/health

# Verify mock flight data
curl http://localhost:3000/api/flights?from=BER&to=JFK

# Verify TRMNL payload generation
curl http://localhost:3000/api/trmnl/payload

# Run validators
npm run lint && npm run typecheck
```

## TRMNL Integration Options (Research Findings)

### Option A: Polling Strategy (FREE)
- TRMNL polls YOUR server URL periodically
- Requires public URL (ngrok in dev, deployed URL in prod)
- No rate limits from your side
- TRMNL fetches every 5-30 min based on device settings

### Option B: Webhook Strategy (Requires $20 Developer addon)
- YOUR server pushes to TRMNL webhook URL
- Rate limit: 12x/hour (free) or 30x/hour (TRMNL+)
- Payload size: 2KB (free) or 5KB (TRMNL+)
- Supports deep_merge and stream strategies for incremental updates

### Recommendation
Start with **Polling Strategy** (free):
1. Create Private Plugin in TRMNL dashboard
2. Set strategy to "Polling"
3. Enter ngrok URL as polling endpoint
4. TRMNL fetches data on its refresh cycle

This allows full functionality without the Developer addon.
