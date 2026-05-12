import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDashboardNav } from "../context/DashboardNavContext";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();
  const dashboardNav = useDashboardNav();
  const adminName = localStorage.getItem("adminName") || "Admin";
  const [activeAlerts, setActiveAlerts] = useState(0);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    setActiveAlerts(5);
    // Apply theme on mount - only add class for light mode
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, [theme]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isDashboardRoute = [
    "/dashboard",
    "/threats",
    "/alerts",
    "/map",
    "/reports",
    "/audit-log",
    "/settings",
    "/monitoring",
  ].includes(location.pathname);

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

        {/* Theme toggle button */}
        <button className="dark-mode-toggle" onClick={toggleTheme} title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}>
          <i className={`bi ${theme === "dark" ? "bi-sun" : "bi-moon"}`}></i>
        </button>

        <button className="navbar-logout" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i>{" "}
          <span className="navbar-logout-text">{t("logout")}</span>
        </button>

        {dashboardNav && isDashboardRoute && (
          <button
            type="button"
            className="navbar-drawer-toggle"
            onClick={dashboardNav.toggleDrawer}
            aria-label={
              dashboardNav.drawerOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={dashboardNav.drawerOpen}
          >
            <i
              className={`bi ${dashboardNav.drawerOpen ? "bi-x-lg" : "bi-list"}`}
            />
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;