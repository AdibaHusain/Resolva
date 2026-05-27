import api from './axiosInstance';

export const complaintApi = {
  // Student
  create:      (formData) => api.post('/complaints', formData),   // FormData for file upload
  getAll:      (params)   => api.get('/complaints', { params }),
  getMine:     (params)   => api.get('/complaints/mine', { params }),
  getById:     (id)       => api.get(`/complaints/${id}`),
  getTimeline: (id)       => api.get(`/complaints/${id}/timeline`),
  vote:        (id)       => api.post(`/complaints/${id}/vote`),

  // Admin
  assign:       (id, data) => api.patch(`/complaints/${id}/assign`, data),
  changeStatus: (id, data) => api.patch(`/complaints/${id}/status`, data),

  // Staff
  uploadProof:  (id, formData) => api.post(`/complaints/${id}/proof`, formData),
};