import React from "react";
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
import "./Analytics.css";

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

export default function Analytics() {
  // Mock data (same as before)
  const overview = {
    totalThreats: 127,
    activeThreats: 48,
    highCritical: 31,
    totalAlerts: 342,
  };

  const threatTimeData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Threats Detected",
        data: [12, 19, 15, 22, 24, 18, 17],
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const threatByType = {
    labels: ["DDoS", "Brute Force", "Malware", "Unauthorized Access"],
    datasets: [
      {
        label: "Count",
        data: [34, 22, 41, 18],
        backgroundColor: ["#60a5fa", "#f59e0b", "#10b981", "#ef4444"],
      },
    ],
  };

  const threatSeverity = {
    labels: ["Critical", "High", "Medium", "Low"],
    datasets: [
      {
        data: [12, 28, 45, 42],
        backgroundColor: ["#ef4444", "#f59e0b", "#eab308", "#10b981"],
      },
    ],
  };

  const confidenceDistribution = {
    labels: ["< 70%", "70-80%", "80-90%", "90-100%"],
    datasets: [
      {
        label: "Threats",
        data: [15, 35, 52, 25],
        backgroundColor: "#818cf8",
      },
    ],
  };

  const alertSeverity = {
    labels: ["Critical", "High", "Medium", "Low"],
    datasets: [
      {
        label: "Alerts",
        data: [28, 64, 142, 108],
        backgroundColor: ["#ef4444", "#f59e0b", "#eab308", "#10b981"],
      },
    ],
  };

  const alertStatus = {
    labels: ["Active", "Resolved"],
    datasets: [
      {
        data: [142, 200],
        backgroundColor: ["#f59e0b", "#10b981"],
      },
    ],
  };

  const alertTrend = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Alerts",
        data: [42, 38, 55, 49, 62, 47, 49],
        borderColor: "#8b5cf6",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const campusZones = [
    { name: "Data Center", threats: 18, risk: "high" },
    { name: "Admin Office", threats: 22, risk: "critical" },
    { name: "Library", threats: 15, risk: "medium" },
    { name: "Computer Labs", threats: 24, risk: "high" },
    { name: "Dormitory", threats: 28, risk: "critical" },
    { name: "Staff Network", threats: 12, risk: "low" },
    { name: "Student Wi-Fi", threats: 8, risk: "low" },
  ];

  const systemHealth = {
    modelAccuracy: 98.2,
    falsePositiveRate: 1.8,
    processedLogs: 15420,
    mlStatus: "Running",
  };

  const insights = {
    daily:
      "Highest threat activity in Dormitory and Admin Office. DDoS and Malware remain most common.",
    weekly:
      "Threat volume increased 12% this week, mainly in Computer Labs. False positive rate stable.",
    monthly:
      "Overall threat growth 5% month-over-month. Critical threats decreased by 8%.",
    recommendations: [
      "Increase monitoring in Dormitory and Computer Labs.",
      "Review DDoS rules – highest volume in Admin Office.",
      "ML model accuracy remains high; no retraining needed this week.",
    ],
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">
          <div className="content-header">
            <h1>Cybersecurity Analytics</h1>
            <p className="page-description">
              Real‑time and historical analytics for proactive threat management.
            </p>
          </div>

          {/* 1. Overview Cards */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon"><i className="bi bi-shield"></i></div>
              <div className="metric-content">
                <span className="metric-label">Total Threats</span>
                <span className="metric-value">{overview.totalThreats}</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon"><i className="bi bi-exclamation-triangle"></i></div>
              <div className="metric-content">
                <span className="metric-label">Active Threats</span>
                <span className="metric-value">{overview.activeThreats}</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon"><i className="bi bi-shield-exclamation"></i></div>
              <div className="metric-content">
                <span className="metric-label">High/Critical</span>
                <span className="metric-value">{overview.highCritical}</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon"><i className="bi bi-bell"></i></div>
              <div className="metric-content">
                <span className="metric-label">Total Alerts</span>
                <span className="metric-value">{overview.totalAlerts}</span>
              </div>
            </div>
          </div>

          {/* 2. Threat Analytics */}
          <section className="analytics-section">
            <h2>Threat Analytics</h2>
            <div className="charts-grid two-column">
              <div className="chart-card">
                <h4>Threats Over Time</h4>
                <Line data={threatTimeData} />
              </div>
              <div className="chart-card">
                <h4>Threats by Type</h4>
                <Bar data={threatByType} options={{ plugins: { legend: { display: false } } }} />
              </div>
              <div className="chart-card">
                <h4>Severity Distribution</h4>
                <Pie data={threatSeverity} options={{ plugins: { legend: { position: "bottom" } } }} />
              </div>
              <div className="chart-card">
                <h4>Confidence Distribution</h4>
                <Bar data={confidenceDistribution} options={{ plugins: { legend: { display: false } } }} />
              </div>
            </div>
          </section>

          {/* 3. Alert Analytics */}
          <section className="analytics-section">
            <h2>Alert Analytics</h2>
            <div className="charts-grid three-column">
              <div className="chart-card">
                <h4>Alerts by Severity</h4>
                <Bar data={alertSeverity} options={{ plugins: { legend: { display: false } } }} />
              </div>
              <div className="chart-card">
                <h4>Active vs Resolved</h4>
                <Pie data={alertStatus} options={{ plugins: { legend: { position: "bottom" } } }} />
              </div>
              <div className="chart-card">
                <h4>Alert Trend</h4>
                <Line data={alertTrend} />
              </div>
            </div>
          </section>

          {/* 4. Area‑Based Analytics */}
          <section className="analytics-section">
            <h2>Campus Threat Distribution</h2>
            <div className="area-grid">
              {campusZones.map((zone) => (
                <div key={zone.name} className={`zone-card risk-${zone.risk}`}>
                  <div className="zone-name">{zone.name}</div>
                  <div className="zone-threats">{zone.threats} threats</div>
                  <div className="heat-indicator" style={{ width: `${(zone.threats / 30) * 100}%` }}></div>
                </div>
              ))}
            </div>
            <div className="heatmap-note">
              <span className="heat-low"></span> Low
              <span className="heat-medium"></span> Medium
              <span className="heat-high"></span> High
              <span className="heat-critical"></span> Critical
            </div>
          </section>

          {/* 5. System Health Analytics */}
          <section className="analytics-section">
            <h2>System Health</h2>
            <div className="health-grid">
              <div className="health-card">
                <span className="health-label">ML Model Accuracy</span>
                <span className="health-value">{systemHealth.modelAccuracy}%</span>
              </div>
              <div className="health-card">
                <span className="health-label">False Positive Rate</span>
                <span className="health-value">{systemHealth.falsePositiveRate}%</span>
              </div>
              <div className="health-card">
                <span className="health-label">Processed Logs</span>
                <span className="health-value">{systemHealth.processedLogs.toLocaleString()}</span>
              </div>
              <div className="health-card">
                <span className="health-label">ML Engine</span>
                <span className={`health-value status-${systemHealth.mlStatus.toLowerCase()}`}>
                  {systemHealth.mlStatus}
                </span>
              </div>
            </div>
          </section>

          {/* 6. Report & Decision Support */}
          <section className="analytics-section">
            <h2>Security Insights & Recommendations</h2>
            <div className="insights-grid">
              <div className="insight-card">
                <h4>Daily Summary</h4>
                <p>{insights.daily}</p>
              </div>
              <div className="insight-card">
                <h4>Weekly Summary</h4>
                <p>{insights.weekly}</p>
              </div>
              <div className="insight-card">
                <h4>Monthly Summary</h4>
                <p>{insights.monthly}</p>
              </div>
              <div className="insight-card recommendations">
                <h4>Recommendations</h4>
                <ul>
                  {insights.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}