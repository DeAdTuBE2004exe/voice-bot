import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppNavbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Chatbot from './pages/Chatbot';
import Profile from './pages/Profile';
// import ChangePassword from './pages/ChangePassword';
import NotFound from './pages/NotFound';
import RequestPasswordReset from './pages/RequestPasswordReset';  // Import RequestPasswordReset page
// import ResetPassword from './pages/ResetPassword';                // Import ResetPassword page

function App() {
  return (
    <>
      {/* Responsive, dynamic navbar */}
      <AppNavbar />
      
      {/* All app routes */}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/request-password-reset" element={<RequestPasswordReset />} />
        {/* <Route path="/reset-password" element={<ResetPassword />} /> */}
        
        {/* Protected routes only for authenticated users */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chatbot />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        
        {/* Catch-all for 404 - not found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
