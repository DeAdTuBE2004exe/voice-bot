import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/RequestPasswordReset.css'; // Use the new CSS file

const API_BASE_URL = 'http://localhost:5000';

const RequestPasswordReset = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(5); // State for countdown timer

  const navigate = useNavigate();

  // Updated useEffect to handle the live countdown
  useEffect(() => {
    let timer;
    if (step === 3 && message) {
      timer = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown <= 1) {
            clearInterval(timer);
            navigate('/login');
            return 0;
          }
          return prevCountdown - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, message, navigate]);

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Server responded with an error');
      await res.json();
      setMessage('If this email exists, an OTP has been sent.');
      setStep(2); // Move to next step
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit OTP and new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, new_password: newPassword }),
      });
      if (!res.ok) throw new Error('Server responded with an error');
      await res.json();
      setMessage('Password reset successful! You can now log in.');
      setStep(3);
    } catch (err) {
      setError('Failed to reset password. Please check your OTP and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reusable Spinner component
  const ThemedSpinner = () => <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>;

  return (
    <div className="reset-container">
      <div className="reset-card">
        <h2 className="reset-title">Secure Password Reset</h2>
        
        {/* Render alerts above the form */}
        {message && !error && <div className="alert-custom alert-success">{message}</div>}
        {error && <div className="alert-custom alert-danger">{error}</div>}

        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="reset-form">
            <div className="form-group-custom">
              <label htmlFor="email" className="form-label-custom">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="off"
                className="form-control-custom"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              {loading ? <ThemedSpinner /> : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="reset-form">
            <div className="form-group-custom">
              <label htmlFor="otp" className="form-label-custom">OTP</label>
              <input
                id="otp"
                type="text"
                placeholder="Enter the OTP"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                required
                className="form-control-custom"
              />
            </div>
            <div className="form-group-custom">
              <label htmlFor="newPassword" className="form-label-custom">New Password</label>
              <input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                minLength={4}
                required
                className="form-control-custom"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              {loading ? <ThemedSpinner /> : 'Reset Password'}
            </button>
          </form>
        )}

        {step === 3 && message && (
          <div className="countdown-text">
            Redirecting to login in {countdown} seconds...
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestPasswordReset;
