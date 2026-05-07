import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "./AIModel.css";

export default function AIModel() {
  const { t } = useTranslation();
  // ---------- Mock Data ----------
  const [models] = useState([
    {
      id: 1,
      name: "Random Forest + CNN Ensemble",
      type: "Ensemble (Random Forest + CNN)",
      version: "2.1.0",
      status: "Active",
      accuracy: 98.2,
      falsePositiveRate: 1.8,
      lastTrained: "2025-03-15",
      logsProcessed: 15420,
      threatsDetected: 127,
      avgConfidence: 86.4,
    },
    {
      id: 2,
      name: "Isolation Forest (Anomaly Detector)",
      type: "Unsupervised",
      version: "1.3.2",
      status: "Inactive",
      accuracy: 92.5,
      falsePositiveRate: 4.2,
      lastTrained: "2025-02-28",
      logsProcessed: 8320,
      threatsDetected: 89,
      avgConfidence: 74.1,
    },
  ]);

  const [activeModelId, setActiveModelId] = useState(1);
  const activeModel = models.find((m) => m.id === activeModelId) || models[0];

  // ---------- Simulated Toggle ----------
  const [modelEnabled, setModelEnabled] = useState(true);
  const handleToggle = () => {
    setModelEnabled(!modelEnabled);
    alert(t("modelEnabled", { status: modelEnabled ? "disabled" : "enabled" }));
  };

  // ---------- Last Detections (mock) ----------
  const lastDetections = [
    { time: "10:45:23", threat: "DDoS Attack", confidence: 98 },
    { time: "09:22:17", threat: "Malware", confidence: 87 },
    { time: "08:10:05", threat: "Brute Force", confidence: 95 },
    { time: "07:30:44", threat: "Port Scanning", confidence: 65 },
  ];

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">
          <div className="content-header">
            <h1>{t("aiModelMonitoring")}</h1>
            <p className="page-description">
              {t("aiModelDescription")}
            </p>
          </div>

          {/* Model Selector & Status */}
          <div className="model-selector-card">
            <div className="model-selector">
              <label htmlFor="modelSelect">{t("activeModel")}</label>
              <select
                id="modelSelect"
                value={activeModelId}
                onChange={(e) => setActiveModelId(Number(e.target.value))}
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} (v{m.version})
                  </option>
                ))}
              </select>
            </div>
            <div className="model-toggle">
              <span className={`status-badge ${modelEnabled ? "active" : "inactive"}`}>
                {modelEnabled ? t("active") : t("inactive")}
              </span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={modelEnabled}
                  onChange={handleToggle}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>

          {/* Main Metrics Grid */}
          <div className="metrics-grid">
            {/* Active Model Overview */}
            <div className="metric-card">
              <div className="metric-icon"><i className="bi bi-cpu"></i></div>
              <div className="metric-content">
                <span className="metric-label">{t("modelName")}</span>
                <span className="metric-value">{activeModel.name}</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon"><i className="bi bi-tag"></i></div>
              <div className="metric-content">
                <span className="metric-label">{t("version")}</span>
                <span className="metric-value">{activeModel.version}</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon"><i className="bi bi-bar-chart"></i></div>
              <div className="metric-content">
                <span className="metric-label">{t("type")}</span>
                <span className="metric-value">{activeModel.type}</span>
              </div>
            </div>
          </div>

          {/* Performance & Usage Cards */}
          <div className="two-column-grid">
            {/* Performance Metrics */}
            <div className="card">
              <h3>
                <i className="bi bi-graph-up"></i> {t("performanceMetrics")}
              </h3>
              <div className="stats-list">
                <div className="stat-row">
                  <span className="stat-label">{t("detectionAccuracy")}</span>
                  <span className="stat-value">{activeModel.accuracy}%</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">{t("falsePositiveRate")}</span>
                  <span className="stat-value">{activeModel.falsePositiveRate}%</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">{t("lastTrainedDate")}</span>
                  <span className="stat-value">{activeModel.lastTrained}</span>
                </div>
              </div>
            </div>

            {/* Usage Statistics */}
            <div className="card">
              <h3>
                <i className="bi bi-hdd-stack"></i> {t("usageStatistics")}
              </h3>
              <div className="stats-list">
                <div className="stat-row">
                  <span className="stat-label">{t("logsProcessed")}</span>
                  <span className="stat-value">{activeModel.logsProcessed.toLocaleString()}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">{t("threatsDetected")}</span>
                  <span className="stat-value">{activeModel.threatsDetected}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">{t("avgConfidence")}</span>
                  <span className="stat-value">{activeModel.avgConfidence}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Detections (optional, adds transparency) */}
          <div className="card">
            <h3>
              <i className="bi bi-clock-history"></i> {t("recentDetections")}
            </h3>
            <table className="detection-table">
              <thead>
                <tr>
                  <th>{t("time")}</th>
                  <th>{t("threatType")}</th>
                  <th>{t("confidence")}</th>
                </tr>
              </thead>
              <tbody>
                {lastDetections.map((d, idx) => (
                  <tr key={idx}>
                    <td>{d.time}</td>
                    <td>{d.threat}</td>
                    <td>
                      <span className="confidence-badge">{d.confidence}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* One‑Line Viva Explanation */}
          <div className="info-note">
            <p>
              <i className="bi bi-info-circle"></i> {t("aiModelInfo")}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}