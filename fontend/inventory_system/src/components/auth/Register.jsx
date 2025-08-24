import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import api from '../../api';
import './Login.css'; 

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password2) {
      toast.error('❌ Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/register/', formData);
      toast.success('🎉 Registered successfully. You can now log in.');
      navigate('/login');
    } catch (err) {
      if (err.response?.data) {
        console.error('Registration failed:', JSON.stringify(err.response.data, null, 2));
        toast.error(
          Object.values(err.response.data)
            .flat()
            .join(' ') || '❌ Registration failed'
        );
      } else {
        console.error('Registration failed:', err.message);
        toast.error('❌ Registration failed');
      }
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
        <h3 className="mb-4 text-white">📝 Register</h3>
        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="form-label text-white">Username</label>
            <input
              type="text"
              name="username"
              className="form-control"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <label className="form-label text-white">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <label className="form-label text-white">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <label className="form-label text-white">Confirm Password</label>
            <input
              type="password"
              name="password2"
              className="form-control"
              value={formData.password2}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn btn-light w-100" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <div className="text-center mt-3">
          <a href="/login" className="text-decoration-none text-white">
            🔐 Already have an account? Login
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;