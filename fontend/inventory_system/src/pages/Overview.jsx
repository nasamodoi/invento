import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../api';
import './Overview.css';

const Overview = () => {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [theme, setTheme] = useState('dark');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await api.get('overview/');
        setStats(res.data.stats);
        setRecent(Array.isArray(res.data.recent) ? res.data.recent : []);
      } catch (err) {
        console.error('Failed to fetch overview:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const formatTZS = (amount) => {
    if (typeof amount !== 'number') return '—';
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const cardClasses = {
    'Total Products': 'card-products',
    'Total Users': 'card-users',
    'Total Sales': 'card-sales',
    'Total Purchases': 'card-purchases',
    'Total Expenses': 'card-expenses',
    'Net Profit': 'card-profit',
    'Total Product Value': 'card-inventory',
    'Low Stock Products': 'card-warning'
  };

  if (loading || !stats) {
    return <div className="text-white">Loading overview...</div>;
  }

  const profitColor = stats.net_profit > 0 ? 'text-success' : 'text-danger';
  const lowStockColor = stats.low_stock_products > 0 ? 'text-warning fw-bold' : 'text-muted';

  return (
    <div className={`overview-container theme-${theme}`}>
      {/* Header and Theme Toggle */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className={theme === 'dark' ? 'text-white' : ''}>📊 System Overview</h2>
        <button className="btn btn-outline-light" onClick={toggleTheme}>
          Toggle to {theme === 'dark' ? 'Light' : 'Dark'} Mode
        </button>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        {[
          { label: 'Total Products', value: stats.total_products },
          { label: 'Total Users', value: stats.total_users },
          { label: 'Total Sales', value: formatTZS(stats.total_sales) },
          { label: 'Total Purchases', value: formatTZS(stats.total_purchases) },
          { label: 'Total Expenses', value: formatTZS(stats.total_expenses) },
          { label: 'Net Profit', value: formatTZS(stats.net_profit), className: profitColor },
          { label: 'Total Product Value', value: formatTZS(stats.total_product_price) },
          { label: 'Low Stock Products', value: stats.low_stock_products, className: lowStockColor }
        ].map((item, idx) => (
          <div key={idx} className="col-md-4 mb-3">
            <div className={`card ${cardClasses[item.label] || ''}`}>
              <div className="card-body">
                <h5>{item.label}</h5>
                <p className={item.className || ''}>{item.value ?? '—'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <h4 className={theme === 'dark' ? 'text-white' : ''}>🕒 Recent Activity</h4>
      <ul className="list-group mb-4">
        {recent.length > 0 ? (
          recent.map((item, idx) => (
            <li key={idx} className="list-group-item">
              <span className="me-2">•</span>{item}
            </li>
          ))
        ) : (
          <li className="list-group-item">No recent activity</li>
        )}
      </ul>

      {/* Navigation Buttons */}
      <div className="btn-group">
        <NavLink to="/products" className="btn btn-outline-light">Manage Products</NavLink>
        <NavLink to="/users" className="btn btn-outline-light">Manage Users</NavLink>
        <NavLink to="/sales" className="btn btn-outline-light">View Sales</NavLink>
        <NavLink to="/purchases" className="btn btn-outline-light">View Purchases</NavLink>
        <NavLink to="/expenses" className="btn btn-outline-light">View Expenses</NavLink>
        <NavLink to="/products?filter=low-stock" className="btn btn-outline-warning">🔍 Review Low Stock</NavLink>
      </div>
    </div>
  );
};

export default Overview;