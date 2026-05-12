// src/pages/Login.jsx

import { useState } from "react";

import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import { useTranslation } from "react-i18next";



function Login() {

  const { t } = useTranslation();

  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const [rememberMe, setRememberMe] = useState(false);



  const handleSubmit = async (e) => {

    e.preventDefault();

    const result = await login(email, password);
    if (result.success) {
      navigate("/dashboard");
      return;
    }
    setError(result.message || t("invalidCredentials"));

  };



  const handleForgotPassword = (e) => {

    e.preventDefault();

    navigate("/forgot-password");

  };



  return (

    <div className="login-container">

      {/* Floating blobs */}

      <div className="blob blob1"></div>

      <div className="blob blob2"></div>



      <div className="login-card">

        {/* Login Form – moved logo to top, centered */}

        <div className="login-form">

          {/* Clickable logo that goes to landing page */}

          <Link to="/" className="login-logo-link">

            <img

              src="/images/Picture1.jpg"

              alt="Haramaya University Logo"

              className="login-logo"

            />

          </Link>

          <h1>{t("appName")}</h1>

          <p className="login-subtitle">{t("secureLoginDashboard")}</p>



          {error && <div className="error-message">{error}</div>}



          <form onSubmit={handleSubmit}>

            <div className="form-group">

              <input

                type="email"

                placeholder={t("enterUsernameEmail")}

                value={email}

                onChange={(e) => setEmail(e.target.value)}

                required

              />

            </div>

            <div className="form-group">

              <input

                type="password"

                placeholder={t("enterPassword")}

                value={password}

                onChange={(e) => setPassword(e.target.value)}

                required

              />

            </div>

            <div className="remember-me">

              <input

                type="checkbox"

                id="remember"

                checked={rememberMe}

                onChange={(e) => setRememberMe(e.target.checked)}

              />

              {t("rememberMe")}

            </div>

            <div className="forgot-password-container">

              <a href="#" onClick={handleForgotPassword} className="forgot-link">

                {t("forgotPassword")}

              </a>

            </div>

            <button type="submit" className="login-btn">

              {t("signin")}

            </button>

          </form>

        </div>

      </div>

    </div>

  );

}



export default Login;