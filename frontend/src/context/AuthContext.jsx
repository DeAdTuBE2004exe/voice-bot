// import React, { createContext, useState, useEffect, useRef } from 'react'

// // Create the AuthContext object
// export const AuthContext = createContext()

// export const AuthProvider = ({ children }) => {
//   const [token, setToken] = useState(localStorage.getItem('token') || null)
//   const [user, setUser] = useState(null)
//   const isLoggedIn = Boolean(token)
  
//   const timerRef = useRef(null)

//   // Sync token to localStorage for persistence
//   useEffect(() => {
//     if (token) localStorage.setItem('token', token)
//     else localStorage.removeItem('token')
//   }, [token])

//   // Logout function clears state and localStorage
//   const logout = () => {
//     setToken(null)
//     setUser(null)
//     localStorage.removeItem('token')
//     alert('Logged out due to inactivity or manual logout.')
//     // Optionally call backend logout API here if you want
//     // e.g., axios.post('/logout', {}, {headers: {Authorization: `Bearer ${token}`}})
//   }

//   // AFK inactivity timer reset function
//   const resetInactivityTimer = () => {
//     if (timerRef.current) clearTimeout(timerRef.current)
//     timerRef.current = setTimeout(() => {
//       logout()
//     }, 10 * 60 * 1000) // 10 minutes for AFK timeout
//   }

//   // Setup event listeners for user activity to reset timer
//   useEffect(() => {
//     if (!isLoggedIn) return

//     const events = ['mousemove', 'keydown', 'click', 'scroll']
//     events.forEach(event => window.addEventListener(event, resetInactivityTimer))
    
//     resetInactivityTimer() // start timer on mount when logged in

//     // Cleanup listeners on unmount or logout
//     return () => {
//       events.forEach(event => window.removeEventListener(event, resetInactivityTimer))
//       if (timerRef.current) clearTimeout(timerRef.current)
//     }
//   }, [isLoggedIn])

//   // Login method saves token and user info, and starts inactivity timer
//   const login = (newToken, userInfo = null) => {
//     setToken(newToken)
//     setUser(userInfo)
//     resetInactivityTimer()
//   }

//   return (
//     <AuthContext.Provider value={{ token, user, isLoggedIn, login, logout, setUser }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }
import React, { createContext, useState, useEffect, useRef } from 'react'
import axiosInstance from '../api/axiosInstance'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [user, setUser] = useState(undefined)  // undefined = loading, null = not logged in, object = logged in
  const [loading, setLoading] = useState(true)
  const isLoggedIn = Boolean(token && user && user.email)
  const timerRef = useRef(null)

  // Sync token to localStorage for persistence
  useEffect(() => {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  }, [token])

  // On initial load, fetch user profile if token exists
  useEffect(() => {
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    setLoading(true)
    axiosInstance
      .get('/auth/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setUser(res.data)
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [token])

  const logout = () => {
    setToken(null)
    setUser(null)
    setLoading(false)
    localStorage.removeItem('token')
    alert('Logged out due to inactivity or manual logout.')
  }

  // AFK inactivity timer reset function
  const resetInactivityTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(logout, 10 * 60 * 1000)
  }

  // Setup event listeners for user activity to reset timer
  useEffect(() => {
    if (!isLoggedIn) return
    const events = ['mousemove', 'keydown', 'click', 'scroll']
    events.forEach(event => window.addEventListener(event, resetInactivityTimer))
    resetInactivityTimer()
    return () => {
      events.forEach(event => window.removeEventListener(event, resetInactivityTimer))
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isLoggedIn])

  // Login method saves token and fetches user info from backend
  const login = (newToken) => {
    setToken(newToken)
    setLoading(true)
    axiosInstance
      .get('/auth/profile', { headers: { Authorization: `Bearer ${newToken}` } })
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
    resetInactivityTimer()
  }

  return (
    <AuthContext.Provider value={{ token, user, isLoggedIn, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}
