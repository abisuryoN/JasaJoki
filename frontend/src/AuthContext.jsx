import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        
        try {
            const res = await api.get('/auth/me');
            setUser(res.data);
        } catch (error) {
            console.error("Failed to fetch user", error);
            handleLogout();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, [token]);

    const handleLogin = (newToken, userData) => {
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('token', newToken);
    };

    const handleLogout = async () => {
        try {
            if (token) {
                await api.post('/auth/logout');
            }
        } catch (error) {
            console.error("Logout error", error);
        } finally {
            setToken(null);
            setUser(null);
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login: handleLogin, logout: handleLogout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
