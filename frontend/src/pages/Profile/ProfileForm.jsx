import React from "react";
import { Spinner } from "react-bootstrap";

const ProfileForm = ({
  form,
  onChange,
  otp,
  onOtpChange,
  otpSent,
  onSubmit,
  onCancel,
  loading,
  error,
  success,
  resendAvailable,
  resendCountdown,
  onResendOtp,
  changePasswordOnly,
}) => (
  <form onSubmit={onSubmit} className="profile-form" noValidate>
    {error && <div className="profile-message profile-error">{error}</div>}
    {success && <div className="profile-message profile-success">{success}</div>}

    {!changePasswordOnly && (
      <>
        <div className="profile-form-group">
          <label htmlFor="username" className="profile-label">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            value={form.username}
            onChange={onChange}
            className="profile-input"
            required
            autoComplete="username"
          />
        </div>

        <div className="profile-form-group">
          <label htmlFor="email" className="profile-label">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            className="profile-input"
            required
            autoComplete="email"
          />
        </div>
      </>
    )}

    {changePasswordOnly && (
      <div className="profile-form-group">
        <label htmlFor="password" className="profile-label">New Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          className="profile-input"
          required
          autoComplete="new-password"
        />
      </div>
    )}

    {otpSent && (
      <div className="profile-form-group">
        <label htmlFor="otp" className="profile-label">Enter OTP</label>
        <div className="profile-otp-group">
          <input
            id="otp"
            name="otp"
            type="text"
            value={otp}
            onChange={onOtpChange}
            className="profile-input"
            required
            autoComplete="one-time-code"
          />
          <button
            type="button"
            className="profile-button resend-button"
            onClick={onResendOtp}
            disabled={!resendAvailable || loading}
          >
            {loading ? <Spinner animation="border" size="sm" /> : (resendAvailable ? "Resend" : `${resendCountdown}s`)}
          </button>
        </div>
      </div>
    )}

    <div className="button-group">
      <button
        type="submit"
        disabled={loading}
        className="profile-button save-button"
      >
        {loading ? (otpSent ? <Spinner animation="border" size="sm" /> : "Sending...") : (otpSent ? "Verify and Save" : "Send OTP")}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="profile-button cancel-button"
      >
        Cancel
      </button>
    </div>
  </form>
);

export default ProfileForm;
