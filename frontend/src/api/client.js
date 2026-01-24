import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api', // Adjust if backend port changes
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the token in headers
apiClient.interceptors.request.use(
    (config) => {
        const storedUser = localStorage.getItem('activeUser');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user.token) {
                config.headers.Authorization = `Bearer ${user.token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;
