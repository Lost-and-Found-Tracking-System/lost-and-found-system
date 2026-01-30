import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');
            
            if (token && savedUser) {
                try {
                    // Verify token by fetching profile
                    const res = await api.get('/v1/users/profile');
                    setUser(res.data);
                    localStorage.setItem('user', JSON.stringify(res.data));
                } catch (err) {
                    // Token invalid, clear storage
                    console.error('Auth check failed:', err);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    // Login function
    const login = async (credentials) => {
        try {
            const res = await api.post('/v1/auth/login', {
                email: credentials.email,
                password: credentials.password,
            });
            
            const { accessToken, userId, role } = res.data;
            
            // Store token
            localStorage.setItem('token', accessToken);
            
            // Fetch full user profile
            const profileRes = await api.get('/v1/users/profile');
            const userData = {
                id: userId,
                role: role,
                ...profileRes.data.profile,
                status: profileRes.data.status,
            };
            
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            
            return userData;
        } catch (error) {
            console.error('Login error:', error);
            throw error.response?.data || { error: 'Login failed' };
        }
    };

    // Register function
    const register = async (userData) => {
        try {
            const res = await api.post('/v1/auth/register', userData);
            
            const { accessToken, userId } = res.data;
            
            localStorage.setItem('token', accessToken);
            
            // Fetch profile
            const profileRes = await api.get('/v1/users/profile');
            const user = {
                id: userId,
                ...profileRes.data.profile,
                role: profileRes.data.role,
            };
            
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            
            return user;
        } catch (error) {
            console.error('Register error:', error);
            throw error.response?.data || { error: 'Registration failed' };
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await api.post('/v1/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
        }
    };

    // Update user profile
    const updateProfile = async (profileData) => {
        try {
            const res = await api.put('/v1/users/profile', profileData);
            const updatedUser = { ...user, ...res.data.profile };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            return updatedUser;
        } catch (error) {
            console.error('Update profile error:', error);
            throw error.response?.data || { error: 'Update failed' };
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            login, 
            logout, 
            register,
            updateProfile,
            isAuthenticated: !!user,
            isAdmin: user?.role === 'admin' || user?.role === 'delegated_admin',
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
