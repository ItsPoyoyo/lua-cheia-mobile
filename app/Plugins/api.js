import axios from 'axios';

const apiInstance = axios.create({
  baseURL: 'http://192.168.0.171:8000/api/v1/',
  timeout: 10000, // Request timeout in milliseconds
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export default apiInstance;