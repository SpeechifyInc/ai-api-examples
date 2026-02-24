#!/bin/bash

set -e

# Load SPEECHIFY_API_KEY from .env if present
if [ -f "$(dirname "$0")/.env" ]; then
  export $(grep -v '^#' "$(dirname "$0")/.env" | xargs)
fi

RESPONSE=$(curl -s -X POST https://api.speechify.ai/v1/audio/speech \
  -H "Authorization: Bearer $SPEECHIFY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Welcome to Speechify!",
    "voice_id": "george",
    "audio_format": "mp3"
  }')

echo "$RESPONSE" | jq -r '.audio_data' | base64 -d > output.mp3

echo "Audio saved to output.mp3"
