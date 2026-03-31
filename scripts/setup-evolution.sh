#!/bin/bash

# Evolution-API Setup Script
# This script sets up Evolution-API for WhatsApp notifications

set -e

echo "🚀 Evolution-API Setup"
echo "====================="

# Generate random API key if not set
if [ -z "$EVOLUTION_API_KEY" ]; then
  if command -v openssl &> /dev/null; then
    EVOLUTION_API_KEY=$(openssl rand -hex 32)
  else
    # Fallback for systems without openssl
    EVOLUTION_API_KEY=$(head -c 32 /dev/urandom | xxd -p)
  fi
  echo "✨ Generated new API key: $EVOLUTION_API_KEY"
  echo ""
  echo "⚠️  IMPORTANT: Save this key to your .env file:"
  echo "   EVOLUTION_API_KEY=$EVOLUTION_API_KEY"
  echo ""
fi

# Export for docker-compose
export EVOLUTION_API_KEY

echo "📦 Starting Evolution-API stack..."
docker-compose -f docker-compose.evolution.yml up -d

echo ""
echo "⏳ Waiting for Evolution-API to initialize (30 seconds)..."
sleep 30

# Check health
echo ""
echo "🔍 Checking Evolution-API health..."
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
  echo "✅ Evolution-API is running!"
  echo ""
  echo "📋 Connection Details:"
  echo "   - Manager UI: http://localhost:8080/manager"
  echo "   - API URL: http://localhost:8080"
  echo "   - API Key: $EVOLUTION_API_KEY"
  echo ""
  echo "📱 Next Steps:"
  echo "   1. Open the Manager UI in your browser"
  echo "   2. Create a new instance named 'queue-automation'"
  echo "   3. Scan the QR code with your WhatsApp Business account"
  echo "   4. Test the connection using the API"
else
  echo "⚠️  Evolution-API may still be starting. Check status with:"
  echo "   docker-compose -f docker-compose.evolution.yml ps"
  echo "   docker-compose -f docker-compose.evolution.yml logs evolution-api"
fi

echo ""
echo "🛑 To stop Evolution-API:"
echo "   docker-compose -f docker-compose.evolution.yml down"
