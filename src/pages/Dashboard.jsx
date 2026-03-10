import React from "react";
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
  // Traffic history data
  const trafficLabels = [
    "2025/10/21 18:30",
    "2025/10/22 01:45",
    "2025/10/22 09:00",
    "2025/10/22 16:15",
  ];
  const trafficData = {
    labels: trafficLabels,
    datasets: [
      {
        label: "Inbound Traffic (Mbps)",
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

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">
          {/* Header */}
          <div className="content-header">
            <h1>Threat Detection Dashboard</h1>
            <div className="search-bar">
              <i className="bi bi-search"></i>
              <input type="text" placeholder="Search threats, logs, or users..." />
            </div>
          </div>

          {/* Overview Section */}
          <section className="dashboard-section">
            <h2 className="section-title">Overview</h2>
            <p className="section-subtitle">Key security metrics at a glance</p>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="bi bi-shield-shaded"></i>
                </div>
                <div className="metric-content">
                  <span className="metric-label">Active Threats</span>
                  <span className="metric-value">16</span>
                  <span className="metric-change positive">↑ +1 in last hour</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="bi bi-exclamation-triangle"></i>
                </div>
                <div className="metric-content">
                  <span className="metric-label">Anomalies Detected</span>
                  <span className="metric-value">47</span>
                  <span className="metric-change negative">↓ 12% decrease</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="bi bi-check-circle"></i>
                </div>
                <div className="metric-content">
                  <span className="metric-label">Protected Systems</span>
                  <span className="metric-value">98%</span>
                  <span className="metric-change positive">↑ 2% improvement</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="bi bi-clock-history"></i>
                </div>
                <div className="metric-content">
                  <span className="metric-label">System Uptime</span>
                  <span className="metric-value">99.7%</span>
                </div>
              </div>
            </div>
          </section>

          {/* Traffic Analysis Section */}
          <section className="dashboard-section">
            <h2 className="section-title">Traffic Analysis</h2>
            <p className="section-subtitle">
              Inbound traffic trend over the last 24 hours – helps identify
              unusual spikes that may indicate DDoS attacks or scanning activity.
            </p>
            <div className="card traffic-card">
              <div className="card-header">
                <h3>Traffic History</h3>
                <div className="card-actions">
                  <button className="btn-outline">Last 24 hours</button>
                </div>
              </div>
              <div className="chart-wrapper">
                <Line data={trafficData} options={chartOptions} />
              </div>
            </div>
          </section>

          {/* Recent Threats Section */}
          <section className="dashboard-section">
            <h2 className="section-title">Recent Threat Detections</h2>
            <p className="section-subtitle">
              List of the most recent security incidents, sorted by time. Click on a row to view details.
            </p>
            <div className="card threats-card">
              <div className="card-header">
                <h3>Threat Log</h3>
                <div className="card-actions">
                  <button className="btn-outline">Filter</button>
                </div>
              </div>
              <div className="table-responsive">
                <table className="threats-table">
                  <thead>
                    <tr>
                      <th>Threat ID</th>
                      <th>Type</th>
                      <th>Severity</th>
                      <th>Source IP</th>
                      <th>Location</th>
                      <th>Time Detected</th>
                      <th>Confidence</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentThreats.map((threat) => (
                      <tr key={threat.id}>
                        <td><span className="threat-id">{threat.id}</span></td>
                        <td>{threat.type}</td>
                        <td>{getSeverityBadge(threat.severity)}</td>
                        <td>{threat.sourceIP}</td>
                        <td>{threat.location}</td>
                        <td>{threat.time}</td>
                        <td><span className="confidence">{threat.confidence}</span></td>
                        <td>
                          <button className="action-btn"><i className="bi bi-three-dots-vertical"></i></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* System Status Section (only Real-Time Monitoring remains) */}
          <section className="dashboard-section">
            <h2 className="section-title">System Status</h2>
            <p className="section-subtitle">
              Current real‑time connection statistics.
            </p>
            <div className="card monitoring-card">
              <h3>Online Real-Time Monitoring</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value">960</span>
                  <span className="stat-label">New Connections per Second</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">127.654K</span>
                  <span className="stat-label">Concurrent Connections</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">29.837K</span>
                  <span className="stat-label">Concurrent UDP Connections</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">97.350K</span>
                  <span className="stat-label">Concurrent TCP Connections</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">4.612K</span>
                  <span className="stat-label">Online IP Addresses</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">0</span>
                  <span className="stat-label">Online Users</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}