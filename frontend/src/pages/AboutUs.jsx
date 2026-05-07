import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./AboutUs.css";
import "./ProfessionalFooter.css";   // ← ADD THIS LINE

const AboutUs = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("i18nextLng", lng);
  };

  return (
    <div className="about-us">
      {/* Header */}
      <header className="about-header">
        <div className="container">
          <div className="logo">
            {/* Haramaya University Logo Image */}
            <img
              src="/images/picture1.jpg"
              alt="Haramaya University Logo"
              className="navbar-logo"
            />
            <span className="logo-text">{t("appName")}</span>
          </div>
          <nav className="nav-links">
            <Link to="/" className="nav-link">{t("home")}</Link>
            <Link to="/about" className="nav-link active">{t("about")}</Link>
            <Link to="/contact" className="nav-link">{t("contact")}</Link>
            <Link to="/login" className="login-btn">{t("adminLogin")}</Link>
            {/* Bootstrap Language Selector */}
            <select
              value={i18n.language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="form-select bg-dark text-white border-primary w-auto"
              style={{ width: "auto", cursor: "pointer", marginLeft: "1rem" }}
            >
              <option value="en">English</option>
              <option value="am">አማርኛ</option>
              <option value="om">Oromoo</option>
              <option value="so">Soomaali</option>
            </select>
          </nav>
        </div>
      </header>

      <div className="about-us-container">
        <div className="about-us-card">
          {/* System Identity */}
          <section className="about-section">
            <h1 className="section-title">{t("aboutTitle")}</h1>
            <div className="system-identity">
              <p className="identity-text">
                <strong>{t("appName")}</strong> {t("aboutPara1")}
              </p>
              <blockquote className="quote">
                "{t("proactiveProtectionQuote")}"
              </blockquote>
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

          {/* Our Solution */}
          <section className="about-section">
            <h2 className="section-subtitle">{t("ourSolution")}</h2>
            <p className="section-text">
              {t("solutionDescription")}
            </p>
            <ul className="solution-list">
              <li>{t("solutionCollectsPreprocesses")}</li>
              <li>{t("solutionUsesMachineLearning")}</li>
              <li>{t("solutionProvidesDashboard")}</li>
              <li>{t("solutionSendsAlerts")}</li>
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
            <p className="section-text">
              {t("teamDescription")}
            </p>
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

          {/* Reliability & Limitations */}
          <section className="about-section">
            <h2 className="section-subtitle">{t("reliabilityLimitations")}</h2>
            <ul className="limitations-list">
              <li><strong>{t("detectionAccuracy")}:</strong> {t("detectionAccuracyDescription")}</li>
              <li><strong>{t("encryptedTraffic")}:</strong> {t("encryptedTrafficDescription")}</li>
              <li><strong>{t("latency")}:</strong> {t("latencyDescription")}</li>
              <li><strong>{t("areaMappingAccuracy")}:</strong> {t("areaMappingAccuracyDescription")}</li>
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
};

export default AboutUs;