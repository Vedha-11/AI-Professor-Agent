import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  login: async (username: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    const res = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return res.data;
  },
  signup: async (username: string, password: string) => {
    const res = await api.post('/auth/signup', { username, password });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

// Course APIs
export const courseAPI = {
  list: async () => {
    const res = await api.get('/courses/');
    return res.data;
  },
  create: async (name: string, description?: string) => {
    const res = await api.post('/courses/', { name, description });
    return res.data;
  },
  get: async (id: number) => {
    const res = await api.get(`/courses/${id}`);
    return res.data;
  },
};

// Material APIs
export const materialAPI = {
  upload: async (courseId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/materials/upload/${courseId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  list: async (courseId: number) => {
    const res = await api.get(`/materials/course/${courseId}`);
    return res.data;
  },
};

// Ingest API
export const ingestAPI = {
  ingest: async (materialId: number) => {
    const res = await api.post(`/ingest/${materialId}`);
    return res.data;
  },
};

// Q&A APIs
export const qaAPI = {
  ask: async (courseId: number, question: string) => {
    const res = await api.post('/qa/ask', { course_id: courseId, question });
    return res.data;
  },
  askSimple: async (courseId: number, question: string) => {
    const res = await api.post('/qa/ask-simple', { course_id: courseId, question });
    return res.data;
  },
  status: async () => {
    const res = await api.get('/qa/status');
    return res.data;
  },
};

// Student Progress APIs
export const studentAPI = {
  getProgress: async (courseId: number) => {
    const res = await api.get(`/students/progress/${courseId}`);
    return res.data;
  },
  getAllProgress: async () => {
    const res = await api.get('/students/progress');
    return res.data;
  },
  getHistory: async (courseId: number, limit = 20) => {
    const res = await api.get(`/students/history/${courseId}?limit=${limit}`);
    return res.data;
  },
  getRecommendations: async (courseId: number) => {
    const res = await api.get(`/students/recommendations/${courseId}`);
    return res.data;
  },
  getEvaluation: async (courseId: number) => {
    const res = await api.get(`/students/evaluate/${courseId}`);
    return res.data;
  },
  getDashboard: async () => {
    const res = await api.get('/students/dashboard');
    return res.data;
  },
};

// Submission APIs
export const submissionAPI = {
  create: async (courseId: number, content: string) => {
    const res = await api.post('/submissions/', { course_id: courseId, content });
    return res.data;
  },
  getMy: async () => {
    const res = await api.get('/submissions/my');
    return res.data;
  },
  getLeaderboard: async (courseId: number) => {
    const res = await api.get(`/submissions/leaderboard/${courseId}`);
    return res.data;
  },
  getAssignments: async (courseId: number, count = 5) => {
    const res = await api.get(`/submissions/assignments/${courseId}?count=${count}`);
    return res.data;
  },
  gradeAnswer: async (courseId: number, question: string, answer: string, topic = 'general') => {
    const res = await api.post('/submissions/grade', { 
      course_id: courseId, 
      question, 
      answer,
      topic 
    });
    return res.data;
  },
};

export default api;
