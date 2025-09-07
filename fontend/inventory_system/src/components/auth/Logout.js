import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Logout = () => {
  const navigate = useNavigate();
  const hasLoggedOut = useRef(false); // ✅ Prevent multiple toasts

  useEffect(() => {
    if (!hasLoggedOut.current) {
      // ✅ Clear tokens
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');

      // ✅ Show toast once
      toast.info('👋 You’ve been logged out');
      hasLoggedOut.current = true;

      // ✅ Redirect immediately
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return null; // ✅ No visual needed
};

export default Logout;