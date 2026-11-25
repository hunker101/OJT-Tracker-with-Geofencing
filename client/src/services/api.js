import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export const fetchSites = async () => {
    const res = await api.get('/sites');
    return res.data;
};

export const fetchSite = async (id) => {
    const res = await api.get(`/sites/${id}`);
    return res.data;
};

export const addSite = async (data) => {
    const res = await api.post('/sites', data);
    return res.data;
};

export const updateSite = async (id, data) => {
    const res = await api.put(`/sites/${id}`, data);
    return res.data;
};

export const deleteSite = async (id) => {
    const res = await api.delete(`/sites/${id}`);
    return res.data;
};

export const fetchAttendance = async () => {
    const res = await api.get('/attendance');
    return res.data;
};

export const fetchActiveAttendance = async () => {
    const res = await api.get('/attendance/active');
    return res.data;
};

export const deleteAttendance = async (id) => {
    const res = await api.delete(`/attendance/${id}`);
    return res.data;
};

export const clockIn = async (data) => {
    const res = await api.post('/attendance/clock-in', data);
    return res.data;
};

export const clockOut = async (sessionId) => {
    const res = await api.post('/attendance/clock-out', { sessionId });
    return res.data;
};

export const updateAttendance = async (id, data) => {
    const res = await api.patch(`/attendance/${id}`, data);
    return res.data;
};

export const logManualSession = async (data) => {
    const res = await api.post('/attendance/manual', data);
    return res.data;
};

export const fetchDTR = async () => {
    const res = await api.get('/reports/dtr');
    return res.data;
};

export const fetchHolidays = async () => {
    const res = await api.get('/holidays');
    return res.data;
};

export const addHoliday = async (data) => {
    const res = await api.post('/holidays', data);
    return res.data;
};

export const deleteHoliday = async (id) => {
    const res = await api.delete(`/holidays/${id}`);
    return res.data;
};

export default api;
