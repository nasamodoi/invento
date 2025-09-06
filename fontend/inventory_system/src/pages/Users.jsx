import React, { useEffect, useState } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('users/');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const toggleActivation = async (userId, currentStatus) => {
    try {
      const response = await api.patch(`users/${userId}/`, {
        is_active: !currentStatus,
      });
      toast.success(`✅ User ${response.data.username} is now ${response.data.is_active ? 'active' : 'inactive'}`);
      setUsers(users.map(u => (u.id === userId ? response.data : u)));
    } catch (error) {
      console.error('Failed to update user status:', error);
      toast.error('❌ Failed to update user status');
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.is_superuser ? 'admin' : user.is_staff ? 'staff' : 'user').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid mt-4">
      <h2 className="mb-3">👥 Users</h2>

      {/* Search Bar */}
      <div className="mb-3 d-flex flex-wrap gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="🔍 Search by username, email, or role"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button className="btn btn-outline-secondary" onClick={() => setSearchTerm('')}>
            ❌ Clear
          </button>
        )}
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="alert alert-warning">No users match your search.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={user.id || index}>
                  <td>{index + 1}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    {user.is_superuser
                      ? 'Admin'
                      : user.is_staff
                      ? 'Staff'
                      : 'User'}
                  </td>
                  <td>
                    <span className={`badge ${user.is_active ? 'bg-success' : 'bg-danger'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(user.date_joined).toLocaleDateString()}</td>
                  <td>
                    <button
                      className={`btn btn-sm ${user.is_active ? 'btn-outline-danger' : 'btn-outline-success'}`}
                      onClick={() => toggleActivation(user.id, user.is_active)}
                    >
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users;