import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check for an active session on load
    useEffect(() => {
        const storedUser = localStorage.getItem('activeUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await apiClient.post('/auth/login', { email, password });
            const userData = response.data;
            setUser(userData);
            localStorage.setItem('activeUser', JSON.stringify(userData));
            return { success: true };
        } catch (error) {
            console.error("Login error:", error);
            return {
                success: false,
                message: error.response?.data?.message || "Login failed"
            };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('activeUser');
        // You might want to call a logout endpoint here if your backend supports token invalidation
    };

    const register = async (userData) => {
        try {
            const response = await apiClient.post('/auth/register', userData);
            // Optionally log the user in directly after register, or require them to login
            // For now, let's just return success so they can be redirected to login
            return { success: true };
        } catch (error) {
            console.error("Registration error:", error);
            return {
                success: false,
                message: error.response?.data?.message || "Registration failed"
            };
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, register }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
