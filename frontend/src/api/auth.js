import axiosInstance from './axiosInstance'

export const loginApi = async (credentials) => {
  try {
    const response = await axiosInstance.post('/auth/login', credentials)
    return response.data
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network error')
  }
}

export const signupApi = async (payload) => {
  try {
    const response = await axiosInstance.post('/auth/signup', payload)
    return response.data
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network error')
  }
}

export const logoutApi = async () => {
  try {
    const response = await axiosInstance.post('/auth/logout')
    return response.data
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network error')
  }
}
