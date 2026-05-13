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
        setError("");
        
        // Fetch audit logs from backend
        const auditRes = await api.get('/audit/logs');
        
        if (auditRes.data?.success) {
          setLogs(auditRes.data.data?.logs || []);
        } else {
          setError('Failed to fetch audit logs');
          console.warn('Failed to fetch audit logs:', auditRes.data?.message);
        }
        
      } catch (error) {
        console.error('Error fetching audit logs:', error);
        setError('Failed to load audit logs. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

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
    // Export logs to CSV
    const csvContent = [
      [t("timestamp"), t("administrator"), t("actionType"), t("targetEntity"), t("status"), t("description")],
      ...logs.map(log => [
        new Date(log.timestamp).toLocaleString(),
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

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="dashboard-layout">
          <Sidebar />
          <div className="dashboard-content">
            <p>{t("loading")}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">
          {error && (
            <div style={{
              padding: "12px",
              marginBottom: "16px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "6px",
              color: "#991b1b"
            }}>
              ⚠️ {error}
            </div>
          )}

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
                  {logs.length > 0 ? (
                    logs.map((log, idx) => (
                      <tr key={idx}>
                        <td>{new Date(log.timestamp).toLocaleString()}</td>
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