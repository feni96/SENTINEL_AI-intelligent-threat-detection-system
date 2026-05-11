import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function AuditLog() {
  const { t } = useTranslation();
  // ---------- Mock Audit Data ----------
  const [logs, setLogs] = useState([
    {
      id: 1,
      timestamp: "2025-03-21 09:15:23",
      admin: "admin@hu.edu.et",
      actionType: "Login",
      target: "-",
      status: "Success",
      description: "Administrator logged in from IP 10.230.227.195",
    },
    {
      id: 2,
      timestamp: "2025-03-21 09:22:17",
      admin: "sec_analyst",
      actionType: "Alert Acknowledge",
      target: "ALT-002",
      status: "Success",
      description: "Acknowledged malware alert in Library",
    },
    {
      id: 3,
      timestamp: "2025-03-21 10:05:11",
      admin: "admin@hu.edu.et",
      actionType: "Threat Status Change",
      target: "THR-005",
      status: "Success",
      description: "Changed status from New to Investigating",
    },
    {
      id: 4,
      timestamp: "2025-03-21 11:30:44",
      admin: "sec_analyst",
      actionType: "Report Generation",
      target: "RPT-20250321-001",
      status: "Success",
      description: "Generated Daily report",
    },
    {
      id: 5,
      timestamp: "2025-03-21 12:45:02",
      admin: "admin@hu.edu.et",
      actionType: "Logout",
      target: "-",
      status: "Success",
      description: "Administrator logged out",
    },
    {
      id: 6,
      timestamp: "2025-03-22 08:30:15",
      admin: "sec_analyst",
      actionType: "Alert Escalation",
      target: "ALT-001",
      status: "Success",
      description: "Escalated critical DDoS alert to incident response",
    },
    {
      id: 7,
      timestamp: "2025-03-22 09:10:33",
      admin: "admin@hu.edu.et",
      actionType: "Threat Status Change",
      target: "THR-003",
      status: "Success",
      description: "Changed status from Investigating to Resolved",
    },
    {
      id: 8,
      timestamp: "2025-03-22 10:22:47",
      admin: "sec_analyst",
      actionType: "Report Generation",
      target: "RPT-20250322-001",
      status: "Failed",
      description: "Attempted to generate Weekly report – insufficient data",
    },
    {
      id: 9,
      timestamp: "2025-03-22 11:05:59",
      admin: "admin@hu.edu.et",
      actionType: "Configuration Change",
      target: "System",
      status: "Success",
      description: "Updated alert threshold for DDoS detection",
    },
    {
      id: 10,
      timestamp: "2025-03-22 12:30:21",
      admin: "sec_analyst",
      actionType: "Alert Resolution",
      target: "ALT-004",
      status: "Success",
      description: "Resolved low‑severity port scan alert",
    },
  ]);

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
    // Date filter
    const logDate = log.timestamp.split(" ")[0]; // YYYY-MM-DD
    const today = new Date().toISOString().split("T")[0];
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    if (dateFilter === "today" && logDate !== today) return false;
    if (dateFilter === "7days" && logDate < last7Days) return false;

    // Action type filter
    if (actionFilter !== "All" && log.actionType !== actionFilter)
      return false;

    // Admin filter
    if (adminFilter !== "All" && log.admin !== adminFilter) return false;

    // Search (admin name, target entity, description)
    const searchLower = searchTerm.toLowerCase();
    return (
      searchTerm === "" ||
      log.admin.toLowerCase().includes(searchLower) ||
      log.target.toLowerCase().includes(searchLower) ||
      log.description.toLowerCase().includes(searchLower)
    );
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