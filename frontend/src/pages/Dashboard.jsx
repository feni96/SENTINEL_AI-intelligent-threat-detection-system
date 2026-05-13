import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import { 
  initializeSocket, 
  onNewThreat, 
  onThreatUpdate, 
  onThreatStats,
  onMLServiceHealth,
  onSystemAlert,
  offEvent,
  disconnectSocket 
} from "../services/socket";

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

// Error Boundary Component
class DashboardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Dashboard error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: '#dc2626' }}>
          <h3>Dashboard Error</h3>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>Reload Dashboard</button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function Dashboard() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [dataFreshness, setDataFreshness] = useState({
    threatStats: null,
    recentThreats: null,
    systemHealth: null,
    trafficData: null,
    connectionStats: null,
    zones: null
  });
  const [mlServiceStatus, setMlServiceStatus] = useState({
    available: false,
    status: 'unknown',
    models: [],
    lastUpdate: null
  });
  const [threatStats, setThreatStats] = useState({
    totalThreats: 0,
    recentThreats: 0,
    mlPredictedCount: 0,
    threatsByLevel: {},
  });
  const [recentThreats, setRecentThreats] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    uptime: { percentage: 0, formatted: '0s' },
    status: 'loading'
  });
  const [trafficData, setTrafficData] = useState({
    labels: [],
    data: []
  });
  const [connectionStats, setConnectionStats] = useState({
    connectionsPerSecond: 0,
    concurrentConnections: 0,
    tcpConnections: 0,
    udpConnections: 0,
    uniqueIPs: 0,
    onlineUsers: 0
  });
  const [zones, setZones] = useState([]);
  const [loadingZones, setLoadingZones] = useState(true);
  const [zoneStats, setZoneStats] = useState({});
  const [errors, setErrors] = useState({});

  // Chart configuration with safe defaults
  const chartData = {
    labels: trafficData.labels || [],
    datasets: [
      {
        label: t("inboundTraffic"),
        data: trafficData.data || [],
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

  // Format timestamp for freshness indicator
  const formatFreshness = (timestamp) => {
    if (!timestamp) return 'Never';
    const now = new Date();
    const diff = Math.floor((now - new Date(timestamp)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  // Render data freshness indicator
  const DataFreshnessIndicator = ({ timestamp, label }) => {
    const isStale = timestamp && (new Date() - new Date(timestamp)) > 60000; // 1 minute
    return (
      <span style={{
        fontSize: '0.75rem',
        color: isStale ? '#dc2626' : '#059669',
        marginLeft: '8px'
      }}>
        {isStale ? '⚠️' : '✓'} {formatFreshness(timestamp)}
      </span>
    );
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const timestamp = new Date();
        
        // Fetch all dashboard data with individual error handling
        try {
          const [statsRes, threatsRes, healthRes, trafficRes, connectionsRes, zonesRes, mlHealthRes] = await Promise.allSettled([
            api.get("/ml/threats/stats"),
            api.get("/ml/threats/recent?limit=5"),
            api.get("/system/health"),
            api.get("/traffic/summary"),
            api.get("/connections/stats"),
            api.get("/zones"),
            api.get("/ml/health")
          ]);

          // Update ML service status first
          if (mlHealthRes.status === 'fulfilled') {
            const mlHealth = mlHealthRes.value.data?.data?.health || {};
            setMlServiceStatus({
              available: mlHealth.fastapi_available === true,
              status: mlHealth.status || 'unknown',
              models: mlHealth.models?.available_models || [],
              lastUpdate: timestamp
            });
          } else {
            // ML service is offline
            setMlServiceStatus({
              available: false,
              status: 'offline',
              models: [],
              lastUpdate: timestamp
            });
          }

          // Update threat statistics
          if (statsRes.status === 'fulfilled') {
            const stats = statsRes.value.data?.data || {};
            setThreatStats({
              totalThreats: stats.totalThreats || 0,
              recentThreats: stats.recentThreats || 0,
              mlPredictedCount: stats.mlPredictedCount || 0,
              threatsByLevel: stats.threatsByLevel || {},
            });
            setDataFreshness(prev => ({ ...prev, threatStats: timestamp }));
            setErrors(prev => ({ ...prev, threatStats: null }));
          } else {
            const errorMsg = statsRes.reason?.message || 'Failed to fetch threat stats';
            console.warn('Failed to fetch threat stats:', errorMsg);
            setErrors(prev => ({ ...prev, threatStats: errorMsg }));
          }

          // Update recent threats
          if (threatsRes.status === 'fulfilled') {
            const recent = threatsRes.value.data?.data?.threats || [];
            setRecentThreats(recent);
            setDataFreshness(prev => ({ ...prev, recentThreats: timestamp }));
            setErrors(prev => ({ ...prev, recentThreats: null }));
          } else {
            const errorMsg = threatsRes.reason?.message || 'Failed to fetch recent threats';
            console.warn('Failed to fetch recent threats:', errorMsg);
            setErrors(prev => ({ ...prev, recentThreats: errorMsg }));
          }

          // Update system health
          if (healthRes.status === 'fulfilled') {
            const health = healthRes.value.data?.data || {};
            setSystemHealth({
              uptime: health.uptime || { percentage: 0, formatted: '0s' },
              status: health.status || 'unknown'
            });
            setDataFreshness(prev => ({ ...prev, systemHealth: timestamp }));
            setErrors(prev => ({ ...prev, systemHealth: null }));
          } else {
            const errorMsg = healthRes.reason?.message || 'Failed to fetch system health';
            console.warn('Failed to fetch system health:', errorMsg);
            setErrors(prev => ({ ...prev, systemHealth: errorMsg }));
          }

          // Update traffic data
          if (trafficRes.status === 'fulfilled') {
            const traffic = trafficRes.value.data?.data || {};
            setTrafficData({
              labels: traffic.labels || [],
              data: traffic.data || []
            });
            setDataFreshness(prev => ({ ...prev, trafficData: timestamp }));
            setErrors(prev => ({ ...prev, trafficData: null }));
          } else {
            const errorMsg = trafficRes.reason?.message || 'Failed to fetch traffic summary';
            console.warn('Failed to fetch traffic summary:', errorMsg);
            setErrors(prev => ({ ...prev, trafficData: errorMsg }));
          }

          // Update connection statistics
          if (connectionsRes.status === 'fulfilled') {
            const connections = connectionsRes.value.data?.data || {};
            setConnectionStats({
              connectionsPerSecond: connections.connectionsPerSecond || 0,
              concurrentConnections: connections.concurrentConnections || 0,
              tcpConnections: connections.tcpConnections || 0,
              udpConnections: connections.udpConnections || 0,
              uniqueIPs: connections.uniqueIPs || 0,
              onlineUsers: connections.onlineUsers || 0
            });
            setDataFreshness(prev => ({ ...prev, connectionStats: timestamp }));
            setErrors(prev => ({ ...prev, connectionStats: null }));
          } else {
            const errorMsg = connectionsRes.reason?.message || 'Failed to fetch connection stats';
            console.warn('Failed to fetch connection stats:', errorMsg);
            setErrors(prev => ({ ...prev, connectionStats: errorMsg }));
          }

          // Update zones data
          if (zonesRes.status === 'fulfilled') {
            const zonesData = zonesRes.value.data?.data?.zones || [];
            setZones(zonesData);
            setLoadingZones(false);
            setDataFreshness(prev => ({ ...prev, zones: timestamp }));
            setErrors(prev => ({ ...prev, zones: null }));
            
            // Calculate zone statistics
            const stats = zonesData.reduce((acc, zone) => {
              acc[zone.zoneType] = (acc[zone.zoneType] || 0) + 1;
              acc.total = (acc.total || 0) + 1;
              acc.enabled = (acc.enabled || 0) + (zone.enabled ? 1 : 0);
              return acc;
            }, {});
            setZoneStats(stats);
          } else {
            const errorMsg = zonesRes.reason?.message || 'Failed to fetch zones';
            console.warn('Failed to fetch zones:', errorMsg);
            setErrors(prev => ({ ...prev, zones: errorMsg }));
            setLoadingZones(false);
          }
        } catch (apiError) {
          console.error('API fetching error:', apiError);
          setErrors(prev => ({ ...prev, api: apiError.message }));
        }

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setErrors(prev => ({ ...prev, general: error.message }));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Set up Socket.IO connection and listeners
    const token = localStorage.getItem("token");
    let socket = null;
    
    try {
      socket = initializeSocket(token);
      if (!socket) {
        console.warn('Failed to create socket connection');
        return;
      }

      // Socket connection handlers
      socket.on("connect", () => {
        console.log('✅ Socket.IO connected successfully');
      });

      socket.on("connect_error", (error) => {
        console.warn('⚠️ Socket.IO connection error:', error);
        setErrors(prev => ({ ...prev, socket: 'Real-time connection failed' }));
      });

      socket.on("disconnect", (reason) => {
        console.warn('⚠️ Socket.IO disconnected:', reason);
      });

      // NEW THREAT EVENT - Update recent threats and stats
      const handleNewThreat = (event) => {
        try {
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
          setDataFreshness(prev => ({ ...prev, recentThreats: new Date() }));
        } catch (error) {
          console.error('Error processing new threat event:', error);
        }
      };

      // THREAT UPDATE EVENT - Update threat status
      const handleThreatUpdate = (event) => {
        try {
          setRecentThreats((prev) =>
            prev.map((threat) =>
              threat._id === event.threatId
                ? { ...threat, ...event }
                : threat
            )
          );
          setDataFreshness(prev => ({ ...prev, recentThreats: new Date() }));
        } catch (error) {
          console.error('Error processing threat update event:', error);
        }
      };

      // THREAT STATS EVENT - Update dashboard metrics
      const handleThreatStats = (event) => {
        try {
          setThreatStats({
            totalThreats: event.totalThreats || 0,
            recentThreats: event.recentThreats || 0,
            mlPredictedCount: event.mlPredictedCount || 0,
            threatsByLevel: event.threatsByLevel || {},
          });
          setDataFreshness(prev => ({ ...prev, threatStats: new Date() }));
        } catch (error) {
          console.error('Error processing threat stats event:', error);
        }
      };

      // ML SERVICE HEALTH EVENT - Update service status
      const handleMLServiceHealth = (event) => {
        try {
          setMlServiceStatus({
            available: event.available || false,
            status: event.status || 'unknown',
            models: event.models || [],
            lastUpdate: new Date()
          });
          setErrors(prev => ({ ...prev, mlService: null }));
        } catch (error) {
          console.error('Error processing ML service health event:', error);
        }
      };

      // SYSTEM ALERT EVENT - Display system-wide alerts
      const handleSystemAlert = (event) => {
        try {
          console.warn(`🚨 System Alert [${event.severity}]: ${event.message}`);
          setErrors(prev => ({ 
            ...prev, 
            systemAlert: `${event.type}: ${event.message}` 
          }));
        } catch (error) {
          console.error('Error processing system alert event:', error);
        }
      };

      // Register all Socket.IO listeners
      onNewThreat(handleNewThreat);
      onThreatUpdate(handleThreatUpdate);
      onThreatStats(handleThreatStats);
      onMLServiceHealth(handleMLServiceHealth);
      onSystemAlert(handleSystemAlert);

    } catch (error) {
      console.error('Socket.IO setup error:', error);
      setErrors(prev => ({ ...prev, socket: error.message }));
    }

    // Refresh connection stats every 30 seconds (backend-driven)
    const statsInterval = setInterval(async () => {
      try {
        const connectionsRes = await api.get("/connections/stats");
        if (connectionsRes.data?.data) {
          const connections = connectionsRes.data.data;
          setConnectionStats({
            connectionsPerSecond: connections.connectionsPerSecond || 0,
            concurrentConnections: connections.concurrentConnections || 0,
            tcpConnections: connections.tcpConnections || 0,
            udpConnections: connections.udpConnections || 0,
            uniqueIPs: connections.uniqueIPs || 0,
            onlineUsers: connections.onlineUsers || 0
          });
          setDataFreshness(prev => ({ ...prev, connectionStats: new Date() }));
        }
      } catch (error) {
        console.warn("Failed to refresh connection stats:", error);
      }
    }, 30000);

    // Cleanup function
    return () => {
      if (socket) {
        try {
          // Remove all listeners
          offEvent('newThreat', handleNewThreat);
          offEvent('threatUpdate', handleThreatUpdate);
          offEvent('threatStats', handleThreatStats);
          offEvent('mlServiceHealth', handleMLServiceHealth);
          offEvent('systemAlert', handleSystemAlert);
          
          disconnectSocket();
        } catch (error) {
          console.warn('Error during socket cleanup:', error);
        }
      }
      clearInterval(statsInterval);
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
    <DashboardErrorBoundary>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">
          {/* Header */}
          <div className="content-header">
            <div className="header-left">
              {/* ML Service Status Indicator */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: mlServiceStatus.available ? '#dcfce7' : '#fee2e2',
                borderRadius: '6px',
                fontSize: '0.875rem'
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: mlServiceStatus.available ? '#16a34a' : '#dc2626'
                }}></span>
                <span>ML Service: {mlServiceStatus.available ? 'Online' : 'Offline'}</span>
                {mlServiceStatus.lastUpdate && (
                  <span style={{ fontSize: '0.75rem', color: '#666' }}>
                    {formatFreshness(mlServiceStatus.lastUpdate)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Error Display Section */}
          {Object.values(errors).some(e => e) && (
            <div style={{
              padding: '12px',
              marginBottom: '16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              color: '#991b1b'
            }}>
              <strong>⚠️ Data Issues:</strong>
              <ul style={{ margin: '8px 0 0 20px', fontSize: '0.875rem' }}>
                {errors.threatStats && <li>Threat Stats: {errors.threatStats}</li>}
                {errors.recentThreats && <li>Recent Threats: {errors.recentThreats}</li>}
                {errors.systemHealth && <li>System Health: {errors.systemHealth}</li>}
                {errors.trafficData && <li>Traffic Data: {errors.trafficData}</li>}
                {errors.connectionStats && <li>Connection Stats: {errors.connectionStats}</li>}
                {errors.socket && <li>Real-time Connection: {errors.socket}</li>}
                {errors.systemAlert && <li>System Alert: {errors.systemAlert}</li>}
              </ul>
            </div>
          )}

          {/* Overview Section */}
          <section className="dashboard-section">
            <h2 className="section-title">
              {t("keyMetrics")}
              {dataFreshness.threatStats && (
                <DataFreshnessIndicator 
                  timestamp={dataFreshness.threatStats} 
                  label="Threat Stats"
                />
              )}
            </h2>
          
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
                  <span className="realtime-value">
                    {systemHealth.uptime.percentage || 0}
                    <span className="realtime-unit">%</span>
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Traffic Analysis Section */}
          <section className="dashboard-section">
            <h2 className="section-title">
              {t("trafficAnalysis")}
              {dataFreshness.trafficData && (
                <DataFreshnessIndicator 
                  timestamp={dataFreshness.trafficData} 
                  label="Traffic Data"
                />
              )}
            </h2>
            <p className="section-subtitle">{t("trafficAnalysisSubtitle")}</p>
            <div className="card traffic-card">
              <div className="card-header">
                <h3>{t("trafficHistory")}</h3>
                <div className="card-actions">
                  <button className="btn-outline">{t("last24Hours")}</button>
                </div>
              </div>
              <div className="chart-wrapper">
                {trafficData && trafficData.labels && trafficData.labels.length > 0 ? (
                  <Line data={chartData} options={chartOptions} />
                ) : (
                  <div className="no-data-placeholder">
                    <p>{t("noDataAvailable")}</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          
          <section className="dashboard-section">
            <h2 className="section-title">
              {t("recentThreats")}
              {dataFreshness.recentThreats && (
                <DataFreshnessIndicator 
                  timestamp={dataFreshness.recentThreats} 
                  label="Recent Threats"
                />
              )}
            </h2>
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
                    {recentThreats && recentThreats.length > 0 ? (
                      recentThreats.map((threat) => (
                        <tr key={threat._id}>
                          <td>{threat.threatType || 'Unknown'}</td>
                          <td>{threat.sourceIP || 'N/A'}</td>
                          <td>{threat.severityLevel || 'Unknown'}</td>
                          <td>{threat.confidenceScore || 0}%</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                          {t("noDataAvailable")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          
          {/* Real-time Monitoring Section */}
          <div className="realtime-section">
            <h2>
              Real-time Monitoring
              {dataFreshness.connectionStats && (
                <DataFreshnessIndicator 
                  timestamp={dataFreshness.connectionStats} 
                  label="Connection Stats"
                />
              )}
            </h2>
            <div className="realtime-grid">
              <div className="realtime-metric-card">
                <div className="realtime-icon speed"></div>
                <div className="realtime-content">
                  <span className="realtime-label">New Connections per Second</span>
                  <span className="realtime-value">{connectionStats.connectionsPerSecond || 0}</span>
                </div>
              </div>
              <div className="realtime-metric-card">
                <div className="realtime-icon connections"></div>
                <div className="realtime-content">
                  <span className="realtime-label">Concurrent Connections</span>
                  <span className="realtime-value">
                    {connectionStats.concurrentConnections >= 1000 
                      ? `${(connectionStats.concurrentConnections / 1000).toFixed(3)}<span className="realtime-unit">K</span>`
                      : connectionStats.concurrentConnections || 0
                    }
                  </span>
                </div>
              </div>
              <div className="realtime-metric-card">
                <div className="realtime-icon udp"></div>
                <div className="realtime-content">
                  <span className="realtime-label">Concurrent UDP Connections</span>
                  <span className="realtime-value">
                    {connectionStats.udpConnections >= 1000 
                      ? `${(connectionStats.udpConnections / 1000).toFixed(3)}<span className="realtime-unit">K</span>`
                      : connectionStats.udpConnections || 0
                    }
                  </span>
                </div>
              </div>
              <div className="realtime-metric-card">
                <div className="realtime-icon tcp"></div>
                <div className="realtime-content">
                  <span className="realtime-label">Concurrent TCP Connections</span>
                  <span className="realtime-value">
                    {connectionStats.tcpConnections >= 1000 
                      ? `${(connectionStats.tcpConnections / 1000).toFixed(3)}<span className="realtime-unit">K</span>`
                      : connectionStats.tcpConnections || 0
                    }
                  </span>
                </div>
              </div>
              <div className="realtime-metric-card">
                <div className="realtime-icon ip"></div>
                <div className="realtime-content">
                  <span className="realtime-label">Online IP Addresses</span>
                  <span className="realtime-value">
                    {connectionStats.uniqueIPs >= 1000 
                      ? `${(connectionStats.uniqueIPs / 1000).toFixed(3)}<span className="realtime-unit">K</span>`
                      : connectionStats.uniqueIPs || 0
                    }
                  </span>
                </div>
              </div>
              <div className="realtime-metric-card">
                <div className="realtime-icon users"></div>
                <div className="realtime-content">
                  <span className="realtime-label">Online Users</span>
                  <span className="realtime-value">{connectionStats.onlineUsers || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardErrorBoundary>
  );
}