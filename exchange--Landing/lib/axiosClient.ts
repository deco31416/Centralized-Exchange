// src/lib/axiosClient.ts
import axios from 'axios';

const isProduction = process.env.NODE_ENV === 'production';

const BASE_URL = isProduction
  ? process.env.NEXT_PUBLIC_API_PROD
  : process.env.NEXT_PUBLIC_API_DEV;

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;
