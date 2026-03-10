import axios from 'axios';
export const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api', headers: { 'Content-Type': 'application/json' } });
api.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('auth-storage');
    if (stored) { const { state } = JSON.parse(stored); if (state?.token) config.headers.Authorization = `Bearer ${state.token}`; }
  }
  return config;
});
api.interceptors.response.use(res => res, async error => {
  const original = error.config;
  if (error.response?.status === 401 && !original._retry) {
    original._retry = true;
    try {
      const stored = localStorage.getItem('auth-storage');
      if (stored) {
        const { state } = JSON.parse(stored);
        if (state?.refreshToken) {
          const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken: state.refreshToken });
          const { accessToken } = res.data.data;
          const newStored = JSON.parse(stored); newStored.state.token = accessToken;
          localStorage.setItem('auth-storage', JSON.stringify(newStored));
          original.headers.Authorization = `Bearer ${accessToken}`;
          return api(original);
        }
      }
    } catch { localStorage.removeItem('auth-storage'); window.location.href = '/login'; }
  }
  return Promise.reject(error);
});
