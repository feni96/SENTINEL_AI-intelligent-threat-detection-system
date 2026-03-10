// src/pages/Login.jsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./Login.css"

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

/**
 * Handles form submission for login authentication
 * @param {Object} e - The form submission event object
 */
  const handleSubmit = (e) => {
    e.preventDefault() // Prevents default form submission behavior
    // Demo authentication
    if (email === "admin@sentinel.com" && password === "123456") {
      navigate("/dashboard") // Redirect to dashboard on successful login
    } else {
      setError("Invalid email or password") // Set error message for invalid credentials
    }
  }

  return (
    <div className="login-container">
      {/* Floating blobs */}
      <div className="blob blob1"></div>
      <div className="blob blob2"></div>

      <div className="login-form">
        <h1>Sentinel AI</h1>
        <p className="login-subtitle">Secure Login Dashboard</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  )
}

export default Login