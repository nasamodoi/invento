// import axios from 'axios';

// // Dynamically set baseURL based on environment
// const baseURL =
//   process.env.NODE_ENV === 'production'
//     ? 'https://invento-1-f2o1.onrender.com/api/'  // ✅ Backend URL
//     : 'http://localhost:8000/api/';

// const api = axios.create({ baseURL });

// // Attach access token to every request
// api.interceptors.request.use(config => {
//   const accessToken = localStorage.getItem('access_token');
//   if (accessToken) {
//     config.headers.Authorization = `Bearer ${accessToken}`;
//   }
//   return config;
// });

// // Handle token refresh on 401 errors
// api.interceptors.response.use(
//   response => response,
//   async error => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         const refreshToken = localStorage.getItem('refresh_token');
//         const res = await axios.post(`${baseURL}token/refresh/`, {
//           refresh: refreshToken
//         });

//         const newAccess = res.data.access;
//         localStorage.setItem('access_token', newAccess);

//         // Retry original request with new token
//         originalRequest.headers.Authorization = `Bearer ${newAccess}`;
//         return api(originalRequest);
//       } catch (refreshErr) {
//         console.error('⚠️ Token refresh failed:', refreshErr);
//         localStorage.removeItem('access_token');
//         localStorage.removeItem('refresh_token');
//         window.location.href = '/login';
//         return Promise.reject(refreshErr);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;


import axios from 'axios';

// Dynamically set baseURL based on environment
const baseURL =
  process.env.NODE_ENV === 'production'
    ? 'https://invento-1-f2o1.onrender.com/api/' // ✅ Production backend
    : 'http://localhost:8000/api/';               // ✅ Local dev backend

// Create an Axios instance
const api = axios.create({ baseURL });

// Request interceptor — attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token found');

        // Request a new access token
        const res = await axios.post(`${baseURL}token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = res.data.access;
        localStorage.setItem('access_token', newAccessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
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
