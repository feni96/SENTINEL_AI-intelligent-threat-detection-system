import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
            <Link to="/" className="nav-link">{t("home")}</Link>
            <Link to="/about" className="nav-link">{t("about")}</Link>
            <Link to="/contact" className="nav-link">{t("contact")}</Link>
            <Link to="/login" className="login-btn">
              <i className="bi bi-box-arrow-in-right"></i>
              {t("login")}
            </Link>
            {/* Language selector with globe icon - same as dashboard */}
            <div className="language-selector-wrapper">
              <i className="bi bi-globe language-globe-icon"></i>
              <select
                value={i18n.language}
                onChange={(e) => {
                  localStorage.setItem("i18nextLng", e.target.value);
                  window.location.reload();
                }}
                className="language-selector"
              >
                <option value="en">English</option>
                <option value="am">አማርኛ</option>
                <option value="om">Oromoo</option>
              </select>
            </div>
            {/* Guest Alert Icon */}
            <Link to="/guest-alerts" className="navbar-icon guest-alert-icon active">
              <i className="bi bi-bell"></i>
              <span className="badge">3</span>
            </Link>
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