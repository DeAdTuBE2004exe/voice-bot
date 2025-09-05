import React, { useContext, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AuthContext } from '../context/AuthContext';
import { loginApi } from '../api/auth';
import { useNavigate, Link } from 'react-router-dom';
import { Alert, Spinner } from 'react-bootstrap';
import '../css/Login.css';

const schema = yup.object({
  usernameOrEmail: yup
    .string()
    .required('Username or Email is required')
    .min(3, 'Must be at least 3 characters'),
  password: yup
    .string()
    .min(4, 'Password must be at least 4 characters')
    .required('Password is required'),
}).required();

const Login = () => {
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  // Redirect if logged in
  useEffect(() => {
    if (user && user.email) {
      navigate("/chat", { replace: true });
    }
  }, [user, navigate]);

  const onSubmit = async (data) => {
    setError(null);
    setLoading(true);
    try {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.usernameOrEmail.trim());
      const credentials = isEmail
        ? { email: data.usernameOrEmail.trim(), password: data.password }
        : { username: data.usernameOrEmail.trim(), password: data.password };
      const response = await loginApi(credentials); // Expects { token: ... }
      login(response.token); // AuthContext handles fetching user and triggers redirect
      // Do NOT navigate here! useEffect above will redirect when user is set
    } catch (err) {
      let errorMessage = 'Login failed. Please try again.';
      if (err.response && err.response.data) {
        errorMessage = err.response.data.error || err.response.data.message || errorMessage;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">VoiceBot Login</h2>
        {error && (
          <Alert variant="danger" style={{ width: '100%', marginBottom: '14px' }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="login-form" autoComplete="off">
          <div className="form-group-custom">
            <label htmlFor="usernameOrEmail" className="form-label-custom">
              Username or Email
            </label>
            <input
              id="usernameOrEmail"
              type="text"
              autoComplete="off"
              placeholder="Enter username or email"
              {...register('usernameOrEmail')}
              className={`form-input-custom ${errors.usernameOrEmail ? 'form-input-error' : ''}`}
            />
            {errors.usernameOrEmail && (
              <div className="form-error-message">{errors.usernameOrEmail.message}</div>
            )}
          </div>
          <div className="form-group-custom">
            <label htmlFor="password" className="form-label-custom">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="off"
              placeholder="Enter password"
              {...register('password')}
              className={`form-input-custom ${errors.password ? 'form-input-error' : ''}`}
            />
            {errors.password && (
              <div className="form-error-message">{errors.password.message}</div>
            )}
          </div>
          <button type="submit" disabled={loading} className="login-button">
            {loading ? <Spinner animation="border" size="sm" /> : 'Login'}
          </button>
        </form>
        <div className="form-links-container">
          <Link to="/signup" className="create-account-link">
            Create an account
          </Link>
          <Link to="/request-password-reset" className="forgot-password-link">
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;