import { jwtDecode } from 'jwt-decode';

export const useUser = () => {
  const token = localStorage.getItem('access');
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return {
      username: decoded.username,
      is_admin: decoded.is_admin,
      is_staff_user: decoded.is_staff_user,
    };
  } catch {
    return null;
  }
};


// utils/token.js
// import { useEffect, useState } from 'react';
// import api from '../api';

// export const useUser = () => {
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const response = await api.get('/api/users/'); // or /api/user/
//         setUser(response.data);
//       } catch (err) {
//         console.error('Failed to fetch user:', err);
//       }
//     };

//     fetchUser();
//   }, []);

//   return user;
// };
