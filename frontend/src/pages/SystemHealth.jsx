import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "../components/Sidebar";

const SystemHealth = () => {
  const { t } = useTranslation();
  const [systemMetrics, setSystemMetrics] = useState({});
  const [services, setServices] = useState([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState("1h");

  // Mock system health data
  useEffect(() => {
    const mockMetrics = {
      cpu: {
        current: 45,
        average: 38,
        peak: 78,
        trend: "stable"
      },
      memory: {
        current: 62,
        average: 58,
        peak: 85,
        trend: "increasing"
      },
      disk: {
        current: 34,
        average: 32,
        peak: 45,
        trend: "stable"
      },
      network: {
        inbound: "125 MB/s",
        outbound: "89 MB/s",
        latency: "12ms",
        packetLoss: "0.02%"
      },
      database: {
        connections: 45,
        queries: "1,247/min",
        responseTime: "23ms",
        cacheHitRate: "94.5%"
      }
    };

    const mockServices = [
      {
        name: "Web Server",
        status: "healthy",
        uptime: "99.98%",
        responseTime: "145ms",
        lastCheck: "2024-01-15T15:30:00Z",
        port: 80,
        url: "https://sentinel.haramaya.edu.et"
      },
      {
        name: "Database Server",
        status: "healthy",
        uptime: "99.95%",
        responseTime: "23ms",
        lastCheck: "2024-01-15T15:30:00Z",
        port: 5432,
        url: "postgresql://localhost:5432"
      },
      {
        name: "Authentication Service",
        status: "warning",
        uptime: "98.76%",
        responseTime: "234ms",
        lastCheck: "2024-01-15T15:29:45Z",
        port: 8080,
        url: "http://auth.internal:8080"
      },
      {
        name: "ML Processing Service",
        status: "healthy",
        uptime: "99.87%",
        responseTime: "567ms",
        lastCheck: "2024-01-15T15:30:00Z",
        port: 8001,
        url: "http://ml.internal:8001"
      },
      {
        name: "Alert Service",
        status: "critical",
        uptime: "95.23%",
        responseTime: "timeout",
        lastCheck: "2024-01-15T15:28:12Z",
        port: 8002,
        url: "http://alerts.internal:8002"
      },
      {
        name: "Log Aggregator",
        status: "healthy",
        uptime: "99.92%",
        responseTime: "89ms",
        lastCheck: "2024-01-15T15:30:00Z",
        port: 9200,
        url: "http://logs.internal:9200"
      }
    ];

    setSystemMetrics(mockMetrics);
    setServices(mockServices);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "healthy": return "#28a745";
      case "warning": return "#ffc107";
      case "critical": return "#dc3545";
      default: return "#6c757d";
    }
  };

  const getMetricColor = (value) => {
    if (value >= 80) return "#dc3545";
    if (value >= 60) return "#ffc107";
    return "#28a745";
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "increasing": return "bi-arrow-up";
      case "decreasing": return "bi-arrow-down";
      case "stable": return "bi-arrow-right";
      default: return "bi-dash";
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case "increasing": return "#dc3545";
      case "decreasing": return "#28a745";
      case "stable": return "#6c757d";
      default: return "#6c757d";
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">
            <i className="bi bi-heart-pulse"></i>
            System Health
          </h1>
          <p className="page-subtitle">Monitor system performance and service status</p>
        </div>

        <div className="system-health-container">
          {/* Time Range Selector */}
          <div className="health-controls">
            <div className="time-range-selector">
              <label>Time Range:</label>
              <select 
                value={selectedTimeRange} 
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="time-select"
              >
                <option value="15m">Last 15 minutes</option>
                <option value="1h">Last hour</option>
                <option value="6h">Last 6 hours</option>
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
              </select>
            </div>
            <div className="health-actions">
              <button className="btn btn-secondary">
                <i className="bi bi-arrow-clockwise"></i>
                Refresh
              </button>
              <button className="btn btn-secondary">
                <i className="bi bi-download"></i>
                Export Report
              </button>
            </div>
          </div>

          {/* System Overview */}
          <div className="system-overview">
            <h3>System Performance Metrics</h3>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-header">
                  <h4>CPU Usage</h4>
                  <i className={`bi ${getTrendIcon(systemMetrics.cpu?.trend)}`} 
                     style={{ color: getTrendColor(systemMetrics.cpu?.trend) }}></i>
                </div>
                <div className="metric-value">
                  <span className="current-value">{systemMetrics.cpu?.current}%</span>
                  <div className="metric-bar">
                    <div 
                      className="metric-fill"
                      style={{ 
                        width: `${systemMetrics.cpu?.current}%`,
                        backgroundColor: getMetricColor(systemMetrics.cpu?.current)
                      }}
                    ></div>
                  </div>
                </div>
                <div className="metric-stats">
                  <span>Avg: {systemMetrics.cpu?.average}%</span>
                  <span>Peak: {systemMetrics.cpu?.peak}%</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <h4>Memory Usage</h4>
                  <i className={`bi ${getTrendIcon(systemMetrics.memory?.trend)}`} 
                     style={{ color: getTrendColor(systemMetrics.memory?.trend) }}></i>
                </div>
                <div className="metric-value">
                  <span className="current-value">{systemMetrics.memory?.current}%</span>
                  <div className="metric-bar">
                    <div 
                      className="metric-fill"
                      style={{ 
                        width: `${systemMetrics.memory?.current}%`,
                        backgroundColor: getMetricColor(systemMetrics.memory?.current)
                      }}
                    ></div>
                  </div>
                </div>
                <div className="metric-stats">
                  <span>Avg: {systemMetrics.memory?.average}%</span>
                  <span>Peak: {systemMetrics.memory?.peak}%</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <h4>Disk Usage</h4>
                  <i className={`bi ${getTrendIcon(systemMetrics.disk?.trend)}`} 
                     style={{ color: getTrendColor(systemMetrics.disk?.trend) }}></i>
                </div>
                <div className="metric-value">
                  <span className="current-value">{systemMetrics.disk?.current}%</span>
                  <div className="metric-bar">
                    <div 
                      className="metric-fill"
                      style={{ 
                        width: `${systemMetrics.disk?.current}%`,
                        backgroundColor: getMetricColor(systemMetrics.disk?.current)
                      }}
                    ></div>
                  </div>
                </div>
                <div className="metric-stats">
                  <span>Avg: {systemMetrics.disk?.average}%</span>
                  <span>Peak: {systemMetrics.disk?.peak}%</span>
                </div>
              </div>

              <div className="metric-card network-card">
                <div className="metric-header">
                  <h4>Network Traffic</h4>
                </div>
                <div className="network-stats">
                  <div className="network-stat">
                    <label>Inbound:</label>
                    <span>{systemMetrics.network?.inbound}</span>
                  </div>
                  <div className="network-stat">
                    <label>Outbound:</label>
                    <span>{systemMetrics.network?.outbound}</span>
                  </div>
                  <div className="network-stat">
                    <label>Latency:</label>
                    <span>{systemMetrics.network?.latency}</span>
                  </div>
                  <div className="network-stat">
                    <label>Packet Loss:</label>
                    <span>{systemMetrics.network?.packetLoss}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Database Performance */}
          <div className="database-performance">
            <h3>Database Performance</h3>
            <div className="db-metrics">
              <div className="db-metric">
                <div className="db-metric-icon">
                  <i className="bi bi-database"></i>
                </div>
                <div className="db-metric-content">
                  <h4>{systemMetrics.database?.connections}</h4>
                  <p>Active Connections</p>
                </div>
              </div>
              <div className="db-metric">
                <div className="db-metric-icon">
                  <i className="bi bi-lightning"></i>
                </div>
                <div className="db-metric-content">
                  <h4>{systemMetrics.database?.queries}</h4>
                  <p>Queries per Minute</p>
                </div>
              </div>
              <div className="db-metric">
                <div className="db-metric-icon">
                  <i className="bi bi-speedometer2"></i>
                </div>
                <div className="db-metric-content">
                  <h4>{systemMetrics.database?.responseTime}</h4>
                  <p>Avg Response Time</p>
                </div>
              </div>
              <div className="db-metric">
                <div className="db-metric-icon">
                  <i className="bi bi-bullseye"></i>
                </div>
                <div className="db-metric-content">
                  <h4>{systemMetrics.database?.cacheHitRate}</h4>
                  <p>Cache Hit Rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Service Status */}
          <div className="service-status">
            <h3>Service Health Status</h3>
            <div className="services-grid">
              {services.map((service, index) => (
                <div key={index} className="service-card">
                  <div className="service-header">
                    <div className="service-name">
                      <i className="bi bi-gear"></i>
                      <span>{service.name}</span>
                    </div>
                    <div 
                      className="service-status-indicator"
                      style={{ backgroundColor: getStatusColor(service.status) }}
                    >
                      {service.status.toUpperCase()}
                    </div>
                  </div>
                  <div className="service-details">
                    <div className="service-metric">
                      <label>Uptime:</label>
                      <span className={parseFloat(service.uptime) < 99 ? 'warning' : 'good'}>
                        {service.uptime}
                      </span>
                    </div>
                    <div className="service-metric">
                      <label>Response Time:</label>
                      <span className={service.responseTime === 'timeout' ? 'error' : 'good'}>
                        {service.responseTime}
                      </span>
                    </div>
                    <div className="service-metric">
                      <label>Port:</label>
                      <span>{service.port}</span>
                    </div>
                    <div className="service-metric">
                      <label>Last Check:</label>
                      <span>{new Date(service.lastCheck).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <div className="service-actions">
                    <button className="btn btn-sm btn-secondary">
                      <i className="bi bi-arrow-clockwise"></i>
                      Test
                    </button>
                    <button className="btn btn-sm btn-primary">
                      <i className="bi bi-gear"></i>
                      Configure
                    </button>
                    {service.status === "critical" && (
                      <button className="btn btn-sm btn-warning">
                        <i className="bi bi-play"></i>
                        Restart
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Summary */}
          <div className="system-summary">
            <div className="summary-cards">
              <div className="summary-card healthy">
                <div className="card-icon">
                  <i className="bi bi-check-circle"></i>
                </div>
                <div className="card-content">
                  <h4>{services.filter(s => s.status === "healthy").length}</h4>
                  <p>Healthy Services</p>
                </div>
              </div>
              <div className="summary-card warning">
                <div className="card-icon">
                  <i className="bi bi-exclamation-triangle"></i>
                </div>
                <div className="card-content">
                  <h4>{services.filter(s => s.status === "warning").length}</h4>
                  <p>Warning Status</p>
                </div>
              </div>
              <div className="summary-card critical">
                <div className="card-icon">
                  <i className="bi bi-x-circle"></i>
                </div>
                <div className="card-content">
                  <h4>{services.filter(s => s.status === "critical").length}</h4>
                  <p>Critical Issues</p>
                </div>
              </div>
              <div className="summary-card uptime">
                <div className="card-icon">
                  <i className="bi bi-clock"></i>
                </div>
                <div className="card-content">
                  <h4>99.2%</h4>
                  <p>Overall Uptime</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Events */}
          <div className="recent-events">
            <h3>Recent System Events</h3>
            <div className="events-list">
              <div className="event-item">
                <div className="event-time">15:30</div>
                <div className="event-content">
                  <div className="event-type info">INFO</div>
                  <div className="event-message">System health check completed successfully</div>
                </div>
              </div>
              <div className="event-item">
                <div className="event-time">15:28</div>
                <div className="event-content">
                  <div className="event-type warning">WARNING</div>
                  <div className="event-message">Alert Service response time exceeded threshold</div>
                </div>
              </div>
              <div className="event-item">
                <div className="event-time">15:25</div>
                <div className="event-content">
                  <div className="event-type error">ERROR</div>
                  <div className="event-message">Alert Service connection timeout</div>
                </div>
              </div>
              <div className="event-item">
                <div className="event-time">15:20</div>
                <div className="event-content">
                  <div className="event-type info">INFO</div>
                  <div className="event-message">Database maintenance completed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;