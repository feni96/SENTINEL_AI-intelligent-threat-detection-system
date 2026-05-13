import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

export default function AuditLog() {
  const { t } = useTranslation();
  
  // ---------- State ----------
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // ---------- Fetch Data ----------
  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setLoading(true);
        
        // Fetch audit logs from backend
        const auditRes = await api.get('/audit/logs');
        
        if (auditRes.data?.success) {
          setLogs(auditRes.data.data?.logs || []);
        } else {
          console.warn('Failed to fetch audit logs:', auditRes.data?.message);
        }
        
      } catch (error) {
        console.error('Error fetching audit logs:', error);
        setError('Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  // ---------- Filter State ----------
  const [dateFilter, setDateFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("All");
  const [adminFilter, setAdminFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // ---------- Derived Filter Options ----------
  const actionTypes = [
    "All",
    ...new Set(logs.map((log) => log.actionType)),
  ];
  const admins = ["All", ...new Set(logs.map((log) => log.admin))];

  // ---------- Filter Logic ----------
  const filteredLogs = logs.filter((log) => {
    // Only apply filters if they are set and not "All"
    
    // Date filter - only apply if not "all"
    if (dateFilter !== "all") {
      const logDate = log.timestamp.split(" ")[0]; // YYYY-MM-DD
      const today = new Date().toISOString().split("T")[0];
      const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      if (dateFilter === "today" && logDate !== today) return false;
      if (dateFilter === "7days" && logDate < last7Days) return false;
    }

    // Action type filter - only apply if not "All"
    if (actionFilter !== "All" && log.actionType !== actionFilter)
      return false;

    // Admin filter - only apply if not "All"
    if (adminFilter !== "All" && log.admin !== adminFilter) return false;

    // Search filter - only apply if search term exists
    if (searchTerm && searchTerm.trim() !== "") {
      const searchLower = searchTerm.toLowerCase();
      if (
        !log.admin.toLowerCase().includes(searchLower) &&
        !log.target.toLowerCase().includes(searchLower) &&
        !log.description.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    return true; // Only filter out if a specific condition fails
  });

  // ---------- Helper for Status Badge ----------
  const getStatusBadge = (status) => {
    const classes = {
      Success: "badge-success",
      Failed: "badge-failed",
      Pending: "badge-pending",
    };
    return <span className={`badge ${classes[status] || "badge-default"}`}>{status}</span>;
  };

  const handleExport = () => {
    // Export filtered logs to CSV
    const csvContent = [
      [t("id"), t("timestamp"), t("administrator"), t("actionType"), t("targetEntity"), t("status"), t("description")],
      ...filteredLogs.map(log => [
        log.id,
        log.timestamp,
        log.admin,
        log.actionType,
        log.target,
        log.status,
        log.description
      ])
    ].map(row => row.map(cell => `"${cell || ''}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_log_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">
          {/* Header removed as requested */}

          {/* Filters Bar */}
          <div className="filters-bar">
            <div className="filter-group">
              <label>{t("date")}</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">{t("allTime")}</option>
                <option value="today">{t("today")}</option>
                <option value="7days">{t("last7Days")}</option>
              </select>
            </div>
            <div className="filter-group">
              <label>{t("actionType")}</label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
              >
                {actionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>{t("administrator")}</label>
              <select
                value={adminFilter}
                onChange={(e) => setAdminFilter(e.target.value)}
              >
                {admins.map((admin) => (
                  <option key={admin} value={admin}>
                    {admin}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group search">
              <label>{t("search")}</label>
              <input
                type="text"
                placeholder={t("searchAuditPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Audit Log Table */}
          <div className="card audit-card">
            <div className="card-header">
              <h3>{t("auditTrail")}</h3>
              <div className="card-actions">
                <button className="btn-outline" onClick={handleExport}>{t("exportCsv")}</button>
              </div>
            </div>
            <div className="table-responsive">
              <table className="audit-table">
                <thead>
                  <tr>
                    <th>{t("timestamp")}</th>
                    <th>{t("administrator")}</th>
                    <th>{t("actionType")}</th>
                    <th>{t("targetEntity")}</th>
                    <th>{t("status")}</th>
                    <th>{t("description")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <tr key={log.id}>
                        <td>{log.timestamp}</td>
                        <td>{log.admin}</td>
                        <td>{log.actionType}</td>
                        <td>{log.target}</td>
                        <td>{getStatusBadge(log.status)}</td>
                        <td>{log.description}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-data">
                        {t("noAuditRecordsMatch")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}