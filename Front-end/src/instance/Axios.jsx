import axios from 'axios';

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,  // ✅ use template literal
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

console.log('Backend URL:', import.meta.env.VITE_BACKEND_URL);


export default apiClient;
