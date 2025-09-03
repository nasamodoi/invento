// import { useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// import { initInactivityTracking } from './utils/AuthManager';

// import Dashboard from './pages/Dashboard';
// import Login from './components/auth/Login';
// import Logout from './components/auth/Logout';
// import PrivateRoute from './components/PrivateRoute';
// import Register from './components/auth/Register';

// import Overview from './pages/Overview'; // ✅ Import Overview
// import Products from './pages/Products';
// import Purchases from './pages/Purchases';
// import Sales from './pages/Sales';
// import Expenses from './pages/Expenses';
// import Reports from './pages/Reports';
// import Settings from './pages/Settings';
// import Users from './pages/Users';

// const App = () => {
//   useEffect(() => {
//     initInactivityTracking();
//   }, []);

//   return (
//     <Router>
//       <>
//         <ToastContainer position="top-right" autoClose={3000} />
//         <Routes>
//           {/* Public Routes */}
//           <Route path="/login" element={<Login />} />
//           <Route path="/logout" element={<Logout />} />

//           {/* Protected Dashboard with nested routes */}
//           <Route
//             path="/"
//             element={
//               <PrivateRoute>
//                 <Dashboard />
//               </PrivateRoute>
//             }
//           >
//             <Route index element={<Overview />} /> {/* ✅ Default route */}
//             <Route path="products" element={<Products />} />
//             <Route path="purchases" element={<Purchases />} />
//             <Route path="sales" element={<Sales />} />
//             <Route path="expenses" element={<Expenses />} />
//             <Route path="reports" element={<Reports />} />
//             <Route path="settings" element={<Settings />} />
//             <Route path="users" element={<Users />} />
//             <Route path="register" element={<Register />} />
//           </Route>
//         </Routes>
//       </>
//     </Router>
//   );
// };

// export default App;



import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { initInactivityTracking } from './utils/AuthManager';

import Dashboard from './pages/Dashboard';
import Login from './components/auth/Login';
import Logout from './components/auth/Logout';
import PrivateRoute from './components/PrivateRoute';
import Register from './components/auth/Register';

import Overview from './pages/Overview';
import Products from './pages/Products';
import Purchases from './pages/Purchases';
import Sales from './pages/Sales';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Users from './pages/Users';

const App = () => {
  useEffect(() => {
    initInactivityTracking();
  }, []);

  return (
    <Router>
      <>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />

          {/* Protected Dashboard with nested routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          >
            {/* Default route for "/" */}
            <Route index element={<Overview />} />

            {/* ✅ Alias route for "/overview" */}
            <Route path="overview" element={<Overview />} />

            {/* Other dashboard routes */}
            <Route path="products" element={<Products />} />
            <Route path="purchases" element={<Purchases />} />
            <Route path="sales" element={<Sales />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="users" element={<Users />} />
            <Route path="register" element={<Register />} />
          </Route>
        </Routes>
      </>
    </Router>
  );
};

export default App;





