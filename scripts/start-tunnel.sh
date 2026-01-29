#!/bin/bash

# Flight Price Tracker - ngrok tunnel script
# This exposes your local server so TRMNL can poll it

PORT=${PORT:-3000}

echo "Starting ngrok tunnel for port $PORT..."
echo ""
echo "Once started, copy the HTTPS URL and use it in TRMNL:"
echo "  https://xxx.ngrok.io/api/trmnl/data"
echo ""
echo "Press Ctrl+C to stop the tunnel."
echo ""

ngrok http $PORT
