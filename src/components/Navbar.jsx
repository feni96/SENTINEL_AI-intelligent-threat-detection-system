import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const adminName = localStorage.getItem("adminName") || "Admin";
  const [activeAlerts, setActiveAlerts] = useState(0);

  // Simulate fetching active alerts count (replace with real API later)
  useEffect(() => {
    // This would be an API call in a real app
    setActiveAlerts(5); // mock data
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminName");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <i className="bi bi-shield-shaded"></i>
        <span>Sentinel AI</span>
      </div>
      <div className="navbar-menu">
        {/* Network Context Icon */}
        <Link to="/network" className="navbar-icon" title="Network Context">
          <i className="bi bi-diagram-3"></i>
        </Link>

        {/* Monitoring Icon */}
        <Link to="/monitoring" className="navbar-icon" title="Monitoring">
          <i className="bi bi-activity"></i>
        </Link>

        {/* Alerts Icon with Badge */}
        <Link to="/alerts" className="navbar-icon" title="Alerts">
          <i className="bi bi-bell"></i>
          {activeAlerts > 0 && <span className="badge">{activeAlerts}</span>}
        </Link>

        {/* Profile Icon */}
        <Link to="/profile" className="navbar-icon" title="Profile">
          <i className="bi bi-person-circle"></i>
        </Link>

        <span className="navbar-welcome">Welcome, {adminName}</span>

        <button className="navbar-logout" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i> Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;