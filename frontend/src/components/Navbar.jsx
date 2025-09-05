import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/logo.webp';
import '../css/Navbar.css'; // Add this import statement

const Navbar = () => {
  const { isLoggedIn, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isNavVisible, setIsNavVisible] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper to check if route is current
  const isCurrent = (path) => location.pathname === path;

  return (
    <>
      <div 
        className="navbar-trigger-zone"
        onMouseEnter={() => setIsNavVisible(true)}
        onMouseLeave={() => setIsNavVisible(false)}
      >
        <div className={`navbar-indicator ${isNavVisible ? 'hidden' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EFEFEF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        <nav className={`navbar-container ${isNavVisible ? 'visible' : ''}`}>
          <div className="navbar-content">
            <Link to="/" className="navbar-brand-container">
              <img src={logo} alt="VoiceBot Logo" className="navbar-brand-logo" />
              <span className="navbar-brand">VoiceBot</span>
            </Link>
            <div className="nav-links-right">
              {isLoggedIn ? (
                <>
                  <Link to="/chat" className={`nav-link ${isCurrent('/chat') ? 'nav-link-current' : ''}`}>
                    Chat
                  </Link>
                  <Link to="/profile" className={`nav-link ${isCurrent('/profile') ? 'nav-link-current' : ''}`}>
                    Profile
                  </Link>
                  <button className="logout-button" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className={`nav-link ${isCurrent('/login') ? 'nav-link-current' : ''}`}>
                    Login
                  </Link>
                  <Link to="/signup" className={`nav-link ${isCurrent('/signup') ? 'nav-link-current' : ''}`}>
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Navbar;