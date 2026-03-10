// src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: "bi-speedometer2", end: true },
    { path: "/map", label: "Area Map", icon: "bi-map" },
    { path: "/threats", label: "Threats", icon: "bi-shield-exclamation" },
    { path: "/reports", label: "Reports", icon: "bi-file-earmark-text" },
    { path: "/analytics", label: "Analytics", icon: "bi-graph-up" },
    { path: "/ai-model", label: "AI Model", icon: "bi-cpu" },
    { path: "/audit-log", label: "Audit Log", icon: "bi-journal-text" },
    { path: "/settings", label: "Settings", icon: "bi-gear" },
  ];

  return (
    <aside className="sidebar">
      <nav className="nav flex-column">
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