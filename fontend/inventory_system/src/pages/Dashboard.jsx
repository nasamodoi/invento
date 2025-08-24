// import React from 'react';
// import Sidebar from '../components/Sidebar';
// import { Outlet } from 'react-router-dom';

// const Dashboard = () => (
//   <div style={{ display: 'flex' }}>
//     <Sidebar />
//     <div style={{ flex: 1, padding: '20px' }}>
//       <Outlet /> {/* This will render child routes */}
//     </div>
//   </div>
// );

// export default Dashboard;


import React from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { Outlet } from 'react-router-dom';

const Dashboard = () => {
  // Hapa unaweza kuchukua user kutoka context au auth provider
  const currentUser = {
    username: 'adminUser',
    role: 'admin', // Badilisha kuwa 'user' ili link ya Register ifichwe
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* TopBar ya juu */}
        <TopBar currentUser={currentUser} />

        {/* Sehemu ya content ya ndani */}
        <div style={{ flex: 1, padding: '20px' }}>
          <Outlet /> {/* Hapa child routes zitarender */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;