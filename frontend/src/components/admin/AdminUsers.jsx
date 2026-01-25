import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminUsers.css'; // Import the styles

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Helper for Auth Headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // 1. Fetch all users
      const response = await axios.get('http://127.0.0.1:8000/api/admin/users-details/', {
        headers: getAuthHeaders()
      });
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError("Failed to load users.");
        setLoading(false);
      }
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = !currentStatus; // Toggle boolean
    const actionName = newStatus ? "Unblock" : "Block";

    if (!window.confirm(`Are you sure you want to ${actionName} this user?`)) return;

    // Optimistic UI Update (Update screen before server responds)
    const originalUsers = [...users];
    setUsers(users.map(user => 
      user.id === userId ? { ...user, is_active: newStatus } : user
    ));

    try {
      // 2. Send PATCH request
      // Note: Your backend looks for user_id in query params (?user_id=1), not the URL path
      await axios.patch(
        'http://127.0.0.1:8000/api/admin/users-details/', 
        { is_active: newStatus }, // Body
        { 
          headers: getAuthHeaders(),
          params: { user_id: userId } // This adds ?user_id=X to the URL
        }
      );
      // Success - logic handled by optimistic update above
      console.log(`User ${userId} status changed to ${newStatus}`);

    } catch (err) {
      console.error("Update error:", err);
      // Revert if server fails
      setUsers(originalUsers);
      alert("Failed to update user status. Check if backend method is named 'patch' not 'path'.");
    }
  };

  if (loading) return <div className="users-container">Loading Users...</div>;
  if (error) return <div className="users-container" style={{color: 'red'}}>{error}</div>;

  return (
    <div className="users-container">
      <h1 className="users-header">User Management</h1>

      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                
                {/* ID */}
                <td>#{user.id}</td>

                {/* Name */}
                <td style={{fontWeight: '600'}}>{user.name || "N/A"}</td>

                {/* Email */}
                <td>{user.email}</td>

                {/* Phone */}
                <td>{user.phone_number || "-"}</td>

                {/* Status Badge */}
                <td>
                  <span className={`status-badge ${user.is_active ? 'status-active' : 'status-blocked'}`}>
                    {user.is_active ? 'Active' : 'Blocked'}
                  </span>
                </td>

                {/* Toggle Button */}
                <td>
                  {user.is_active ? (
                    <button 
                      className="btn-action btn-block"
                      onClick={() => handleToggleStatus(user.id, user.is_active)}
                    >
                      Block User
                    </button>
                  ) : (
                    <button 
                      className="btn-action btn-unblock"
                      onClick={() => handleToggleStatus(user.id, user.is_active)}
                    >
                      Unblock User
                    </button>
                  )}
                </td>

              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td colSpan="6" style={{textAlign: 'center', padding: '30px', color: '#888'}}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;