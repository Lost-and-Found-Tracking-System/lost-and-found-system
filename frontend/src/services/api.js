import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
    timeout: 15000,
});

// Request interceptor - add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Handle 401 errors - but not on login/register pages to avoid redirect loops
        if (error.response?.status === 401 && !originalRequest._retry) {
            const isAuthPage = window.location.pathname === '/login' || 
                               window.location.pathname === '/register' ||
                               window.location.pathname === '/register-visitor' ||
                               window.location.pathname === '/' ||
                               window.location.pathname === '/home';
            
            if (!isAuthPage) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        
        // Handle network errors
        if (!error.response) {
            error.message = 'Network error. Please check your connection.';
        }
        
        return Promise.reject(error);
    }
);

export default api;