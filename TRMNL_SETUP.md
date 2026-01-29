# TRMNL Device Setup Guide

This guide explains how to connect your TRMNL e-ink device to the Flight Price Tracker.

## Prerequisites

1. A TRMNL device connected to your account at [usetrmnl.com](https://usetrmnl.com)
2. This Flight Price Tracker app running locally or deployed
3. (For local development) ngrok or similar tunneling service

## Option 1: Polling Strategy (Recommended - FREE)

This is the free option that works without the $20 Developer addon.

### Step 1: Start the App

```bash
# Start the development server
pm2 start pm2.config.js

# Or manually
npm run dev
```

### Step 2: Expose with ngrok (for local development)

```bash
# Start ngrok tunnel
ngrok http 3000

# Note the public URL, e.g., https://abc123.ngrok.io
```

### Step 3: Create Private Plugin in TRMNL

1. Log in to [usetrmnl.com](https://usetrmnl.com)
2. Go to **Plugins** → **Add Plugin** → **Private Plugin**
3. Configure:
   - **Name**: Flight Price Tracker
   - **Strategy**: Select **Polling**
   - **Polling URL**: Enter your ngrok URL + `/api/trmnl/data`
     - Example: `https://abc123.ngrok.io/api/trmnl/data`
   - **HTTP Method**: GET
4. Click **Save**

### Step 4: Configure Display Markup

In the TRMNL Markup Editor, paste this Liquid template:

```html
<div class="view view--full">
  <div class="layout layout--col">
    <div class="title_bar">
      <span class="title">Flights from {{ merge_variables.home_airport }}</span>
    </div>
    
    {% for dest in merge_variables.destinations %}
    <div class="item {% if dest.trend contains '↓' %}item--emphasis-1{% elsif dest.trend contains '↑' %}item--emphasis-2{% endif %}">
      <div class="meta">
        <span class="label label--large">{{ dest.code }}</span>
      </div>
      <div class="content">
        <span class="title title--small">{{ dest.name }}</span>
        <div class="flex gap--medium">
          <span class="value value--large">€{{ dest.current_price }}</span>
          <span class="label">{{ dest.trend }}</span>
        </div>
        <span class="description">{{ dest.best_airline }} via {{ dest.best_site }}</span>
      </div>
    </div>
    {% endfor %}
    
    {% if merge_variables.destinations.size == 0 %}
    <div class="item">
      <div class="content">
        <span class="description">No destinations configured yet.</span>
      </div>
    </div>
    {% endif %}
    
    <div class="layout layout--row layout--right">
      <span class="label label--small">Updated: {{ merge_variables.last_updated | date: "%H:%M" }}</span>
    </div>
  </div>
</div>
```

### Step 5: Add to Playlist

1. Go to your TRMNL **Playlist**
2. Add the new Flight Price Tracker plugin
3. Set refresh interval (recommended: 15-30 minutes)

Your TRMNL will now poll your server and display flight prices!

---

## Option 2: Webhook Strategy (Requires $20 Developer Addon)

If you have the Developer addon, you can push updates to TRMNL.

### Step 1: Create Private Plugin with Webhook

1. In TRMNL, create a Private Plugin
2. Select **Webhook** strategy
3. Copy the generated Webhook URL

### Step 2: Configure in Flight Tracker

1. Open the Flight Price Tracker web dashboard
2. Find the "TRMNL Connection" section
3. Paste your Webhook URL in the "Option 2: Webhook" field
4. Click **Save**

### Step 3: Push Updates

The app will automatically push price updates to your TRMNL device.

**Rate Limits:**
- Free: 12 pushes/hour
- TRMNL+: 30 pushes/hour
- Payload size: 2KB (free) / 5KB (TRMNL+)

---

## Troubleshooting

### "Unable to fetch data" on TRMNL

1. Verify your ngrok tunnel is running
2. Test the endpoint: `curl https://your-ngrok-url.ngrok.io/api/trmnl/data`
3. Check TRMNL debug logs in plugin settings

### Prices not updating

1. Check PM2 status: `pm2 status`
2. Verify destinations are configured in the web dashboard
3. For Polling: TRMNL fetches based on device refresh interval
4. For Webhook: Check rate limits haven't been exceeded

### Chart not displaying

Charts are generated via QuickChart.io. If charts don't appear:
1. Ensure you have price history (add destinations and wait for updates)
2. Check that QuickChart URLs are accessible from TRMNL servers

---

## API Reference

### GET /api/trmnl/data

Returns flight data in TRMNL-compatible format:

```json
{
  "merge_variables": {
    "home_airport": "BER (Berlin)",
    "last_updated": "2025-01-29T19:45:00Z",
    "destinations": [
      {
        "code": "JFK",
        "name": "New York",
        "current_price": 450,
        "currency": "EUR",
        "trend": "↓ -12%",
        "best_airline": "Condor",
        "best_site": "Google Flights",
        "chart_url": "https://quickchart.io/chart?c=..."
      }
    ]
  }
}
```

### GET /api/health

Health check endpoint:

```json
{
  "status": "ok",
  "timestamp": "2025-01-29T19:45:00Z",
  "version": "0.1.0"
}
```
