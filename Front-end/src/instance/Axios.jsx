import axios from 'axios';

const apiClient = axios.create({

    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  
  // baseURL: '/api',

  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export default apiClient;





