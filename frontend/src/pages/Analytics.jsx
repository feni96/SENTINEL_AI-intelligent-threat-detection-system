import React from "react";
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
  const { t } = useTranslation();
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
        label: t("threatsDetected"),
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
        label: t("count"),
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
        label: t("threats"),
        data: [15, 35, 52, 25],
        backgroundColor: "#818cf8",
      },
    ],
  };

  const alertSeverity = {
    labels: ["Critical", "High", "Medium", "Low"],
    datasets: [
      {
        label: t("alerts"),
        data: [28, 64, 142, 108],
        backgroundColor: ["#ef4444", "#f59e0b", "#eab308", "#10b981"],
      },
    ],
  };

  const alertStatus = {
    labels: [t("active"), t("resolved")],
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
        label: t("alerts"),
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
            <h1>{t("cybersecurityAnalytics")}</h1>
            <p className="page-description">
              {t("analyticsDescription")}
            </p>
          </div>

          {/* 1. Overview Cards */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon"><i className="bi bi-shield"></i></div>
              <div className="metric-content">
                <span className="metric-label">{t("totalThreats")}</span>
                <span className="metric-value">{overview.totalThreats}</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon"><i className="bi bi-exclamation-triangle"></i></div>
              <div className="metric-content">
                <span className="metric-label">{t("activeThreats")}</span>
                <span className="metric-value">{overview.activeThreats}</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon"><i className="bi bi-shield-exclamation"></i></div>
              <div className="metric-content">
                <span className="metric-label">{t("highCritical")}</span>
                <span className="metric-value">{overview.highCritical}</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon"><i className="bi bi-bell"></i></div>
              <div className="metric-content">
                <span className="metric-label">{t("totalAlerts")}</span>
                <span className="metric-value">{overview.totalAlerts}</span>
              </div>
            </div>
          </div>

          {/* 2. Threat Analytics */}
          <section className="analytics-section">
            <h2>{t("threatAnalytics")}</h2>
            <div className="charts-grid two-column">
              <div className="chart-card">
                <h4>{t("threatsOverTime")}</h4>
                <Line data={threatTimeData} />
              </div>
              <div className="chart-card">
                <h4>{t("threatsByType")}</h4>
                <Bar data={threatByType} options={{ plugins: { legend: { display: false } } }} />
              </div>
              <div className="chart-card">
                <h4>{t("severityDistribution")}</h4>
                <Pie data={threatSeverity} options={{ plugins: { legend: { position: "bottom" } } }} />
              </div>
              <div className="chart-card">
                <h4>{t("confidenceDistribution")}</h4>
                <Bar data={confidenceDistribution} options={{ plugins: { legend: { display: false } } }} />
              </div>
            </div>
          </section>

          {/* 3. Alert Analytics */}
          <section className="analytics-section">
            <h2>{t("alertAnalytics")}</h2>
            <div className="charts-grid three-column">
              <div className="chart-card">
                <h4>{t("alertsBySeverity")}</h4>
                <Bar data={alertSeverity} options={{ plugins: { legend: { display: false } } }} />
              </div>
              <div className="chart-card">
                <h4>{t("activeVsResolved")}</h4>
                <Pie data={alertStatus} options={{ plugins: { legend: { position: "bottom" } } }} />
              </div>
              <div className="chart-card">
                <h4>{t("alertTrend")}</h4>
                <Line data={alertTrend} />
              </div>
            </div>
          </section>

          {/* 4. Area‑Based Analytics */}
          <section className="analytics-section">
            <h2>{t("campusThreatDistribution")}</h2>
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
              <span className="heat-low"></span> {t("low")}
              <span className="heat-medium"></span> {t("medium")}
              <span className="heat-high"></span> {t("high")}
              <span className="heat-critical"></span> {t("critical")}
            </div>
          </section>

          {/* 5. System Health Analytics */}
          <section className="analytics-section">
            <h2>{t("systemHealth")}</h2>
            <div className="health-grid">
              <div className="health-card">
                <span className="health-label">{t("mlModelAccuracy")}</span>
                <span className="health-value">{systemHealth.modelAccuracy}%</span>
              </div>
              <div className="health-card">
                <span className="health-label">{t("falsePositiveRate")}</span>
                <span className="health-value">{systemHealth.falsePositiveRate}%</span>
              </div>
              <div className="health-card">
                <span className="health-label">{t("processedLogs")}</span>
                <span className="health-value">{systemHealth.processedLogs.toLocaleString()}</span>
              </div>
              <div className="health-card">
                <span className="health-label">{t("mlEngine")}</span>
                <span className={`health-value status-${systemHealth.mlStatus.toLowerCase()}`}>
                  {systemHealth.mlStatus}
                </span>
              </div>
            </div>
          </section>

          {/* 6. Report & Decision Support */}
          <section className="analytics-section">
            <h2>{t("securityInsights")}</h2>
            <div className="insights-grid">
              <div className="insight-card">
                <h4>{t("dailySummary")}</h4>
                <p>{insights.daily}</p>
              </div>
              <div className="insight-card">
                <h4>{t("weeklySummary")}</h4>
                <p>{insights.weekly}</p>
              </div>
              <div className="insight-card">
                <h4>{t("monthlySummary")}</h4>
                <p>{insights.monthly}</p>
              </div>
              <div className="insight-card recommendations">
                <h4>{t("recommendations")}</h4>
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