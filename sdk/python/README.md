# Speechify Python SDK Example

This example demonstrates how to use the Speechify AI API Python SDK to convert text to speech and save it as an audio file.

## Prerequisites

- Python 3.8+
- [uv](https://docs.astral.sh/uv/) package manager
- A Speechify AI API token. You can get one by signing up at [Speechify AI API Console](https://console.sws.speechify.com/).

## Running The Example Locally

1. Clone the repository
2. Install dependencies: `uv sync`
3. In this folder, create a file named `.env` and set the `SPEECHIFY_API_KEY` environment variable to your Speechify AI API token: `SPEECHIFY_API_KEY=your-api-key`
4. Run the script: `uv run python3 -m main`
5. The generated audio will be saved as `output.ogg` in the same folder
