import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Landing.css";
import "./ProfessionalFooter.css";

export default function Landing() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("i18nextLng", lng);
  };

  return (
    <div className="landing">
      {/* Header */}
      <header className="landing-header">
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
            <a href="#hero" className="nav-link">{t("home")}</a>
            <Link to="/about" className="nav-link">{t("about")}</Link>
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

      {/* Hero Section */}
      <section id="hero" className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              {t("appName")}
              <span className="hero-subtitle">{t("heroSubtitle")}</span>
            </h1>
            <p className="hero-description">
              {t("heroDescription")}
            </p>
          </div>
          
        </div>
      </section>

      {/* Security Notice */}
      <section className="security-notice">
        <div className="container">
          <div className="notice-box">
            <i className="bi bi-shield-lock"></i>
            <p>
              <strong>{t("accessRestricted")}:</strong> {t("securityNoticeText")}
            </p>
          </div>
        </div>
      </section>

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