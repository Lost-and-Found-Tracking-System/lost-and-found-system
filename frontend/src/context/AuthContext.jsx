import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Replace with actual profile endpoint
                    // const res = await api.get('/auth/profile');
                    // setUser(res.data);

                    // Mocking user for now
                    setUser({
                        id: '1',
                        name: 'John Doe',
                        email: 'john@amrita.edu',
                        role: 'student',
                        affiliation: 'CBE',
                    });
                } catch (err) {
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (credentials) => {
        // const res = await api.post('/auth/login', credentials);
        // localStorage.setItem('token', res.data.token);
        // setUser(res.data.user);

        // Mock login
        const mockUser = {
            id: '1',
            name: 'John Doe',
            email: credentials.email,
            role: credentials.role || 'student',
            affiliation: 'CBE',
        };
        localStorage.setItem('token', 'mock-token');
        setUser(mockUser);
        return mockUser;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
