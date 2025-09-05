import React, { useState, useRef, useEffect } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import axiosInstance from '../api/axiosInstance';
import '../css/Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Controlled audio element ref
  const audioRef = useRef(null);

  // Track the current audio Object URL so we can revoke it
  const currentAudioUrlRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Clean markdown symbols before TTS to avoid reading asterisks
  const stripMarkdown = (text) => {
    return text.replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/`/g, '')
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1');
  };

  // Play audio using the controlled audio element and revoke old URLs
  const playAudio = (url) => {
    if (audioRef.current) {
      // Revoke old URL if exists
      if (currentAudioUrlRef.current) {
        URL.revokeObjectURL(currentAudioUrlRef.current);
      }
      currentAudioUrlRef.current = url;

      audioRef.current.src = url;
      audioRef.current.play();
      setIsPlaying(true);

      audioRef.current.onended = () => {
        setIsPlaying(false);
        if (currentAudioUrlRef.current) {
          URL.revokeObjectURL(currentAudioUrlRef.current);
          currentAudioUrlRef.current = null;
        }
      };
    }
  };

  // Stop audio playback and revoke URL
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      if (currentAudioUrlRef.current) {
        URL.revokeObjectURL(currentAudioUrlRef.current);
        currentAudioUrlRef.current = null;
      }
    }
  };

  const canSTT = "webkitSpeechRecognition" in window || "SpeechRecognition" in window;

  const startListening = () => {
    if (!canSTT) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    const Recognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new Recognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      recognition.stop();

      await sendMessage(null, transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      recognition.stop();
    };

    setIsListening(true);
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const sendMessage = async (e, spokenText = null) => {
    if (e) e.preventDefault();
    const textToSend = spokenText !== null ? spokenText : input;
    if (!textToSend.trim()) return;

    setLoading(true);
    setError(null);
    setMessages(prev => [...prev, { sender: 'user', text: textToSend }]);
    setInput(''); // Clear input after sending

    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.post('/auth/chat', { text: textToSend }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const botText = response.data.response;
      setMessages(prev => [...prev, { sender: 'bot', text: botText }]);

      const cleanText = stripMarkdown(botText);

      const ttsRes = await fetch("http://localhost:5000/auth/tts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: cleanText }),
      });

      if (ttsRes.ok) {
        const ttsBlob = await ttsRes.blob();
        const audioUrl = URL.createObjectURL(ttsBlob);
        playAudio(audioUrl);
      } else {
        setError('Failed to get audio response.');
      }
    } catch (err) {
      setError('Failed to connect to chatbot.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="chatbot-container">
        <div className="chat-card">
          <div className="message-area">
            {messages.length === 0 && (
              <div className="welcome-message">
                What's on your mind? I'm here to help with any questions or tasks you have.<br />
                Go ahead and ask away.
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div className={`message-bubble ${msg.sender === 'user' ? 'user-bubble' : 'bot-bubble'}`}>
                  {msg.sender === 'bot'
                    ? <ReactMarkdown>{msg.text}</ReactMarkdown>
                    : msg.text
                  }
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
            {loading && (
              <div className="spinner-container">
                <Spinner animation="border" size="sm" /> Waiting for response...
              </div>
            )}
            {error && (
              <Alert variant="danger" style={{ margin: '8px 0', fontSize: '1.08rem' }}>
                {error}
              </Alert>
            )}
          </div>

          {/* Input form, mic button, stop audio button */}
          <form onSubmit={sendMessage} className="input-form">
            <input
              type="text"
              placeholder="Ask me anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading || isListening}
              autoComplete="off"
              className="input-field"
            />
            <button
              type="submit"
              disabled={loading || !input.trim() || isListening}
              className="send-button"
            >
              Send
            </button>

            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className="mic-button"
              title={isListening ? "Stop Listening" : "Speak"}
              disabled={loading}
              style={{ marginLeft: 8 }}
            >
              {isListening ? "🛑" : "🎤"}
            </button>

            <button
              type="button"
              onClick={stopAudio}
              disabled={!isPlaying}
              className="stop-button"
              style={{ marginLeft: 8 }}
              title="Stop Audio"
            >
              ⏹️
            </button>
          </form>
        </div>

        {/* Controlled audio element for playback */}
        <audio ref={audioRef} style={{ display: 'none' }} />
      </div>
    </>
  );
};

export default Chatbot;
