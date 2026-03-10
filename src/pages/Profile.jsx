// src/pages/Profile.jsx
import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "./Profile.css";

const Profile = () => {
  // Mock user data – replace with real data from your auth system / API
  const [user, setUser] = useState({
    username: "admin",
    email: "admin@haramaya.edu.et",
    fullName: "Security Administrator",
    role: "Administrator",
    department: "IT Security",
    phone: "+251-91-234-5678",
    avatar: null, // could be a URL
  });

  // Edit mode for profile details
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ ...user });

  // Password change form
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState("");

  // Tab state: "profile" or "security"
  const [activeTab, setActiveTab] = useState("profile");

  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    // Send updated profile to backend (API call)
    console.log("Updating profile:", formData);
    setUser(formData);
    setEditMode(false);
    // Show success toast/notification (optional)
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordMessage("");

    // Basic validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage("New passwords do not match.");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordMessage("Password must be at least 8 characters.");
      return;
    }

    // Send to backend (API call)
    console.log("Changing password...", {
      current: passwordData.currentPassword,
      new: passwordData.newPassword,
    });
    setPasswordMessage("Password updated successfully!");
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">
          <div className="profile-page">
            {/* Header */}
            <div className="profile-header">
              <h1>Administrator Profile</h1>
              <p>Manage your account settings and preferences</p>
            </div>

            {/* Tabs */}
            <div className="profile-tabs">
              <button
                className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                <i className="bi bi-person"></i> Profile Details
              </button>
              <button
                className={`tab-btn ${activeTab === "security" ? "active" : ""}`}
                onClick={() => setActiveTab("security")}
              >
                <i className="bi bi-shield-lock"></i> Security
              </button>
              <button
                className={`tab-btn ${activeTab === "notifications" ? "active" : ""}`}
                onClick={() => setActiveTab("notifications")}
              >
                <i className="bi bi-bell"></i> Notifications
              </button>
            </div>

            {/* Tab Content */}
            <div className="profile-content">
              {/* Profile Details Tab */}
              {activeTab === "profile" && (
                <div className="profile-details-tab">
                  {!editMode ? (
                    <div className="profile-view">
                      <div className="avatar-section">
                        <div className="avatar">
                          {user.avatar ? (
                            <img src={user.avatar} alt="avatar" />
                          ) : (
                            <i className="bi bi-person-circle"></i>
                          )}
                        </div>
                        <button className="btn-outline btn-sm">
                          <i className="bi bi-camera"></i> Change
                        </button>
                      </div>
                      <div className="info-grid">
                        <div className="info-item">
                          <label>Username</label>
                          <p>{user.username}</p>
                        </div>
                        <div className="info-item">
                          <label>Full Name</label>
                          <p>{user.fullName}</p>
                        </div>
                        <div className="info-item">
                          <label>Email</label>
                          <p>{user.email}</p>
                        </div>
                        <div className="info-item">
                          <label>Role</label>
                          <p>{user.role}</p>
                        </div>
                        <div className="info-item">
                          <label>Department</label>
                          <p>{user.department}</p>
                        </div>
                        <div className="info-item">
                          <label>Phone</label>
                          <p>{user.phone}</p>
                        </div>
                      </div>
                      <div className="profile-actions">
                        <button className="btn-primary" onClick={() => setEditMode(true)}>
                          <i className="bi bi-pencil"></i> Edit Profile
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form className="profile-edit-form" onSubmit={handleProfileSubmit}>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Username</label>
                          <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleProfileChange}
                            disabled // typically username is not editable
                          />
                        </div>
                        <div className="form-group">
                          <label>Full Name</label>
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleProfileChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Email</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleProfileChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Phone</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleProfileChange}
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Department</label>
                          <input
                            type="text"
                            name="department"
                            value={formData.department}
                            onChange={handleProfileChange}
                          />
                        </div>
                        <div className="form-group">
                          <label>Role</label>
                          <input type="text" value={user.role} disabled />
                        </div>
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="btn-primary">
                          <i className="bi bi-check-lg"></i> Save Changes
                        </button>
                        <button type="button" className="btn-outline" onClick={() => setEditMode(false)}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="security-tab">
                  <h3>Change Password</h3>
                  <form className="password-form" onSubmit={handlePasswordSubmit}>
                    <div className="form-group">
                      <label>Current Password</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength="8"
                      />
                    </div>
                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                    {passwordMessage && (
                      <div className={`message ${passwordMessage.includes("success") ? "success" : "error"}`}>
                        {passwordMessage}
                      </div>
                    )}
                    <button type="submit" className="btn-primary">
                      <i className="bi bi-shield-check"></i> Update Password
                    </button>
                  </form>

                  <hr className="divider" />

                  <h3>Two‑Factor Authentication (2FA)</h3>
                  <p className="text-secondary">Enhance your account security by enabling 2FA.</p>
                  <button className="btn-outline">
                    <i className="bi bi-google"></i> Set up 2FA
                  </button>
                </div>
              )}

              {/* Notifications Tab (placeholder) */}
              {activeTab === "notifications" && (
                <div className="notifications-tab">
                  <h3>Notification Preferences</h3>
                  <p className="text-secondary">Choose how you receive alerts and updates.</p>
                  <div className="notification-options">
                    <label className="checkbox-label">
                      <input type="checkbox" defaultChecked /> Email alerts for critical threats
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" defaultChecked /> SMS for high‑severity incidents
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" /> Daily summary report
                    </label>
                  </div>
                  <button className="btn-primary">Save Preferences</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;