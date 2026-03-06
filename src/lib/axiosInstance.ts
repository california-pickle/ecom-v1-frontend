// import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
//   _retry?: boolean;
// }

// const axiosInstance = axios.create({
//   baseURL: "http://localhost:4200/api",
//   withCredentials: true,
// });
// axiosInstance.interceptors.request.use(
//   (config: InternalAxiosRequestConfig) => {
//     return config;
//   },
//   (error: AxiosError) => Promise.reject(error),
// );

// axiosInstance.interceptors.response.use(
//   (response) => response,

//   async (error: AxiosError) => {
//     const originalRequest = error.config as CustomAxiosRequestConfig;

//     if (
//       error.response?.status === 401 &&
//       originalRequest &&
//       !originalRequest._retry
//     ) {
//       originalRequest._retry = true;
//       try {
//         // Refresh API te auto call dicchi. Ekhane automatically 'refreshToken' cookie ta backend e chole jabe
//         await axios.get(
//           `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`, // Tomar backend e eta GET naki POST sheta check kore nio, ami GET dhore nilam
//           { withCredentials: true },
//         );

//         // Success! Backend ekhon automatic notun 'accessToken' cookie bosiye diyeche.
//         // Tai amra fail howa API call ta abar korchi:
//         return axiosInstance(originalRequest);
//       } catch (refreshError) {
//         // Jodi Refresh token er o meyad (7 din) shesh hoye jay, tokhon user ke Login page e pathiye dibo
//         if (typeof window !== "undefined") {
//           window.location.href = "/login";
//         }
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   },
// );

// export default axiosInstance;

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// .env file theke URL nibe, na thakle localhost:4200 use hobe
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // 401 Error mane token expire hoyeche
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // AUTO REFRESH: Tomar backend endpoint jodi '/auth/refresh-token' hoy
        // Backend e jodi oita 'POST' hoy, tobe ekhane .post koro
        await axios.post(`${API_BASE_URL}/auth/refresh`, {
          withCredentials: true,
        });

        // Token refresh hole fail howa request-ta abar hobe
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh token o jodi expire hoye jay, tahole Login page e pathaw
        if (typeof window !== "undefined") {
          // Path ta /admin/login kore dilam
          window.location.href = "/admin/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
