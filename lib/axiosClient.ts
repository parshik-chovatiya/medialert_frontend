// import axios from 'axios';
// import type { InternalAxiosRequestConfig } from 'axios';

// const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
// //const BASE_URL = 'http://192.168.29.38:3000/api';
// //const BASE_URL = ' https://maria-unhelpable-chelsie.ngrok-free.dev/api';

// const axiosClient = axios.create({
//   baseURL: BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Request interceptor - Add access token to all requests
// axiosClient.interceptors.request.use(
//   (config: InternalAxiosRequestConfig) => {
//     const token = localStorage.getItem('access_token');
//     if (token && config.headers) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor - Handle token refresh on 401
// axiosClient.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // If error is 401 and we haven't retried yet
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         const refreshToken = localStorage.getItem('refresh_token');
        
//         if (!refreshToken) {
//           // No refresh token, logout
//           localStorage.removeItem('access_token');
//           localStorage.removeItem('refresh_token');
//           window.location.href = '/login';
//           return Promise.reject(error);
//         }

//         // Try to refresh the token
//         const response = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
//           refresh: refreshToken,
//         });

//         const { access } = response.data;

//         // Save new access token
//         localStorage.setItem('access_token', access);

//         // Retry original request with new token
//         originalRequest.headers.Authorization = `Bearer ${access}`;
//         return axiosClient(originalRequest);
//       } catch (refreshError) {
//         // Refresh failed, logout
//         localStorage.removeItem('access_token');
//         localStorage.removeItem('refresh_token');
//         window.location.href = '/login';
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default axiosClient;

import axios from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const axiosClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // ⭐ REQUIRED for HttpOnly cookies
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axios.post(
          `${BASE_URL}/auth/token/refresh/`,
          {},
          { withCredentials: true }
        );
        return axiosClient(originalRequest);
      } catch (refreshError) {
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;