import React, { createContext, useState, useEffect, useRef } from 'react'
import axiosInstance from '../api/axiosInstance'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [user, setUser] = useState(undefined)  // undefined = loading, null = no user
  const [loading, setLoading] = useState(true)
  const timerRef = useRef(null)

  const isLoggedIn = Boolean(token && user && user.email)

  // Sync token with localStorage
  useEffect(() => {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  }, [token])

  // Fetch user profile ONLY IF VALID TOKEN EXISTS
  useEffect(() => {
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    setLoading(true)

    axiosInstance
      .get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setUser(res.data)
      })
      .catch(err => {
        if (err.response?.status === 401) {
          // TOKEN IS INVALID — STOP LOOP IMMEDIATELY
          console.log("Token invalid/expired. Clearing token...")
          setToken(null)
          setUser(null)
          setLoading(false)
          return
        }
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [token])

  // Logout function
  const logout = () => {
    setToken(null)
    setUser(null)
    setLoading(false)
    localStorage.removeItem('token')
    alert('Logged out due to inactivity or manual logout.')
  }

  // Inactivity timer reset
  const resetInactivityTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(logout, 3 * 60 * 1000) // 3 Minutes
  }

  // Setup listeners when logged in
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

  // Login function (fetch user again to verify token)
  const login = async (newToken) => {
    setToken(newToken)
    setLoading(true)

    try {
      const res = await axiosInstance.get('/auth/profile', {
        headers: { Authorization: `Bearer ${newToken}` }
      })
      setUser(res.data)
    } catch (err) {
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }

    resetInactivityTimer()
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isLoggedIn,
        loading,
        login,
        logout,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
