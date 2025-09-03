import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api';
import './Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: 'odoi',
    password: 'odoi@1234567890',
  });
  const [loading, setLoading] = useState(false);
  const [errorShake, setErrorShake] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('access_token'));

  const navigate = useNavigate();

  useEffect(() => {
    const savedUsername = localStorage.getItem('saved_username');
    if (savedUsername) {
      setCredentials((prev) => ({ ...prev, username: savedUsername }));
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorShake(false);

    try {
      const response = await api.post('/api/token/', {
        username: credentials.username,
        password: credentials.password,
      });
      const { access, refresh } = response.data;

      if (rememberMe) {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        localStorage.setItem('saved_username', credentials.username);
      } else {
        sessionStorage.setItem('access_token', access);
        sessionStorage.setItem('refresh_token', refresh);
        localStorage.removeItem('saved_username');
      }

      toast.success('✅ Login successful');
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      toast.error('❌ Invalid credentials');
      setErrorShake(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animated-bg position-relative">
      <motion.div
        className="container mt-5"
        style={{ maxWidth: '400px', zIndex: 1 }}
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h3 className="mb-4 text-white">🔐 Login</h3>
        <motion.form
          onSubmit={handleSubmit}
          animate={errorShake ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <motion.div className="mb-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <label className="form-label text-white">Username</label>
            <input
              type="text"
              name="username"
              className="form-control"
              value={credentials.username}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </motion.div>

          <motion.div className="mb-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <label className="form-label text-white">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={credentials.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </motion.div>

          <motion.button
            type="submit"
            className="btn btn-light w-100"
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <span>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Logging in...
              </span>
            ) : (
              'Login'
            )}
          </motion.button>

          <div className="form-check mt-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              disabled={loading}
            />
            <label className="form-check-label text-white" htmlFor="rememberMe">
              Remember Me
            </label>
          </div>
        </motion.form>
      </motion.div>

      <AnimatePresence>
        {loading && (
          <motion.div
            className="loading-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div>
              <div className="spinner-border text-light mb-3" role="status"></div>
              <div>Authenticating...</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;