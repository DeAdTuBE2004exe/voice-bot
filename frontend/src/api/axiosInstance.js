import axios from 'axios'

// Create Axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000', // Replace with your backend URL
})

// Add a request interceptor to include token from localStorage
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// Optional: Add a response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized (e.g., logout and redirect to login)
      // You can trigger logout here if needed
      window.location.href = '/login' // simple redirect
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
