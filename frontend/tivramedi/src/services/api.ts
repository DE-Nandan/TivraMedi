// src/services/api.ts
import axios, { type AxiosInstance } from 'axios'

// Keep localhost as default for local development
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8080',
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

export default apiClient
