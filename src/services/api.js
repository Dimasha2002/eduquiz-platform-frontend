import axios from 'axios';

// Auto-detect API URL based on environment
const getApiUrl = () => {
  // If VITE_API_URL is set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // If running on production (not localhost), use production backend
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://eduquiz-platform-backend.onrender.com/api';
  }
  
  // Default to localhost for development
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();
console.log('🔗 API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  getCurrentUser: () => api.get('/auth/me'),
};

// Module API
export const moduleAPI = {
  getAll: () => api.get('/modules'),
  getMyModules: () => api.get('/modules/my-modules'),
  getById: (id) => api.get(`/modules/${id}`),
  create: (data) => api.post('/modules', data),
  update: (id, data) => api.put(`/modules/${id}`, data),
  delete: (id) => api.delete(`/modules/${id}`),
};

// Quiz API
export const quizAPI = {
  getByModule: (moduleId) => api.get(`/quizzes/module/${moduleId}`),
  getById: (id) => api.get(`/quizzes/${id}`),
  create: (data) => api.post('/quizzes', data),
  update: (id, data) => api.put(`/quizzes/${id}`, data),
  delete: (id) => api.delete(`/quizzes/${id}`),
};

// Enrollment API
export const enrollmentAPI = {
  getMyCourses: () => api.get('/enrollments/my-courses'),
  enroll: (moduleId) => api.post('/enrollments', { moduleId }),
  checkEnrollment: (moduleId) => api.get(`/enrollments/check/${moduleId}`),
  unenroll: (moduleId) => api.delete(`/enrollments/${moduleId}`),
};

// Attempt API
export const attemptAPI = {
  getByQuiz: (quizId) => api.get(`/attempts/quiz/${quizId}`),
  getByModule: (moduleId) => api.get(`/attempts/module/${moduleId}`),
  start: (quizId) => api.post('/attempts/start', { quizId }),
  submit: (attemptId, answers) => api.post(`/attempts/submit/${attemptId}`, { answers }),
  getById: (attemptId) => api.get(`/attempts/${attemptId}`),
  getTeacherResults: (moduleId) => api.get(`/attempts/teacher/module/${moduleId}`),
  getQuizAttempts: (quizId) => api.get(`/attempts/teacher/quiz/${quizId}`),
};

export default api;
