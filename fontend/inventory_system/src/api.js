import axios from 'axios';

// Dynamically set baseURL based on environment
const baseURL =
  process.env.NODE_ENV === 'production'
    ? 'https://invento-1-f2o1.onrender.com'
    : 'http://localhost:8000';

const api = axios.create({ baseURL });

// Attach access token to every request
api.interceptors.request.use(config => {
  const accessToken = localStorage.getItem('access_token');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Handle token refresh on 401 errors
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const res = await axios.post(`${baseURL}/api/token/refresh/`, {
          refresh: refreshToken
        });

        const newAccess = res.data.access;
        localStorage.setItem('access_token', newAccess);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (refreshErr) {
        console.error('⚠️ Token refresh failed:', refreshErr);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default api;