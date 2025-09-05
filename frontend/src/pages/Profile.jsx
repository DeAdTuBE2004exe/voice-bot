// import React, { useContext, useState, useEffect } from "react";
// import { AuthContext } from "../context/AuthContext";
// import ProfileForm from "./Profile/ProfileForm.jsx";
// import DeleteAccountModal from "./DeleteAccountModal.jsx";
// import { Spinner } from "react-bootstrap";

// const BACKEND_URL = "http://localhost:5000";

// const Profile = () => {
//   const { user, setUser, logout } = useContext(AuthContext);

//   // Profile edit states
//   const [editing, setEditing] = useState(false);
//   const [changePasswordOnly, setChangePasswordOnly] = useState(false);
//   const [form, setForm] = useState({ username: "", email: "", password: "" });
//   const [otp, setOtp] = useState("");
//   const [otpSent, setOtpSent] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [resendAvailable, setResendAvailable] = useState(false);
//   const [resendCountdown, setResendCountdown] = useState(60);

//   // Delete modal states
//   const [showDelete, setShowDelete] = useState(false);
//   const [deletePassword, setDeletePassword] = useState("");
//   const [deleteOtp, setDeleteOtp] = useState("");
//   const [deleteLoading, setDeleteLoading] = useState(false);
//   const [deleteError, setDeleteError] = useState("");
//   const [deleteSuccess, setDeleteSuccess] = useState("");
//   const [otpRequestLoading, setOtpRequestLoading] = useState(false);
//   const [otpCooldown, setOtpCooldown] = useState(0);

//   // Fetch profile data
//   useEffect(() => {
//     async function fetchProfile() {
//       const token = localStorage.getItem("token");
//       try {
//         const res = await fetch(`${BACKEND_URL}/auth/profile`, {
//           headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
//         });
//         const data = await res.json();
//         if (!res.ok) {
//           setError(data.detail || "Failed to fetch profile");
//           setForm({ username: "", email: "", password: "" });
//           return;
//         }
//         setUser(data);
//         setForm({ username: data.username, email: data.email, password: "" });
//         setError("");
//       } catch {
//         setError("Failed to fetch profile");
//         setForm({ username: "", email: "", password: "" });
//       }
//     }
//     fetchProfile();
//   }, [setUser]);

//   // OTP resend timer
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

//   // Delete OTP cooldown timer
//   useEffect(() => {
//     let timer;
//     if (otpCooldown > 0) {
//       timer = setInterval(() => {
//         setOtpCooldown((c) => (c <= 1 ? 0 : c - 1));
//       }, 1000);
//     }
//     return () => clearInterval(timer);
//   }, [otpCooldown]);

//   // Input handlers
//   const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
//   const handleOtpChange = (e) => setOtp(e.target.value);

//   // Request OTP for profile update
//   async function handleRequestOtp() {
//     setLoading(true);
//     setError("");
//     setSuccess("");
//     const token = localStorage.getItem("token");
//     try {
//       const res = await fetch(`${BACKEND_URL}/auth/request-profile-update-otp`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
//       });
//       if (!res.ok) {
//         const data = await res.json();
//         setError(data.error || "Failed to send OTP");
//         setLoading(false);
//         return;
//       }
//       setOtpSent(true);
//       setResendAvailable(false);
//       setResendCountdown(60);
//       setSuccess("OTP sent");
//     } catch {
//       setError("Failed to send OTP");
//     }
//     setLoading(false);
//   }

//   // Resend OTP
//   async function handleResendOtp() {
//     if (!resendAvailable) return;
//     setLoading(true);
//     setError("");
//     setSuccess("");
//     const token = localStorage.getItem("token");
//     try {
//       const res = await fetch(`${BACKEND_URL}/auth/request-profile-update-otp`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
//       });
//       if (!res.ok) {
//         const data = await res.json();
//         setError(data.error || "Failed to resend OTP");
//         setLoading(false);
//         return;
//       }
//       setResendAvailable(false);
//       setResendCountdown(60);
//       setSuccess("OTP resent");
//     } catch {
//       setError("Failed to resend OTP");
//     }
//     setLoading(false);
//   }

//   // Submit profile updates
//   async function handleSubmit(e) {
//     e.preventDefault();
//     if (!otpSent) return await handleRequestOtp();
//     setLoading(true);
//     setError("");
//     setSuccess("");
//     const token = localStorage.getItem("token");
//     try {
//       const payload = { otp: otp.trim() };
//       if (!changePasswordOnly) {
//         payload.username = form.username;
//         payload.email = form.email;
//       }
//       if (form.password) payload.password = form.password;
//       const res = await fetch(`${BACKEND_URL}/auth/update-profile`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
//         body: JSON.stringify(payload)
//       });
//       const data = await res.json();
//       if (!res.ok) {
//         setError(data.error || "Update failed");
//         setLoading(false);
//         return;
//       }
//       setUser(data);
//       setForm({ username: data.username, email: data.email, password: "" });
//       setOtpSent(false);
//       setOtp("");
//       setSuccess("Profile updated");
//       setEditing(false);
//       setChangePasswordOnly(false);
//     } catch {
//       setError("Update failed");
//     }
//     setLoading(false);
//   }

//   // Request OTP for deletion
//   async function handleRequestDeleteOtp() {
//     setOtpRequestLoading(true);
//     setDeleteError("");
//     setDeleteSuccess("");
//     const token = localStorage.getItem("token");
//     try {
//       const res = await fetch(`${BACKEND_URL}/auth/request-delete-otp`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
//       });
//       if (!res.ok) {
//         const data = await res.json();
//         setDeleteError(data.error || "Failed to send OTP");
//       } else {
//         setDeleteSuccess("OTP sent");
//         setOtpCooldown(60);
//       }
//     } catch {
//       setDeleteError("Failed to send OTP");
//     }
//     setOtpRequestLoading(false);
//   }

//   // Delete account
//   async function handleDeleteAccount(password, otp) {
//     if (!password || !otp) {
//       setDeleteError("Password and OTP required");
//       return;
//     }
//     setDeleteLoading(true);
//     setDeleteError("");
//     setDeleteSuccess("");
//     const token = localStorage.getItem("token");
//     try {
//       const res = await fetch(`${BACKEND_URL}/auth/delete-user`, {
//         method: "DELETE",
//         headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
//         body: JSON.stringify({ password, otp })
//       });
//       if (!res.ok) {
//         const data = await res.json();
//         setDeleteError(data.error || "Delete failed");
//         setDeleteLoading(false);
//         return;
//       }
//       setDeleteSuccess("Account deleted");
//       setTimeout(() => {
//         logout();
//         window.location.href = "/";
//       }, 2000);
//     } catch {
//       setDeleteError("Delete failed");
//     }
//     setDeleteLoading(false);
//   }

//   return (
//     <>
//       <div className="profile-container">
//         <div className="profile-card">
//           <div className="profile-title">Your Profile</div>
//           {error && <div className="error-message">{error}</div>}
//           {success && <div className="success-message">{success}</div>}

//           {!editing && !showDelete && (
//             <>
//               <div>
//                 <strong>Username:</strong> {user?.username ?? <em>Not Set</em>}
//               </div>
//               <div>
//                 <strong>Email:</strong> {user?.email ?? <em>Not Set</em>}
//               </div>
//               <div className="button-group">
//                 <button onClick={() => { setEditing(true); setChangePasswordOnly(false); }}>Edit</button>
//                 <button onClick={() => { setEditing(true); setChangePasswordOnly(true); setForm(f => ({ ...f, password: "" })); }}>Change Password</button>
//                 <button onClick={() => setShowDelete(true)}>Delete Account</button>
//               </div>
//             </>
//           )}

//           {editing && !showDelete && (
//             <ProfileForm
//               form={form}
//               onChange={handleChange}
//               otp={otp}
//               onOtpChange={handleOtpChange}
//               otpSent={otpSent}
//               onSubmit={handleSubmit}
//               onCancel={() => {
//                 setEditing(false);
//                 setChangePasswordOnly(false);
//                 setOtpSent(false);
//                 setOtp("");
//                 setError("");
//                 setSuccess("");
//                 setForm(f => ({ ...f, password: "" }));
//               }}
//               loading={loading}
//               error={error}
//               success={success}
//               resendAvailable={resendAvailable}
//               resendCountdown={resendCountdown}
//               onResendOtp={handleResendOtp}
//               changePasswordOnly={changePasswordOnly}
//             />
//           )}

//           {showDelete && <DeleteAccountModal
//             onClose={() => {
//               setShowDelete(false);
//               setDeletePassword("");
//               setDeleteOtp("");
//               setDeleteError("");
//               setDeleteSuccess("");
//               setDeleteLoading(false);
//             }}
//             onDelete={handleDeleteAccount}
//             deleteLoading={deleteLoading}
//             otpRequestLoading={otpRequestLoading}
//             otpCooldown={otpCooldown}
//             onRequestOtp={handleRequestDeleteOtp}
//             error={deleteError}
//             success={deleteSuccess}
//           />}
//         </div>
//       </div>
//     </>
//   );
// };

// export default Profile;
import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import ProfileForm from "./Profile/ProfileForm.jsx";
import DeleteAccountModal from "./DeleteAccountModal.jsx";
import { Spinner } from "react-bootstrap";
import '../css/Profile.css';

const BACKEND_URL = "http://localhost:5000";

const Profile = () => {
  const { user, setUser, logout } = useContext(AuthContext);

  // Profile edit states
  const [editing, setEditing] = useState(false);
  const [changePasswordOnly, setChangePasswordOnly] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendAvailable, setResendAvailable] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);

  // Delete modal states
  const [showDelete, setShowDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteOtp, setDeleteOtp] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState("");
  const [otpRequestLoading, setOtpRequestLoading] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  // Fetch profile data
  useEffect(() => {
    async function fetchProfile() {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${BACKEND_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.detail || "Failed to fetch profile");
          setForm({ username: "", email: "", password: "" });
          return;
        }
        setUser(data);
        setForm({ username: data.username, email: data.email, password: "" });
        setError("");
      } catch {
        setError("Failed to fetch profile");
        setForm({ username: "", email: "", password: "" });
      }
    }
    fetchProfile();
  }, [setUser]);

  // OTP resend timer
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

  // Delete OTP cooldown timer
  useEffect(() => {
    let timer;
    if (otpCooldown > 0) {
      timer = setInterval(() => {
        setOtpCooldown((c) => (c <= 1 ? 0 : c - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCooldown]);

  // Input handlers
  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handleOtpChange = (e) => setOtp(e.target.value);

  // Request OTP for profile update
  async function handleRequestOtp() {
    setLoading(true);
    setError("");
    setSuccess(""); // Clear
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BACKEND_URL}/auth/request-profile-update-otp`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to send OTP");
        setLoading(false);
        return;
      }
      setOtpSent(true);
      setResendAvailable(false);
      setResendCountdown(60);
      setSuccess("OTP sent");
    } catch {
      setError("Failed to send OTP");
    }
    setLoading(false);
  }

  // Resend OTP
  async function handleResendOtp() {
    if (!resendAvailable) return;
    setLoading(true);
    setError("");
    setSuccess(""); // Clear
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BACKEND_URL}/auth/request-profile-update-otp`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to resend OTP");
        setLoading(false);
        return;
      }
      setResendAvailable(false);
      setResendCountdown(60);
      setSuccess("OTP resent");
    } catch {
      setError("Failed to resend OTP");
    }
    setLoading(false);
  }

  // Submit profile updates
  async function handleSubmit(e) {
    e.preventDefault();
    if (!otpSent) return await handleRequestOtp();
    setLoading(true);
    setError("");
    setSuccess("");
    const token = localStorage.getItem("token");
    try {
      const payload = { otp: otp.trim() };
      if (!changePasswordOnly) {
        payload.username = form.username;
        payload.email = form.email;
      }
      if (form.password) payload.password = form.password;
      const res = await fetch(`${BACKEND_URL}/auth/update-profile`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Update failed");
        setLoading(false);
        return;
      }
      setUser(data);
      setForm({ username: data.username, email: data.email, password: "" });
      setOtpSent(false);
      setOtp("");
      setSuccess("Profile updated");
      setEditing(false);
      setChangePasswordOnly(false);
    } catch {
      setError("Update failed");
    }
    setLoading(false);
  }

  // Request OTP for deletion
  async function handleRequestDeleteOtp() {
    setOtpRequestLoading(true);
    setDeleteError("");
    setDeleteSuccess("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BACKEND_URL}/auth/request-delete-otp`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      });
      if (!res.ok) {
        const data = await res.json();
        setDeleteError(data.error || "Failed to send OTP");
      } else {
        setDeleteSuccess("OTP sent");
        setOtpCooldown(60);
      }
    } catch {
      setDeleteError("Failed to send OTP");
    }
    setOtpRequestLoading(false);
  }

  // Delete account
  async function handleDeleteAccount(password, otp) {
    if (!password || !otp) {
      setDeleteError("Password and OTP required");
      return;
    }
    setDeleteLoading(true);
    setDeleteError("");
    setDeleteSuccess("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BACKEND_URL}/auth/delete-user`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ password, otp })
      });
      if (!res.ok) {
        const data = await res.json();
        setDeleteError(data.error || "Delete failed");
        setDeleteLoading(false);
        return;
      }
      setDeleteSuccess("Account deleted");
      setTimeout(() => {
        logout();
        window.location.href = "/";
      }, 2000);
    } catch {
      setDeleteError("Delete failed");
    }
    setDeleteLoading(false);
  }

  return (
    <>
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-title">Your Profile</div>
          {/* Only show ONE success message here */}
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {!editing && !showDelete && (
            <>
              <div className="profile-info-item">
                <span className="info-label">Username:</span> <span className="info-value">{user?.username ?? <em>Not Set</em>}</span>
              </div>
              <div className="profile-info-item">
                <span className="info-label">Email:</span> <span className="info-value">{user?.email ?? <em>Not Set</em>}</span>
              </div>
              <div className="button-group">
                <button className="profile-button" onClick={() => { setEditing(true); setChangePasswordOnly(false); }}>Edit Profile</button>
                <button className="profile-button" onClick={() => { setEditing(true); setChangePasswordOnly(true); setForm(f => ({ ...f, password: "" })); }}>Change Password</button>
                <button className="profile-button-danger" onClick={() => setShowDelete(true)}>Delete Account</button>
              </div>
            </>
          )}

          {editing && !showDelete && (
            <ProfileForm
              form={form}
              onChange={handleChange}
              otp={otp}
              onOtpChange={handleOtpChange}
              otpSent={otpSent}
              onSubmit={handleSubmit}
              onCancel={() => {
                setEditing(false);
                setChangePasswordOnly(false);
                setOtpSent(false);
                setOtp("");
                setError("");
                setSuccess("");
                setForm(f => ({ ...f, password: "" }));
              }}
              loading={loading}
              error={error}
              success={""} // PASS EMPTY success TO ProfileForm to avoid duplicate msg!
              resendAvailable={resendAvailable}
              resendCountdown={resendCountdown}
              onResendOtp={handleResendOtp}
              changePasswordOnly={changePasswordOnly}
            />
          )}

          {showDelete && <DeleteAccountModal
            onClose={() => {
              setShowDelete(false);
              setDeletePassword("");
              setDeleteOtp("");
              setDeleteError("");
              setDeleteSuccess("");
              setDeleteLoading(false);
            }}
            onDelete={handleDeleteAccount}
            deleteLoading={deleteLoading}
            otpRequestLoading={otpRequestLoading}
            otpCooldown={otpCooldown}
            onRequestOtp={handleRequestDeleteOtp}
            error={deleteError}
            success={deleteSuccess}
          />}
        </div>
      </div>
    </>
  );
};

export default Profile;
