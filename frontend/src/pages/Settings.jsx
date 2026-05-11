import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

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
      alert(t("newPasswordsDoNotMatch"));
      return;
    }
    if (passwordForm.new.length < 8) {
      alert(t("passwordMustBeAtLeast8Characters"));
      return;
    }
    alert(t("passwordChangedSuccessfully"));
    setPasswordForm({ current: "", new: "", confirm: "" });
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
                <i className="bi bi-shield-lock"></i> {t("securityAndAccount")}
              </h3>
              <div className="settings-section">
                <form onSubmit={handleSavePassword}>
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