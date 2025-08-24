// src/utils/AuthManager.js
const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes

let timeout;

export const startInactivityTimer = () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  }, INACTIVITY_LIMIT);
};

export const resetInactivityTimer = () => {
  startInactivityTimer();
};

export const initInactivityTracking = () => {
  ['click', 'mousemove', 'keydown', 'scroll'].forEach(event =>
    window.addEventListener(event, resetInactivityTimer)
  );
  startInactivityTimer();
};