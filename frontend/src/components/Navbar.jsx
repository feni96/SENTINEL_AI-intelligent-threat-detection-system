import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const adminName = localStorage.getItem("adminName") || "Admin";
  const [activeAlerts, setActiveAlerts] = useState(0);

  useEffect(() => {
    setActiveAlerts(5);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminName");
    navigate("/login");
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("i18nextLng", lng);
  };

  return (
    <nav className="navbar">
      {/* Left side: Logo + Brand */}
      <div className="navbar-left">
        <img
          src="/images/picture1.jpg"
          alt="Haramaya University Logo"
          className="navbar-logo"
        />
        <div className="navbar-brand">
          <span>{t("appName")}</span>
        </div>
      </div>

      {/* Right side: Icons, welcome, language, dark toggle, logout */}
      <div className="navbar-menu">
        <Link to="/alerts" className="navbar-icon" title={t("alerts")}>
          <i className="bi bi-bell"></i>
          {activeAlerts > 0 && <span className="badge">{activeAlerts}</span>}
        </Link>

        <span className="navbar-welcome">
          {t("welcome")}, {adminName}
        </span>

        {/* Language selector with globe icon */}
        <div className="language-selector-wrapper">
          <i className="bi bi-globe language-globe-icon"></i>
          <select
            value={i18n.resolvedLanguage?.split('-')[0] || i18n.language}
            onChange={(e) => changeLanguage(e.target.value)}
            className="language-selector"
          >
            <option value="en">English</option>
            <option value="am">አማርኛ</option>
            <option value="om">Oromoo</option>
          </select>
        </div>

        <button className="navbar-logout" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i> {t("logout")}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;