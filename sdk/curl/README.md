# Speechify curl Example

This example demonstrates how to use the Speechify AI API directly with curl to convert text to speech and save it as an audio file.

## Prerequisites

- curl
- A Speechify AI API token. You can get one by signing up at [Speechify AI API Console](https://console.sws.speechify.com/).

## Running The Example Locally

1. Clone the repository
2. In this folder, create a file named `.env` and set the `SPEECHIFY_API_KEY` environment variable to your Speechify AI API token: `SPEECHIFY_API_KEY=your-api-key`
3. Make the script executable: `chmod +x run.sh`
4. Run the script: `./run.sh`
5. The generated audio will be saved as `output.mp3` in the same folder

## Running manually

You can also run the curl command directly with your API key:

```bash
curl -X POST https://api.speechify.ai/v1/audio/speech \
  -H "Authorization: Bearer $SPEECHIFY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Welcome to Speechify!",
    "voice_id": "george",
    "audio_format": "mp3"
  }' \
  --output output.mp3
```
