import React from "react";
import { Link } from "react-router-dom";
import "./Landing.css";

export default function Landing() {
  return (
    <div className="landing">
      {/* Header */}
      <header className="landing-header">
        <div className="container">
          <div className="logo">
            <span className="logo-icon">🛡️</span>
            <span className="logo-text">Sentinel AI</span>
          </div>
          <nav className="nav-links">
            <a href="#hero" className="nav-link">Home</a>
            
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#about" className="nav-link">About</a>
            <a href="#contact" className="nav-link">Contact</a>
            <Link to="/login" className="login-btn">Admin Login</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Sentinel AI
              <span className="hero-subtitle">Intelligent Threat Detection System for Haramaya University</span>
            </h1>
            <p className="hero-description">
              Harness the power of artificial intelligence to monitor, detect, and respond to cyber threats across Haramaya University’s digital infrastructure. Sentinel AI provides real‑time threat intelligence, automated alerts, and actionable insights to protect academic and administrative systems.
            </p>
          </div>
          <div className="hero-image">
            <img 
              src="public/images/picture1.jpg" 
              alt="Haramaya University Logo"
              className="university-logo"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">From raw logs to actionable insights</p>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h4>Network Logs</h4>
              <p>Collect data from firewalls, servers, and network devices across campus.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">2</div>
              <h4>Machine Learning</h4>
              <p>Models analyse patterns and detect anomalies using supervised & unsupervised techniques.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">3</div>
              <h4>Threat Detection</h4>
              <p>Identify DDoS, malware, brute‑force, and unauthorised access attempts.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">4</div>
              <h4>Alerts & Dashboard</h4>
              <p>Real‑time alerts with severity, location, and recommended actions.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">5</div>
              <h4>Reports</h4>
              <p>Automated summaries for security administrators.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Sentinel AI Section */}
<section id="about" className="about-us">
  <div className="container">
    <h2 className="section-title">About Sentinel AI</h2>
    <p className="section-subtitle">Intelligent threat detection for Haramaya University</p>
    <div className="about-content">
      <p>
        Sentinel AI is an advanced cybersecurity system that leverages machine learning to monitor, detect, and respond to cyber threats across Haramaya University's network infrastructure. The system continuously analyzes network traffic, authentication logs, and system events to identify anomalies and potential attacks in real time.
      </p>
      <p>
        Key capabilities include AI-powered threat detection, area‑based visualization of attacks across campus zones, intelligent alert prioritization with confidence scoring, and automated security reporting. Sentinel AI provides security administrators with a unified dashboard for complete situational awareness and rapid incident response.
      </p>
    </div>
  </div>
</section>

      {/* Contact Us Section (NEW) */}
      <section id="contact" className="contact-us">
        <div className="container">
          <h2 className="section-title">Get in Touch</h2>
          <p className="section-subtitle">We'd love to hear from you</p>
          <div className="contact-grid">
            <div className="contact-info">
              <div className="contact-item">
                <i className="bi bi-envelope"></i>
                <div>
                  <h4>Email</h4>
                  <p>sentinel@haramaya.edu.et</p>
                </div>
              </div>
              <div className="contact-item">
                <i className="bi bi-telephone"></i>
                <div>
                  <h4>Phone</h4>
                  <p>+251 91 234 5678</p>
                </div>
              </div>
              <div className="contact-item">
                <i className="bi bi-geo-alt"></i>
                <div>
                  <h4>Address</h4>
                  <p>Haramaya University, Dire Dawa, Ethiopia</p>
                </div>
              </div>
            </div>
            <div className="contact-form">
              <form>
                <input type="text" placeholder="Your Name" />
                <input type="email" placeholder="Your Email" />
                <textarea rows="4" placeholder="Your Message"></textarea>
                <button type="submit" className="btn-primary">Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Security Notice */}
      <section className="security-notice">
        <div className="container">
          <div className="notice-box">
            <i className="bi bi-shield-lock"></i>
            <p>
              <strong>Access Restricted:</strong> The Sentinel AI monitoring dashboard, threat data, and system controls are accessible only to authorised security administrators of Haramaya University. Unauthorised access is prohibited.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <span>Sentinel AI</span>
              <small>Intelligent Threat Detection</small>
            </div>
           
            <div className="footer-social">
              <a href="#"><i className="bi bi-twitter"></i></a>
              <a href="#"><i className="bi bi-linkedin"></i></a>
              <a href="#"><i className="bi bi-github"></i></a>
            </div>
          </div>
          <div className="copyright">
            © {new Date().getFullYear()} Sentinel AI – Academic Project, Haramaya University. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}