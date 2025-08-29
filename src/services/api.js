import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:7196/api',
});

// 🔐 Ajouter le token automatiquement à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
