import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on mount
    useEffect(() => {
        const verifyAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await api.get('/v1/users/profile');
                const userData = response.data;
                
                // Map backend response to user object
                const mappedUser = {
                    id: userData._id,
                    email: userData.profile?.email,
                    fullName: userData.profile?.fullName,
                    phone: userData.profile?.phone,
                    affiliation: userData.profile?.affiliation,
                    role: userData.role,
                    status: userData.status,
                    institutionalId: userData.institutionalId,
                    visitorId: userData.visitorId,
                    createdAt: userData.createdAt,
                };
                
                setUser(mappedUser);
                localStorage.setItem('user', JSON.stringify(mappedUser));
            } catch (error) {
                console.error('Auth verification failed:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        verifyAuth();
    }, []);

    // Login function
    const login = async (credentials) => {
        try {
            const response = await api.post('/v1/auth/login', credentials);
            const { accessToken, userId, role } = response.data;

            // Store token
            localStorage.setItem('token', accessToken);

            // Fetch full user profile
            const profileResponse = await api.get('/v1/users/profile');
            const userData = profileResponse.data;

            // Map backend response to user object
            const mappedUser = {
                id: userData._id || userId,
                email: userData.profile?.email,
                fullName: userData.profile?.fullName,
                phone: userData.profile?.phone,
                affiliation: userData.profile?.affiliation,
                role: userData.role || role,
                status: userData.status,
                institutionalId: userData.institutionalId,
                visitorId: userData.visitorId,
                createdAt: userData.createdAt,
            };

            setUser(mappedUser);
            localStorage.setItem('user', JSON.stringify(mappedUser));

            return mappedUser;
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Login failed';
            throw { error: errorMessage };
        }
    };

    // Register function
    const register = async (userData) => {
        try {
            const response = await api.post('/v1/auth/register', {
                fullName: userData.fullName,
                email: userData.email,
                password: userData.password,
                phone: userData.phone,
                affiliation: userData.affiliation,
                institutionalId: userData.institutionalId,
            });

            const { accessToken, userId } = response.data;

            // Store token
            localStorage.setItem('token', accessToken);

            // Fetch full user profile
            const profileResponse = await api.get('/v1/users/profile');
            const profileData = profileResponse.data;

            // Map backend response to user object
            const mappedUser = {
                id: profileData._id || userId,
                email: profileData.profile?.email,
                fullName: profileData.profile?.fullName,
                phone: profileData.profile?.phone,
                affiliation: profileData.profile?.affiliation,
                role: profileData.role,
                status: profileData.status,
                institutionalId: profileData.institutionalId,
                createdAt: profileData.createdAt,
            };

            setUser(mappedUser);
            localStorage.setItem('user', JSON.stringify(mappedUser));

            return mappedUser;
        } catch (error) {
            console.error('Registration error:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Registration failed';
            throw { error: errorMessage };
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

    // Update profile function
    const updateProfile = async (profileData) => {
        try {
            const response = await api.put('/v1/users/profile', profileData);
            const userData = response.data;

            // Map backend response to user object
            const mappedUser = {
                id: userData._id,
                email: userData.profile?.email,
                fullName: userData.profile?.fullName,
                phone: userData.profile?.phone,
                affiliation: userData.profile?.affiliation,
                role: userData.role,
                status: userData.status,
                institutionalId: userData.institutionalId,
                visitorId: userData.visitorId,
                createdAt: userData.createdAt,
            };

            setUser(mappedUser);
            localStorage.setItem('user', JSON.stringify(mappedUser));

            return mappedUser;
        } catch (error) {
            console.error('Update profile error:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Update failed';
            throw { error: errorMessage };
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};