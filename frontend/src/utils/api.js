import axios from 'axios';

function getApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();
  if (!configuredUrl) return 'http://localhost:5000/api';

  const normalizedUrl = configuredUrl.replace(/\/+$/, '');
  return normalizedUrl.endsWith('/api') ? normalizedUrl : `${normalizedUrl}/api`;
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 20000,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('ds_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res.data,
  err => Promise.reject(new Error(err.response?.data?.error || 'Something went wrong'))
);

export const authAPI = {
  adminSetup: (data) => api.post('/auth/admin/setup', data),
  adminLogin:  (email, password) => api.post('/auth/admin/login', { email, password }),
  signup:      (data) => api.post('/auth/signup', data),
  login:       (email, password) => api.post('/auth/login', { email, password }),
  me:          () => api.get('/auth/me'),
};

export const promptsAPI = {
  getActive: () => api.get('/prompts/active'),
  getAll:    () => api.get('/prompts'),
  create:    (data) => api.post('/prompts', data),
  update:    (id, data) => api.put(`/prompts/${id}`, data),
  delete:    (id) => api.delete(`/prompts/${id}`),
};

export const lettersAPI = {
  submit:        (data) => api.post('/letters', data),
  getMy:         () => api.get('/letters/my'),
  getMailbox:    () => api.get('/letters/mailbox'),
  markRead:      (id) => api.patch(`/letters/${id}/read`),
  adminGetAll:   (params) => api.get('/letters/admin/all', { params }),
  adminPair:     (letterId, recipientId) => api.post('/letters/admin/pair', { letterId, recipientId }),
  adminDeliver:  (id, adminNote) => api.post(`/letters/admin/deliver/${id}`, { adminNote }),
  adminDelete:   (id) => api.delete(`/letters/admin/${id}`),
};

export const participantsAPI = {
  getMe:     () => api.get('/participants/me'),
  updateBio: (bio) => api.patch('/participants/me', { bio }),
  getAll:    () => api.get('/participants'),
  toggle:    (id) => api.patch(`/participants/${id}/toggle`),
  delete:    (id) => api.delete(`/participants/${id}`),
};

export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
};

export default api;
