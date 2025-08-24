// // src/components/ProtectedRoute.jsx
// import React from 'react';
// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// const PrivateRoute = ({ requiredRole, children }) => {
//   const { userRole } = useAuth();

//   // Not logged in at all
//   if (!userRole) {
//     return <Navigate to="/login" replace />;
//   }

//   // Role mismatch (e.g. user tries to access admin-only page)
//   if (requiredRole && userRole !== requiredRole) {
//     return <Navigate to="/" replace />;
//   }

//   // Authorized, render children
//   return children;
// };

// export default PrivateRoute;


import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  return token ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
