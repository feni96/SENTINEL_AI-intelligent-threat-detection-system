import React, { useState } from "react";
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
import "./Threats.css";

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

export default function Threats() {
  // ---------- Mock Threat Data (Aligned with Schema) ----------
  const [threats, setThreats] = useState([
    {
      // Core schema fields
      _id: "THR-001",
      logId: "LOG-98372",                     // Reference to NetworkLog
      threatType: "DDoS Attack",
      severityLevel: "Critical",               // enum
      confidenceScore: 98,
      status: "New",                            // enum, default "New"
      detectedAt: "2025-03-20T10:45:23Z",       // ISO string
      sourceIP: "192.168.1.105",
      areaName: "Admin Building",
      zoneType: "Administrative",
      latitude: 40.7128,
      longitude: -74.0060,

      // Extra UI fields (not in schema, but useful for display)
      relatedAlert: "ALT-001",
      description: "Large-scale DDoS attack targeting admin network. Multiple SYN floods from diverse sources.",
      classification: "Volumetric DDoS",
      confidenceExplanation: "Very high confidence based on traffic patterns and known DDoS signatures.",
      logs: ["LOG-98372", "LOG-98373"],
      timeline: [
        { time: "10:45:23", event: "Initial detection" },
        { time: "10:46:10", event: "Traffic spike confirmed" },
        { time: "10:47:00", event: "Attack classified as DDoS" },
      ],
      sourceDestIP: { src: "192.168.1.105", dst: "10.0.0.5" },
      attackPattern: "SYN flood with spoofed IPs",
      recommendedAction: "Block source IPs and enable rate limiting on the firewall.",
    },
    {
      _id: "THR-002",
      logId: "LOG-98374",
      threatType: "Malware",
      severityLevel: "High",
      confidenceScore: 87,
      status: "Investigating",
      detectedAt: "2025-03-20T09:22:17Z",
      sourceIP: "10.0.0.23",
      areaName: "Library",
      zoneType: "Academic",
      latitude: 40.7135,
      longitude: -74.0055,
      relatedAlert: "ALT-002",
      description: "Malware signature detected on Library server.",
      classification: "Trojan.Generic",
      confidenceExplanation: "High confidence based on signature match with known malware.",
      logs: ["LOG-98374"],
      timeline: [
        { time: "09:22:17", event: "Signature match" },
        { time: "09:25:00", event: "File quarantined" },
      ],
      sourceDestIP: { src: "10.0.0.23", dst: "8.8.8.8" },
      attackPattern: "C2 beaconing",
      recommendedAction: "Run full antivirus scan and isolate the server.",
    },
    {
      _id: "THR-003",
      logId: "LOG-98375",
      threatType: "Unauthorized Access",
      severityLevel: "Medium",
      confidenceScore: 76,
      status: "Resolved",
      detectedAt: "2025-03-19T15:15:02Z",
      sourceIP: "172.16.0.45",
      areaName: "Computer Lab 3",
      zoneType: "Academic",
      latitude: 40.7140,
      longitude: -74.0045,
      relatedAlert: "ALT-003",
      description: "Repeated failed login attempts from lab machine.",
      classification: "Brute-force attempt",
      confidenceExplanation: "Moderate confidence; pattern matches brute-force, but no successful login.",
      logs: ["LOG-98375"],
      timeline: [
        { time: "15:15:02", event: "First detection" },
        { time: "15:30:00", event: "IP blocked" },
      ],
      sourceDestIP: { src: "172.16.0.45", dst: "10.0.10.20" },
      attackPattern: "SSH brute force",
      recommendedAction: "Investigate user activity; ensure strong passwords.",
    },
    {
      _id: "THR-004",
      logId: "LOG-98376",
      threatType: "Port Scanning",
      severityLevel: "Low",
      confidenceScore: 65,
      status: "False Positive",
      detectedAt: "2025-03-19T11:30:44Z",
      sourceIP: "192.168.2.101",
      areaName: "Student Dorm A",
      zoneType: "Residential",
      latitude: 40.7150,
      longitude: -74.0030,
      relatedAlert: "ALT-004",
      description: "Port scan detected from dormitory subnet.",
      classification: "Reconnaissance",
      confidenceExplanation: "Low confidence; could be benign scanning tool.",
      logs: ["LOG-98376"],
      timeline: [
        { time: "11:30:44", event: "Scan detected" },
        { time: "11:45:00", event: "Marked as false positive" },
      ],
      sourceDestIP: { src: "192.168.2.101", dst: "10.0.0.1" },
      attackPattern: "TCP SYN scan",
      recommendedAction: "Monitor for further activity.",
    },
    {
      _id: "THR-005",
      logId: "LOG-98377",
      threatType: "Brute Force",
      severityLevel: "Critical",
      confidenceScore: 95,
      status: "New",
      detectedAt: "2025-03-20T12:05:11Z",
      sourceIP: "45.128.34.12",
      areaName: "External",
      zoneType: "External",
      latitude: 0,
      longitude: 0,
      relatedAlert: "ALT-005",
      description: "Brute force attack on finance system.",
      classification: "Credential stuffing",
      confidenceExplanation: "Very high confidence based on velocity and known patterns.",
      logs: ["LOG-98377"],
      timeline: [
        { time: "12:05:11", event: "Attack detected" },
        { time: "12:06:00", event: "Rate limiting triggered" },
      ],
      sourceDestIP: { src: "45.128.34.12", dst: "10.0.20.5" },
      attackPattern: "Multiple login attempts from many IPs",
      recommendedAction: "Enable CAPTCHA and notify finance team.",
    },
  ]);

  // ---------- State ----------
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Filters
  const [filterSeverity, setFilterSeverity] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterMinConfidence, setFilterMinConfidence] = useState(0);
  const [filterArea, setFilterArea] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [timeRange, setTimeRange] = useState("24h");

  // Derived filter options (using new field names)
  const severityOptions = ["All", ...new Set(threats.map(t => t.severityLevel))];
  const typeOptions = ["All", ...new Set(threats.map(t => t.threatType))];
  const statusOptions = ["All", ...new Set(threats.map(t => t.status))];
  const areaOptions = ["All", ...new Set(threats.map(t => t.areaName))];

  // Filtered threats
  const filteredThreats = threats.filter(t => {
    const matchesSeverity = filterSeverity === "All" || t.severityLevel === filterSeverity;
    const matchesType = filterType === "All" || t.threatType === filterType;
    const matchesStatus = filterStatus === "All" || t.status === filterStatus;
    const matchesConfidence = t.confidenceScore >= filterMinConfidence;
    const matchesArea = filterArea === "All" || t.areaName === filterArea;
    const matchesSearch =
      searchTerm === "" ||
      t._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.sourceIP.includes(searchTerm) ||
      t.threatType.toLowerCase().includes(searchTerm.toLowerCase());
    // Time range filter would be more complex in real app
    return matchesSeverity && matchesType && matchesStatus && matchesConfidence && matchesArea && matchesSearch;
  });

  // Summary Cards (using new field names)
  const totalThreats = threats.length;
  const activeThreats = threats.filter(t => t.status === "New" || t.status === "Investigating").length;
  const criticalHigh = threats.filter(t => t.severityLevel === "Critical" || t.severityLevel === "High").length;
  const resolvedFP = threats.filter(t => t.status === "Resolved" || t.status === "False Positive").length;

  // ---------- Chart Data ----------
  // Threats by Type
  const typeCounts = threats.reduce((acc, t) => {
    acc[t.threatType] = (acc[t.threatType] || 0) + 1;
    return acc;
  }, {});
  const typeChartData = {
    labels: Object.keys(typeCounts),
    datasets: [
      {
        label: "Count",
        data: Object.values(typeCounts),
        backgroundColor: "#60a5fa",
      },
    ],
  };

  // Threats by Severity
  const severityCounts = {
    Critical: threats.filter(t => t.severityLevel === "Critical").length,
    High: threats.filter(t => t.severityLevel === "High").length,
    Medium: threats.filter(t => t.severityLevel === "Medium").length,
    Low: threats.filter(t => t.severityLevel === "Low").length,
  };
  const severityPieData = {
    labels: ["Critical", "High", "Medium", "Low"],
    datasets: [
      {
        data: [severityCounts.Critical, severityCounts.High, severityCounts.Medium, severityCounts.Low],
        backgroundColor: ["#ef4444", "#f59e0b", "#eab308", "#10b981"],
      },
    ],
  };

  // Threat Trend Over Time (mock)
  const trendLabels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"];
  const trendData = [1, 3, 5, 8, 6, 4];
  const trendChartData = {
    labels: trendLabels,
    datasets: [
      {
        label: "Threats",
        data: trendData,
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Confidence Distribution (mock bins)
  const confidenceBins = [0, 50, 70, 80, 90, 100];
  const confidenceCounts = [0, 1, 1, 2, 1]; // for bins 0-50,50-70,70-80,80-90,90-100
  const confidenceChartData = {
    labels: ["<50%", "50-70%", "70-80%", "80-90%", "90-100%"],
    datasets: [
      {
        label: "Threats",
        data: confidenceCounts,
        backgroundColor: "#818cf8",
      },
    ],
  };

  // ---------- ML Model Info ----------
  const mlModel = {
    name: "Random Forest + CNN Ensemble",
    accuracy: 98.2,
    falsePositiveRate: 1.8,
    lastTrained: "2025-03-15",
  };

  // ---------- Helper Functions ----------
  const getSeverityBadge = (severityLevel) => {
    const classes = {
      Critical: "badge-critical",
      High: "badge-high",
      Medium: "badge-medium",
      Low: "badge-low",
    };
    return <span className={`badge ${classes[severityLevel]}`}>{severityLevel}</span>;
  };

  const getStatusBadge = (status) => {
    const classes = {
      New: "badge-new",
      Investigating: "badge-investigating",
      Resolved: "badge-resolved",
      "False Positive": "badge-falsepositive",
    };
    return <span className={`badge ${classes[status] || "badge-default"}`}>{status}</span>;
  };

  const handleInvestigate = (id) => {
    setThreats(threats.map(t => t._id === id ? { ...t, status: "Investigating" } : t));
  };
  const handleResolve = (id) => {
    setThreats(threats.map(t => t._id === id ? { ...t, status: "Resolved" } : t));
  };
  const handleFalsePositive = (id) => {
    setThreats(threats.map(t => t._id === id ? { ...t, status: "False Positive" } : t));
  };

  const handleRowClick = (threat) => {
    setSelectedThreat(threat);
    setShowDetails(true);
  };

  // Area-based visualization mock (simple grid)
  const campusZones = [
    { name: "Admin Building", risk: "high", threats: 3 },
    { name: "Library", risk: "medium", threats: 1 },
    { name: "Computer Lab 3", risk: "low", threats: 1 },
    { name: "Student Dorm A", risk: "low", threats: 1 },
    { name: "External", risk: "critical", threats: 1 },
  ];

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">
          {/* Header */}
          <div className="content-header">
            <h1>Threat Detection & Analysis</h1>
            <div className="search-bar">
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="Search Threat ID, Source IP, Type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Summary Cards */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon"><i className="bi bi-shield"></i></div>
              <div className="metric-content">
                <span className="metric-label">Total Detected Threats</span>
                <span className="metric-value">{totalThreats}</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon"><i className="bi bi-exclamation-triangle"></i></div>
              <div className="metric-content">
                <span className="metric-label">Active Threats</span>
                <span className="metric-value">{activeThreats}</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon"><i className="bi bi-shield-exclamation"></i></div>
              <div className="metric-content">
                <span className="metric-label">High / Critical</span>
                <span className="metric-value">{criticalHigh}</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon"><i className="bi bi-check-circle"></i></div>
              <div className="metric-content">
                <span className="metric-label">Resolved / False Pos.</span>
                <span className="metric-value">{resolvedFP}</span>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="filters-bar">
            <div className="filter-group">
              <label>Severity</label>
              <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
                {severityOptions.map(opt => <option key={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Threat Type</label>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                {typeOptions.map(opt => <option key={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Status</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                {statusOptions.map(opt => <option key={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Min Confidence</label>
              <select value={filterMinConfidence} onChange={(e) => setFilterMinConfidence(Number(e.target.value))}>
                <option value={0}>Any</option>
                <option value={70}>≥70%</option>
                <option value={80}>≥80%</option>
                <option value={90}>≥90%</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Campus Area</label>
              <select value={filterArea} onChange={(e) => setFilterArea(e.target.value)}>
                {areaOptions.map(opt => <option key={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Time Range</label>
              <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                <option value="24h">Last 24h</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
            </div>
          </div>

          {/* Main Content: Table + Details Panel */}
          <div className="threats-main">
            <div className={`threats-table-section ${showDetails ? "with-details" : ""}`}>
              <div className="card threats-card">
                <div className="card-header">
                  <h3>Threat List</h3>
                  <div className="card-actions">
                    <button className="btn-outline">Export</button>
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="threats-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Detection Time</th>
                        <th>Type</th>
                        <th>Severity</th>
                        <th>Confidence</th>
                        <th>Source IP</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Related Log</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredThreats.map(threat => (
                        <tr
                          key={threat._id}
                          onClick={() => handleRowClick(threat)}
                          className={threat.severityLevel === "Critical" ? "critical-row" : ""}
                        >
                          <td><span className="threat-id">{threat._id}</span></td>
                          <td>{new Date(threat.detectedAt).toLocaleString()}</td>
                          <td>{threat.threatType}</td>
                          <td>{getSeverityBadge(threat.severityLevel)}</td>
                          <td><span className="confidence">{threat.confidenceScore}%</span></td>
                          <td>{threat.sourceIP}</td>
                          <td>{threat.areaName}</td>
                          <td>{getStatusBadge(threat.status)}</td>
                          <td>{threat.logId}</td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <div className="threat-actions">
                              {threat.status === "New" && (
                                <button className="btn-icon" title="Investigate" onClick={() => handleInvestigate(threat._id)}>
                                  <i className="bi bi-search"></i>
                                </button>
                              )}
                              {threat.status !== "Resolved" && threat.status !== "False Positive" && (
                                <>
                                  <button className="btn-icon" title="Resolve" onClick={() => handleResolve(threat._id)}>
                                    <i className="bi bi-check2-circle"></i>
                                  </button>
                                  <button className="btn-icon" title="False Positive" onClick={() => handleFalsePositive(threat._id)}>
                                    <i className="bi bi-x-circle"></i>
                                  </button>
                                </>
                              )}
                              <button className="btn-icon"><i className="bi bi-three-dots-vertical"></i></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Details Panel */}
            {showDetails && selectedThreat && (
              <div className="details-panel">
                <div className="details-header">
                  <h4>Threat Details</h4>
                  <button className="btn-icon" onClick={() => setShowDetails(false)}><i className="bi bi-x-lg"></i></button>
                </div>
                <div className="details-content">
                  <p><strong>ID:</strong> {selectedThreat._id}</p>
                  <p><strong>Log ID:</strong> {selectedThreat.logId}</p>
                  <p><strong>Classification:</strong> {selectedThreat.classification}</p>
                  <p><strong>Description:</strong> {selectedThreat.description}</p>
                  <p><strong>Confidence Explanation:</strong> {selectedThreat.confidenceExplanation}</p>
                  <p><strong>Related Logs:</strong> {selectedThreat.logs?.join(", ")}</p>
                  <p><strong>Timeline:</strong></p>
                  <ul className="timeline">
                    {selectedThreat.timeline?.map((item, idx) => (
                      <li key={idx}>{item.time} – {item.event}</li>
                    ))}
                  </ul>
                  <p><strong>Source/Dest IP:</strong> {selectedThreat.sourceDestIP?.src} → {selectedThreat.sourceDestIP?.dst}</p>
                  <p><strong>Attack Pattern:</strong> {selectedThreat.attackPattern}</p>
                  <p><strong>Recommended Action:</strong> {selectedThreat.recommendedAction}</p>
                  <p><strong>Campus Area:</strong> {selectedThreat.areaName}</p>
                  <p><strong>Zone Type:</strong> {selectedThreat.zoneType}</p>
                  <p><strong>Coordinates:</strong> {selectedThreat.latitude}, {selectedThreat.longitude}</p>
                </div>
                <div className="details-actions">
                  <button className="btn-primary">Take Action</button>
                </div>
              </div>
            )}
          </div>

          {/* Area-Based Threat Visualization */}
          <div className="area-viz-section">
            <h2>Threat Map / Campus Zones</h2>
            <div className="campus-map">
              <div className="map-placeholder">
                <div className="zones-grid">
                  {campusZones.map(zone => (
                    <div key={zone.name} className={`zone-card risk-${zone.risk}`}>
                      <h4>{zone.name}</h4>
                      <p>{zone.threats} active threats</p>
                      <span className={`risk-badge ${zone.risk}`}>{zone.risk} risk</span>
                    </div>
                  ))}
                </div>
                <p className="map-note">📍 Interactive map would be embedded here (Leaflet / Google Maps).</p>
              </div>
            </div>
          </div>

          {/* Analytics Charts */}
          <div className="stats-section">
            <h2>Threat Analytics</h2>
            <div className="charts-grid">
              <div className="chart-card">
                <h4>Threats by Type</h4>
                <Bar data={typeChartData} options={{ plugins: { legend: { display: false } } }} />
              </div>
              <div className="chart-card">
                <h4>Threats by Severity</h4>
                <Pie data={severityPieData} options={{ plugins: { legend: { position: "bottom" } } }} />
              </div>
              <div className="chart-card">
                <h4>Threat Trend (Today)</h4>
                <Line data={trendChartData} />
              </div>
              <div className="chart-card">
                <h4>Confidence Distribution</h4>
                <Bar data={confidenceChartData} options={{ plugins: { legend: { display: false } } }} />
              </div>
            </div>
          </div>

          {/* ML Model Insight */}
          <div className="ml-insight-card">
            <h3>🤖 ML Model Status</h3>
            <div className="ml-details">
              <div className="ml-item">
                <span className="ml-label">Model:</span>
                <span className="ml-value">{mlModel.name}</span>
              </div>
              <div className="ml-item">
                <span className="ml-label">Accuracy:</span>
                <span className="ml-value">{mlModel.accuracy}%</span>
              </div>
              <div className="ml-item">
                <span className="ml-label">False Positive Rate:</span>
                <span className="ml-value">{mlModel.falsePositiveRate}%</span>
              </div>
              <div className="ml-item">
                <span className="ml-label">Last Trained:</span>
                <span className="ml-value">{mlModel.lastTrained}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}