const startBtn = document.getElementById('startBtn');
const status = document.getElementById('status');
let ws;
let recognition;
let isSpeaking = false;
let speechSynthesis = window.speechSynthesis;
let lastInputTime = 0;
const DEBOUNCE_MS = 300; // Reduced for faster response

startBtn.addEventListener('click', () => {
  startBtn.disabled = true;
  startBtn.textContent = 'Talking...';
  status.textContent = 'Connecting...';

  ws = new WebSocket(`ws://localhost:3000`);

  ws.onopen = () => {
    console.log('WebSocket connected');
    status.textContent = 'Listening...';
    startRecognition();
  };

  ws.onmessage = (event) => {
    const text = event.data;
    status.textContent = 'Speaking response...';
    speakResponse(text);
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    status.textContent = 'WebSocket error. Please try again.';
    stopRecognition();
    startBtn.disabled = false;
    startBtn.textContent = 'Start Talking';
  };

  ws.onclose = () => {
    console.log('WebSocket closed');
    stopRecognition();
    speechSynthesis.cancel();
    startBtn.disabled = false;
    startBtn.textContent = 'Start Talking';
    status.textContent = 'Not speaking';
  };
});

function startRecognition() {
  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.continuous = true;
  recognition.interimResults = true; // Enable interim results for instant interruptions
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    const now = Date.now();
    if (now - lastInputTime < DEBOUNCE_MS) return;
    lastInputTime = now;

    const result = event.results[event.results.length - 1];
    const transcript = result[0].transcript;
    console.log('🗣️ You said:', transcript);

    if (!result.isFinal) {
      // User is speaking: interrupt immediately
      if (isSpeaking) {
        speechSynthesis.cancel();
        isSpeaking = false;
        status.textContent = 'Interrupted. Listening...';
        status.classList.remove('speaking');
      }
    } else {
      // Final transcript: send to server
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(transcript);
        status.textContent = 'Processing: ' + transcript;
      }
    }
  };

  recognition.onerror = (event) => {
    console.error('❌ Speech recognition error:', event.error);
    status.textContent = `Error: ${event.error}. Retrying...`;
    if (event.error === 'network') {
      setTimeout(startRecognition, 1000); // Reduced retry delay
    } else if (event.error === 'no-speech' || event.error === 'aborted') {
      recognition.start();
    } else {
      status.textContent = `Error: ${event.error}. Click to restart.`;
      startBtn.disabled = false;
      startBtn.textContent = 'Start Talking';
    }
  };

  recognition.onend = () => {
    if (startBtn.disabled && ws.readyState === WebSocket.OPEN) {
      setTimeout(() => recognition.start(), 50); // Faster restart
    }
  };

  recognition.start();
}

function stopRecognition() {
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
}

function speakResponse(text) {
  speechSynthesis.cancel(); // Clear any queued speech
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 1.1; // Slightly faster speech
  utterance.onstart = () => {
    isSpeaking = true;
    status.textContent = 'Speaking response...';
    status.classList.add('speaking');
  };
  utterance.onend = () => {
    isSpeaking = false;
    status.textContent = 'Listening...';
    status.classList.remove('speaking');
  };
  speechSynthesis.speak(utterance);
}