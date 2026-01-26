import api from './api';

export const authService = {
  // Login with credentials
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response;
  },

  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response;
  },

  // Register temporary visitor
  registerVisitor: async (visitorData) => {
    const response = await api.post('/auth/register-visitor', visitorData);
    return response;
  },

  // Send OTP for verification
  sendOTP: async (contact) => {
    const response = await api.post('/auth/send-otp', { contact });
    return response;
  },

  // Verify OTP
  verifyOTP: async (contact, otp) => {
    const response = await api.post('/auth/verify-otp', { contact, otp });
    return response;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response;
  },

  // Update user profile
  updateProfile: async (updates) => {
    const response = await api.put('/auth/profile', updates);
    return response;
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    const response = await api.post('/auth/reset-password-request', { email });
    return response;
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response;
  },

  // Change password (when logged in)
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response;
  },
};