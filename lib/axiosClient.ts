import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
//const BASE_URL = "http://192.168.29.38:8000/api";
//const BASE_URL = "https://maria-unhelpable-chelsie.ngrok-free.dev/api";

const axiosClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
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