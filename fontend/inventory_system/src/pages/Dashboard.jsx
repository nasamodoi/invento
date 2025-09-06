import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { Outlet } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const currentUser = {
    username: 'adminUser',
    role: 'admin',
  };

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <Sidebar
        onCollapseChange={setCollapsed}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Overlay for mobile sidebar */}
      {mobileSidebarOpen && <div className="overlay" onClick={() => setMobileSidebarOpen(false)} />}

      {/* Main Content */}
      <div className={`main-content ${collapsed ? 'collapsed' : 'expanded'}`}>
        <TopBar
          currentUser={currentUser}
          onBurgerClick={() => setMobileSidebarOpen(true)}
        />
        <div className="content-area">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;