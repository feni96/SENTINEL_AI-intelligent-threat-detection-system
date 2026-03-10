import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "./Settings.css";

export default function Settings() {
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
  const [zones, setZones] = useState([
    { id: 1, name: "Library", ipRange: "10.0.2.0/24", enabled: true },
    { id: 2, name: "Computer Labs", ipRange: "10.0.3.0/24", enabled: true },
    { id: 3, name: "Dormitory", ipRange: "10.0.4.0/24", enabled: true },
    { id: 4, name: "Data Center", ipRange: "10.0.0.0/24", enabled: true },
    { id: 5, name: "Admin Office", ipRange: "10.0.1.0/24", enabled: true },
    { id: 6, name: "Student Wi-Fi", ipRange: "10.0.6.0/24", enabled: false },
  ]);
  const [areaVizEnabled, setAreaVizEnabled] = useState(true);

  // ---------- Security & Account ----------
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [sessionTimeout, setSessionTimeout] = useState(30); // minutes
  const lastLogin = "2025-03-22 08:30:15";
  const recentActivity = [
    "Logged in from 10.230.227.195",
    "Changed alert threshold to Medium",
    "Generated Weekly report",
  ];

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

  const handleZoneToggle = (id) => {
    setZones(zones.map((z) => (z.id === id ? { ...z, enabled: !z.enabled } : z)));
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      alert("New passwords do not match.");
      return;
    }
    if (passwordForm.new.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }
    alert("Password changed successfully (simulated).");
    setPasswordForm({ current: "", new: "", confirm: "" });
  };

  const handleSaveSettings = () => {
    alert("Settings saved (simulated).");
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">
          <div className="content-header">
            <h1>System Settings</h1>
            <p className="page-description">
              Configure alerting, notifications, ML models, zone mapping, and security preferences.
            </p>
          </div>

          <div className="settings-grid">
            {/* Alert Settings */}
            <div className="settings-card">
              <h3>
                <i className="bi bi-exclamation-triangle"></i> Alert Settings
              </h3>
              <div className="settings-section">
                <div className="setting-row">
                  <label>Severity Threshold</label>
                  <select
                    value={alertSeverityThreshold}
                    onChange={(e) => setAlertSeverityThreshold(e.target.value)}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
                <div className="setting-row">
                  <label>Min Confidence Score (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={minConfidence}
                    onChange={(e) => setMinConfidence(Number(e.target.value))}
                  />
                </div>
                <div className="setting-row">
                  <label>Enable Alert for Threat Types</label>
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
                <i className="bi bi-bell"></i> Notification Settings
              </h3>
              <div className="settings-section">
                <div className="setting-row">
                  <label>Channels</label>
                  <div className="checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={notificationChannels.dashboard}
                        onChange={() => handleChannelToggle("dashboard")}
                      />
                      Dashboard
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={notificationChannels.email}
                        onChange={() => handleChannelToggle("email")}
                      />
                      Email
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={notificationChannels.sms}
                        onChange={() => handleChannelToggle("sms")}
                      />
                      SMS
                    </label>
                  </div>
                </div>
                <div className="setting-row">
                  <label>Notify for Severities</label>
                  <div className="checkbox-group">
                    {Object.entries(notifySeverities).map(([sev, enabled]) => (
                      <label key={sev}>
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={() => handleSeverityNotifyToggle(sev)}
                        />
                        {sev}
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
                    Priority notifications only (Critical/High)
                  </label>
                </div>
              </div>
            </div>

            {/* ML Model Settings */}
            <div className="settings-card">
              <h3>
                <i className="bi bi-cpu"></i> Machine Learning Model
              </h3>
              <div className="settings-section">
                <div className="setting-row read-only">
                  <label>Active Model</label>
                  <span>{mlModel.activeModel}</span>
                </div>
                <div className="setting-row read-only">
                  <label>Accuracy</label>
                  <span>{mlModel.accuracy}%</span>
                </div>
                <div className="setting-row read-only">
                  <label>False Positive Rate</label>
                  <span>{mlModel.falsePositiveRate}%</span>
                </div>
                <div className="setting-row read-only">
                  <label>Last Trained</label>
                  <span>{mlModel.lastTrained}</span>
                </div>
                <div className="setting-row">
                  <label>
                    <input
                      type="checkbox"
                      checked={modelEnabled}
                      onChange={(e) => setModelEnabled(e.target.checked)}
                    />
                    Enable ML Detection
                  </label>
                </div>
              </div>
            </div>

            {/* Area / Zone Mapping */}
            <div className="settings-card">
              <h3>
                <i className="bi bi-map"></i> Zone Mapping
              </h3>
              <div className="settings-section">
                <div className="setting-row">
                  <label>
                    <input
                      type="checkbox"
                      checked={areaVizEnabled}
                      onChange={(e) => setAreaVizEnabled(e.target.checked)}
                    />
                    Enable Area‑Based Visualization
                  </label>
                </div>
                <div className="zone-list">
                  {zones.map((zone) => (
                    <div key={zone.id} className="zone-item">
                      <label>
                        <input
                          type="checkbox"
                          checked={zone.enabled}
                          onChange={() => handleZoneToggle(zone.id)}
                        />
                        {zone.name}
                      </label>
                      <span className="zone-ip">{zone.ipRange}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Security & Account Settings */}
            <div className="settings-card">
              <h3>
                <i className="bi bi-shield-lock"></i> Security & Account
              </h3>
              <div className="settings-section">
                <form onSubmit={handleSavePassword}>
                  <div className="setting-row">
                    <label>Current Password</label>
                    <input
                      type="password"
                      name="current"
                      value={passwordForm.current}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="setting-row">
                    <label>New Password</label>
                    <input
                      type="password"
                      name="new"
                      value={passwordForm.new}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="setting-row">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      name="confirm"
                      value={passwordForm.confirm}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary">
                    Change Password
                  </button>
                </form>
                <hr />
                <div className="setting-row">
                  <label>Session Timeout (minutes)</label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(Number(e.target.value))}
                  />
                </div>
                <div className="setting-row read-only">
                  <label>Last Login</label>
                  <span>{lastLogin}</span>
                </div>
                <div className="setting-row read-only">
                  <label>Recent Activity</label>
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
              Save All Settings
            </button>
          </div>
        </div>
      </div>
    </>
  );
}