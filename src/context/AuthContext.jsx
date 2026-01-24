import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

const API_BASE = 'http://localhost:3001/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('activeUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const userData = await response.json();
            
            if (response.ok) {
                setUser(userData);
                localStorage.setItem('activeUser', JSON.stringify(userData));
                return { success: true };
            } else {
                return { success: false, message: userData.message };
            }
        } catch (error) {
            return { success: false, message: "Login failed" };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('activeUser');
    };

    const register = async (userData) => {
        try {
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            const result = await response.json();
            return response.ok ? { success: true } : { success: false, message: result.message };
        } catch (error) {
            return { success: false, message: "Registration failed" };
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, register }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);