import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from '../assets/logo.webp';
import '../css/Home.css'; // Correct import path

const Home = () => {
  const { isLoggedIn, user } = useContext(AuthContext);

  return (
    <div className="home-container">
      <div className="home-card">
        <h1 className="home-title">
          Welcome to VoiceBot
        </h1>
        <div className="home-subtitle">
          AI-powered text and voice chatbot to accelerate your productivity and learning.<br />
          {isLoggedIn ? (
            <span>
              Hello <strong>{user?.username || 'User'}</strong>! Ready to chat with the AI?
            </span>
          ) : (
            <span>
              Please use the navigation bar above to log in or sign up to get started!
            </span>
          )}
        </div>
        {isLoggedIn && (
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            marginBottom: '1.8rem'
          }}>
            <Link to="/chat" className="button-link">
              <button className="chat-button">
                Go to Chatbot
              </button>
            </Link>
          </div>
        )}
        <div className="features-card">
          <h2 className="features-title">
            Why use VoiceBot?
          </h2>
          <ul className="features-list">
            <li>Fast, interactive AI chat experience</li>
            <li>Text-to-speech and speech input features (coming soon!)</li>
            <li>Secure login and data privacy</li>
            <li>Fully responsive</li>
            <li>Simple clean design and seamless UX</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;
