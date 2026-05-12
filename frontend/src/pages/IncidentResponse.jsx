import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "../components/Sidebar";

const IncidentResponse = () => {
  const { t } = useTranslation();
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");

  // Mock incident data
  useEffect(() => {
    const mockIncidents = [
      {
        id: "INC-001",
        title: "Suspicious Login Attempts",
        description: "Multiple failed login attempts detected from IP 192.168.1.100",
        severity: "high",
        status: "open",
        assignee: "Security Team Alpha",
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T14:20:00Z",
        source: "Authentication System",
        affectedSystems: ["Web Portal", "Database Server"],
        timeline: [
          { time: "10:30", action: "Incident created", user: "System" },
          { time: "10:35", action: "Assigned to Security Team Alpha", user: "Admin" },
          { time: "14:20", action: "Investigation started", user: "John Doe" }
        ]
      },
      {
        id: "INC-002",
        title: "Malware Detection",
        description: "Potential malware detected on workstation WS-205",
        severity: "critical",
        status: "in-progress",
        assignee: "Incident Response Team",
        createdAt: "2024-01-15T09:15:00Z",
        updatedAt: "2024-01-15T15:45:00Z",
        source: "Endpoint Protection",
        affectedSystems: ["Workstation WS-205"],
        timeline: [
          { time: "09:15", action: "Malware detected", user: "System" },
          { time: "09:20", action: "Workstation isolated", user: "Auto-Response" },
          { time: "15:45", action: "Forensic analysis initiated", user: "Jane Smith" }
        ]
      },
      {
        id: "INC-003",
        title: "Data Exfiltration Attempt",
        description: "Unusual data transfer patterns detected",
        severity: "medium",
        status: "resolved",
        assignee: "Network Security Team",
        createdAt: "2024-01-14T16:20:00Z",
        updatedAt: "2024-01-15T08:30:00Z",
        source: "Network Monitor",
        affectedSystems: ["File Server", "Network Gateway"],
        timeline: [
          { time: "16:20", action: "Anomaly detected", user: "System" },
          { time: "16:25", action: "Traffic blocked", user: "Auto-Response" },
          { time: "08:30", action: "False positive confirmed", user: "Mike Johnson" }
        ]
      }
    ];
    setIncidents(mockIncidents);
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical": return "#dc3545";
      case "high": return "#fd7e14";
      case "medium": return "#ffc107";
      case "low": return "#28a745";
      default: return "#6c757d";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open": return "#dc3545";
      case "in-progress": return "#ffc107";
      case "resolved": return "#28a745";
      case "closed": return "#6c757d";
      default: return "#6c757d";
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    const statusMatch = filterStatus === "all" || incident.status === filterStatus;
    const severityMatch = filterSeverity === "all" || incident.severity === filterSeverity;
    return statusMatch && severityMatch;
  });

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">
            <i className="bi bi-shield-exclamation"></i>
            Incident Response
          </h1>
          <p className="page-subtitle">Manage and track security incidents</p>
        </div>

        <div className="incident-response-container">
          {/* Filters and Controls */}
          <div className="incident-controls">
            <div className="filter-group">
              <label>Status:</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Severity:</label>
              <select 
                value={filterSeverity} 
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <button className="btn btn-primary">
              <i className="bi bi-plus"></i>
              Create Incident
            </button>
          </div>

          <div className="incident-layout">
            {/* Incident List */}
            <div className="incident-list">
              <h3>Active Incidents ({filteredIncidents.length})</h3>
              {filteredIncidents.map(incident => (
                <div 
                  key={incident.id}
                  className={`incident-card ${selectedIncident?.id === incident.id ? 'selected' : ''}`}
                  onClick={() => setSelectedIncident(incident)}
                >
                  <div className="incident-header">
                    <span className="incident-id">{incident.id}</span>
                    <div className="incident-badges">
                      <span 
                        className="severity-badge"
                        style={{ backgroundColor: getSeverityColor(incident.severity) }}
                      >
                        {incident.severity.toUpperCase()}
                      </span>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(incident.status) }}
                      >
                        {incident.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <h4 className="incident-title">{incident.title}</h4>
                  <p className="incident-description">{incident.description}</p>
                  <div className="incident-meta">
                    <span><i className="bi bi-person"></i> {incident.assignee}</span>
                    <span><i className="bi bi-clock"></i> {new Date(incident.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Incident Details */}
            <div className="incident-details">
              {selectedIncident ? (
                <>
                  <div className="details-header">
                    <h3>{selectedIncident.title}</h3>
                    <div className="details-actions">
                      <button className="btn btn-secondary">
                        <i className="bi bi-pencil"></i>
                        Edit
                      </button>
                      <button className="btn btn-success">
                        <i className="bi bi-check-circle"></i>
                        Resolve
                      </button>
                    </div>
                  </div>

                  <div className="details-content">
                    <div className="detail-section">
                      <h4>Incident Information</h4>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <label>ID:</label>
                          <span>{selectedIncident.id}</span>
                        </div>
                        <div className="detail-item">
                          <label>Severity:</label>
                          <span 
                            className="severity-badge"
                            style={{ backgroundColor: getSeverityColor(selectedIncident.severity) }}
                          >
                            {selectedIncident.severity.toUpperCase()}
                          </span>
                        </div>
                        <div className="detail-item">
                          <label>Status:</label>
                          <span 
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(selectedIncident.status) }}
                          >
                            {selectedIncident.status.replace('-', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="detail-item">
                          <label>Assignee:</label>
                          <span>{selectedIncident.assignee}</span>
                        </div>
                        <div className="detail-item">
                          <label>Source:</label>
                          <span>{selectedIncident.source}</span>
                        </div>
                        <div className="detail-item">
                          <label>Created:</label>
                          <span>{new Date(selectedIncident.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h4>Description</h4>
                      <p>{selectedIncident.description}</p>
                    </div>

                    <div className="detail-section">
                      <h4>Affected Systems</h4>
                      <div className="affected-systems">
                        {selectedIncident.affectedSystems.map((system, index) => (
                          <span key={index} className="system-tag">{system}</span>
                        ))}
                      </div>
                    </div>

                    <div className="detail-section">
                      <h4>Timeline</h4>
                      <div className="timeline">
                        {selectedIncident.timeline.map((event, index) => (
                          <div key={index} className="timeline-item">
                            <div className="timeline-time">{event.time}</div>
                            <div className="timeline-content">
                              <div className="timeline-action">{event.action}</div>
                              <div className="timeline-user">by {event.user}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="no-selection">
                  <i className="bi bi-shield-exclamation"></i>
                  <h3>Select an incident to view details</h3>
                  <p>Choose an incident from the list to see detailed information and timeline.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentResponse;