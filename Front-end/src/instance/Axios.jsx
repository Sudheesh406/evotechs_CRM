import axios from 'axios';

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`, // ✅ no undefined
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

console.log('Backend URL:', import.meta.env.VITE_BACKEND_URL); // ✅ should print URL

export default apiClient;
