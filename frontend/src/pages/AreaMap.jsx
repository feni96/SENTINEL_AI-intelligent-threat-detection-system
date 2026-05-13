import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import { createDashboardSocket } from "../services/socket";

export default function AreaMap() {
  const { t } = useTranslation();
  
  // ---------- State ----------
  const [zones, setZones] = useState([]);
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // ---------- Fetch Data ----------
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch zones and threats in parallel
        const [zonesRes, threatsRes] = await Promise.allSettled([
          api.get('/zones'),
          api.get('/ml/threats/recent?limit=50')
        ]);

        // Process zones
        if (zonesRes.status === 'fulfilled') {
          const zonesData = zonesRes.value.data?.data?.zones || [];
          setZones(zonesData);
        } else {
          console.warn('Failed to fetch zones:', zonesRes.reason);
        }

        // Process threats
        if (threatsRes.status === 'fulfilled') {
          const threatsData = threatsRes.value.data?.data?.threats || [];
          // Enrich threats with zone information
          const enrichedThreats = await Promise.all(
            threatsData.map(async (threat) => {
              try {
                // Resolve source IP to zone
                const zoneRes = await api.get(`/zones/resolve/${threat.sourceIP}`);
                const zone = zoneRes.data?.data?.zone;
                
                return {
                  ...threat,
                  zoneId: zone?._id || 'unknown',
                  zoneName: zone?.name || 'Unknown Zone'
                };
              } catch (error) {
                console.warn('Failed to resolve zone for threat:', error);
                return {
                  ...threat,
                  zoneId: 'unknown',
                  zoneName: 'Unknown Zone'
                };
              }
            })
          );
          setThreats(enrichedThreats);
        } else {
          console.warn('Failed to fetch threats:', threatsRes.reason);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up Socket.IO for real-time updates
    const token = localStorage.getItem("token");
    try {
      const socket = createDashboardSocket(token);
      if (socket) {
        socket.on("newThreat", (event) => {
          const incoming = {
            _id: event.id,
            type: event.threatType,
            severity: event.severityLevel || "Medium",
            confidence: Math.round((event.confidence || 0) * 100),
            sourceIP: event.sourceIP,
            zoneId: event.zoneId || 'unknown',
            zoneName: event.zoneName || 'Unknown Zone',
            time: event.timestamp || new Date().toISOString(),
          };
          setThreats((prev) => [incoming, ...prev].slice(0, 50));
        });
      }
    } catch (error) {
      console.warn('Socket.IO setup failed:', error);
    }
  }, []);

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
  const zoneThreatCounts = zones.reduce((acc, zone) => {
    const count = filteredThreats.filter(t => t.zoneId === zone._id).length;
    acc[zone._id] = count;
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

  // Helper to get zone coordinates
  const getZoneCoordinates = (zone) => {
    return {
      lat: zone.coordinates?.latitude || 9.3,
      lng: zone.coordinates?.longitude || 42.1
    };
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
            {loading ? (
              <div className="loading-message">Loading zones and threats...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              <div className="realtime-grid">
                {zones.map(zone => {
                  const threatCount = getThreatCount(zone._id);
                  const highestSeverity = getZoneHighestSeverity(zone._id);
                  const heatClass = getHeatIntensity(threatCount);
                  const coords = getZoneCoordinates(zone);
                  return (
                    <div
                      key={zone._id}
                      className="realtime-metric-card"
                      data-zone={zone._id}
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
            )}

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
              <p><strong>Building:</strong> {selectedZone.building}</p>
              <p><strong>Department:</strong> {selectedZone.department}</p>
              <p><strong>Risk Level:</strong> {selectedZone.riskLevel}</p>
              <p><strong>Total Threats:</strong> {getThreatCount(selectedZone._id)}</p>
              <p><strong>Highest Severity:</strong> {getZoneHighestSeverity(selectedZone._id) || "None"}</p>
              <p><strong>{t("lastDetected")}</strong> {
                threats.filter((item) => item.zoneId === selectedZone._id)
                  .sort((a, b) => new Date(b.time) - new Date(a.time))[0]?.time || t("notAvailable")
              }</p>
              <h4>{t("threatsInThisZone")}</h4>
              <ul className="threat-list">
                {threats.filter((item) => item.zoneId === selectedZone._id).map((item) => (
                  <li key={item.id}>
                    <span className={`threat-type-badge ${item.severity.toLowerCase()}`}>{item.type}</span>
                    <span>{item.severity}</span>
                    <span>{item.confidence}%</span>
                    <span>{item.time}</span>
                  </li>
                ))}
              </ul>
              <button className="btn-primary" onClick={() => {
                const zoneId = selectedZone?._id;
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