import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "./NetworkContext.css";

export default function NetworkContext() {
  // ---------- Mock Zone Data (would be derived from network logs) ----------
  const [zones] = useState([
    { id: 1, name: "Library", ipRange: "10.0.2.0/24", threatCount: 15, riskLevel: "medium" },
    { id: 2, name: "Computer Labs", ipRange: "10.0.3.0/24", threatCount: 24, riskLevel: "high" },
    { id: 3, name: "Student Wi-Fi", ipRange: "10.0.6.0/24", threatCount: 8, riskLevel: "low" },
    { id: 4, name: "Administration", ipRange: "10.0.1.0/24", threatCount: 22, riskLevel: "high" },
    { id: 5, name: "Data Center", ipRange: "10.0.0.0/24", threatCount: 18, riskLevel: "medium" },
    { id: 6, name: "Dormitory Network", ipRange: "10.0.4.0/24", threatCount: 28, riskLevel: "critical" },
    { id: 7, name: "Staff Network", ipRange: "10.0.5.0/24", threatCount: 12, riskLevel: "low" },
  ]);

  // ---------- Traffic Source Context (simulated from logs) ----------
  const [trafficOrigin] = useState([
    { zone: "Administration", incoming: 3420, outgoing: 2100, threats: 22 },
    { zone: "Library", incoming: 2840, outgoing: 1850, threats: 15 },
    { zone: "Computer Labs", incoming: 4120, outgoing: 3250, threats: 24 },
    { zone: "Student Wi-Fi", incoming: 6720, outgoing: 5400, threats: 8 },
    { zone: "Dormitory", incoming: 5210, outgoing: 4300, threats: 28 },
    { zone: "Data Center", incoming: 8940, outgoing: 7230, threats: 18 },
    { zone: "Staff Network", incoming: 1890, outgoing: 1420, threats: 12 },
  ]);

  // Helper to get risk badge
  const getRiskBadge = (level) => {
    const classes = {
      low: "risk-low",
      medium: "risk-medium",
      high: "risk-high",
      critical: "risk-critical",
    };
    return <span className={`risk-badge ${classes[level]}`}>{level}</span>;
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">
          <div className="content-header">
            <h1>Network Context</h1>
            <p className="page-description">
              Campus zone mapping and traffic context – used as input for AI threat detection, not network control.
            </p>
          </div>

          {/* Zone Cards */}
          <div className="zone-cards">
            {zones.map((zone) => (
              <div key={zone.id} className={`zone-card risk-${zone.riskLevel}`}>
                <div className="zone-header">
                  <h3>{zone.name}</h3>
                  {getRiskBadge(zone.riskLevel)}
                </div>
                <div className="zone-details">
                  <div className="zone-row">
                    <span className="zone-label">IP Range:</span>
                    <span className="zone-ip">{zone.ipRange}</span>
                  </div>
                  <div className="zone-row">
                    <span className="zone-label">Threats:</span>
                    <span className="zone-threat-count">{zone.threatCount}</span>
                  </div>
                </div>
                <div className="threat-indicator">
                  <div
                    className="threat-bar"
                    style={{ width: `${(zone.threatCount / 30) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Traffic Source Table */}
          <div className="card">
            <h3><i className="bi bi-arrow-left-right"></i> Traffic Origin Context</h3>
            <div className="table-responsive">
              <table className="traffic-table">
                <thead>
                  <tr>
                    <th>Zone</th>
                    <th>Incoming (pkts)</th>
                    <th>Outgoing (pkts)</th>
                    <th>Associated Threats</th>
                  </tr>
                </thead>
                <tbody>
                  {trafficOrigin.map((item, idx) => (
                    <tr key={idx}>
                      <td><strong>{item.zone}</strong></td>
                      <td>{item.incoming.toLocaleString()}</td>
                      <td>{item.outgoing.toLocaleString()}</td>
                      <td>
                        <span className={`threat-badge ${item.threats > 20 ? "high" : item.threats > 10 ? "medium" : "low"}`}>
                          {item.threats}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Area Map Support Note */}
          <div className="info-note">
            <i className="bi bi-info-circle"></i>
            <p>
              This contextual data is derived from aggregated network logs (source IP, protocol, packet size, etc.)
              and is used by the <strong>Area Map</strong> and <strong>Analytics</strong> modules to visualize threat distribution across campus zones.
              No packet filtering, firewall rules, or traffic shaping is performed here.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}