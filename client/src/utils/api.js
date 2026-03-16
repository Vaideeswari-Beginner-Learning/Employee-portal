import axios from 'axios';

// The frontend now lives on the same server as the backend!
// We use a relative path so it automatically sends requests to itself.
const BACKEND_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: BACKEND_BASE_URL
});

// Request interceptor for API calls
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for API calls
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    // In production, we use relative paths since frontend and backend are on the same domain
    if (import.meta.env.PROD) {
        return `${path.startsWith('/') ? '' : '/'}${path}`;
    }

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

export default api;
