// src/App.jsx
import { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardNavProvider } from "./context/DashboardNavContext";
import { TranslationProvider } from "./context/TranslationContext";
import Landing from "./pages/Landing";  
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";      // new public landing page
import GuestAlerts from "./pages/GuestAlerts";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Threats from "./pages/Threats";
import Alerts from "./pages/Alerts";
import AreaMap from "./pages/AreaMap";
import Reports from "./pages/Reports";
import AuditLog from "./pages/AuditLog";
import Settings from "./pages/Settings";
import Monitoring from "./pages/Monitoring";
import "bootstrap-icons/font/bootstrap-icons.css";

function App() {
  return (
    <TranslationProvider>
      <Suspense fallback={<div className="loading">Loading translations...</div>}>
        <BrowserRouter>
          <DashboardNavProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/guest-alerts" element={<GuestAlerts />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/threats" element={<Threats />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/map" element={<AreaMap />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/audit-log" element={<AuditLog />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/monitoring" element={<Monitoring />} />
          </Routes>
          </DashboardNavProvider>
        </BrowserRouter>
      </Suspense>
    </TranslationProvider>
  );
}

export default App;