# Browser Streaming Example with Next.js

This example demonstrates how to use the Speechify AI API to stream text-to-speech audio natively in the browser in the Next.js app.

This is the minimal demo covering all of the core topics:

- usage of the API Key to issue the user access token
- usage of the user access token to authenticate the public-client (in-browser code) with the API
- regular updates of the user access token
- usage of the Speechify AI API to convert text to speech
- streaming the audio in the browser

The example is written in JavaScript and intentionally kept simple to focus on the core topics. It uses:

- Next.js for the server and the client
- end-user authentication with the SQLite back-end

## Prerequisites

- Node.js 18+,
- npm 8+,
- A Speechify AI API token. You can get one by signing up at [Speechify AI API Console](https://console.sws.speechify.com/).

## Running The Example Locally

1. Clone the repository
2. Install dependencies: `npm install`
3. In this folder, create a file named `.env` and set the `SPEECHIFY_API_KEY` environment variable to your Speechify AI API token: `SPEECHIFY_API_KEY=your-api-key`
4. Build the client: `npm run build`
5. Start the server: `npm start`
6. Open the browser at `http://localhost:4040`
