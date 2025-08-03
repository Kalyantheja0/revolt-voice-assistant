const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const WebSocketServer = require('ws').Server;
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = 'gemini-1.5-flash'; // Stable, low-latency model
// For testing: 'gemini-2.0-flash-live-001' or 'gemini-live-2.5-flash-preview'
// For submission: 'gemini-2.5-flash-preview-native-audio-dialog'

const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', async (ws) => {
  console.log('Client connected');

  const modelInstance = genAI.getGenerativeModel({
    model,
    systemInstruction: {
      role: 'system',
      parts: [{ text: "You are Rev, the AI voice assistant for Revolt Motors. You provide helpful, accurate information exclusively about Revolt Motors, their electric motorcycles, products, services, pricing, bookings, dealerships, and related topics. If a user asks about anything unrelated, politely respond that you can only assist with Revolt Motors inquiries and redirect the conversation back to relevant topics." }]
    },
    generationConfig: {
      maxOutputTokens: 100, // Limit output for faster responses
      temperature: 0.7 // Balance speed and quality
    }
  });

  const session = await modelInstance.startChat();

  ws.on('message', async (data) => {
    const text = data.toString();
    try {
      const result = await session.sendMessage(text);
      const responseText = result.response.text();
      ws.send(responseText);
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send('Error: ' + error.message);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});