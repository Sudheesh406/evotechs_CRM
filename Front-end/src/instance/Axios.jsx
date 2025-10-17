import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',  // ✅ use template literal
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export default apiClient;
