import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

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
              
            
            </div>
            
               
          </div>

          {/* Overview Section */}
          <section className="dashboard-section">
            <h2 className="section-title">{t("keyMetrics")}</h2>
          
            <div className="realtime-grid">
              <div className="realtime-metric-card">
                <div className="realtime-icon threats"></div>
                <div className="realtime-content">
                  <span className="realtime-label">{t("activeThreats")}</span>
                  <span className="realtime-value">16</span>
                </div>
              </div>
              <div className="realtime-metric-card">
                <div className="realtime-icon anomalies"></div>
                <div className="realtime-content">
                  <span className="realtime-label">{t("anomaliesDetected")}</span>
                  <span className="realtime-value">47</span>
                </div>
              </div>
              <div className="realtime-metric-card">
                <div className="realtime-icon protected"></div>
                <div className="realtime-content">
                  <span className="realtime-label">{t("protectedSystems")}</span>
                  <span className="realtime-value">98<span className="realtime-unit">%</span></span>
                </div>
              </div>
              <div className="realtime-metric-card">
                <div className="realtime-icon uptime"></div>
                <div className="realtime-content">
                  <span className="realtime-label">{t("systemUptime")}</span>
                  <span className="realtime-value">99.7<span className="realtime-unit">%</span></span>
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

          
          {/* Real-time Monitoring Section */}
          <div className="realtime-section">
            <h2>Real-time Monitoring</h2>
            <div className="realtime-grid">
              <div className="realtime-metric-card">
                <div className="realtime-icon speed"></div>
                <div className="realtime-content">
                  <span className="realtime-label">New Connections per Second</span>
                  <span className="realtime-value">960</span>
                </div>
              </div>
              <div className="realtime-metric-card">
                <div className="realtime-icon connections"></div>
                <div className="realtime-content">
                  <span className="realtime-label">Concurrent Connections</span>
                  <span className="realtime-value">127.654<span className="realtime-unit">K</span></span>
                </div>
              </div>
              <div className="realtime-metric-card">
                <div className="realtime-icon udp"></div>
                <div className="realtime-content">
                  <span className="realtime-label">Concurrent UDP Connections</span>
                  <span className="realtime-value">29.837<span className="realtime-unit">K</span></span>
                </div>
              </div>
              <div className="realtime-metric-card">
                <div className="realtime-icon tcp"></div>
                <div className="realtime-content">
                  <span className="realtime-label">Concurrent TCP Connections</span>
                  <span className="realtime-value">97.350<span className="realtime-unit">K</span></span>
                </div>
              </div>
              <div className="realtime-metric-card">
                <div className="realtime-icon ip"></div>
                <div className="realtime-content">
                  <span className="realtime-label">Online IP Addresses</span>
                  <span className="realtime-value">4.612<span className="realtime-unit">K</span></span>
                </div>
              </div>
              <div className="realtime-metric-card">
                <div className="realtime-icon users"></div>
                <div className="realtime-content">
                  <span className="realtime-label">Online Users</span>
                  <span className="realtime-value">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}