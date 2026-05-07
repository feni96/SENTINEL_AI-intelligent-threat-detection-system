import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./ContactUs.css";

const ContactUs = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("i18nextLng", lng);
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
            <a href="#hero" className="nav-link">{t("home")}</a>
            <Link to="/about" className="nav-link">{t("about")}</Link>
            <Link to="/contact" className="nav-link active">{t("contact")}</Link>
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

      <div className="container py-5">
        {/* Main glass card (rest of the page unchanged) */}
        <div className="card bg-dark bg-opacity-25 border border-primary rounded-4 shadow-lg overflow-hidden">
          <div className="card-body p-4 p-lg-5">
            <h1 className="display-5 fw-bold text-white mb-3 border-start border-primary border-4 ps-3">
              {t("contactTitle")}
            </h1>
            <p className="text-light-emphasis mb-5 pb-2 border-bottom border-secondary">
              {t("contactSubtitle")}
            </p>

            <div className="row g-5">
              {/* Left column – contact details */}
              <div className="col-lg-5">
                <div className="d-flex flex-column gap-4">
                  {/* Official Support */}
                  <div className="bg-dark bg-opacity-50 p-3 rounded-3 border-start border-primary border-3">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <i className="bi bi-envelope-paper fs-4 text-primary"></i>
                      <h3 className="h5 text-white fw-semibold mb-0">Official Support</h3>
                    </div>
                    <p className="mb-1"><a href="mailto:sentinel-support@haramaya.edu.et" className="text-primary text-decoration-none">sentinel-support@haramaya.edu.et</a></p>
                    <small className="text-light-emphasis">24/7 technical support for security incidents and system issues</small>
                  </div>

                  {/* Incident Reporting */}
                  <div className="bg-dark bg-opacity-50 p-3 rounded-3 border-start border-danger border-3">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <i className="bi bi-exclamation-triangle fs-4 text-danger"></i>
                      <h3 className="h5 text-white fw-semibold mb-0">Incident Reporting</h3>
                    </div>
                    <p className="mb-1"><a href="mailto:security-incident@haramaya.edu.et" className="text-danger text-decoration-none">security-incident@haramaya.edu.et</a></p>
                    <small className="text-light-emphasis">Report security incidents and urgent threats immediately</small>
                  </div>

                  {/* Phone & Hours */}
                  <div className="bg-dark bg-opacity-50 p-3 rounded-3 border-start border-info border-3">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <i className="bi bi-telephone fs-4 text-info"></i>
                      <h3 className="h5 text-white fw-semibold mb-0">Phone Support</h3>
                    </div>
                    <p className="mb-0 text-light">+251 91 234 5678</p>
                    <p className="mb-0 text-light-emphasis small">Mon-Fri, 8:00 AM - 5:00 PM</p>
                  </div>

                  {/* Social Media */}
                  <div className="bg-dark bg-opacity-50 p-3 rounded-3 border-start border-success border-3">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <i className="bi bi-share fs-4 text-success"></i>
                      <h3 className="h5 text-white fw-semibold mb-0">Social Media</h3>
                    </div>
                    <div className="d-flex gap-3 mt-2">
                      <a href="#" className="text-light fs-4" target="_blank" rel="noopener noreferrer"><i className="bi bi-twitter"></i></a>
                      <a href="#" className="text-light fs-4" target="_blank" rel="noopener noreferrer"><i className="bi bi-linkedin"></i></a>
                      <a href="#" className="text-light fs-4" target="_blank" rel="noopener noreferrer"><i className="bi bi-github"></i></a>
                    </div>
                  </div>

                  {/* Map placeholder */}
                  <div className="bg-dark bg-opacity-25 p-3 rounded-3 text-center border border-primary border-dashed">
                    <i className="bi bi-map me-2"></i>
                    <span className="text-light-emphasis">Interactive campus map showing security zones</span>
                  </div>
                </div>
              </div>

              {/* Right column – Bootstrap form */}
              <div className="col-lg-7">
                <div className="bg-dark bg-opacity-25 p-4 rounded-4">
                  <h3 className="h4 text-white mb-3 text-center">Send Message</h3>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <input type="text" className="form-control bg-dark text-white border-secondary" name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                      <input type="email" className="form-control bg-dark text-white border-secondary" name="email" placeholder="Your Email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                      <select className="form-select bg-dark text-white border-secondary" name="subject" value={formData.subject} onChange={handleChange} required>
                        <option value="">Select Topic</option>
                        <option value="technical">Technical Support</option>
                        <option value="general">General Inquiry</option>
                        <option value="security">Security Incident</option>
                        <option value="feedback">Feedback</option>
                        <option value="partnership">Partnership</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <textarea className="form-control bg-dark text-white border-secondary" name="message" rows="5" placeholder="Your Message" value={formData.message} onChange={handleChange} required></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold rounded-pill">Send Message</button>
                    {submitted && <div className="alert alert-success mt-3 py-2 text-center">✓ Message sent successfully</div>}
                  </form>
                </div>
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

      {/* Professional Footer (unchanged) */}
      <footer className="professional-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>{t("aboutTitle")}</h4>
            <p>{t("footerAboutDescription")}</p>
            <div className="social-links">
              <a href="#" aria-label="Twitter"><i className="bi bi-twitter"></i></a>
              <a href="#" aria-label="LinkedIn"><i className="bi bi-linkedin"></i></a>
              <a href="#" aria-label="GitHub"><i className="bi bi-github"></i></a>
            </div>
          </div>
          
          <div className="footer-section">
            <h4>{t("systemFeatures")}</h4>
            <ul className="footer-links">
              <li><a href="/">{t("realTimeMonitoring")}</a></li>
              <li><a href="/">{t("threatIntelligence")}</a></li>
              <li><a href="/">{t("automatedResponse")}</a></li>
              <li><a href="/">{t("campusNetworkProtection")}</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>{t("services")}</h4>
            <ul className="footer-links">
              <li><Link to="/">{t("aiAnomalyDetection")}</Link></li>
              <li><Link to="/">{t("realTimeCampusThreatMap")}</Link></li>
              <li><Link to="/">{t("automatedAlertingReporting")}</Link></li>
              <li><Link to="/">{t("advancedSecurityAnalytics")}</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>{t("contactInfo")}</h4>
            <p><strong>{t("email")}:</strong> sentinel-support@haramaya.edu.et</p>
            <p><strong>{t("phone")}:</strong> +251 91 234 5678</p>
            <p><strong>{t("location")}:</strong> Haramaya University, Ethiopia</p>
            <p><strong>{t("hours")}:</strong> Mon-Fri, 8:00 AM - 5:00 PM</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} {t("copyright")}</p>
        </div>
      </footer>
    </div>
  );
};

export default ContactUs;