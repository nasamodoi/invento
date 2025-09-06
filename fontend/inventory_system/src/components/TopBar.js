import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './TopBar.css';

const TopBar = ({ currentUser, onBurgerClick }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setDropdownOpen(prev => !prev);

  // 🔒 Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="topbar">
      <div className="topbar-left">
        <button className="burger-btn" onClick={onBurgerClick}>☰</button>
        <h2 className="topbar-title">📋 My Dashboard</h2>
      </div>

      <div className="topbar-right">
        {currentUser?.role === 'admin' && (
          <Link to="/register" className="topbar-link">📝 Register</Link>
        )}

        {/* Avatar + Dropdown */}
        <div className="user-dropdown" ref={dropdownRef}>
          <div className="avatar" onClick={toggleDropdown}>
            {currentUser.username.charAt(0).toUpperCase()}
          </div>
          {dropdownOpen && (
            <div className="dropdown-menu">
              <p className="dropdown-user">👤 {currentUser.username}</p>
              <Link to="/logout" className="dropdown-link">🚪 Logout</Link>
            </div>
            
          )}
        </div>
      </div>
    </nav>
  );
};

export default TopBar;