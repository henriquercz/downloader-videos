import axios from 'axios';

const api = axios.create({
    // Em dev, o Vite pode fazer proxy se configurado, ou apontamos direto
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
    timeout: 30000, // 30s timeout para requests pesados
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para logs em dev
api.interceptors.request.use((config) => {
    //   console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Tratamento global de erros pode ser expandido aqui
        console.error('[API Error]', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;
