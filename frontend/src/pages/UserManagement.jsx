import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "../components/Sidebar";

const UserManagement = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock user data
  useEffect(() => {
    const mockUsers = [
      {
        id: "USR-001",
        username: "admin",
        email: "admin@haramaya.edu.et",
        fullName: "System Administrator",
        role: "admin",
        status: "active",
        lastLogin: "2024-01-15T14:30:00Z",
        createdAt: "2023-01-01T00:00:00Z",
        department: "IT Security",
        permissions: ["read", "write", "delete", "admin"],
        loginAttempts: 0,
        twoFactorEnabled: true
      },
      {
        id: "USR-002",
        username: "security.analyst",
        email: "analyst@haramaya.edu.et",
        fullName: "John Doe",
        role: "analyst",
        status: "active",
        lastLogin: "2024-01-15T13:45:00Z",
        createdAt: "2023-06-15T00:00:00Z",
        department: "Security Operations",
        permissions: ["read", "write"],
        loginAttempts: 0,
        twoFactorEnabled: true
      },
      {
        id: "USR-003",
        username: "network.monitor",
        email: "monitor@haramaya.edu.et",
        fullName: "Jane Smith",
        role: "operator",
        status: "active",
        lastLogin: "2024-01-15T12:20:00Z",
        createdAt: "2023-08-20T00:00:00Z",
        department: "Network Operations",
        permissions: ["read"],
        loginAttempts: 1,
        twoFactorEnabled: false
      },
      {
        id: "USR-004",
        username: "guest.user",
        email: "guest@haramaya.edu.et",
        fullName: "Guest User",
        role: "viewer",
        status: "inactive",
        lastLogin: "2024-01-10T09:15:00Z",
        createdAt: "2024-01-01T00:00:00Z",
        department: "External",
        permissions: ["read"],
        loginAttempts: 3,
        twoFactorEnabled: false
      },
      {
        id: "USR-005",
        username: "incident.responder",
        email: "responder@haramaya.edu.et",
        fullName: "Mike Johnson",
        role: "analyst",
        status: "locked",
        lastLogin: "2024-01-12T16:30:00Z",
        createdAt: "2023-11-10T00:00:00Z",
        department: "Incident Response",
        permissions: ["read", "write"],
        loginAttempts: 5,
        twoFactorEnabled: true
      }
    ];
    setUsers(mockUsers);
  }, []);

  const getRoleColor = (role) => {
    switch (role) {
      case "admin": return "#dc3545";
      case "analyst": return "#fd7e14";
      case "operator": return "#ffc107";
      case "viewer": return "#28a745";
      default: return "#6c757d";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "#28a745";
      case "inactive": return "#ffc107";
      case "locked": return "#dc3545";
      default: return "#6c757d";
    }
  };

  const filteredUsers = users.filter(user => {
    const roleMatch = filterRole === "all" || user.role === filterRole;
    const statusMatch = filterStatus === "all" || user.status === filterStatus;
    const searchMatch = searchTerm === "" || 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return roleMatch && statusMatch && searchMatch;
  });

  const handleAddUser = () => {
    setShowAddUser(true);
    setSelectedUser(null);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowAddUser(false);
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">
            <i className="bi bi-people"></i>
            User Management
          </h1>
          <p className="page-subtitle">Manage system users and permissions</p>
        </div>

        <div className="user-management-container">
          {/* Controls */}
          <div className="user-controls">
            <div className="search-bar">
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-group">
              <select 
                value={filterRole} 
                onChange={(e) => setFilterRole(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="analyst">Analyst</option>
                <option value="operator">Operator</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div className="filter-group">
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="locked">Locked</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={handleAddUser}>
              <i className="bi bi-plus"></i>
              Add User
            </button>
          </div>

          <div className="user-layout">
            {/* User List */}
            <div className="user-list">
              <div className="user-table">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Last Login</th>
                      <th>2FA</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id} className={selectedUser?.id === user.id ? 'selected' : ''}>
                        <td>
                          <div className="user-info">
                            <div className="user-avatar">
                              <i className="bi bi-person-circle"></i>
                            </div>
                            <div className="user-details">
                              <div className="user-name">{user.fullName}</div>
                              <div className="user-email">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span 
                            className="role-badge"
                            style={{ backgroundColor: getRoleColor(user.role) }}
                          >
                            {user.role.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span 
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(user.status) }}
                          >
                            {user.status.toUpperCase()}
                          </span>
                        </td>
                        <td>{new Date(user.lastLogin).toLocaleDateString()}</td>
                        <td>
                          <i className={`bi ${user.twoFactorEnabled ? 'bi-shield-check' : 'bi-shield-x'}`}
                             style={{ color: user.twoFactorEnabled ? '#28a745' : '#dc3545' }}></i>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn btn-sm btn-secondary"
                              onClick={() => handleEditUser(user)}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button className="btn btn-sm btn-danger">
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* User Details/Form Panel */}
            <div className="user-details-panel">
              {showAddUser ? (
                <div className="add-user-form">
                  <h3>Add New User</h3>
                  <form className="user-form">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input type="text" className="form-control" placeholder="Enter full name" />
                    </div>
                    <div className="form-group">
                      <label>Username</label>
                      <input type="text" className="form-control" placeholder="Enter username" />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" className="form-control" placeholder="Enter email" />
                    </div>
                    <div className="form-group">
                      <label>Department</label>
                      <input type="text" className="form-control" placeholder="Enter department" />
                    </div>
                    <div className="form-group">
                      <label>Role</label>
                      <select className="form-control">
                        <option value="viewer">Viewer</option>
                        <option value="operator">Operator</option>
                        <option value="analyst">Analyst</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>
                        <input type="checkbox" /> Enable Two-Factor Authentication
                      </label>
                    </div>
                    <div className="form-actions">
                      <button type="button" className="btn btn-secondary" onClick={() => setShowAddUser(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Create User
                      </button>
                    </div>
                  </form>
                </div>
              ) : selectedUser ? (
                <div className="user-details">
                  <div className="details-header">
                    <h3>{selectedUser.fullName}</h3>
                    <div className="user-badges">
                      <span 
                        className="role-badge"
                        style={{ backgroundColor: getRoleColor(selectedUser.role) }}
                      >
                        {selectedUser.role.toUpperCase()}
                      </span>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(selectedUser.status) }}
                      >
                        {selectedUser.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="details-content">
                    <div className="detail-section">
                      <h4>User Information</h4>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <label>User ID:</label>
                          <span>{selectedUser.id}</span>
                        </div>
                        <div className="detail-item">
                          <label>Username:</label>
                          <span>{selectedUser.username}</span>
                        </div>
                        <div className="detail-item">
                          <label>Email:</label>
                          <span>{selectedUser.email}</span>
                        </div>
                        <div className="detail-item">
                          <label>Department:</label>
                          <span>{selectedUser.department}</span>
                        </div>
                        <div className="detail-item">
                          <label>Created:</label>
                          <span>{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="detail-item">
                          <label>Last Login:</label>
                          <span>{new Date(selectedUser.lastLogin).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h4>Security</h4>
                      <div className="security-info">
                        <div className="security-item">
                          <label>Two-Factor Authentication:</label>
                          <span className={selectedUser.twoFactorEnabled ? 'enabled' : 'disabled'}>
                            <i className={`bi ${selectedUser.twoFactorEnabled ? 'bi-shield-check' : 'bi-shield-x'}`}></i>
                            {selectedUser.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        <div className="security-item">
                          <label>Failed Login Attempts:</label>
                          <span className={selectedUser.loginAttempts > 3 ? 'warning' : ''}>
                            {selectedUser.loginAttempts}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h4>Permissions</h4>
                      <div className="permissions-list">
                        {selectedUser.permissions.map((permission, index) => (
                          <span key={index} className="permission-tag">
                            {permission}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="user-actions">
                      <button className="btn btn-primary">
                        <i className="bi bi-pencil"></i>
                        Edit User
                      </button>
                      <button className="btn btn-warning">
                        <i className="bi bi-key"></i>
                        Reset Password
                      </button>
                      {selectedUser.status === "locked" && (
                        <button className="btn btn-success">
                          <i className="bi bi-unlock"></i>
                          Unlock Account
                        </button>
                      )}
                      <button className="btn btn-danger">
                        <i className="bi bi-person-x"></i>
                        Deactivate
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-selection">
                  <i className="bi bi-people"></i>
                  <h3>Select a user or add new user</h3>
                  <p>Choose a user from the list to view details or click "Add User" to create a new account.</p>
                </div>
              )}
            </div>
          </div>

          {/* User Statistics */}
          <div className="user-stats">
            <div className="stats-cards">
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="bi bi-people" style={{ color: "#007bff" }}></i>
                </div>
                <div className="stat-content">
                  <h4>{users.length}</h4>
                  <p>Total Users</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="bi bi-person-check" style={{ color: "#28a745" }}></i>
                </div>
                <div className="stat-content">
                  <h4>{users.filter(u => u.status === "active").length}</h4>
                  <p>Active Users</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="bi bi-shield-check" style={{ color: "#ffc107" }}></i>
                </div>
                <div className="stat-content">
                  <h4>{users.filter(u => u.twoFactorEnabled).length}</h4>
                  <p>2FA Enabled</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="bi bi-person-lock" style={{ color: "#dc3545" }}></i>
                </div>
                <div className="stat-content">
                  <h4>{users.filter(u => u.status === "locked").length}</h4>
                  <p>Locked Accounts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;