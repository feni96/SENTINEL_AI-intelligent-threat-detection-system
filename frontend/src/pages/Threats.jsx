import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

export default function Threats() {
  const { t } = useTranslation();
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    const loadThreats = async () => {
      try {
        const response = await api.get("/threats?limit=200");
        setThreats(response.data?.data?.threats || []);
      } catch (err) {
        setError(err.response?.data?.error?.message || "Failed to load threats");
      } finally {
        setLoading(false);
      }
    };
    loadThreats();
  }, []);

  const filteredThreats = useMemo(() => {
    return threats.filter((tItem) => {
      const bySeverity = filterSeverity === "All" || tItem.severityLevel === filterSeverity;
      const byStatus = filterStatus === "All" || tItem.status === filterStatus;
      const bySearch =
        !searchTerm ||
        tItem.threatType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tItem.sourceIP?.includes(searchTerm);
      return bySeverity && byStatus && bySearch;
    });
  }, [threats, searchTerm, filterSeverity, filterStatus]);

  const patchThreat = async (id, payload) => {
    try {
      const response = await api.put(`/threats/${id}`, payload);
      const updated = response.data?.data?.threat;
      if (!updated) return;
      setThreats((prev) => prev.map((tItem) => (tItem._id === id ? updated : tItem)));
    } catch (err) {
      setError(err.response?.data?.error?.message || "Action failed");
    }
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">
          <div className="filters-bar">
            <div className="filter-group">
              <label>{t("severity")}</label>
              <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
                <option>All</option>
                <option>Critical</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div className="filter-group">
              <label>{t("status")}</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option>All</option>
                <option>Active</option>
                <option>Investigating</option>
                <option>Resolved</option>
                <option>False Positive</option>
                <option>Escalated</option>
              </select>
            </div>
            <div className="filter-group">
              <label>{t("search")}</label>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("searchThreatsPlaceholder")}
              />
            </div>
          </div>

          {loading ? <p>Loading threats...</p> : null}
          {error ? <p className="error-message">{error}</p> : null}

          <div className="card threats-card">
            <div className="card-header">
              <h3>{t("threatList")}</h3>
            </div>
            <div className="table-responsive">
              <table className="threats-table">
                <thead>
                  <tr>
                    <th>{t("id")}</th>
                    <th>{t("type")}</th>
                    <th>{t("severity")}</th>
                    <th>{t("confidence")}</th>
                    <th>{t("sourceIP")}</th>
                    <th>{t("status")}</th>
                    <th>{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredThreats.map((threat) => (
                    <tr key={threat._id}>
                      <td>{threat._id}</td>
                      <td>{threat.threatType}</td>
                      <td>{threat.severityLevel}</td>
                      <td>{threat.confidenceScore}%</td>
                      <td>{threat.sourceIP}</td>
                      <td>{threat.status}</td>
                      <td>
                        <div className="threat-actions">
                          {threat.status !== "Investigating" && (
                            <button className="btn-icon" onClick={() => patchThreat(threat._id, { status: "Investigating" })}>
                              <i className="bi bi-search"></i>
                            </button>
                          )}
                          {threat.status !== "Resolved" && (
                            <button className="btn-icon" onClick={() => patchThreat(threat._id, { status: "Resolved" })}>
                              <i className="bi bi-check2-circle"></i>
                            </button>
                          )}
                          {threat.status !== "False Positive" && (
                            <button className="btn-icon" onClick={() => patchThreat(threat._id, { status: "False Positive" })}>
                              <i className="bi bi-x-circle"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}