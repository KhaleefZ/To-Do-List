import axios, { InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API = axios.create({
  baseURL: 'http://10.0.2.2:3000', // Android emulator localhost
  // For iOS simulator, use: 'http://localhost:3000'
  // For physical device, use your computer's local IP: 'http://192.168.x.x:3000'
  timeout: 10000,
});

API.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await AsyncStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for better error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      AsyncStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default API;