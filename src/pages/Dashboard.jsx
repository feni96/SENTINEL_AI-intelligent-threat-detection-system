import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "./Dashboard.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const { t } = useTranslation();
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage or system preference
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Toggle dark mode and update DOM + localStorage
  const toggleDarkMode = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Apply initial dark mode class on mount
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Traffic history data
  const trafficLabels = [
    t("trafficHistoryLabel1"),
    t("trafficHistoryLabel2"),
    t("trafficHistoryLabel3"),
    t("trafficHistoryLabel4"),
    "2025/10/22 16:15",
  ];
  const trafficData = {
    labels: trafficLabels,
    datasets: [
      {
        label: t("inboundTraffic"),
        data: [3200, 4100, 2800, 4870],
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#2563eb",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Mbps" },
      },
    },
  };

  // Sample threat data
  const recentThreats = [
    {
      id: "THR-2023-0012",
      type: "DDoS Attack",
      severity: "Critical",
      sourceIP: "192.168.1.105",
      location: "Admin Building",
      time: "10:45 AM",
      confidence: "98%",
    },
    {
      id: "THR-2023-0011",
      type: "Malware",
      severity: "High",
      sourceIP: "10.0.0.23",
      location: "Library",
      time: "09:22 AM",
      confidence: "87%",
    },
    {
      id: "THR-2023-0010",
      type: "Unauthorized Access",
      severity: "Medium",
      sourceIP: "172.16.0.45",
      location: "Computer Lab 3",
      time: "Yesterday, 3:15 PM",
      confidence: "76%",
    },
    {
      id: "THR-2023-0009",
      type: "Port Scanning",
      severity: "Low",
      sourceIP: "192.168.2.101",
      location: "Student Dorm A",
      time: "Yesterday, 11:30 AM",
      confidence: "65%",
    },
  ];

  const getSeverityBadge = (severity) => {
    const classes = {
      Critical: "badge-critical",
      High: "badge-high",
      Medium: "badge-medium",
      Low: "badge-low",
    };
    return <span className={`badge ${classes[severity]}`}>{severity}</span>;
  };

  // Action handlers for threat table
  const handleFilter = () => {
    // Open filter modal or show filter options
    console.log("Filter threats clicked");
    // You can implement a modal or expand filter section here
  };
  const handleInvestigate = (threatId) => {
    console.log("Investigating threat:", threatId);
    // Add investigation logic here
  };

  const handleResolve = (threatId) => {
    console.log("Resolving threat:", threatId);
    // Add resolution logic here
  };

  const handleFalsePositive = (threatId) => {
    console.log("Marking as false positive:", threatId);
    // Add false positive logic here
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">
          {/* Header */}
          <div className="content-header">
            <div className="header-left">
              <h1>{t("threatDetection")}</h1>
              <div className="search-bar">
                <i className="bi bi-search"></i>
                <input type="text" placeholder={t("searchPlaceholder")} />
              </div>
            </div>
            
               
          </div>

          {/* Overview Section */}
          <section className="dashboard-section">
            <h2 className="section-title">{t("overview")}</h2>
            <p className="section-subtitle">{t("keyMetrics")}</p>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="bi bi-shield-shaded"></i>
                </div>
                <div className="metric-content">
                  <span className="metric-label">{t("activeThreats")}</span>
                  <span className="metric-value">16</span>
                  <span className="metric-change positive">↑ +1 in last hour</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="bi bi-exclamation-triangle"></i>
                </div>
                <div className="metric-content">
                  <span className="metric-label">{t("anomaliesDetected")}</span>
                  <span className="metric-value">47</span>
                  <span className="metric-change negative">↓ 12% decrease</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="bi bi-check-circle"></i>
                </div>
                <div className="metric-content">
                  <span className="metric-label">{t("protectedSystems")}</span>
                  <span className="metric-value">98%</span>
                  <span className="metric-change positive">↑ 2% improvement</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="bi bi-clock-history"></i>
                </div>
                <div className="metric-content">
                  <span className="metric-label">{t("systemUptime")}</span>
                  <span className="metric-value">99.7%</span>
                </div>
              </div>
            </div>
          </section>

          {/* Traffic Analysis Section */}
          <section className="dashboard-section">
            <h2 className="section-title">{t("trafficAnalysis")}</h2>
            <p className="section-subtitle">{t("trafficAnalysisSubtitle")}</p>
            <div className="card traffic-card">
              <div className="card-header">
                <h3>{t("trafficHistory")}</h3>
                <div className="card-actions">
                  <button className="btn-outline">{t("last24Hours")}</button>
                </div>
              </div>
              <div className="chart-wrapper">
                <Line data={trafficData} options={chartOptions} />
              </div>
            </div>
          </section>

          {/* Recent Threats Section */}
          <section className="dashboard-section">
            <h2 className="section-title">{t("recentThreatDetections")}</h2>
            <p className="section-subtitle">{t("recentThreatsSubtitle")}</p>
            <div className="card threats-card">
              <div className="card-header">
                <h3>{t("threatLog")}</h3>
                <div className="card-actions">
                  <button className="btn-outline" onClick={handleFilter}>{t("filter")}</button>
                </div>
              </div>
              <div className="table-responsive">
                <table className="threats-table">
                  <thead>
                    <tr>
                      <th>{t("threatId")}</th>
                      <th>{t("type")}</th>
                      <th>{t("severity")}</th>
                      <th>{t("sourceIP")}</th>
                      <th>{t("location")}</th>
                      <th>{t("timeDetected")}</th>
                      <th>{t("confidence")}</th>
                      <th>{t("actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentThreats.map((threat) => (
                      <tr key={threat.id}>
                        <td>
                          <span className="threat-id">{threat.id}</span>
                        </td>
                        <td>{threat.type}</td>
                        <td>{getSeverityBadge(threat.severity)}</td>
                        <td>{threat.sourceIP}</td>
                        <td>{threat.location}</td>
                        <td>{threat.time}</td>
                        <td>
                          <span className="confidence">{threat.confidence}</span>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="threat-actions">
                            <button className="btn-icon" title={t("investigate")} onClick={() => handleInvestigate(threat.id)}>
                              <i className="bi bi-search"></i>
                            </button>
                            <button className="btn-icon" title={t("resolve")} onClick={() => handleResolve(threat.id)}>
                              <i className="bi bi-check2-circle"></i>
                            </button>
                            <button className="btn-icon" title={t("falsePositive")} onClick={() => handleFalsePositive(threat.id)}>
                              <i className="bi bi-x-circle"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* System Status Section */}
          <section className="dashboard-section">
            <h2 className="section-title">{t("systemStatus")}</h2>
            <p className="section-subtitle">{t("systemStatusSubtitle")}</p>
            <div className="card monitoring-card">
              <h3>{t("realTimeMonitoring")}</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value">960</span>
                  <span className="stat-label">{t("newConnectionsPerSecond")}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">127.654K</span>
                  <span className="stat-label">{t("concurrentConnections")}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">29.837K</span>
                  <span className="stat-label">{t("concurrentUDPConnections")}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">97.350K</span>
                  <span className="stat-label">{t("concurrentTCPConnections")}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">4.612K</span>
                  <span className="stat-label">{t("onlineIPAddresses")}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">0</span>
                  <span className="stat-label">{t("onlineUsers")}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}