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
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Threats from "./pages/Threats";
import Alerts from "./pages/Alerts";
import AreaMap from "./pages/AreaMap";
import Reports from "./pages/Reports";
import AuditLog from "./pages/AuditLog";
import Settings from "./pages/Settings";
import Monitoring from "./pages/Monitoring";
import ProtectedRoute from "./components/ProtectedRoute";
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
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/threats" element={<ProtectedRoute><Threats /></ProtectedRoute>} />
            <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
            <Route path="/map" element={<ProtectedRoute><AreaMap /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/audit-log" element={<ProtectedRoute><AuditLog /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/monitoring" element={<ProtectedRoute><Monitoring /></ProtectedRoute>} />
          </Routes>
          </DashboardNavProvider>
        </BrowserRouter>
      </Suspense>
    </TranslationProvider>
  );
}

export default App;