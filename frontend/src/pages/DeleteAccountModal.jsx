import React, { useState } from "react";
import { Spinner } from "react-bootstrap";
import "../css/DeleteAccountModal.css";


const DeleteAccountModal = ({
  onClose,
  onDelete,
  deleteLoading,
  otpLoading,
  otpCooldown,
  onRequestOtp,
  error,
  success,
}) => {
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  return (
    <div className="profile-delete-backdrop">
      <div className="profile-delete-modal">
        <h3 className="profile-delete-title">Delete Account</h3>
        {error && <div className="profile-error-message">{error}</div>}
        {success && <div className="profile-success-message">{success}</div>}
        <p>
          Please enter your current password and OTP to <b>permanently delete</b> your account.
          <br />
          <span className="profile-delete-warning">This action cannot be undone.</span>
        </p>
        <div className="profile-delete-form">
          <div className="profile-delete-input-group">
            <div className="profile-delete-input-item">
              <label htmlFor="password" className="profile-label">Current Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="profile-input"
                autoComplete="current-password"
                placeholder="Enter your password"
              />
            </div>
            <div className="profile-delete-input-item">
              <label htmlFor="otp" className="profile-label">OTP</label>
              <div className="profile-otp-group">
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  className="profile-input"
                  autoComplete="one-time-code"
                  placeholder="Enter OTP"
                />
                <button
                  onClick={() => onRequestOtp()}
                  disabled={otpLoading || otpCooldown > 0}
                  className="otp-button"
                >
                  {otpLoading
                    ? <Spinner animation="border" size="sm" />
                    : otpCooldown > 0
                      ? `${otpCooldown}s`
                      : "Send OTP"}
                </button>
              </div>
            </div>
          </div>
          <div className="modal-button-group">
            <button
              onClick={() => onDelete(password, otp)}
              disabled={deleteLoading}
              className="profile-delete-confirm-btn"
            >
              {deleteLoading ? <Spinner animation="border" size="sm" /> : "Confirm Delete"}
            </button>
            <button
              onClick={() => {
                setPassword("");
                setOtp("");
                onClose();
              }}
              className="profile-delete-cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
