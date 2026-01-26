import api from './api';

export const notificationService = {
  // Get all notifications
  getNotifications: async (limit = 50) => {
    const response = await api.get('/notifications', { params: { limit } });
    return response;
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response;
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response;
  },

  // Mark all as read
  markAllAsRead: async () => {
    const response = await api.patch('/notifications/mark-all-read');
    return response;
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response;
  },

  // Update notification preferences
  updatePreferences: async (preferences) => {
    const response = await api.put('/notifications/preferences', preferences);
    return response;
  },

  // Get notification preferences
  getPreferences: async () => {
    const response = await api.get('/notifications/preferences');
    return response;
  },
};