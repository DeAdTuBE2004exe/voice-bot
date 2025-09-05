// import React, { useState, useEffect } from 'react';
// import { useForm } from 'react-hook-form';
// import { yupResolver } from '@hookform/resolvers/yup';
// import * as yup from 'yup';
// import { signupApi } from '../api/auth';
// import { useNavigate, Link } from 'react-router-dom';
// import { Alert, Spinner } from 'react-bootstrap';
// import '../css/Signup.css';

// // Yup validation schema
// const schema = yup.object({
//   username: yup.string().min(3, 'Username must be at least 3 characters').required('Username is required'),
//   email: yup.string().email('Invalid email').required('Email is required'),
//   password: yup.string().min(4, 'Password must be at least 4 characters').required('Password is required'),
// }).required();

// const Signup = () => {
//   const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [otp, setOtp] = useState('');
//   const [otpSent, setOtpSent] = useState(false);
//   const [otpLoading, setOtpLoading] = useState(false);
//   const [otpError, setOtpError] = useState('');
//   const [resendAvailable, setResendAvailable] = useState(false);
//   const [resendCountdown, setResendCountdown] = useState(60);
//   const [signupEmail, setSignupEmail] = useState(''); // ADDED: Store email for OTP verification

//   const navigate = useNavigate();

//   // Start resend countdown timer
//   useEffect(() => {
//     let timer;
//     if (otpSent && !resendAvailable) {
//       timer = setInterval(() => {
//         setResendCountdown((c) => {
//           if (c <= 1) {
//             clearInterval(timer);
//             setResendAvailable(true);
//             return 60;
//           }
//           return c - 1;
//         });
//       }, 1000);
//     }
//     return () => clearInterval(timer);
//   }, [otpSent, resendAvailable]);

//   const onSubmit = async (data) => {
//     setLoading(true);
//     setError('');
//     setSuccess('');
//     setOtpError('');
//     try {
//       await signupApi(data); // Triggers backend to send OTP after signup
//       setSignupEmail(data.email); // FIXED: Store the email for OTP verification
//       setOtpSent(true);
//       setResendAvailable(false);
//       setResendCountdown(60);
//       setSuccess('Signup successful! OTP sent to your email. Please enter it below.');
//     } catch (err) {
//       setError(err?.error || err?.message || 'Signup failed. Try another username/email.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const verifyOtp = async () => {
//     setOtpError('');
//     setOtpLoading(true);
//     try {
//       const res = await fetch('http://localhost:5000/auth/signup/verify-otp', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ 
//           email: signupEmail, // FIXED: Send both email and OTP
//           otp: otp 
//         }),
//       });
//       if (!res.ok) {
//         const data = await res.json();
//         setOtpError(data.error || 'OTP verification failed.');
//         setOtpLoading(false);
//         return;
//       }
//       setSuccess('OTP verified successfully! Redirecting to login...');
//       setTimeout(() => navigate('/login'), 2000);
//     } catch {
//       setOtpError('OTP verification failed. Please try again.');
//     }
//     setOtpLoading(false);
//   };

//   const resendOtp = async () => {
//     if (!resendAvailable) return;
//     setOtpLoading(true);
//     setOtpError('');
//     try {
//       const res = await fetch('http://localhost:5000/auth/signup/resend-otp', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email: signupEmail }), // FIXED: Send email for resend
//       });
//       if (!res.ok) {
//         const data = await res.json();
//         setOtpError(data.error || 'Failed to resend OTP.');
//         setOtpLoading(false);
//         return;
//       }
//       setResendAvailable(false);
//       setResendCountdown(60);
//       setSuccess('OTP resent successfully.');
//     } catch {
//       setOtpError('Failed to resend OTP. Please try again.');
//     }
//     setOtpLoading(false);
//   };

//   return (
//     <div className="signup-container">
//       <div className="signup-card">
//         <h2 className="signup-title">Sign Up</h2>

//         {/* Show main error or success */}
//         {error && <Alert variant="danger" className="alert-custom alert-danger">{error}</Alert>}
        
//         {!otpSent ? (
//           <form onSubmit={handleSubmit(onSubmit)} className="signup-form" noValidate>
//             <div className="form-group-custom">
//               <label htmlFor="username" className="form-label-custom">Username</label>
//               <input
//                 id="username"
//                 type="text"
//                 autoComplete="off"
//                 placeholder="Enter username"
//                 {...register('username')}
//                 className={`form-input-custom ${errors.username ? 'form-input-error' : ''}`}
//               />
//               {errors.username && <div className="form-error-message">{errors.username.message}</div>}
//             </div>
//             <div className="form-group-custom">
//               <label htmlFor="email" className="form-label-custom">Email</label>
//               <input
//                 id="email"
//                 type="email"
//                 autoComplete="off"
//                 placeholder="Enter email"
//                 {...register('email')}
//                 className={`form-input-custom ${errors.email ? 'form-input-error' : ''}`}
//               />
//               {errors.email && <div className="form-error-message">{errors.email.message}</div>}
//             </div>
//             <div className="form-group-custom">
//               <label htmlFor="password" className="form-label-custom">Password</label>
//               <input
//                 id="password"
//                 type="password"
//                 autoComplete="off"
//                 placeholder="Enter password"
//                 {...register('password')}
//                 className={`form-input-custom ${errors.password ? 'form-input-error' : ''}`}
//               />
//               {errors.password && <div className="form-error-message">{errors.password.message}</div>}
//             </div>
//             <button
//               type="submit"
//               disabled={loading}
//               className="signup-button"
//             >
//               {loading ? <Spinner animation="border" size="sm" /> : 'Sign Up'}
//             </button>
//           </form>
//         ) : (
//           <div className="otp-verification">
//             {success && <Alert variant="success" className="alert-custom alert-success">{success}</Alert>}
//             <label htmlFor="otp" className="form-label-custom">Enter OTP</label>
//             <input
//               id="otp"
//               type="text"
//               value={otp}
//               onChange={e => setOtp(e.target.value)}
//               disabled={otpLoading}
//               className="form-input-custom"
//               placeholder="Enter OTP"
//               maxLength="6"
//             />
//             {otpError && <div className="form-error-message">{otpError}</div>}
//             <button 
//               onClick={verifyOtp} 
//               disabled={otpLoading || otp.length === 0}
//               className="otp-verify-button"
//             >
//               {otpLoading ? <Spinner animation="border" size="sm" /> : 'Verify OTP'}
//             </button>
//             <button 
//               onClick={resendOtp} 
//               disabled={!resendAvailable || otpLoading} 
//               className="otp-resend-button"
//               style={{ marginLeft: '10px' }}
//             >
//               {resendAvailable ? 'Resend OTP' : `Resend in ${resendCountdown}s`}
//             </button>
//           </div>
//         )}

//         <p className="login-prompt">
//           Already have an account?{' '}
//           <Link to="/login" className="login-link">
//             Log in
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Signup;
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { signupApi } from '../api/auth';
import { useNavigate, Link } from 'react-router-dom';
import { Alert, Spinner } from 'react-bootstrap';
import '../css/Signup.css';

// Validation
const schema = yup.object({
  username: yup.string().min(3, 'Username must be at least 3 characters').required('Username is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(4, 'Password must be at least 4 characters').required('Password is required'),
}).required();

const Signup = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendAvailable, setResendAvailable] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);

  const navigate = useNavigate();

  // Restore state after reload
  useEffect(() => {
    const pendingEmail = localStorage.getItem('pendingSignupEmail');
    const pendingOtp = localStorage.getItem('pendingOtpSent');
    if (pendingEmail && pendingOtp === 'true') {
      setSignupEmail(pendingEmail);
      setOtpSent(true);
    }
  }, []);

  useEffect(() => {
    let timer;
    if (otpSent && !resendAvailable) {
      timer = setInterval(() => {
        setResendCountdown((c) => {
          if (c <= 1) {
            clearInterval(timer);
            setResendAvailable(true);
            return 60;
          }
          return c - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, resendAvailable]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');
    setOtpError('');
    try {
      await signupApi(data);
      setSignupEmail(data.email);
      setOtpSent(true);
      setResendAvailable(false);
      setResendCountdown(60);
      setSuccess('Signup successful! OTP sent to your email. Please enter it below.');
      // Save to persist across reloads
      localStorage.setItem('pendingSignupEmail', data.email);
      localStorage.setItem('pendingOtpSent', 'true');
    } catch (err) {
      setError(err?.error || err?.message || 'Signup failed. Try another username/email.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setOtpError('');
    setOtpLoading(true);
    try {
      const res = await fetch('http://localhost:5000/auth/signup/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signupEmail, otp }),
      });
      if (!res.ok) {
        const data = await res.json();
        setOtpError(data.error || 'OTP verification failed.');
        setOtpLoading(false);
        return;
      }
      setSuccess('OTP verified successfully! Redirecting to login...');
      // Clear persistent state
      localStorage.removeItem('pendingSignupEmail');
      localStorage.removeItem('pendingOtpSent');
      setTimeout(() => navigate('/login'), 2000);
    } catch {
      setOtpError('OTP verification failed. Please try again.');
    }
    setOtpLoading(false);
  };

  const resendOtp = async () => {
    if (!resendAvailable) return;
    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await fetch('http://localhost:5000/auth/signup/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signupEmail }),
      });
      if (!res.ok) {
        const data = await res.json();
        setOtpError(data.error || 'Failed to resend OTP.');
        setOtpLoading(false);
        return;
      }
      setResendAvailable(false);
      setResendCountdown(60);
      setSuccess('OTP resent successfully.');
    } catch {
      setOtpError('Failed to resend OTP. Please try again.');
    }
    setOtpLoading(false);
  };

  // Manual "start over" if user makes a mistake:
  const resetSignup = () => {
    localStorage.removeItem('pendingSignupEmail');
    localStorage.removeItem('pendingOtpSent');
    setSignupEmail('');
    setOtp('');
    setOtpSent(false);
    setError('');
    setSuccess('');
    setOtpError('');
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2 className="signup-title">Sign Up</h2>
        {error && <Alert variant="danger" className="alert-custom alert-danger">{error}</Alert>}

        {!otpSent ? (
          <form onSubmit={handleSubmit(onSubmit)} className="signup-form" noValidate>
            <div className="form-group-custom">
              <label htmlFor="username" className="form-label-custom">Username</label>
              <input id="username" type="text" autoComplete="off" placeholder="Enter username"
                {...register('username')}
                className={`form-input-custom ${errors.username ? 'form-input-error' : ''}`}
              />
              {errors.username && <div className="form-error-message">{errors.username.message}</div>}
            </div>
            <div className="form-group-custom">
              <label htmlFor="email" className="form-label-custom">Email</label>
              <input id="email" type="email" autoComplete="off" placeholder="Enter email"
                {...register('email')}
                className={`form-input-custom ${errors.email ? 'form-input-error' : ''}`}
              />
              {errors.email && <div className="form-error-message">{errors.email.message}</div>}
            </div>
            <div className="form-group-custom">
              <label htmlFor="password" className="form-label-custom">Password</label>
              <input id="password" type="password" autoComplete="off" placeholder="Enter password"
                {...register('password')}
                className={`form-input-custom ${errors.password ? 'form-input-error' : ''}`}
              />
              {errors.password && <div className="form-error-message">{errors.password.message}</div>}
            </div>
            <button type="submit" disabled={loading} className="signup-button">
              {loading ? <Spinner animation="border" size="sm" /> : 'Sign Up'}
            </button>
          </form>
        ) : (
          <div className="otp-verification">
            {success && <Alert variant="success" className="alert-custom alert-success">{success}</Alert>}
            <label htmlFor="otp" className="form-label-custom">Enter OTP</label>
            <input id="otp" type="text" value={otp} onChange={e => setOtp(e.target.value)}
              disabled={otpLoading}
              className="form-input-custom" placeholder="Enter OTP" maxLength="6"/>
            {otpError && <div className="form-error-message">{otpError}</div>}
            <button onClick={verifyOtp} disabled={otpLoading || otp.length === 0} className="otp-verify-button">
              {otpLoading ? <Spinner animation="border" size="sm" /> : 'Verify OTP'}
            </button>
            <button onClick={resendOtp} disabled={!resendAvailable || otpLoading} className="otp-resend-button" style={{ marginLeft: '10px' }}>
              {resendAvailable ? 'Resend OTP' : `Resend in ${resendCountdown}s`}
            </button>
            <button onClick={resetSignup} disabled={otpLoading} className="otp-reset-button" style={{ marginLeft: '10px' }}>
              Start Over
            </button>
          </div>
        )}

        <p className="login-prompt">
          Already have an account?{' '}
          <Link to="/login" className="login-link">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
