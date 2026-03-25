import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export const fetchSites = async () => {
    const res = await api.get('/sites');
    return res.data;
};

export const fetchAttendance = async () => {
    const res = await api.get('/attendance');
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

export default api;
