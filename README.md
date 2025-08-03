# Revolt Motors Voice Chatbot Replica

This is a replication of the Revolt Motors voice chatbot using the Gemini Live API in a server-to-server architecture.

## Prerequisites
- Node.js (v18+)
- Free Google AI Studio API key: Create at https://aistudio.google.com
- Microphone access in browser

## Installation
1. Clone this repo or copy files.
2. Run `npm install` to install dependencies.
3. Replace `'YOUR_API_KEY_HERE'` in `index.js` with your API key.
4. For development, switch model to `'gemini-live-2.5-flash-preview'` to avoid rate limits.

## Running
1. Run `npm start`.
2. Open http://localhost:3000 in browser.
3. Allow microphone access.
4. Click "Start Chat" and speak (e.g., "Tell me about Revolt Motors bikes").
5. To interrupt: Speak while AI is responding; it should stop and process new input.


