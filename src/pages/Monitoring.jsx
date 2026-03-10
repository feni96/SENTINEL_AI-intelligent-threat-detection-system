import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "./Monitoring.css";

export default function Monitoring() {
  // ---------- Mock Data ----------
  const [ingestion] = useState({
    status: "Active",
    sources: [
      { name: "Core Router (HU-Main)", lastLog: "2025-03-24 10:45:23", status: "Active" },
      { name: "Library Gateway", lastLog: "2025-03-24 10:42:17", status: "Active" },
      { name: "Admin Server", lastLog: "2025-03-24 10:40:02", status: "Active" },
      { name: "Dormitory Switch", lastLog: "2025-03-24 10:38:45", status: "Active" },
      { name: "Data Center Firewall", lastLog: "2025-03-24 10:30:11", status: "Inactive" },
    ],
    lastReceived: "2025-03-24 10:45:23",
  });

  const [aiStatus] = useState({
    mlProcess: "Running",
    logsAnalyzed: 15420,
    lastExecution: "2025-03-24 10:45:00",
  });

  const [systemHealth] = useState({
    uptime: "99.97%",
    errors: 0,
    pipelineStatus: "Operational",
  });

  // Helper for status badges
  const getStatusBadge = (status) => {
    const className = status === "Active" || status === "Running" || status === "Operational"
      ? "status-active"
      : "status-inactive";
    return <span className={`status-badge ${className}`}>{status}</span>;
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">
          <div className="content-header">
            <h1>System Monitoring</h1>
            <p className="page-description">
              Real‑time visibility of data ingestion, AI analysis, and system health.
            </p>
          </div>

          {/* Top Metrics Cards */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon"><i className="bi bi-database"></i></div>
              <div className="metric-content">
                <span className="metric-label">Ingestion Status</span>
                <span className="metric-value">{getStatusBadge(ingestion.status)}</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon"><i className="bi bi-cpu"></i></div>
              <div className="metric-content">
                <span className="metric-label">ML Process</span>
                <span className="metric-value">{getStatusBadge(aiStatus.mlProcess)}</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon"><i className="bi bi-graph-up"></i></div>
              <div className="metric-content">
                <span className="metric-label">Logs Analyzed</span>
                <span className="metric-value">{aiStatus.logsAnalyzed.toLocaleString()}</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon"><i className="bi bi-arrow-up-circle"></i></div>
              <div className="metric-content">
                <span className="metric-label">System Uptime</span>
                <span className="metric-value">{systemHealth.uptime}</span>
              </div>
            </div>
          </div>

          {/* Two-column layout for detailed status */}
          <div className="monitoring-grid">
            {/* Data Ingestion Monitoring */}
            <div className="card">
              <h3><i className="bi bi-hdd-stack"></i> Data Ingestion</h3>
              <div className="ingestion-summary">
                <div className="summary-row">
                  <span className="summary-label">Overall Status:</span>
                  <span className="summary-value">{getStatusBadge(ingestion.status)}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Last Log Received:</span>
                  <span className="summary-value">{ingestion.lastReceived}</span>
                </div>
              </div>
              <h4>Log Sources</h4>
              <table className="source-table">
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Last Log</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ingestion.sources.map((source, idx) => (
                    <tr key={idx}>
                      <td>{source.name}</td>
                      <td>{source.lastLog}</td>
                      <td>{getStatusBadge(source.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* AI Analysis Status & System Health */}
            <div className="card">
              <h3><i className="bi bi-robot"></i> AI Analysis</h3>
              <div className="ai-details">
                <div className="detail-row">
                  <span className="detail-label">ML Process:</span>
                  <span className="detail-value">{getStatusBadge(aiStatus.mlProcess)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Logs Analyzed:</span>
                  <span className="detail-value">{aiStatus.logsAnalyzed.toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Last Execution:</span>
                  <span className="detail-value">{aiStatus.lastExecution}</span>
                </div>
              </div>

              <h3 style={{ marginTop: "2rem" }}><i className="bi bi-heart-pulse"></i> System Health</h3>
              <div className="health-details">
                <div className="detail-row">
                  <span className="detail-label">Uptime:</span>
                  <span className="detail-value">{systemHealth.uptime}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Errors:</span>
                  <span className="detail-value">{systemHealth.errors}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Pipeline Status:</span>
                  <span className="detail-value">{getStatusBadge(systemHealth.pipelineStatus)}</span>
                </div>
              </div>

              {/* Optional: simple pipeline diagram */}
              <div className="pipeline-diagram">
                <div className="pipeline-step active">
                  <i className="bi bi-database"></i>
                  <span>Logs</span>
                </div>
                <i className="bi bi-arrow-right"></i>
                <div className="pipeline-step active">
                  <i className="bi bi-cpu"></i>
                  <span>ML</span>
                </div>
                <i className="bi bi-arrow-right"></i>
                <div className="pipeline-step active">
                  <i className="bi bi-graph-up"></i>
                  <span>Analysis</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}