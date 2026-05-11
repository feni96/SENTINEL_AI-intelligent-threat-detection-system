import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function AreaMap() {
  const { t } = useTranslation();
  // ---------- Mock Data ----------
  const campusZones = [
    { id: "zone1", name: "Data Center", ipRange: "10.0.0.0/24", lat: 9.3, lng: 42.1 },
    { id: "zone2", name: "Admin Office", ipRange: "10.0.1.0/24", lat: 9.31, lng: 42.11 },
    { id: "zone3", name: "Library", ipRange: "10.0.2.0/24", lat: 9.32, lng: 42.09 },
    { id: "zone4", name: "Computer Labs", ipRange: "10.0.3.0/24", lat: 9.33, lng: 42.12 },
    { id: "zone5", name: "Dormitory Network", ipRange: "10.0.4.0/24", lat: 9.34, lng: 42.13 },
    { id: "zone6", name: "Staff Network", ipRange: "10.0.5.0/24", lat: 9.35, lng: 42.14 },
    { id: "zone7", name: "Student Wi-Fi", ipRange: "10.0.6.0/24", lat: 9.36, lng: 42.15 },
  ];

  // Mock threats (some with location mapping)
  const [threats] = useState([
    { id: "THR-001", type: "DDoS", severity: "Critical", confidence: 98, sourceIP: "10.0.1.105", zoneId: "zone2", time: "2025-03-20 10:45" },
    { id: "THR-002", type: "Malware", severity: "High", confidence: 87, sourceIP: "10.0.2.23", zoneId: "zone3", time: "2025-03-20 09:22" },
    { id: "THR-003", type: "Brute Force", severity: "Medium", confidence: 76, sourceIP: "10.0.3.45", zoneId: "zone4", time: "2025-03-19 15:15" },
    { id: "THR-004", type: "Port Scan", severity: "Low", confidence: 65, sourceIP: "10.0.4.101", zoneId: "zone5", time: "2025-03-19 11:30" },
    { id: "THR-005", type: "DDoS", severity: "Critical", confidence: 95, sourceIP: "10.0.0.12", zoneId: "zone1", time: "2025-03-20 12:05" },
    { id: "THR-006", type: "Unauthorized Access", severity: "High", confidence: 82, sourceIP: "10.0.5.67", zoneId: "zone6", time: "2025-03-20 08:10" },
    { id: "THR-007", type: "Malware", severity: "Medium", confidence: 71, sourceIP: "10.0.6.89", zoneId: "zone7", time: "2025-03-20 07:30" },
  ]);

  // ---------- State ----------
  const [selectedZone, setSelectedZone] = useState(null);
  const [showZoneDetails, setShowZoneDetails] = useState(false);

  // Filters
  const [timeRange, setTimeRange] = useState("24h");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [confidenceThreshold, setConfidenceThreshold] = useState(0);

  // Derived filter options
  const threatTypes = ["All", ...new Set(threats.map(t => t.type))];
  const severityLevels = ["All", "Critical", "High", "Medium", "Low"];

  // Filter threats based on current filters
  const filteredThreats = threats.filter(t => {
    const matchesSeverity = severityFilter === "All" || t.severity === severityFilter;
    const matchesType = typeFilter === "All" || t.type === typeFilter;
    const matchesConfidence = t.confidence >= confidenceThreshold;
    return matchesSeverity && matchesType && matchesConfidence;
  });

  // Group threats by zone for heatmap intensity
  const zoneThreatCounts = campusZones.reduce((acc, zone) => {
    const count = filteredThreats.filter(t => t.zoneId === zone.id).length;
    acc[zone.id] = count;
    return acc;
  }, {});

  const maxThreats = Math.max(...Object.values(zoneThreatCounts), 1);

  // Helper to get threat count for a zone
  const getThreatCount = (zoneId) => filteredThreats.filter(t => t.zoneId === zoneId).length;

  // Helper to get highest severity in a zone
  const getZoneHighestSeverity = (zoneId) => {
    const zoneThreats = threats.filter(t => t.zoneId === zoneId);
    if (zoneThreats.length === 0) return null;
    const severityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    return zoneThreats.reduce((max, t) => severityOrder[t.severity] > severityOrder[max] ? t.severity : max, zoneThreats[0].severity);
  };

  // Helper to get marker color based on severity
  const getMarkerColor = (severity) => {
    switch (severity) {
      case "Critical": return "#ef4444";
      case "High": return "#f59e0b";
      case "Medium": return "#eab308";
      case "Low": return "#10b981";
      default: return "#94a3b8";
    }
  };

  // Helper to get heatmap intensity class
  const getHeatIntensity = (count) => {
    if (count === 0) return "heat-none";
    if (count <= 1) return "heat-low";
    if (count <= 2) return "heat-medium";
    return "heat-high";
  };

  const handleZoneClick = (zone) => {
    setSelectedZone(zone);
    setShowZoneDetails(true);
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">
          {/* Header removed as requested */}

          {/* Filters */}
          <div className="filters-bar">
            <div className="filter-group">
              <label>{t("timeRange")}</label>
              <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                <option value="1h">{t("lastHour")}</option>
                <option value="24h">{t("last24Hours")}</option>
                <option value="7d">{t("last7Days")}</option>
              </select>
            </div>
            <div className="filter-group">
              <label>{t("severity")}</label>
              <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
                {severityLevels.map((s) => (
                  <option key={s}>{t(s.toLowerCase())}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>{t("threatType")}</label>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                {threatTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>{t("minConfidence")}</label>
              <select value={confidenceThreshold} onChange={(e) => setConfidenceThreshold(Number(e.target.value))}>
                <option value={0}>{t("any")}</option>
                <option value={70}>≥70%</option>
                <option value={80}>≥80%</option>
                <option value={90}>≥90%</option>
              </select>
            </div>
          </div>

          {/* Map Area */}
          <div className="map-container">
            <div className="realtime-grid">
              {campusZones.map(zone => {
                const threatCount = getThreatCount(zone.id);
                const highestSeverity = getZoneHighestSeverity(zone.id);
                const heatClass = getHeatIntensity(threatCount);
                return (
                  <div
                    key={zone.id}
                    className="realtime-metric-card"
                    data-zone={zone.id}
                    onClick={() => handleZoneClick(zone)}
                  >
                    <div className="realtime-content">
                      <span className="realtime-label">{zone.name}</span>
                      <span className="realtime-value">{threatCount}</span>
                      <span className="realtime-unit">threats</span>
                    </div>
                    {threatCount > 0 && (
                      <div
                        className="threat-indicator"
                        style={{
                          backgroundColor: getMarkerColor(highestSeverity),
                        }}
                        title={`${threatCount} threat(s), highest severity: ${highestSeverity}`}
                      ></div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="map-legend">
              <h4>{t("legend")}</h4>
              <div className="legend-item">
                <span className="marker-sample critical"></span> {t("critical")}
              </div>
              <div className="legend-item">
                <span className="marker-sample high"></span> {t("high")}
              </div>
              <div className="legend-item">
                <span className="marker-sample medium"></span> {t("medium")}
              </div>
              <div className="legend-item">
                <span className="marker-sample low"></span> {t("low")}
              </div>
              <div className="legend-item heat">
                <span className="heat-sample heat-low"></span> {t("lowDensity")}
              </div>
              <div className="legend-item heat">
                <span className="heat-sample heat-medium"></span> {t("mediumDensity")}
              </div>
              <div className="legend-item heat">
                <span className="heat-sample heat-high"></span> {t("highDensity")}
              </div>
            </div>
          </div>

          {/* Zone Details Panel */}
          {showZoneDetails && selectedZone && (
            <div className="zone-details-panel">
              <h3>{selectedZone.name}</h3>
              <button className="close-btn" onClick={() => setShowZoneDetails(false)}>×</button>
              <p><strong>IP Range:</strong> {selectedZone.ipRange}</p>
              <p><strong>Total Threats:</strong> {getThreatCount(selectedZone.id)}</p>
              <p><strong>Highest Severity:</strong> {getZoneHighestSeverity(selectedZone.id) || "None"}</p>
              <p><strong>{t("lastDetected")}</strong> {
                threats.filter((item) => item.zoneId === selectedZone.id)
                  .sort((a, b) => new Date(b.time) - new Date(a.time))[0]?.time || t("notAvailable")
              }</p>
              <h4>{t("threatsInThisZone")}</h4>
              <ul className="threat-list">
                {threats.filter((item) => item.zoneId === selectedZone.id).map((item) => (
                  <li key={item.id}>
                    <span className={`threat-type-badge ${item.severity.toLowerCase()}`}>{item.type}</span>
                    <span>{item.severity}</span>
                    <span>{item.confidence}%</span>
                    <span>{item.time}</span>
                  </li>
                ))}
              </ul>
              <button className="btn-primary" onClick={() => {
                const zoneId = selectedZone?.id;
                if (zoneId) {
                  sessionStorage.setItem('zoneFilter', zoneId);
                  window.location.href = '/threats';
                }
              }}>
                {t("viewAllThreatsInZone")}
              </button>
            </div>
          )}

          {/* Data Source Note (for examiners) */}
          <div className="data-source-note">
            <p>
              <strong>📍 {t("dataSource")}</strong> {t("areaMapDataSourceDescription")}
            </p>
          </div>

          {/* System Flow Explanation */}
          <div className="flow-explanation card">
            <h4>{t("howAreaMapFitsSystemFlow")}</h4>
            <ol>
              <li>{t("systemFlowStep1")}</li>
              <li>{t("systemFlowStep2")}</li>
              <li>{t("systemFlowStep3")}</li>
              <li>{t("systemFlowStep4")}</li>
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}