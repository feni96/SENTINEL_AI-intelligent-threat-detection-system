import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function Monitoring() {
  const { t } = useTranslation();
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
          {/* Header removed as requested */}

          {/* Top Metrics Cards */}
          <div className="realtime-grid">
            <div className="realtime-metric-card">
              <div className="realtime-icon database"></div>
              <div className="realtime-content">
                <span className="realtime-label">{t("ingestionStatus")}</span>
                <span className="realtime-value">{getStatusBadge(ingestion.status)}</span>
              </div>
            </div>
            <div className="realtime-metric-card">
              <div className="realtime-icon cpu"></div>
              <div className="realtime-content">
                <span className="realtime-label">{t("mlProcess")}</span>
                <span className="realtime-value">{getStatusBadge(aiStatus.mlProcess)}</span>
              </div>
            </div>
            <div className="realtime-metric-card">
              <div className="realtime-icon graph"></div>
              <div className="realtime-content">
                <span className="realtime-label">{t("logsAnalyzed")}</span>
                <span className="realtime-value">{aiStatus.logsAnalyzed.toLocaleString()}</span>
              </div>
            </div>
            <div className="realtime-metric-card">
              <div className="realtime-icon system"></div>
              <div className="realtime-content">
                <span className="realtime-label">{t("systemUptime")}</span>
                <span className="realtime-value">{systemHealth.uptime}</span>
              </div>
            </div>
          </div>

          {/* Two-column layout for detailed status */}
          <div className="monitoring-grid">
            {/* Data Ingestion Monitoring */}
            <div className="card">
              <h3><i className="bi bi-hdd-stack"></i> {t("dataIngestion")}</h3>
              <div className="ingestion-summary">
                <div className="summary-row">
                  <span className="summary-label">{t("overallStatus")}:</span>
                  <span className="summary-value">{getStatusBadge(ingestion.status)}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">{t("lastLogReceived")}:</span>
                  <span className="summary-value">{ingestion.lastReceived}</span>
                </div>
              </div>
              <h4>{t("logSources")}</h4>
              <table className="source-table">
                <thead>
                  <tr>
                    <th>{t("source")}</th>
                    <th>{t("lastLog")}</th>
                    <th>{t("status")}</th>
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
              <h3><i className="bi bi-robot"></i> {t("aiAnalysis")}</h3>
              <div className="ai-details">
                <div className="detail-row">
                  <span className="detail-label">{t("mlProcess")}:</span>
                  <span className="detail-value">{getStatusBadge(aiStatus.mlProcess)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t("logsAnalyzed")}:</span>
                  <span className="detail-value">{aiStatus.logsAnalyzed.toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t("lastExecution")}:</span>
                  <span className="detail-value">{aiStatus.lastExecution}</span>
                </div>
              </div>

              <h3 style={{ marginTop: "2rem" }}><i className="bi bi-heart-pulse"></i> {t("systemHealth")}</h3>
              <div className="health-details">
                <div className="detail-row">
                  <span className="detail-label">{t("systemUptime")}:</span>
                  <span className="detail-value">{systemHealth.uptime}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t("errors")}:</span>
                  <span className="detail-value">{systemHealth.errors}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t("pipelineStatus")}:</span>
                  <span className="detail-value">{getStatusBadge(systemHealth.pipelineStatus)}</span>
                </div>
              </div>

              {/* Optional: simple pipeline diagram */}
              <div className="pipeline-diagram">
                <div className="pipeline-step active">
                  <i className="bi bi-database"></i>
                  <span>{t("logs")}</span>
                </div>
                <i className="bi bi-arrow-right"></i>
                <div className="pipeline-step active">
                  <i className="bi bi-cpu"></i>
                  <span>{t("ml")}</span>
                </div>
                <i className="bi bi-arrow-right"></i>
                <div className="pipeline-step active">
                  <i className="bi bi-graph-up"></i>
                  <span>{t("analysis")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}