import axios from 'axios';

// Ensure the baseURL ends with /api/ if it doesn't already
let baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';
if (!baseURL.endsWith('/api/')) {
  // If the user forgot /api/ at the end of the deployment URL, add it
  if (baseURL.endsWith('/')) {
    baseURL = baseURL + 'api/';
  } else {
    baseURL = baseURL + '/api/';
  }
}

const api = axios.create({
  baseURL: baseURL,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;