import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "./AIModel.css";

export default function AIModel() {
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
    alert(`Model ${modelEnabled ? "disabled" : "enabled"} (simulated).`);
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
            <h1>AI Model Monitoring</h1>
            <p className="page-description">
              Track model health, performance, and reliability for trustworthy threat detection.
            </p>
          </div>

          {/* Model Selector & Status */}
          <div className="model-selector-card">
            <div className="model-selector">
              <label htmlFor="modelSelect">Active Model</label>
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
                {modelEnabled ? "Active" : "Inactive"}
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
                <span className="metric-label">Model Name</span>
                <span className="metric-value">{activeModel.name}</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon"><i className="bi bi-tag"></i></div>
              <div className="metric-content">
                <span className="metric-label">Version</span>
                <span className="metric-value">{activeModel.version}</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon"><i className="bi bi-bar-chart"></i></div>
              <div className="metric-content">
                <span className="metric-label">Type</span>
                <span className="metric-value">{activeModel.type}</span>
              </div>
            </div>
          </div>

          {/* Performance & Usage Cards */}
          <div className="two-column-grid">
            {/* Performance Metrics */}
            <div className="card">
              <h3>
                <i className="bi bi-graph-up"></i> Performance Metrics
              </h3>
              <div className="stats-list">
                <div className="stat-row">
                  <span className="stat-label">Detection Accuracy</span>
                  <span className="stat-value">{activeModel.accuracy}%</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">False Positive Rate</span>
                  <span className="stat-value">{activeModel.falsePositiveRate}%</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Last Trained</span>
                  <span className="stat-value">{activeModel.lastTrained}</span>
                </div>
              </div>
            </div>

            {/* Usage Statistics */}
            <div className="card">
              <h3>
                <i className="bi bi-hdd-stack"></i> Usage Statistics
              </h3>
              <div className="stats-list">
                <div className="stat-row">
                  <span className="stat-label">Logs Processed</span>
                  <span className="stat-value">{activeModel.logsProcessed.toLocaleString()}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Threats Detected</span>
                  <span className="stat-value">{activeModel.threatsDetected}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Avg Confidence</span>
                  <span className="stat-value">{activeModel.avgConfidence}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Detections (optional, adds transparency) */}
          <div className="card">
            <h3>
              <i className="bi bi-clock-history"></i> Recent Detections (Last 4)
            </h3>
            <table className="detection-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Threat Type</th>
                  <th>Confidence</th>
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
              <i className="bi bi-info-circle"></i> The AI Model provides visibility into model status, accuracy, and reliability to ensure trustworthy machine‑learning‑based threat detection without exposing complex model controls.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}