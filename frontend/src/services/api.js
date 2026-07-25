import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// ── Base Axios instance ────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,   // Send httpOnly refresh token cookie
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// ── Request interceptor: attach access token ──────────────────
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err)
);

// ── Response interceptor: auto-refresh on 401 ────────────────
let isRefreshing = false;
let waitQueue    = [];

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (err.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          waitQueue.push({ resolve, reject });
        }).then(token => {
          original.headers['Authorization'] = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        const newToken = data.data.accessToken;
        useAuthStore.getState().setToken(newToken);
        waitQueue.forEach(({ resolve }) => resolve(newToken));
        waitQueue = [];
        original.headers['Authorization'] = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshErr) {
        waitQueue.forEach(({ reject }) => reject(refreshErr));
        waitQueue = [];
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default api;

// ─────────────────────────────────────────────────────────────
// A5 FIX: All API call functions centralized here
// Pages import these directly instead of writing fetch/axios calls inline
// ─────────────────────────────────────────────────────────────

// ── Student API ───────────────────────────────────────────────
export const getDashboardData = async () => {
  const { data } = await api.get('/student/dashboard');
  return data;
};

export const getMaterials = async () => {
  const { data } = await api.get('/student/classroom');
  return data.materials || [];
};

export const getReportData = async () => {
  const { data } = await api.get('/student/report');
  return data;
};

export const getAssessmentQuestions = async () => {
  const { data } = await api.get('/student/assessment');
  return data;
};

export const completeActivity = async (type, difficulty, accuracy) => {
  const { data } = await api.post('/student/complete-activity', { type, difficulty, accuracy });
  return data;
};

// ── Staff API ─────────────────────────────────────────────────
export const getStaffDashboardData = async () => {
  const { data } = await api.get('/staff/dashboard');
  return data;
};

// ── Classes API ───────────────────────────────────────────────
export const getTeacherClasses = async () => {
  const { data } = await api.get('/classes/teacher');
  return data.classes || [];
};

export const getStudentClasses = async () => {
  const { data } = await api.get('/classes/student');
  return data.classes || [];
};

export const createClass = async (classData) => {
  const { data } = await api.post('/classes/create', classData);
  return data;
};

export const joinClass = async (code) => {
  const { data } = await api.post('/classes/join', { code });
  return data;
};

export const inviteStudent = async (email, classId) => {
  const { data } = await api.post('/classes/invite', { email, classId });
  return data;
};

export const getStudentInvites = async () => {
  const { data } = await api.get('/classes/invites');
  return data.invites || [];
};

export const respondToInvite = async (inviteId, status) => {
  const { data } = await api.post('/classes/invite/respond', { inviteId, status });
  return data;
};

export const assignLevelToClass = async (classId, levelId) => {
  const { data } = await api.post('/classes/assign-level', { classId, levelId });
  return data;
};

// ── Levels API ────────────────────────────────────────────────
export const getLevels = async () => {
  const { data } = await api.get('/levels');
  return data;
};

export const getLevelById = async (id) => {
  const { data } = await api.get(`/levels/${id}`);
  return data;
};

export const createLevel = async (levelData) => {
  const { data } = await api.post('/levels', levelData);
  return data;
};

export const deleteLevel = async (id) => {
  const { data } = await api.delete(`/levels/${id}`);
  return data;
};

// ── Prelims API ───────────────────────────────────────────────
export const getPrelimsQuestions = async () => {
  const { data } = await api.get('/prelims/questions');
  return data;
};

export const submitPrelimsTest = async (answers) => {
  // P2 FIX: userId comes from JWT on backend — no need to pass it from frontend
  const { data } = await api.post('/prelims/submit', { answers });
  return data;
};

export const addPrelimsQuestion = async (questionData) => {
  const { data } = await api.post('/prelims/questions', questionData);
  return data;
};

export const deletePrelimsQuestion = async (id) => {
  const { data } = await api.delete(`/prelims/questions/${id}`);
  return data;
};

// ── Notifications API ─────────────────────────────────────────
export const getNotifications = async () => {
  const { data } = await api.get('/notifications');
  return data;
};

export const markNotificationRead = async (notificationId) => {
  const { data } = await api.post('/notifications/mark-read', { notificationId });
  return data;
};

export const markAllNotificationsRead = async () => {
  const { data } = await api.post('/notifications/mark-all-read');
  return data;
};

// ── STT API ───────────────────────────────────────────────────
export const transcribeAudio = async (audioBlob) => {
  const form = new FormData();
  form.append('audio', audioBlob, 'recording.webm');
  const { data } = await api.post('/stt/process', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

// ── Dyslexia AI API ───────────────────────────────────────────
export const summarizeText = async (text) => {
  const { data } = await api.post('/dyslexia/summarize', { text });
  return data;
};

export const simplifyText = async (text) => {
  const { data } = await api.post('/dyslexia/simplify', { text });
  return data;
};

export const extractKeywords = async (text) => {
  const { data } = await api.post('/dyslexia/keywords', { text });
  return data;
};

// ── Dyscalculia API ───────────────────────────────────────────
export const solveMath = async (question) => {
  const { data } = await api.post('/dyscalculia/solve', { question });
  return data;
};

// ── Materials API ─────────────────────────────────────────────
export const uploadMaterial = async (formData) => {
  const { data } = await api.post('/materials/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

export const getAllMaterials = async () => {
  const { data } = await api.get('/materials');
  return data;
};

// ── Assignments API ───────────────────────────────────────────
export const getAssignmentsByClass = async (classId) => {
  const { data } = await api.get(`/assignments/class/${classId}`);
  return data;
};

export const createAssignment = async (assignmentData) => {
  const { data } = await api.post('/assignments/create', assignmentData);
  return data;
};

export const submitAssignment = async (submissionData) => {
  if (submissionData instanceof FormData) {
    const { data } = await api.post('/assignments/submit', submissionData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  }
  const { data } = await api.post('/assignments/submit', submissionData);
  return data;
};

// ── Stream Announcements API ──────────────────────────────────
export const getAnnouncementsByClass = async (classId) => {
  const { data } = await api.get(`/announcements/class/${classId}`);
  return data;
};

export const createAnnouncement = async (announcementData) => {
  const { data } = await api.post('/announcements/create', announcementData);
  return data;
};
