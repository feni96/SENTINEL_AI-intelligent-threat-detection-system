import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const response = await api.get("/alerts?limit=200");
        setAlerts(response.data?.data?.alerts || []);
      } catch (err) {
        setError(err.response?.data?.error?.message || "Failed to load alerts");
      } finally {
        setLoading(false);
      }
    };
    loadAlerts();
  }, []);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((item) => {
      const byPriority = filterPriority === "All" || item.priority === filterPriority;
      const byStatus = filterStatus === "All" || item.status === filterStatus;
      const bySearch =
        !searchTerm ||
        item.sourceIP?.includes(searchTerm) ||
        item.message?.toLowerCase().includes(searchTerm.toLowerCase());
      return byPriority && byStatus && bySearch;
    });
  }, [alerts, filterPriority, filterStatus, searchTerm]);

  const patchAlert = async (id, payload, endpoint = "") => {
    try {
      const url = endpoint ? `/alerts/${id}/${endpoint}` : `/alerts/${id}`;
      const response = await api.put(url, payload);
      const updated = response.data?.data?.alert;
      if (!updated) return;
      setAlerts((prev) => prev.map((a) => (a._id === id ? updated : a)));
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
              <label>Priority</label>
              <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
                <option>All</option>
                <option>Critical</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Status</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option>All</option>
                <option>Open</option>
                <option>Acknowledged</option>
                <option>In Progress</option>
                <option>Resolved</option>
                <option>Dismissed</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Search</label>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by IP or message"
              />
            </div>
          </div>

          {loading ? <p>Loading alerts...</p> : null}
          {error ? <p className="error-message">{error}</p> : null}

          <div className="card alerts-card">
            <div className="card-header">
              <h3>Real-Time Alerts</h3>
            </div>
            <div className="table-responsive">
              <table className="alerts-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Timestamp</th>
                    <th>Priority</th>
                    <th>Message</th>
                    <th>Source</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlerts.map((alert) => (
                    <tr key={alert._id}>
                      <td>{alert._id}</td>
                      <td>{new Date(alert.timestamp).toLocaleString()}</td>
                      <td>{alert.priority}</td>
                      <td>{alert.message}</td>
                      <td>{alert.sourceIP || "-"}</td>
                      <td>{alert.status}</td>
                      <td>
                        <div className="alert-actions">
                          {alert.status === "Open" && (
                            <button className="btn-icon" onClick={() => patchAlert(alert._id, {}, "acknowledge")}>
                              <i className="bi bi-check-lg"></i>
                            </button>
                          )}
                          {alert.status !== "Resolved" && (
                            <button
                              className="btn-icon"
                              onClick={() => patchAlert(alert._id, { resolutionNotes: "Resolved from UI" }, "resolve")}
                            >
                              <i className="bi bi-check2-circle"></i>
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