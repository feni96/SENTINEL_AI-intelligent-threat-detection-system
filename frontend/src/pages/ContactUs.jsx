import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ContactUs = () => {
  const { t, i18n } = useTranslation();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    // Apply theme on mount - only add class for light mode
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, [theme]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("i18nextLng", lng);
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    
    // Only add light class for light mode, remove for dark mode
    if (newTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  };
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="contact-us-page">
      {/* Header – exactly match Landing page structure */}
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
            <Link to="/contact" className="nav-link active">{t("contact")}</Link>
            {/* Guest Alert Icon - without wrapper */}
            <Link to="/guest-alerts" className="nav-link">
              <i className="bi bi-bell"></i>
            </Link>
            {/* Theme toggle button */}
            <button className="dark-mode-toggle" onClick={toggleTheme} title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}>
              <i className={`bi ${theme === "dark" ? "bi-sun" : "bi-moon"}`}></i>
            </button>
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
            <Link to="/login" className="login-btn">
              <i className="bi bi-box-arrow-in-right"></i>
              {t("login")}
            </Link>
          </nav>
        </div>
      </header>

      <div className="container py-5">
        {/* Main glass card using consistent styling */}
        <div className="card">
          <div className="card-body">
            <h1 className="display-5 fw-bold text-white mb-3 border-start border-primary border-4 ps-3">
              {t("contactTitle")}
            </h1>
            <p className="text-light-emphasis mb-5 pb-2 border-bottom border-secondary">
              {t("contactSubtitle")}
            </p>

            <div className="contact-highlight-section">
              {/* Official Support */}
              <div className="contact-highlight-card">
                <div className="realtime-icon">👨‍💼</div>
                <div className="realtime-content">
                  <span className="realtime-label">Official Support</span>
                  <span className="realtime-value">
                    <a href="mailto:sentinel-support@haramaya.edu.et" className="text-primary text-decoration-none">sentinel-support@haramaya.edu.et</a>
                  </span>
                  <span className="realtime-unit">24/7 technical support</span>
                </div>
              </div>

              {/* Incident Reporting */}
              <div className="contact-highlight-card">
                <div className="realtime-icon">⚠️</div>
                <div className="realtime-content">
                  <span className="realtime-label">Incident Reporting</span>
                  <span className="realtime-value">
                    <a href="mailto:security-incident@haramaya.edu.et" className="text-danger text-decoration-none">security-incident@haramaya.edu.et</a>
                  </span>
                  <span className="realtime-unit">Report urgent threats</span>
                </div>
              </div>
            </div>

           

            {/* Contact Form */}
            <div className="contact-form-card">
              <div className="realtime-icon">✉️</div>
              <div className="realtime-content">
                <span className="realtime-label">Send Message</span>
                <span className="realtime-value">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <input type="text" className="form-control" name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                      <input type="email" className="form-control" name="email" placeholder="Your Email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                      <textarea className="form-control" name="message" rows="5" placeholder="Your Message" value={formData.message} onChange={handleChange} required></textarea>
                    </div>
                    <button type="submit" className="btn-primary">Send Message</button>
                    {submitted && <div className="alert alert-success mt-3">✓ Message sent successfully</div>}
                  </form>
                </span>
              </div>
            </div>

            {/* Footer note */}
            <div className="response-note mt-5 pt-3 text-center text-light-emphasis border-top border-secondary">
              <i className="bi bi-clock me-1"></i><strong>Response Time:</strong> We typically respond within 24 hours<br />
              <i className="bi bi-shield-exclamation me-1"></i>For urgent security matters, call <strong>+251-XXX-XXXXXX</strong>.
            </div>
          </div>
        </div>
      </div>

      {/* Professional Footer - Same as Landing Page */}
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
};

export default ContactUs;