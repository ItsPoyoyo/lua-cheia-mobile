import axios from 'axios';

const apiInstance = axios.create({
  baseURL: 'https://lua-cheia-backend-production.up.railway.app/api/v1/',
  timeout: 10000, // Request timeout in milliseconds
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export default apiInstance;