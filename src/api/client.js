const API_BASE = 'http://localhost:3001/api';

const apiClient = {
    async get(endpoint) {
        const token = this.getToken();
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        });
        return response.json();
    },

    async post(endpoint, data) {
        const token = this.getToken();
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    async put(endpoint, data) {
        const token = this.getToken();
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    getToken() {
        const storedUser = localStorage.getItem('activeUser');
        return storedUser ? JSON.parse(storedUser).token : null;
    }
};

export default apiClient;