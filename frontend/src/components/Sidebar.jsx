// src/components/Sidebar.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Check if window is in split mode
  const isSplitWindow = () => {
    return window.innerHeight < window.screen.height;
  };
  
  const navItems = [
    { path: "/dashboard", label: t("dashboard"), icon: "bi-speedometer2", end: true },
    { path: "/map", label: t("areaMap"), icon: "bi-map" },
    { path: "/threats", label: t("threats"), icon: "bi-shield-exclamation" },
    { path: "/reports", label: t("reports"), icon: "bi-file-earmark-text" },
    { path: "/audit-log", label: t("auditLog"), icon: "bi-journal-text" },
    { path: "/settings", label: t("settings"), icon: "bi-gear" },
    { path: "/monitoring", label: t("systemMonitoring"), icon: "bi-activity" },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-expanded' : ''}`}>
      {/* Mobile Menu Toggle - Show in mobile and split window */}
      {(isMobileMenuOpen || isSplitWindow()) && (
        <button 
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          <i className={`bi ${isMobileMenuOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
        </button>
      )}
      
      <nav className={`nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
            end={item.end}
          >
            <i className={`bi ${item.icon}`}></i>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;