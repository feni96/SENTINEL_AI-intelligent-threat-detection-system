import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

/**
 * Shared header for public routes (landing, about, contact, guest alerts).
 * @param {"home"|"about"|"contact"|"guest"} activePage
 */
export default function PublicHeader({ activePage = "home" }) {
  const { t, i18n } = useTranslation();
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  };

  const closeNav = () => setNavOpen(false);

  const lang =
    (i18n.resolvedLanguage && i18n.resolvedLanguage.split("-")[0]) ||
    i18n.language ||
    "en";

  return (
    <header className={`landing-header ${navOpen ? "landing-nav-open" : ""}`}>
      <div className="container">
        <div className="logo">
          <img
            src="/images/picture1.jpg"
            alt="Haramaya University Logo"
            className="navbar-logo"
          />
          <span className="logo-text">{t("appName")}</span>
        </div>
        <button
          type="button"
          className="landing-menu-toggle"
          onClick={() => setNavOpen((o) => !o)}
          aria-label={navOpen ? "Close menu" : "Open menu"}
          aria-expanded={navOpen}
        >
          <i className={`bi ${navOpen ? "bi-x-lg" : "bi-list"}`} />
        </button>
        <nav
          className="nav-links"
          onClick={(e) => {
            if (e.target.closest("a")) closeNav();
          }}
        >
          <Link
            to="/"
            className={`nav-link ${activePage === "home" ? "active" : ""}`}
          >
            {t("home")}
          </Link>
          <Link
            to="/about"
            className={`nav-link ${activePage === "about" ? "active" : ""}`}
          >
            {t("about")}
          </Link>
          <Link
            to="/contact"
            className={`nav-link ${activePage === "contact" ? "active" : ""}`}
          >
            {t("contact")}
          </Link>
          <Link
            to="/guest-alerts"
            className={`nav-link ${activePage === "guest" ? "active" : ""}`}
          >
            <i className="bi bi-bell" />
          </Link>
          <button
            type="button"
            className="dark-mode-toggle"
            onClick={toggleTheme}
            title={
              theme === "dark"
                ? "Switch to Light Mode"
                : "Switch to Dark Mode"
            }
          >
            <i className={`bi ${theme === "dark" ? "bi-sun" : "bi-moon"}`} />
          </button>
          <div className="language-selector-wrapper">
            <i className="bi bi-globe language-globe-icon" />
            <select
              value={lang}
              onChange={(e) => {
                localStorage.setItem("i18nextLng", e.target.value);
                window.location.reload();
              }}
              className="language-selector"
            >
              <option value="en">English</option>
              <option value="am">አማርኛ</option>
              <option value="om">Oromoo</option>
            </select>
          </div>
          <Link to="/login" className="login-btn">
            <i className="bi bi-box-arrow-in-right" />
            {t("login")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
