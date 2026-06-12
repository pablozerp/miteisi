import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Obtener token de autenticación guardado en localStorage
const getAuthHeader = () => {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ===================== AUTH =====================

export const loginUser = async (email, password) => {
  const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
  return res.data; // { token, name, userId }
};

export const registerUser = async (data) => {
  const res = await axios.post(`${API_BASE}/auth/register`, data);
  return res.data; // { message, userId }
};

// ===================== ROADMAP =====================

export const generateRoadmap = async (language) => {
  const res = await axios.post(
    `${API_BASE}/roadmap/generate`,
    { language },
    { headers: getAuthHeader() }
  );
  return res.data; // { roadmapId, language, nodes }
};

export const getMyRoadmaps = async () => {
  const res = await axios.get(`${API_BASE}/roadmap/my-roadmaps`, {
    headers: getAuthHeader(),
  });
  return res.data; // { roadmaps: [...] }
};

export const compareRoadmap = async (langA, langB) => {
  const res = await axios.post(
    `${API_BASE}/roadmap/compare`,
    { langA, langB },
    { headers: getAuthHeader() }
  );
  return res.data; // { langA, langB, comparison, nodesA, nodesB }
};

// ===================== ADMIN =====================

export const getAdminStats = async () => {
  const res = await axios.get(`${API_BASE}/admin/stats`, {
    headers: getAuthHeader(),
  });
  return res.data;
};

export const getAdminUsers = async () => {
  const res = await axios.get(`${API_BASE}/admin/users`, {
    headers: getAuthHeader(),
  });
  return res.data;
};

export const toggleUserStatus = async (userId) => {
  const res = await axios.post(`${API_BASE}/admin/users/${userId}/toggle-status`, {}, {
    headers: getAuthHeader(),
  });
  return res.data;
};

export const assignUserRole = async (userId, role) => {
  const res = await axios.post(`${API_BASE}/admin/users/${userId}/assign-role`, { role }, {
    headers: getAuthHeader(),
  });
  return res.data;
};

export const getWeeklyStats = async () => {
  const res = await axios.get(`${API_BASE}/admin/weekly-stats`, {
    headers: getAuthHeader(),
  });
  return res.data;
};

export const createAdminUser = async (userData) => {
  const res = await axios.post(`${API_BASE}/admin/users`, userData, {
    headers: getAuthHeader(),
  });
  return res.data;
};

export const updateAdminUser = async (userId, userData) => {
  const res = await axios.put(`${API_BASE}/admin/users/${userId}`, userData, {
    headers: getAuthHeader(),
  });
  return res.data;
};

export const deleteAdminUser = async (userId) => {
  const res = await axios.delete(`${API_BASE}/admin/users/${userId}`, {
    headers: getAuthHeader(),
  });
  return res.data;
};
