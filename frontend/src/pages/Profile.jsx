// src/pages/Profile.jsx
import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "./Profile.css";

const Profile = () => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  // Mock user data – replace with real data from your auth system / API
  const [user, setUser] = useState({
    username: "admin",
    email: "admin@haramaya.edu.et",
    fullName: "Security Administrator",
    role: "Administrator",
    department: "IT Security",
    phone: "+251-91-234-5678",
    avatar: null, // could be a URL
    // Additional fields
    employeeId: "EMP-2024-001",
    location: "Haramaya University, Ethiopia",
    joinDate: "2024-01-15",
    bio: "Security administrator with expertise in network security and threat detection.",
    skills: ["Network Security", "Threat Analysis", "Incident Response", "Cybersecurity"],
    certifications: ["CompTIA Security+", "CEH", "CISSP"],
    emergencyContact: {
      name: "John Doe",
      relationship: "Colleague",
      phone: "+251-91-234-5679"
    },
    preferences: {
      language: "English",
      timezone: "GMT+3",
      theme: "dark"
    }
  });

  // Edit mode for profile details
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ ...user });

  // File upload state
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  // Password change form
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordMessageType, setPasswordMessageType] = useState("");

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
    setPasswordMessageType("");

    // Basic validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage(t("newPasswordsDoNotMatch"));
      setPasswordMessageType("error");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordMessage(t("passwordMustBeAtLeast8Characters"));
      setPasswordMessageType("error");
      return;
    }

    // Send to backend (API call)
    console.log("Changing password...", {
      current: passwordData.currentPassword,
      new: passwordData.newPassword,
    });
    setPasswordMessage(t("passwordUpdatedSuccessfully"));
    setPasswordMessageType("success");
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  // File upload handlers
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        setUploadMessage("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setUploadMessage("File size must be less than 5MB");
        return;
      }

      setUploading(true);
      setUploadMessage("");

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target.result;
        // Update user avatar
        setUser({ ...user, avatar: imageUrl });
        setFormData({ ...formData, avatar: imageUrl });
        setUploading(false);
        setUploadMessage("Profile picture updated successfully");
        setTimeout(() => setUploadMessage(""), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
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
              <h1>{t("administratorProfile")}</h1>
              <p>{t("manageAccountSettings")}</p>
            </div>

            {/* Tabs */}
            <div className="profile-tabs">
              <button
                className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                <i className="bi bi-person"></i> {t("profileDetails")}
              </button>
              <button
                className={`tab-btn ${activeTab === "security" ? "active" : ""}`}
                onClick={() => setActiveTab("security")}
              >
                <i className="bi bi-shield-lock"></i> {t("security")}
              </button>
              <button
                className={`tab-btn ${activeTab === "notifications" ? "active" : ""}`}
                onClick={() => setActiveTab("notifications")}
              >
                <i className="bi bi-bell"></i> {t("notifications")}
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
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          style={{ display: 'none' }}
                        />
                        <button 
                          className="btn-outline btn-sm" 
                          onClick={triggerFileUpload}
                          disabled={uploading}
                        >
                          {uploading ? (
                            <>
                              <i className="bi bi-arrow-repeat"></i> Uploading...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-camera"></i> {t("change")}
                            </>
                          )}
                        </button>
                        {uploadMessage && (
                          <div className={`upload-message ${uploadMessage.includes('success') ? 'success' : 'error'}`}>
                            {uploadMessage}
                          </div>
                        )}
                      </div>
                      <div className="info-grid">
                        <div className="info-item">
                          <label>{t("username")}</label>
                          <p>{user.username}</p>
                        </div>
                        <div className="info-item">
                          <label>{t("fullName")}</label>
                          <p>{user.fullName}</p>
                        </div>
                        <div className="info-item">
                          <label>{t("email")}</label>
                          <p>{user.email}</p>
                        </div>
                        <div className="info-item">
                          <label>{t("role")}</label>
                          <p>{user.role}</p>
                        </div>
                        <div className="info-item">
                          <label>{t("department")}</label>
                          <p>{user.department}</p>
                        </div>
                        <div className="info-item">
                          <label>{t("phone")}</label>
                          <p>{user.phone}</p>
                        </div>
                        <div className="info-item">
                          <label>Employee ID</label>
                          <p>{user.employeeId}</p>
                        </div>
                        <div className="info-item">
                          <label>Location</label>
                          <p>{user.location}</p>
                        </div>
                        <div className="info-item">
                          <label>Join Date</label>
                          <p>{new Date(user.joinDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      {/* Bio Section */}
                      <div className="bio-section">
                        <h4>Bio</h4>
                        <p>{user.bio}</p>
                      </div>
                      
                      {/* Skills Section */}
                      <div className="skills-section">
                        <h4>Skills</h4>
                        <div className="skills-list">
                          {user.skills.map((skill, index) => (
                            <span key={index} className="skill-tag">{skill}</span>
                          ))}
                        </div>
                      </div>
                      
                      {/* Certifications Section */}
                      <div className="certifications-section">
                        <h4>Certifications</h4>
                        <div className="certifications-list">
                          {user.certifications.map((cert, index) => (
                            <div key={index} className="certification-item">
                              <i className="bi bi-patch-check-fill"></i>
                              <span>{cert}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Emergency Contact Section */}
                      <div className="emergency-contact-section">
                        <h4>Emergency Contact</h4>
                        <div className="emergency-contact-info">
                          <p><strong>Name:</strong> {user.emergencyContact.name}</p>
                          <p><strong>Relationship:</strong> {user.emergencyContact.relationship}</p>
                          <p><strong>Phone:</strong> {user.emergencyContact.phone}</p>
                        </div>
                      </div>
                      
                      {/* Preferences Section */}
                      <div className="preferences-section">
                        <h4>Preferences</h4>
                        <div className="preferences-grid">
                          <div className="preference-item">
                            <label>Language:</label>
                            <p>{user.preferences.language}</p>
                          </div>
                          <div className="preference-item">
                            <label>Timezone:</label>
                            <p>{user.preferences.timezone}</p>
                          </div>
                          <div className="preference-item">
                            <label>Theme:</label>
                            <p>{user.preferences.theme}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="profile-actions">
                        <button className="btn-primary" onClick={() => setEditMode(true)}>
                          <i className="bi bi-pencil"></i> {t("editProfile")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form className="profile-edit-form" onSubmit={handleProfileSubmit}>
                      <div className="form-row">
                        <div className="form-group">
                          <label>{t("username")}</label>
                          <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleProfileChange}
                            disabled // typically username is not editable
                          />
                        </div>
                        <div className="form-group">
                          <label>{t("fullName")}</label>
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
                          <label>{t("email")}</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleProfileChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>{t("phone")}</label>
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
                          <label>{t("department")}</label>
                          <input
                            type="text"
                            name="department"
                            value={formData.department}
                            onChange={handleProfileChange}
                          />
                        </div>
                        <div className="form-group">
                          <label>{t("role")}</label>
                          <input type="text" value={user.role} disabled />
                        </div>
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="btn-primary">
                          <i className="bi bi-check-lg"></i> {t("saveChanges")}
                        </button>
                        <button type="button" className="btn-outline" onClick={() => setEditMode(false)}>
                          {t("cancel")}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="security-tab">
                  <h3>{t("changePassword")}</h3>
                  <form className="password-form" onSubmit={handlePasswordSubmit}>
                    <div className="form-group">
                      <label>{t("currentPassword")}</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>{t("newPassword")}</label>
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
                      <label>{t("confirmNewPassword")}</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                    {passwordMessage && (
                      <div className={`message ${passwordMessageType === "success" ? "success" : "error"}`}>
                        {passwordMessage}
                      </div>
                    )}
                    <button type="submit" className="btn-primary">
                      <i className="bi bi-shield-check"></i> {t("updatePassword")}
                    </button>
                  </form>

                  <hr className="divider" />

                  <h3>{t("twoFactorAuthentication")}</h3>
                  <p className="text-secondary">{t("enable2faDescription")}</p>
                  <button className="btn-outline">
                    <i className="bi bi-google"></i> {t("setUp2fa")}
                  </button>
                </div>
              )}

              {/* Notifications Tab (placeholder) */}
              {activeTab === "notifications" && (
                <div className="notifications-tab">
                  <h3>{t("notificationPreferences")}</h3>
                  <p className="text-secondary">{t("chooseNotificationPreferences")}</p>
                  <div className="notification-options">
                    <label className="checkbox-label">
                      <input type="checkbox" defaultChecked /> {t("emailAlertsForCriticalThreats")}
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" defaultChecked /> {t("smsForHighSeverityIncidents")}
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" /> {t("dailySummaryReport")}
                    </label>
                  </div>
                  <button className="btn-primary">{t("savePreferences")}</button>
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