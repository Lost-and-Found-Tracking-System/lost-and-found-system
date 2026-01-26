import api from './api';

export const claimsService = {
  // Submit ownership claim
  submitClaim: async (claimData) => {
    const response = await api.post('/claims', claimData);
    return response;
  },

  // Get claim by ID
  getClaimById: async (claimId) => {
    const response = await api.get(`/claims/${claimId}`);
    return response;
  },

  // Get user's claims
  getUserClaims: async (status = null) => {
    const params = status ? { status } : {};
    const response = await api.get('/claims/my-claims', { params });
    return response;
  },

  // Get all claims (admin)
  getAllClaims: async (filters = {}) => {
    const response = await api.get('/claims', { params: filters });
    return response;
  },

  // Upload proof document
  uploadProof: async (claimId, file) => {
    const formData = new FormData();
    formData.append('proof', file);
    const response = await api.post(`/claims/${claimId}/proof`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  // Get AI matches for claim
  getAIMatches: async (claimId) => {
    const response = await api.get(`/claims/${claimId}/matches`);
    return response;
  },

  // Approve claim (admin)
  approveClaim: async (claimId, notes = '') => {
    const response = await api.post(`/claims/${claimId}/approve`, { notes });
    return response;
  },

  // Reject claim (admin)
  rejectClaim: async (claimId, reason) => {
    const response = await api.post(`/claims/${claimId}/reject`, { reason });
    return response;
  },

  // Override AI decision (admin)
  overrideAIDecision: async (claimId, decision, justification) => {
    const response = await api.post(`/claims/${claimId}/override`, {
      decision,
      justification,
    });
    return response;
  },

  // Compare multiple claims
  compareClaims: async (claimIds) => {
    const response = await api.post('/claims/compare', { claimIds });
    return response;
  },

  // Generate official letter
  generateLetter: async (claimId) => {
    const response = await api.get(`/claims/${claimId}/letter`, {
      responseType: 'blob',
    });
    return response;
  },

  // Report suspicious claim
  reportSuspicious: async (claimId, reason) => {
    const response = await api.post(`/claims/${claimId}/report`, { reason });
    return response;
  },
};