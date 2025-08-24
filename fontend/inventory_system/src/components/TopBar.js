import React from 'react';
import { Link } from 'react-router-dom';
import './TopBar.css';

const TopBar = ({ currentUser }) => {
  return (
    <nav className="topbar">
      <div className="topbar-left">
        <h2>📋 My Dashboard</h2>
      </div>
      <div className="topbar-right">
        {currentUser?.role === 'admin' && (
          <Link to="/register" className="topbar-link">
            📝 Register
          </Link>
        )}
      </div>
    </nav>
  );
};

export default TopBar;