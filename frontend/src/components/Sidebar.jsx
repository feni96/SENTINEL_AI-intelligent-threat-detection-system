// src/components/Sidebar.jsx — slide-out drawer; toggle lives in Navbar (☰)
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { useDashboardNav } from "../context/DashboardNavContext";

const Sidebar = () => {
  const { t } = useTranslation();
  const nav = useDashboardNav();

  const navItems = [
    { path: "/dashboard", label: t("dashboard"), icon: "bi-speedometer2", end: true },
    { path: "/map", label: t("areaMap"), icon: "bi-map" },
    { path: "/alerts", label: t("alerts"), icon: "bi-bell" },
    { path: "/reports", label: t("reports"), icon: "bi-file-earmark-text" },
    { path: "/audit-log", label: t("auditLog"), icon: "bi-journal-text" },
    { path: "/settings", label: t("settings"), icon: "bi-gear" },
    { path: "/monitoring", label: t("systemMonitoring"), icon: "bi-activity" },
  ];

  if (!nav) {
    return null;
  }

  const { drawerOpen, closeDrawer } = nav;

  return (
    <div className="dashboard-sidebar-mount" aria-hidden={!drawerOpen}>
      <div
        className={`dashboard-nav-backdrop ${drawerOpen ? "is-visible" : ""}`}
        aria-hidden={!drawerOpen}
        onClick={closeDrawer}
      />
      <aside
        className={`sidebar dashboard-nav-drawer ${drawerOpen ? "is-open" : ""}`}
        aria-hidden={!drawerOpen}
      >
        <nav className="nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
              end={item.end}
              onClick={closeDrawer}
            >
              <i className={`bi ${item.icon}`} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </div>
  );
};

export default Sidebar;
