import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../api';
import './Overview.css';

const Overview = () => {
  const [stats, setStats] = useState({});
  const [recent, setRecent] = useState([]);
  const [theme, setTheme] = useState('dark'); // 'dark' or 'light'

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await api.get('/api/overview/');
        setStats(res.data.stats);
        setRecent(res.data.recent);
      } catch (err) {
        console.error('Failed to fetch overview:', err);
      }
    };
    fetchOverview();
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // ✅ Format TZS values
  const formatTZS = (amount) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className={`overview-container theme-${theme}`}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className={theme === 'dark' ? 'text-white' : ''}>📊 System Overview</h2>
        <button className="btn btn-outline-light" onClick={toggleTheme}>
          Toggle to {theme === 'dark' ? 'Light' : 'Dark'} Mode
        </button>
      </div>

      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card card-products">
            <div className="card-body">
              <h5>Total Products</h5>
              <p>{stats.total_products}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card card-users">
            <div className="card-body">
              <h5>Total Users</h5>
              <p>{stats.total_users}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card card-sales">
            <div className="card-body">
              <h5>Total Sales</h5>
              <p>{formatTZS(stats.total_sales)}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card card-purchases">
            <div className="card-body">
              <h5>Total Purchases</h5>
              <p>{formatTZS(stats.total_purchases)}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card card-expenses">
            <div className="card-body">
              <h5>Total Expenses</h5>
              <p>{formatTZS(stats.total_expenses)}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card card-profit">
            <div className="card-body">
              <h5>Net Profit</h5>
              <p>{formatTZS(stats.net_profit)}</p>
            </div>
          </div>
        </div>
      </div>

      <h4 className={theme === 'dark' ? 'text-white' : ''}>🕒 Recent Activity</h4>
      <ul className="list-group mb-4">
        {recent.map((item, idx) => (
          <li key={idx} className="list-group-item">{item}</li>
        ))}
      </ul>

      <div className="btn-group">
        <NavLink to="/products" className="btn btn-outline-light">Manage Products</NavLink>
        <NavLink to="/users" className="btn btn-outline-light">Manage Users</NavLink>
        <NavLink to="/sales" className="btn btn-outline-light">View Sales</NavLink>
        <NavLink to="/purchases" className="btn btn-outline-light">View Purchases</NavLink>
        <NavLink to="/expenses" className="btn btn-outline-light">View Expenses</NavLink>
      </div>
    </div>
  );
};

export default Overview;