import React from "react";
import { useTranslation } from "react-i18next";
import PublicHeader from "../components/PublicHeader";

const AboutUs = () => {
  const { t } = useTranslation();

  return (
    <div className="about-us">
      <PublicHeader activePage="about" />

      <div className="about-us-container">
        <div className="about-us-card">
          {/* System Identity - updated title and description */}
          <section className="about-section">
            <h1 className="section-title">{t("aboutTitle")}</h1>
            <div className="system-identity">
              <p className="identity-text">
                {t("aboutPara1")}
              </p>
              {/* Quote removed as requested */}
            </div>
          </section>

          {/* The Problem We Solve */}
          <section className="about-section">
            <h2 className="section-subtitle">{t("problemWeSolve")}</h2>
            <p className="section-text">
              {t("problemDescription")}
            </p>
            <ul className="problem-list">
              <li>{t("problemUnauthorizedAccess")}</li>
              <li>{t("problemZeroDayExploits")}</li>
              <li>{t("problemDelayedIncidentResponse")}</li>
              <li>{t("problemRiskToSensitiveData")}</li>
            </ul>
          </section>

          {/* Key Capabilities (Table) */}
          <section className="about-section">
            <h2 className="section-subtitle">{t("keyCapabilities")}</h2>
            <div className="table-wrapper">
              <table className="capabilities-table">
                <thead>
                  <tr>
                    <th>{t("capability")}</th>
                    <th>{t("description")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>{t("realTimeMonitoring")}</td><td>{t("realTimeMonitoringDescription")}</td></tr>
                  <tr><td>{t("anomalyThreatDetection")}</td><td>{t("anomalyThreatDetectionDescription")}</td></tr>
                  <tr><td>{t("interactiveDashboard")}</td><td>{t("interactiveDashboardDescription")}</td></tr>
                  <tr><td>{t("areaBasedVisualization")}</td><td>{t("areaBasedVisualizationDescription")}</td></tr>
                  <tr><td>{t("automatedReporting")}</td><td>{t("automatedReportingDescription")}</td></tr>
                  <tr><td>{t("roleBasedAccess")}</td><td>{t("roleBasedAccessDescription")}</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* The Team Behind Sentinel AI */}
          <section className="about-section">
            <h2 className="section-subtitle">{t("teamBehindSentinel")}</h2>
            <p className="section-text">{t("teamDescription")}</p>
            <div className="team-list">
              <div>Husniya Mahdi</div>
              <div>Lensa Tesfaye</div>
              <div>Nebiya Jemal</div>
              <div>Ket Girma</div>
            </div>
          </section>

          {/* Operating Context */}
          <section className="about-section">
            <h2 className="section-subtitle">{t("operatingContext")}</h2>
            <ul className="context-list">
              <li><strong>{t("intendedUsers")}:</strong> {t("intendedUsersDescription")}</li>
              <li><strong>{t("scope")}:</strong> {t("scopeDescription")}</li>
              <li><strong>{t("environment")}:</strong> {t("environmentDescription")}</li>
            </ul>
          </section>

          {/* Last Updated */}
          <section className="about-section">
            <h2 className="section-subtitle">{t("lastUpdated")}</h2>
            <p className="section-text">
              <strong>{t("updateDate")}</strong> – {t("updateDescription")}
              <br />
              <em>{t("documentationNote")}</em>
            </p>
          </section>
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
                <p><i className="bi bi-geo-alt"></i> {t("haramayaUniversity")}</p>
                <p><i className="bi bi-envelope"></i> security@haramaya.edu.et</p>
                <p><i className="bi bi-telephone"></i> 0925553019</p>
              </div>
            </div>
            
            <div className="footer-section">
              <h4>{t("systemFeatures")}</h4>
              <p className="footer-services">{t("realTimeMonitoring")}</p>
              <p className="footer-services">{t("threatIntelligence")}</p>
              <p className="footer-services">{t("automatedResponse")}</p>
              <p className="footer-services">{t("campusNetworkProtection")}</p>
            </div>
            
            <div className="footer-section">
              <h4>{t("services")}</h4>
              <p className="footer-services">{t("aiAnomalyDetection")}</p>
              <p className="footer-services">{t("realTimeCampusThreatMap")}</p>
              <p className="footer-services">{t("automatedAlertingReporting")}</p>
              <p className="footer-services">{t("advancedSecurityAnalytics")}</p>
            </div>
            
            <div className="footer-section">
              <h4>{t("followUs")}</h4>
              <div className="social-links">
                <a href="https://twitter.com/HaramayaUni" className="social-link"><i className="bi bi-twitter"></i></a>
                <a href="https://et.linkedin.com/company/haramaya-university" className="social-link"><i className="bi bi-linkedin"></i></a>
                <a href="https://www.facebook.com/HRMUNIV" className="social-link"><i className="bi bi-facebook"></i></a>
                <a href="https://www.youtube.com/@haramayauniversity" className="social-link"><i className="bi bi-youtube"></i></a>
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
};

export default AboutUs;