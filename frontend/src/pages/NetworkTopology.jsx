import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "../components/Sidebar";

const NetworkTopology = () => {
  const { t } = useTranslation();
  const [selectedNode, setSelectedNode] = useState(null);
  const [viewMode, setViewMode] = useState("logical");
  const [networkNodes, setNetworkNodes] = useState([]);

  // Mock network topology data
  useEffect(() => {
    const mockNodes = [
      {
        id: "firewall-01",
        name: "Main Firewall",
        type: "firewall",
        status: "online",
        ip: "192.168.1.1",
        location: "Data Center",
        connections: ["router-01", "switch-01"],
        metrics: {
          cpu: 45,
          memory: 62,
          throughput: "850 Mbps",
          connections: 1247
        },
        alerts: 2
      },
      {
        id: "router-01",
        name: "Core Router",
        type: "router",
        status: "online",
        ip: "192.168.1.2",
        location: "Data Center",
        connections: ["firewall-01", "switch-01", "switch-02"],
        metrics: {
          cpu: 32,
          memory: 48,
          throughput: "1.2 Gbps",
          connections: 2156
        },
        alerts: 0
      },
      {
        id: "switch-01",
        name: "Core Switch A",
        type: "switch",
        status: "online",
        ip: "192.168.1.10",
        location: "Building A",
        connections: ["router-01", "server-01", "server-02"],
        metrics: {
          cpu: 28,
          memory: 35,
          throughput: "800 Mbps",
          connections: 48
        },
        alerts: 1
      },
      {
        id: "switch-02",
        name: "Core Switch B",
        type: "switch",
        status: "warning",
        ip: "192.168.1.11",
        location: "Building B",
        connections: ["router-01", "server-03"],
        metrics: {
          cpu: 78,
          memory: 82,
          throughput: "650 Mbps",
          connections: 42
        },
        alerts: 3
      },
      {
        id: "server-01",
        name: "Web Server",
        type: "server",
        status: "online",
        ip: "192.168.1.100",
        location: "Building A",
        connections: ["switch-01"],
        metrics: {
          cpu: 55,
          memory: 68,
          throughput: "200 Mbps",
          connections: 156
        },
        alerts: 0
      },
      {
        id: "server-02",
        name: "Database Server",
        type: "server",
        status: "online",
        ip: "192.168.1.101",
        location: "Building A",
        connections: ["switch-01"],
        metrics: {
          cpu: 72,
          memory: 85,
          throughput: "150 Mbps",
          connections: 89
        },
        alerts: 1
      },
      {
        id: "server-03",
        name: "File Server",
        type: "server",
        status: "offline",
        ip: "192.168.1.102",
        location: "Building B",
        connections: ["switch-02"],
        metrics: {
          cpu: 0,
          memory: 0,
          throughput: "0 Mbps",
          connections: 0
        },
        alerts: 5
      }
    ];
    setNetworkNodes(mockNodes);
  }, []);

  const getNodeIcon = (type) => {
    switch (type) {
      case "firewall": return "bi-shield-check";
      case "router": return "bi-router";
      case "switch": return "bi-diagram-3";
      case "server": return "bi-server";
      default: return "bi-circle";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "online": return "#28a745";
      case "warning": return "#ffc107";
      case "offline": return "#dc3545";
      default: return "#6c757d";
    }
  };

  const getMetricColor = (value) => {
    if (value >= 80) return "#dc3545";
    if (value >= 60) return "#ffc107";
    return "#28a745";
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">
            <i className="bi bi-diagram-3"></i>
            Network Topology
          </h1>
          <p className="page-subtitle">Visualize and monitor network infrastructure</p>
        </div>

        <div className="network-topology-container">
          {/* Controls */}
          <div className="topology-controls">
            <div className="view-controls">
              <button 
                className={`btn ${viewMode === "logical" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setViewMode("logical")}
              >
                <i className="bi bi-diagram-2"></i>
                Logical View
              </button>
              <button 
                className={`btn ${viewMode === "physical" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setViewMode("physical")}
              >
                <i className="bi bi-building"></i>
                Physical View
              </button>
            </div>
            <div className="topology-actions">
              <button className="btn btn-secondary">
                <i className="bi bi-arrow-clockwise"></i>
                Refresh
              </button>
              <button className="btn btn-secondary">
                <i className="bi bi-download"></i>
                Export
              </button>
            </div>
          </div>

          <div className="topology-layout">
            {/* Network Diagram */}
            <div className="network-diagram">
              <div className="diagram-container">
                <svg className="topology-svg" viewBox="0 0 800 600">
                  {/* Connection Lines */}
                  <g className="connections">
                    <line x1="400" y1="100" x2="400" y2="200" stroke="#6c757d" strokeWidth="2" />
                    <line x1="400" y1="200" x2="200" y2="300" stroke="#6c757d" strokeWidth="2" />
                    <line x1="400" y1="200" x2="600" y2="300" stroke="#6c757d" strokeWidth="2" />
                    <line x1="200" y1="300" x2="150" y2="450" stroke="#6c757d" strokeWidth="2" />
                    <line x1="200" y1="300" x2="250" y2="450" stroke="#6c757d" strokeWidth="2" />
                    <line x1="600" y1="300" x2="600" y2="450" stroke="#6c757d" strokeWidth="2" />
                  </g>

                  {/* Network Nodes */}
                  {networkNodes.map((node, index) => {
                    const positions = {
                      "firewall-01": { x: 400, y: 100 },
                      "router-01": { x: 400, y: 200 },
                      "switch-01": { x: 200, y: 300 },
                      "switch-02": { x: 600, y: 300 },
                      "server-01": { x: 150, y: 450 },
                      "server-02": { x: 250, y: 450 },
                      "server-03": { x: 600, y: 450 }
                    };
                    
                    const pos = positions[node.id] || { x: 100 + index * 100, y: 100 };
                    
                    return (
                      <g key={node.id} className="network-node" onClick={() => setSelectedNode(node)}>
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="30"
                          fill={getStatusColor(node.status)}
                          stroke="#fff"
                          strokeWidth="3"
                          className="node-circle"
                        />
                        <text
                          x={pos.x}
                          y={pos.y + 50}
                          textAnchor="middle"
                          className="node-label"
                          fill="var(--text-color)"
                        >
                          {node.name}
                        </text>
                        {node.alerts > 0 && (
                          <circle
                            cx={pos.x + 20}
                            cy={pos.y - 20}
                            r="8"
                            fill="#dc3545"
                            className="alert-indicator"
                          />
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Legend */}
              <div className="topology-legend">
                <h4>Legend</h4>
                <div className="legend-items">
                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: "#28a745" }}></div>
                    <span>Online</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: "#ffc107" }}></div>
                    <span>Warning</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: "#dc3545" }}></div>
                    <span>Offline</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Node Details Panel */}
            <div className="node-details-panel">
              {selectedNode ? (
                <>
                  <div className="details-header">
                    <h3>
                      <i className={`bi ${getNodeIcon(selectedNode.type)}`}></i>
                      {selectedNode.name}
                    </h3>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(selectedNode.status) }}
                    >
                      {selectedNode.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="node-info">
                    <div className="info-section">
                      <h4>Basic Information</h4>
                      <div className="info-grid">
                        <div className="info-item">
                          <label>Type:</label>
                          <span>{selectedNode.type}</span>
                        </div>
                        <div className="info-item">
                          <label>IP Address:</label>
                          <span>{selectedNode.ip}</span>
                        </div>
                        <div className="info-item">
                          <label>Location:</label>
                          <span>{selectedNode.location}</span>
                        </div>
                        <div className="info-item">
                          <label>Alerts:</label>
                          <span className={selectedNode.alerts > 0 ? "alert-count" : ""}>
                            {selectedNode.alerts}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="info-section">
                      <h4>Performance Metrics</h4>
                      <div className="metrics-grid">
                        <div className="metric-item">
                          <label>CPU Usage:</label>
                          <div className="metric-bar">
                            <div 
                              className="metric-fill"
                              style={{ 
                                width: `${selectedNode.metrics.cpu}%`,
                                backgroundColor: getMetricColor(selectedNode.metrics.cpu)
                              }}
                            ></div>
                            <span>{selectedNode.metrics.cpu}%</span>
                          </div>
                        </div>
                        <div className="metric-item">
                          <label>Memory Usage:</label>
                          <div className="metric-bar">
                            <div 
                              className="metric-fill"
                              style={{ 
                                width: `${selectedNode.metrics.memory}%`,
                                backgroundColor: getMetricColor(selectedNode.metrics.memory)
                              }}
                            ></div>
                            <span>{selectedNode.metrics.memory}%</span>
                          </div>
                        </div>
                        <div className="metric-item">
                          <label>Throughput:</label>
                          <span>{selectedNode.metrics.throughput}</span>
                        </div>
                        <div className="metric-item">
                          <label>Active Connections:</label>
                          <span>{selectedNode.metrics.connections}</span>
                        </div>
                      </div>
                    </div>

                    <div className="info-section">
                      <h4>Connections</h4>
                      <div className="connections-list">
                        {selectedNode.connections.map((connection, index) => {
                          const connectedNode = networkNodes.find(n => n.id === connection);
                          return (
                            <div key={index} className="connection-item">
                              <i className={`bi ${getNodeIcon(connectedNode?.type || "unknown")}`}></i>
                              <span>{connectedNode?.name || connection}</span>
                              <span 
                                className="connection-status"
                                style={{ color: getStatusColor(connectedNode?.status || "unknown") }}
                              >
                                {connectedNode?.status || "unknown"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="node-actions">
                      <button className="btn btn-primary">
                        <i className="bi bi-gear"></i>
                        Configure
                      </button>
                      <button className="btn btn-secondary">
                        <i className="bi bi-graph-up"></i>
                        View Metrics
                      </button>
                      <button className="btn btn-warning">
                        <i className="bi bi-exclamation-triangle"></i>
                        Troubleshoot
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="no-selection">
                  <i className="bi bi-diagram-3"></i>
                  <h3>Select a network node</h3>
                  <p>Click on any node in the diagram to view detailed information and metrics.</p>
                </div>
              )}
            </div>
          </div>

          {/* Network Summary */}
          <div className="network-summary">
            <div className="summary-cards">
              <div className="summary-card">
                <div className="card-icon">
                  <i className="bi bi-check-circle" style={{ color: "#28a745" }}></i>
                </div>
                <div className="card-content">
                  <h4>{networkNodes.filter(n => n.status === "online").length}</h4>
                  <p>Online Devices</p>
                </div>
              </div>
              <div className="summary-card">
                <div className="card-icon">
                  <i className="bi bi-exclamation-triangle" style={{ color: "#ffc107" }}></i>
                </div>
                <div className="card-content">
                  <h4>{networkNodes.filter(n => n.status === "warning").length}</h4>
                  <p>Warning Status</p>
                </div>
              </div>
              <div className="summary-card">
                <div className="card-icon">
                  <i className="bi bi-x-circle" style={{ color: "#dc3545" }}></i>
                </div>
                <div className="card-content">
                  <h4>{networkNodes.filter(n => n.status === "offline").length}</h4>
                  <p>Offline Devices</p>
                </div>
              </div>
              <div className="summary-card">
                <div className="card-icon">
                  <i className="bi bi-bell" style={{ color: "#dc3545" }}></i>
                </div>
                <div className="card-content">
                  <h4>{networkNodes.reduce((sum, n) => sum + n.alerts, 0)}</h4>
                  <p>Active Alerts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkTopology;