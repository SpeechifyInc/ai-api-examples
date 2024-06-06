# Browser Streaming Example

This example demonstrates how to use the Speechify AI API to stream text-to-speech audio natively in the browser.

This is the minimal demo covering all of the core topics:

- usage of the API Key to issue the user access token
- usage of the user access token to authenticate the public-client (in-browser code) with the API
- regular updates of the user access token
- usage of the Speechify AI API to convert text to speech
- streaming the audio in the browser

The example is written in JavaScript and intentionally kept simple to focus on the core topics. It uses:

- express.js for the server
- mock end-user authentication
- in-memory storage for the user session (server-side)
- vanilla JS for the client
- Vite for client bundling

## Prerequisites

- Node.js 18+,
- npm 8+,
- A Speechify AI API token. You can get one by signing up at [Speechify AI API Console](https://console.sws.speechify.com/).

## Running The Example Locally
