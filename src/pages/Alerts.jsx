import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";
import "./Alerts.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

export default function Alerts() {
  const { t } = useTranslation();
  // ---------- Mock Data (Aligned with Schema) ----------
  const [alerts, setAlerts] = useState([
    {
      // --- Schema fields ---
      threatId: "THR-001",                     // reference to Threat document
      message: "Large-scale DDoS attack targeting admin network.",
      priority: "Critical",                     // enum: Low, Medium, High, Critical
      status: "Active",                          // enum: Active, Acknowledged, Resolved (default Active)
      createdAt: "2025-03-20T10:45:23Z",        // ISO string

      // --- Extra UI fields (not in schema) ---
      id: "ALT-001",                             // for display
      threatType: "DDoS Attack",
      severity: "Critical",
      confidence: 98,
      sourceIP: "192.168.1.105",
      location: "Admin Building",
      deliveryMethod: "Dashboard, SMS",
      deliveryStatus: "Delivered",
      channel: "SMS",
      classification: "Volumetric DDoS",
      severityExplanation: "Multiple SYN floods from diverse sources.",
      confidenceMeaning: "Very high confidence based on traffic patterns.",
      logId: "LOG-98372",
      recommendedAction: "Block source IPs and enable rate limiting.",
    },
    {
      threatId: "THR-002",
      message: "Malware signature detected on Library server.",
      priority: "High",
      status: "Active",
      createdAt: "2025-03-20T09:22:17Z",
      id: "ALT-002",
      threatType: "Malware",
      severity: "High",
      confidence: 87,
      sourceIP: "10.0.0.23",
      location: "Library",
      deliveryMethod: "Dashboard, Email",
      deliveryStatus: "Sent",
      channel: "Email",
      classification: "Trojan.Generic",
      severityExplanation: "Known malware attempting to communicate with C2.",
      confidenceMeaning: "High confidence based on signature match.",
      logId: "LOG-98373",
      recommendedAction: "Quarantine the server and run antivirus.",
    },
    {
      threatId: "THR-003",
      message: "Repeated failed login attempts from lab machine.",
      priority: "Medium",
      status: "Acknowledged",                    // was "Investigating", now using schema enum
      createdAt: "2025-03-19T15:15:02Z",
      id: "ALT-003",
      threatType: "Unauthorized Access",
      severity: "Medium",
      confidence: 76,
      sourceIP: "172.16.0.45",
      location: "Computer Lab 3",
      deliveryMethod: "Dashboard",
      deliveryStatus: "Delivered",
      channel: "Dashboard",
      classification: "Brute-force attempt",
      severityExplanation: "Multiple failed logins on student records system.",
      confidenceMeaning: "Moderate confidence; pattern matches brute-force.",
      logId: "LOG-98374",
      recommendedAction: "Investigate user activity and block IP if needed.",
    },
    {
      threatId: "THR-004",
      message: "Port scan detected from dormitory subnet.",
      priority: "Low",
      status: "Resolved",
      createdAt: "2025-03-19T11:30:44Z",
      id: "ALT-004",
      threatType: "Port Scanning",
      severity: "Low",
      confidence: 65,
      sourceIP: "192.168.2.101",
      location: "Student Dorm A",
      deliveryMethod: "Dashboard",
      deliveryStatus: "Delivered",
      channel: "Dashboard",
      classification: "Reconnaissance",
      severityExplanation: "Scanning common ports, no exploitation.",
      confidenceMeaning: "Low confidence; could be benign scanning tool.",
      logId: "LOG-98375",
      recommendedAction: "Monitor for further activity.",
    },
    {
      threatId: "THR-005",
      message: "Brute force attack on finance system.",
      priority: "Critical",
      status: "Active",
      createdAt: "2025-03-20T12:05:11Z",
      id: "ALT-005",
      threatType: "Brute Force",
      severity: "Critical",
      confidence: 95,
      sourceIP: "45.128.34.12",
      location: "External",
      deliveryMethod: "Dashboard, SMS, Email",
      deliveryStatus: "Failed",
      channel: "SMS",
      classification: "Credential stuffing",
      severityExplanation: "High number of login attempts from many IPs.",
      confidenceMeaning: "Very high confidence based on velocity and known patterns.",
      logId: "LOG-98376",
      recommendedAction: "Enable CAPTCHA and notify finance team.",
    },
  ]);

  // ---------- State for Filters & Selection ----------
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterSeverity, setFilterSeverity] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterConfidenceMin, setFilterConfidenceMin] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeRange, setTimeRange] = useState("24h"); // '24h', '7d', '30d'

  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);

  // ---------- Derived Stats for Summary Cards ----------
  // Using createdAt to filter "today" (simplified for mock)
  const totalToday = alerts.filter(a => a.createdAt.startsWith("2025-03-20")).length;
  const activeAlerts = alerts.filter(a => a.status === "Active").length;
  const criticalHigh = alerts.filter(a => a.priority === "Critical" || a.priority === "High").length;
  const resolved = alerts.filter(a => a.status === "Resolved").length;

  // ---------- Filtered Alerts ----------
  const filteredAlerts = alerts.filter(alert => {
    const matchesPriority = filterPriority === "All" || alert.priority === filterPriority;
    const matchesSeverity = filterSeverity === "All" || alert.severity === filterSeverity;
    const matchesStatus = filterStatus === "All" || alert.status === filterStatus;
    const matchesConfidence = alert.confidence >= filterConfidenceMin;
    const matchesSearch =
      searchTerm === "" ||
      alert.sourceIP.includes(searchTerm) ||
      alert.threatType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    // Time range filter would be more complex in real app
    return matchesPriority && matchesSeverity && matchesStatus && matchesConfidence && matchesSearch;
  });

  // ---------- Chart Data (unchanged, based on extra fields) ----------
  const severityCounts = {
    Critical: alerts.filter(a => a.severity === "Critical").length,
    High: alerts.filter(a => a.severity === "High").length,
    Medium: alerts.filter(a => a.severity === "Medium").length,
    Low: alerts.filter(a => a.severity === "Low").length,
  };
  const pieData = {
    labels: ["Critical", "High", "Medium", "Low"],
    datasets: [
      {
        data: [severityCounts.Critical, severityCounts.High, severityCounts.Medium, severityCounts.Low],
        backgroundColor: ["#ef4444", "#f59e0b", "#eab308", "#10b981"],
        borderWidth: 0,
      },
    ],
  };

  const timeLabels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"];
  const timeData = [2, 5, 8, 12, 7, 3];
  const lineData = {
    labels: timeLabels,
    datasets: [
      {
        label: "Alerts",
        data: timeData,
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const threatCounts = alerts.reduce((acc, alert) => {
    acc[alert.threatType] = (acc[alert.threatType] || 0) + 1;
    return acc;
  }, {});
  const topThreats = Object.entries(threatCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const barData = {
    labels: topThreats.map(t => t[0]),
    datasets: [
      {
        label: "Occurrences",
        data: topThreats.map(t => t[1]),
        backgroundColor: "#60a5fa",
      },
    ],
  };

  const ipCounts = alerts.reduce((acc, alert) => {
    acc[alert.sourceIP] = (acc[alert.sourceIP] || 0) + 1;
    return acc;
  }, {});
  const topIPs = Object.entries(ipCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // ---------- Helper Functions ----------
  const getPriorityBadge = (priority) => {
    const classes = {
      Critical: "badge-critical",
      High: "badge-high",
      Medium: "badge-medium",
      Low: "badge-low",
    };
    const labelKeys = {
      Critical: "critical",
      High: "high",
      Medium: "medium",
      Low: "low",
    };
    return <span className={`badge ${classes[priority]}`}>{t(labelKeys[priority] || priority)}</span>;
  };

  const getStatusBadge = (status) => {
    const classes = {
      Active: "badge-active",
      Acknowledged: "badge-acknowledged",      // added for schema enum
      Resolved: "badge-resolved",
    };
    const statusKeys = {
      Active: "active",
      Acknowledged: "acknowledged",
      Resolved: "resolved",
    };
    return <span className={`badge ${classes[status] || "badge-default"}`}>{t(statusKeys[status] || status)}</span>;
  };

  const getDeliveryBadge = (status) => {
    const deliveryKeys = {
      Delivered: "delivered",
      Sent: "sent",
      Failed: "failed",
    };
    return (
      <span className={`delivery-badge ${status.toLowerCase()}`}>
        {t(deliveryKeys[status] || status)}
      </span>
    );
  };

  const handleAcknowledge = (id) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, status: "Acknowledged" } : a));
  };
  const handleInvestigate = (id) => {
    // In schema we don't have "Investigating", so we set to "Active" (or could keep as Acknowledged)
    // For UI consistency, we might map "Investigate" to "Acknowledged"
    setAlerts(alerts.map(a => a.id === id ? { ...a, status: "Acknowledged" } : a));
  };
  const handleResolve = (id) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, status: "Resolved" } : a));
  };
  const handleFalsePositive = (id) => {
    // Could set status to "Resolved" or keep as is; for mock we'll just log
    console.log("False positive", id);
  };

  const handleExport = () => {
    // Export filtered alerts to CSV
    const csvContent = [
      [t("id"), t("timestamp"), t("priority"), t("threatType"), t("severity"), t("confidence"), t("sourceIP"), t("location"), t("status"), t("delivery")],
      ...filteredAlerts.map(alert => [
        alert.id,
        new Date(alert.createdAt).toLocaleString(),
        alert.priority,
        alert.threatType,
        alert.severity,
        `${alert.confidence}%`,
        alert.sourceIP,
        alert.location,
        alert.status,
        `${alert.deliveryMethod} via ${alert.channel}`
      ])
    ].map(row => row.map(cell => `"${cell || ''}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `alerts_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAcknowledgeAll = () => {
    // Acknowledge all active alerts
    setAlerts(alerts.map(alert => 
      alert.status === "Active" ? { ...alert, status: "Acknowledged" } : alert
    ));
  };

  const handleRowClick = (alert) => {
    setSelectedAlert(alert);
    setShowDetailsPanel(true);
  };

  // ---------- System Health Mock ----------
  const mlStatus = "Running";
  const lastAlertReceived = alerts.length > 0 ? new Date(alerts[0].createdAt).toLocaleString() : "None";
  const systemUptime = "99.97%";

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">
          {/* Header */}
          <div className="content-header">
            <h1>{t("alertDashboard")}</h1>
            <div className="search-bar">
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder={t("searchAlertsPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Summary Cards */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon"><i className="bi bi-calendar-day"></i></div>
              <div className="metric-content">
                <span className="metric-label">{t("totalAlertsToday")}</span>
                <span className="metric-value">{totalToday}</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon"><i className="bi bi-exclamation-triangle"></i></div>
              <div className="metric-content">
                <span className="metric-label">{t("activeAlerts")}</span>
                <span className="metric-value">{activeAlerts}</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon"><i className="bi bi-shield-exclamation"></i></div>
              <div className="metric-content">
                <span className="metric-label">{t("highCritical")}</span>
                <span className="metric-value">{criticalHigh}</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon"><i className="bi bi-check-circle"></i></div>
              <div className="metric-content">
                <span className="metric-label">{t("resolved")}</span>
                <span className="metric-value">{resolved}</span>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="filters-bar">
            <div className="filter-group">
              <label>{t("priority")}</label>
              <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
                <option value="All">{t("all")}</option>
                <option value="Critical">{t("critical")}</option>
                <option value="High">{t("high")}</option>
                <option value="Medium">{t("medium")}</option>
                <option value="Low">{t("low")}</option>
              </select>
            </div>
            <div className="filter-group">
              <label>{t("severity")}</label>
              <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
                <option value="All">{t("all")}</option>
                <option value="Critical">{t("critical")}</option>
                <option value="High">{t("high")}</option>
                <option value="Medium">{t("medium")}</option>
                <option value="Low">{t("low")}</option>
              </select>
            </div>
            <div className="filter-group">
              <label>{t("status")}</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="All">{t("all")}</option>
                <option value="Active">{t("active")}</option>
                <option value="Acknowledged">{t("acknowledged")}</option>
                <option value="Resolved">{t("resolved")}</option>
              </select>
            </div>
            <div className="filter-group">
              <label>{t("minConfidence")}</label>
              <select value={filterConfidenceMin} onChange={(e) => setFilterConfidenceMin(Number(e.target.value))}>
                <option value={0}>{t("any")}</option>
                <option value={70}>≥70%</option>
                <option value={80}>≥80%</option>
                <option value={90}>≥90%</option>
              </select>
            </div>
            <div className="filter-group">
              <label>{t("timeRange")}</label>
              <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                <option value="24h">{t("last24Hours")}</option>
                <option value="7d">{t("last7Days")}</option>
                <option value="30d">{t("last30Days")}</option>
              </select>
            </div>
          </div>

          {/* Main Content: Table and Details Panel Side-by-Side */}
          <div className="alerts-main">
            {/* Table Section */}
            <div className={`alerts-table-section ${showDetailsPanel ? "with-details" : ""}`}>
              <div className="card alerts-card">
                <div className="card-header">
                  <h3>{t("realTimeAlerts")}</h3>
                  <div className="card-actions">
                    <button className="btn-outline" onClick={handleExport}>{t("export")}</button>
                    <button className="btn-primary" onClick={handleAcknowledgeAll}>{t("acknowledgeAll")}</button>
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="alerts-table">
                    <thead>
                      <tr>
                        <th>{t("id")}</th>
                        <th>{t("timestamp")}</th>
                        <th>{t("priority")}</th>
                        <th>{t("threatType")}</th>
                        <th>{t("severity")}</th>
                        <th>{t("confidence")}</th>
                        <th>{t("sourceIP")}</th>
                        <th>{t("location")}</th>
                        <th>{t("status")}</th>
                        <th>{t("delivery")}</th>
                        <th>{t("actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAlerts.map(alert => (
                        <tr
                          key={alert.id}
                          onClick={() => handleRowClick(alert)}
                          className={alert.priority === "Critical" ? "critical-row" : ""}
                        >
                          <td><span className="alert-id">{alert.id}</span></td>
                          <td>{new Date(alert.createdAt).toLocaleString()}</td>
                          <td>{getPriorityBadge(alert.priority)}</td>
                          <td>{alert.threatType}</td>
                          <td>{alert.severity}</td>
                          <td><span className="confidence">{alert.confidence}%</span></td>
                          <td>{alert.sourceIP}</td>
                          <td>{alert.location}</td>
                          <td>{getStatusBadge(alert.status)}</td>
                          <td>
                            <div>{alert.deliveryMethod}</div>
                            <small className="delivery-detail">
                              {getDeliveryBadge(alert.deliveryStatus)} via {alert.channel}
                            </small>
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <div className="alert-actions">
                              {alert.status === "Active" && (
                                <>
                                  <button className="btn-icon" title={t("acknowledge")} onClick={() => handleAcknowledge(alert.id)}><i className="bi bi-check-lg"></i></button>
                                  <button className="btn-icon" title={t("investigate")} onClick={() => handleInvestigate(alert.id)}><i className="bi bi-search"></i></button>
                                </>
                              )}
                              {alert.status !== "Resolved" && (
                                <button className="btn-icon" title={t("resolve")} onClick={() => handleResolve(alert.id)}><i className="bi bi-check2-circle"></i></button>
                              )}
                              <button className="btn-icon" title={t("falsePositive")} onClick={() => handleFalsePositive(alert.id)}><i className="bi bi-x-circle"></i></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Details Panel (visible when alert selected) */}
            {showDetailsPanel && selectedAlert && (
              <div className="details-panel">
                <div className="details-header">
                  <h4>{t("alertDetails")}</h4>
                  <button className="btn-icon" onClick={() => setShowDetailsPanel(false)}><i className="bi bi-x-lg"></i></button>
                </div>
                <div className="details-content">
                  <p><strong>{t("id")}:</strong> {selectedAlert.id}</p>
                  <p><strong>{t("threatId")}:</strong> {selectedAlert.threatId}</p>
                  <p><strong>{t("message")}:</strong> {selectedAlert.message}</p>
                  <p><strong>{t("priority")}:</strong> {selectedAlert.priority}</p>
                  <p><strong>{t("status")}:</strong> {selectedAlert.status}</p>
                  <p><strong>{t("createdAt")}:</strong> {new Date(selectedAlert.createdAt).toLocaleString()}</p>
                  <p><strong>{t("classification")}:</strong> {selectedAlert.classification}</p>
                  <p><strong>{t("severityExplanation")}:</strong> {selectedAlert.severityExplanation}</p>
                  <p><strong>{t("confidenceMeaning")}:</strong> {selectedAlert.confidenceMeaning}</p>
                  <p><strong>{t("logId")}:</strong> {selectedAlert.logId}</p>
                  <p><strong>{t("recommendedAction")}:</strong> {selectedAlert.recommendedAction}</p>
                  <p><strong>{t("campusLocation")}:</strong> {selectedAlert.location}</p>
                  <p><strong>{t("deliveryStatus")}:</strong> {selectedAlert.deliveryStatus} {t("via")} {selectedAlert.channel}</p>
                </div>
                <div className="details-actions">
                  <button className="btn-primary">{t("takeAction")}</button>
                </div>
              </div>
            )}
          </div>

          {/* Statistics & Charts Section */}
          <div className="stats-section">
            <h2>{t("alertAnalytics")}</h2>
            <div className="charts-grid">
              <div className="chart-card">
                <h4>{t("alertsBySeverity")}</h4>
                <Pie data={pieData} options={{ plugins: { legend: { position: "bottom" } } }} />
              </div>
              <div className="chart-card">
                <h4>{t("alertsOverTimeToday")}</h4>
                <Line data={lineData} options={{ scales: { y: { beginAtZero: true } } }} />
              </div>
              <div className="chart-card">
                <h4>{t("topThreatTypes")}</h4>
                <Bar data={barData} options={{ indexAxis: "y", plugins: { legend: { display: false } } }} />
              </div>
              <div className="chart-card">
                <h4>{t("highRiskIPSources")}</h4>
                <ul className="ip-list">
                  {topIPs.map(([ip, count]) => (
                    <li key={ip}><span>{ip}</span> <span className="badge">{count} {t("alerts")}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* System Health Indicator */}
          <div className="system-health">
            <div className="health-item">
              <i className="bi bi-cpu"></i>
              <span>{t("mlEngine")} <strong className="status-running">{mlStatus}</strong></span>
            </div>
            <div className="health-item">
              <i className="bi bi-clock"></i>
              <span>{t("lastAlert")}: {lastAlertReceived}</span>
            </div>
            <div className="health-item">
              <i className="bi bi-arrow-up-circle"></i>
              <span>{t("systemUptime")} {systemUptime}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}