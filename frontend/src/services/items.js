import api from './api';

export const itemsService = {
  // Search and filter items
  searchItems: async (params) => {
    const response = await api.get('/items/search', { params });
    return response;
  },

  // Get item by ID
  getItemById: async (itemId) => {
    const response = await api.get(`/items/${itemId}`);
    return response;
  },

  // Submit lost item
  submitLostItem: async (itemData) => {
    const response = await api.post('/items/lost', itemData);
    return response;
  },

  // Submit found item
  submitFoundItem: async (itemData) => {
    const response = await api.post('/items/found', itemData);
    return response;
  },

  // Upload item image
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/items/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  // Get AI-powered similar items
  getSimilarItems: async (itemId) => {
    const response = await api.get(`/items/${itemId}/similar`);
    return response;
  },

  // Get user's submitted items
  getUserItems: async (status = null) => {
    const params = status ? { status } : {};
    const response = await api.get('/items/my-items', { params });
    return response;
  },

  // Update item status
  updateItemStatus: async (itemId, status) => {
    const response = await api.patch(`/items/${itemId}/status`, { status });
    return response;
  },

  // Delete item
  deleteItem: async (itemId) => {
    const response = await api.delete(`/items/${itemId}`);
    return response;
  },

  // Get item categories
  getCategories: async () => {
    const response = await api.get('/items/categories');
    return response;
  },

  // Get item locations
  getLocations: async () => {
    const response = await api.get('/items/locations');
    return response;
  },
};