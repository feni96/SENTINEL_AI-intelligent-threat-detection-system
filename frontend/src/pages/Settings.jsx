import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

export default function Settings() {
  const { t } = useTranslation();
  // ---------- Alert Settings ----------
  const [alertSeverityThreshold, setAlertSeverityThreshold] = useState("Medium");
  const [minConfidence, setMinConfidence] = useState(70);
  const [enabledThreatTypes, setEnabledThreatTypes] = useState({
    DDoS: true,
    Malware: true,
    BruteForce: true,
    UnauthorizedAccess: true,
    PortScanning: false,
  });

  // ---------- Notification Settings ----------
  const [notificationChannels, setNotificationChannels] = useState({
    dashboard: true,
    email: true,
    sms: false,
  });
  const [notifySeverities, setNotifySeverities] = useState({
    Critical: true,
    High: true,
    Medium: false,
    Low: false,
  });
  const [priorityOnly, setPriorityOnly] = useState(false);

  // ---------- ML Model Settings (read‑only) ----------
  const mlModel = {
    activeModel: "Random Forest + CNN Ensemble",
    accuracy: 98.2,
    falsePositiveRate: 1.8,
    lastTrained: "2025-03-15",
  };
  const [modelEnabled, setModelEnabled] = useState(true);

  // ---------- Area / Zone Mapping ----------
  const [zones, setZones] = useState([]);
  const [loadingZones, setLoadingZones] = useState(true);
  const [zoneError, setZoneError] = useState("");
  const [areaVizEnabled, setAreaVizEnabled] = useState(true);
  const [showAddZoneForm, setShowAddZoneForm] = useState(false);
  const [newZone, setNewZone] = useState({
    name: "",
    building: "",
    department: "",
    ipRange: "",
    riskLevel: "Medium",
    zoneType: "Academic",
    enabled: true
  });

  // ---------- Security & Account ----------
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [sessionTimeout, setSessionTimeout] = useState(30); // minutes
  const lastLogin = "2025-03-22 08:30:15";
  const recentActivity = [
    "Logged in from 10.230.227.195",
    "Changed alert threshold to Medium",
    "Generated Weekly report",
  ];

  // ---------- Zone Management ----------
  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      setLoadingZones(true);
      const response = await api.get('/zones');
      setZones(response.data.data.zones);
      setZoneError("");
    } catch (error) {
      setZoneError("Failed to fetch zones: " + (error.response?.data?.message || error.message));
    } finally {
      setLoadingZones(false);
    }
  };

  const handleZoneToggle = async (zoneId) => {
    try {
      const zone = zones.find(z => z._id === zoneId);
      if (zone) {
        await api.put(`/zones/${zoneId}`, { enabled: !zone.enabled });
        setZones(zones.map(z => z._id === zoneId ? { ...z, enabled: !z.enabled } : z));
      }
    } catch (error) {
      setZoneError("Failed to update zone: " + (error.response?.data?.message || error.message));
    }
  };

  const handleAddZone = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/zones', newZone);
      setZones([...zones, response.data.data.zone]);
      setNewZone({
        name: "",
        building: "",
        department: "",
        ipRange: "",
        riskLevel: "Medium",
        zoneType: "Academic",
        enabled: true
      });
      setShowAddZoneForm(false);
      setZoneError("");
    } catch (error) {
      setZoneError("Failed to add zone: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteZone = async (zoneId) => {
    if (window.confirm("Are you sure you want to delete this zone?")) {
      try {
        await api.delete(`/zones/${zoneId}`);
        setZones(zones.filter(z => z._id !== zoneId));
        setZoneError("");
      } catch (error) {
        setZoneError("Failed to delete zone: " + (error.response?.data?.message || error.message));
      }
    }
  };

  // ---------- Handlers ----------
  const handleThreatTypeToggle = (type) => {
    setEnabledThreatTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleChannelToggle = (channel) => {
    setNotificationChannels((prev) => ({ ...prev, [channel]: !prev[channel] }));
  };

  const handleSeverityNotifyToggle = (sev) => {
    setNotifySeverities((prev) => ({ ...prev, [sev]: !prev[sev] }));
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setPasswordError("");
    setPasswordSuccess("");
    
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError(t("newPasswordsDoNotMatch"));
      return;
    }
    if (passwordForm.new.length < 8) {
      setPasswordError(t("passwordMustBeAtLeast8Characters"));
      return;
    }
    
    try {
      const response = await api.put('/auth/change-password', {
        currentPassword: passwordForm.current,
        newPassword: passwordForm.new
      });
      
      setPasswordSuccess(response.data?.message || t("passwordChangedSuccessfully"));
      setPasswordForm({ current: "", new: "", confirm: "" });
      
      // Clear success message after 3 seconds
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (error) {
      setPasswordError(error.response?.data?.error?.message || error.response?.data?.message || t("passwordChangeFailed"));
    }
  };

  const handleSaveSettings = () => {
    alert(t("settingsSaved"));
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">
          {/* Header removed as requested */}

          <div className="settings-grid">
            {/* Alert Settings */}
            <div className="settings-card">
              <h3>
                <i className="bi bi-exclamation-triangle"></i> {t("alertSettings")}
              </h3>
              <div className="settings-section">
                <div className="setting-row">
                  <label>{t("severityThreshold")}</label>
                  <select
                    value={alertSeverityThreshold}
                    onChange={(e) => setAlertSeverityThreshold(e.target.value)}
                  >
                    <option value="Low">{t("low")}</option>
                    <option value="Medium">{t("medium")}</option>
                    <option value="High">{t("high")}</option>
                    <option value="Critical">{t("critical")}</option>
                  </select>
                </div>
                <div className="setting-row">
                  <label>{t("minConfidenceScore")}</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={minConfidence}
                    onChange={(e) => setMinConfidence(Number(e.target.value))}
                  />
                </div>
                <div className="setting-row">
                  <label>{t("enableAlertForThreatTypes")}</label>
                  <div className="checkbox-group">
                    {Object.entries(enabledThreatTypes).map(([type, enabled]) => (
                      <label key={type}>
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={() => handleThreatTypeToggle(type)}
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="settings-card">
              <h3>
                <i className="bi bi-bell"></i> {t("notificationSettings")}
              </h3>
              <div className="settings-section">
                <div className="setting-row">
                  <label>{t("channels")}</label>
                  <div className="checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={notificationChannels.dashboard}
                        onChange={() => handleChannelToggle("dashboard")}
                      />
                      {t("dashboardChannel")}
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={notificationChannels.email}
                        onChange={() => handleChannelToggle("email")}
                      />
                      {t("emailChannel")}
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={notificationChannels.sms}
                        onChange={() => handleChannelToggle("sms")}
                      />
                      {t("smsChannel")}
                    </label>
                  </div>
                </div>
                <div className="setting-row">
                  <label>{t("notifyForSeverities")}</label>
                  <div className="checkbox-group">
                    {Object.entries(notifySeverities).map(([sev, enabled]) => (
                      <label key={sev}>
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={() => handleSeverityNotifyToggle(sev)}
                        />
                        {t(sev.toLowerCase())}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="setting-row">
                  <label>
                    <input
                      type="checkbox"
                      checked={priorityOnly}
                      onChange={(e) => setPriorityOnly(e.target.checked)}
                    />
                    {t("priorityNotificationsOnly")}
                  </label>
                </div>
              </div>
            </div>

            {/* ML Model Settings */}
            <div className="settings-card">
              <h3>
                <i className="bi bi-cpu"></i> {t("machineLearningModel")}
              </h3>
              <div className="settings-section">
                <div className="setting-row read-only">
                  <label>{t("activeModel")}</label>
                  <span>{mlModel.activeModel}</span>
                </div>
                <div className="setting-row read-only">
                  <label>{t("accuracy")}</label>
                  <span>{mlModel.accuracy}%</span>
                </div>
                <div className="setting-row read-only">
                  <label>{t("falsePositiveRate")}</label>
                  <span>{mlModel.falsePositiveRate}%</span>
                </div>
                <div className="setting-row read-only">
                  <label>{t("lastTrained")}</label>
                  <span>{mlModel.lastTrained}</span>
                </div>
                <div className="setting-row">
                  <label>
                    <input
                      type="checkbox"
                      checked={modelEnabled}
                      onChange={(e) => setModelEnabled(e.target.checked)}
                    />
                    {t("enableMlDetection")}
                  </label>
                </div>
              </div>
            </div>

            {/* Area / Zone Mapping */}
            <div className="settings-card">
              <h3>
                <i className="bi bi-map"></i> {t("zoneMapping")}
              </h3>
              <div className="settings-section">
                <div className="setting-row">
                  <label>
                    <input
                      type="checkbox"
                      checked={areaVizEnabled}
                      onChange={(e) => setAreaVizEnabled(e.target.checked)}
                    />
                    {t("enableAreaBasedVisualization")}
                  </label>
                </div>
                {zoneError && (
                  <div className="error-message" style={{ color: 'red', marginBottom: '10px', padding: '10px', backgroundColor: '#ffebee', border: '1px solid #f44336', borderRadius: '4px' }}>
                    {zoneError}
                  </div>
                )}
                <div className="zone-list">
                  {loadingZones ? (
                    <div>Loading zones...</div>
                  ) : zones.length === 0 ? (
                    <div>No zones configured</div>
                  ) : (
                    zones.map((zone) => (
                      <div key={zone._id} className="zone-item">
                        <label>
                          <input
                            type="checkbox"
                            checked={zone.enabled}
                            onChange={() => handleZoneToggle(zone._id)}
                          />
                          {zone.name}
                        </label>
                        <span className="zone-ip">{zone.ipRange}</span>
                        <span className="zone-building">{zone.building}</span>
                        <span className="zone-risk" style={{ 
                          color: zone.riskLevel === 'Critical' ? '#d32f2f' : 
                                 zone.riskLevel === 'High' ? '#f57c00' : 
                                 zone.riskLevel === 'Medium' ? '#fbc02d' : '#388e3c'
                        }}>
                          {zone.riskLevel}
                        </span>
                        <button 
                          onClick={() => handleDeleteZone(zone._id)}
                          style={{ 
                            marginLeft: '10px', 
                            padding: '2px 8px', 
                            backgroundColor: '#f44336', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '3px',
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <div style={{ marginTop: '15px' }}>
                  <button 
                    onClick={() => setShowAddZoneForm(!showAddZoneForm)}
                    style={{ 
                      padding: '8px 16px', 
                      backgroundColor: '#2196f3', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {showAddZoneForm ? 'Cancel' : 'Add New Zone'}
                  </button>
                </div>
                {showAddZoneForm && (
                  <form onSubmit={handleAddZone} style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <input
                        type="text"
                        placeholder="Zone Name"
                        value={newZone.name}
                        onChange={(e) => setNewZone({...newZone, name: e.target.value})}
                        required
                        style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
                      />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <input
                        type="text"
                        placeholder="Building"
                        value={newZone.building}
                        onChange={(e) => setNewZone({...newZone, building: e.target.value})}
                        required
                        style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
                      />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <input
                        type="text"
                        placeholder="Department"
                        value={newZone.department}
                        onChange={(e) => setNewZone({...newZone, department: e.target.value})}
                        required
                        style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
                      />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <input
                        type="text"
                        placeholder="IP Range (e.g., 10.0.2.0/24)"
                        value={newZone.ipRange}
                        onChange={(e) => setNewZone({...newZone, ipRange: e.target.value})}
                        required
                        style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
                      />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <select
                        value={newZone.riskLevel}
                        onChange={(e) => setNewZone({...newZone, riskLevel: e.target.value})}
                        style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <select
                        value={newZone.zoneType}
                        onChange={(e) => setNewZone({...newZone, zoneType: e.target.value})}
                        style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
                      >
                        <option value="Academic">Academic</option>
                        <option value="Administrative">Administrative</option>
                        <option value="Student Housing">Student Housing</option>
                        <option value="Infrastructure">Infrastructure</option>
                        <option value="Public Access">Public Access</option>
                        <option value="Research">Research</option>
                      </select>
                    </div>
                    <button 
                      type="submit"
                      style={{ 
                        padding: '8px 16px', 
                        backgroundColor: '#4caf50', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Add Zone
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Security & Account Settings */}
            <div className="settings-card">
              <h3>
                <i className="bi bi-shield-lock"></i> {t("securityAndAccount")}
              </h3>
              <div className="settings-section">
                <form onSubmit={handleSavePassword}>
                  {passwordError && (
                    <div className="error-message" style={{ color: 'red', marginBottom: '10px', padding: '10px', backgroundColor: '#ffebee', border: '1px solid #f44336', borderRadius: '4px' }}>
                      {passwordError}
                    </div>
                  )}
                  {passwordSuccess && (
                    <div className="success-message" style={{ color: 'green', marginBottom: '10px', padding: '10px', backgroundColor: '#e8f5e8', border: '1px solid #4caf50', borderRadius: '4px' }}>
                      {passwordSuccess}
                    </div>
                  )}
                  <div className="setting-row">
                    <label>{t("currentPassword")}</label>
                    <input
                      type="password"
                      name="current"
                      value={passwordForm.current}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="setting-row">
                    <label>{t("newPassword")}</label>
                    <input
                      type="password"
                      name="new"
                      value={passwordForm.new}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="setting-row">
                    <label>{t("confirmNewPassword")}</label>
                    <input
                      type="password"
                      name="confirm"
                      value={passwordForm.confirm}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary">
                    {t("changePassword")}
                  </button>
                </form>
                <hr />
                <div className="setting-row">
                  <label>{t("sessionTimeoutMinutes")}</label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(Number(e.target.value))}
                  />
                </div>
                <div className="setting-row read-only">
                  <label>{t("lastLogin")}</label>
                  <span>{lastLogin}</span>
                </div>
                <div className="setting-row read-only">
                  <label>{t("recentActivity")}</label>
                  <ul className="activity-list">
                    {recentActivity.map((act, idx) => (
                      <li key={idx}>{act}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Global Save Button */}
          <div className="settings-actions">
            <button className="btn-primary" onClick={handleSaveSettings}>
              {t("saveAllSettings")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}