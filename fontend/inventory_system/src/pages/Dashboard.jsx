import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { Outlet } from 'react-router-dom';

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);

  const currentUser = {
    username: 'adminUser',
    role: 'admin',
  };

  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar is fixed via CSS and sends collapse state */}
      <Sidebar onCollapseChange={setCollapsed} />

      {/* Main content area scrolls independently and adjusts width */}
      <div
  className="main-content"
  style={{
    marginLeft: collapsed ? '85px' : '250px',
    width: collapsed ? 'calc(100vw - 85px)' : 'calc(100vw - 250px)', // ✅ fix width
    height: '100vh',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    transition: 'margin-left 0.3s ease, width 0.3s ease',
  }}
>
        <TopBar currentUser={currentUser} />

        <div style={{ flex: 1, padding: '20px' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;