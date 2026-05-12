import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import { createDashboardSocket } from "../services/socket";

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
  const [threatStats, setThreatStats] = useState({
    totalThreats: 0,
    recentThreats: 0,
    mlPredictedCount: 0,
    threatsByLevel: {},
  });
  const [recentThreats, setRecentThreats] = useState([]);

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
    maintainAspectRatio: false,
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, threatsRes] = await Promise.all([
          api.get("/ml/threats/stats"),
          api.get("/ml/threats/recent?limit=5"),
        ]);

        const stats = statsRes.data?.data || {};
        const recent = threatsRes.data?.data?.threats || [];
        setThreatStats({
          totalThreats: stats.totalThreats || 0,
          recentThreats: stats.recentThreats || 0,
          mlPredictedCount: stats.mlPredictedCount || 0,
          threatsByLevel: stats.threatsByLevel || {},
        });
        setRecentThreats(recent);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };

    fetchDashboardData();

    const token = localStorage.getItem("token");
    const socket = createDashboardSocket(token);
    if (!socket) return undefined;

    socket.on("connect", () => {
      socket.emit("subscribeThreats");
    });

    socket.on("newThreat", (event) => {
      const incoming = {
        _id: event.id,
        threatType: event.threatType,
        sourceIP: event.sourceIP,
        severityLevel: event.severityLevel || "Medium",
        confidenceScore: Math.round((event.confidence || 0) * 100),
        timestamp: event.timestamp || new Date().toISOString(),
      };
      setRecentThreats((prev) => [incoming, ...prev].slice(0, 5));
      setThreatStats((prev) => ({
        ...prev,
        totalThreats: (prev.totalThreats || 0) + 1,
        recentThreats: (prev.recentThreats || 0) + 1,
      }));
    });

    return () => {
      socket.emit("unsubscribeThreats");
      socket.disconnect();
    };
  }, []);

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
                  <span className="realtime-value">{threatStats.totalThreats}</span>
                </div>
              </div>
              <div className="realtime-metric-card">
                <div className="realtime-icon anomalies"></div>
                <div className="realtime-content">
                  <span className="realtime-label">{t("anomaliesDetected")}</span>
                  <span className="realtime-value">{threatStats.recentThreats}</span>
                </div>
              </div>
              <div className="realtime-metric-card">
                <div className="realtime-icon protected"></div>
                <div className="realtime-content">
                  <span className="realtime-label">{t("protectedSystems")}</span>
                  <span className="realtime-value">
                    {threatStats.mlPredictedCount}
                  </span>
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

          <section className="dashboard-section">
            <h2 className="section-title">{t("recentThreats")}</h2>
            <div className="card">
              <div className="table-responsive">
                <table className="threat-table">
                  <thead>
                    <tr>
                      <th>{t("threatType")}</th>
                      <th>{t("sourceIP")}</th>
                      <th>{t("severity")}</th>
                      <th>{t("confidence")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentThreats.map((threat) => (
                      <tr key={threat._id}>
                        <td>{threat.threatType}</td>
                        <td>{threat.sourceIP}</td>
                        <td>{threat.severityLevel}</td>
                        <td>{threat.confidenceScore || 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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