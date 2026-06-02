import axios from 'axios'

// In production (Vercel), VITE_API_URL = https://codaris-api.onrender.com
// In development, it's empty so Vite proxy handles /api → localhost:5000
const BASE = import.meta.env.VITE_API_URL ?? ''

const api = axios.create({
  baseURL: `${BASE}/api`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

export default api
