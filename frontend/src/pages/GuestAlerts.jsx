import React from "react";
import { useTranslation } from "react-i18next";
import PublicHeader from "../components/PublicHeader";

export default function GuestAlerts() {
  const { t } = useTranslation();

  // Sample guest alert data (basic info only)
  const guestAlerts = [
    {
      threatId: "THR-001",
      threatType: "DDoS Attack",
      sourceIP: "192.168.1.105",
      location: "Admin Building",
      createdAt: "2025-03-20T10:45:23Z"
    },
    {
      threatId: "THR-002", 
      threatType: "SQL Injection",
      sourceIP: "192.168.2.47",
      location: "Library",
      createdAt: "2025-03-20T11:23:15Z"
    },
    {
      threatId: "THR-003",
      threatType: "Port Scan",
      sourceIP: "192.168.3.182",
      location: "Student Center",
      createdAt: "2025-03-20T12:15:42Z"
    },
    {
      threatId: "THR-004",
      threatType: "Malware Detection",
      sourceIP: "192.168.4.93",
      location: "Computer Lab",
      createdAt: "2025-03-20T13:42:18Z"
    },
    {
      threatId: "THR-005",
      threatType: "Suspicious Activity",
      sourceIP: "192.168.5.201",
      location: "Cafeteria",
      createdAt: "2025-03-20T14:28:55Z"
    }
  ];

  return (
    <div className="guest-alerts-page">
      <PublicHeader activePage="guest" />

      {/* Main Content */}
      <div
        className="container py-5"
        style={{ marginTop: "var(--app-navbar-height, 80px)" }}
      >
        <div className="card">
          <div className="card-body">
            
          <div className="realtime-grid mb-5">
            <div className="realtime-metric-card">
              <div className="realtime-icon threats"></div>
              <div className="realtime-content">
                <span className="realtime-label">{t("totalAlerts")}</span>
                <span className="realtime-value">5</span>
              </div>
            </div>
            <div className="realtime-metric-card">
              <div className="realtime-icon uptime"></div>
              <div className="realtime-content">
                <span className="realtime-label">{t("last24Hours")}</span>
                <span className="realtime-value">4</span>
              </div>
            </div>
            <div className="realtime-metric-card">
              <div className="realtime-icon anomalies"></div>
              <div className="realtime-content">
                <span className="realtime-label">{t("activeThreats")}</span>
                <span className="realtime-value">3</span>
              </div>
            </div>
          </div>

          {/* Alerts Grid */}
          <div className="guest-alerts-grid">
            {guestAlerts.map((alert, index) => (
              <div key={index} className="guest-alert-card">
                  <div className="alert-header">
                    <div className="alert-icon">
                      <i className="bi bi-exclamation-triangle-fill"></i>
                    </div>
                    <div className="alert-title">
                      <div className="threat-id">{alert.threatId}</div>
                      <div className="threat-type">{alert.threatType}</div>
                    </div>
                  </div>
                  <div className="alert-details">
                    <div className="detail-row">
                      <i className="bi bi-geo-alt"></i>
                      <span className="detail-label">{t("location")}:</span>
                      <span className="detail-value">{alert.location}</span>
                    </div>
                    <div className="detail-row">
                      <i className="bi bi-hdd-network"></i>
                      <span className="detail-label">{t("sourceIP")}:</span>
                      <span className="detail-value">{alert.sourceIP}</span>
                    </div>
                    <div className="detail-row">
                      <i className="bi bi-clock"></i>
                      <span className="detail-label">{t("detectedAt")}:</span>
                      <span className="detail-value">{new Date(alert.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          {/* Footer Note */}
          <div className="guest-alerts-footer-note mt-5 pt-3 text-center text-light-emphasis border-top border-secondary">
              <i className="bi bi-info-circle me-1"></i>
              <strong>{t("guestAccessNote")}:</strong> {t("guestAccessDescription")}
            </div>
          </div>
        </div>
      </div>

      {/* Professional Footer */}
      <footer className="professional-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-section">
              <h4>{t("appName")}</h4>
              <p>{t("tagline")}</p>
              <div className="footer-contact">
                <p><i className="bi bi-geo-alt"></i> Haramaya University, Ethiopia</p>
                <p><i className="bi bi-envelope"></i> security@haramaya.edu.et</p>
                <p><i className="bi bi-telephone"></i> +251 123 456 789</p>
              </div>
            </div>
            
            <div className="footer-section">
              <h4>{t("systemFeatures")}</h4>
              <p className="footer-services">
                {t("realTimeMonitoring")}
              </p>
              <p className="footer-services">
                {t("threatIntelligence")}
              </p>
              <p className="footer-services">
                {t("automatedResponse")}
              </p>
              <p className="footer-services">
                {t("campusNetworkProtection")}
              </p>
            </div>
            
            <div className="footer-section">
              <h4>{t("services")}</h4>
              <p className="footer-services">
                {t("aiAnomalyDetection")}
              </p>
              <p className="footer-services">
                {t("realTimeCampusThreatMap")}
              </p>
              <p className="footer-services">
                {t("automatedAlertingReporting")}
              </p>
              <p className="footer-services">
                {t("advancedSecurityAnalytics")}
              </p>
            </div>
            
            <div className="footer-section">
              <h4>{t("followUs")}</h4>
              <div className="social-links">
                <a href="#" className="social-link"><i className="bi bi-twitter"></i></a>
                <a href="#" className="social-link"><i className="bi bi-linkedin"></i></a>
                <a href="#" className="social-link"><i className="bi bi-facebook"></i></a>
                <a href="#" className="social-link"><i className="bi bi-github"></i></a>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="footer-divider"></div>
            <p>&copy; {new Date().getFullYear()} {t("copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
