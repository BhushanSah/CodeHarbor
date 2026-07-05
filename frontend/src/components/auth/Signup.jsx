import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../authContext";
import { Link } from "react-router-dom";

import logo from "../../assets/github-mark-white.svg";
import "./auth.css";

const PersonIcon = () => (
  <svg className="field-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4" />
    <path d="M2.5 14c0-3 2.5-4.8 5.5-4.8s5.5 1.8 5.5 4.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const MailIcon = () => (
  <svg className="field-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    <path d="M2 4.5l6 4.5 6-4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LockIcon = () => (
  <svg className="field-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M1 8s2.5-4.5 7-4.5S15 8 15 8s-2.5 4.5-7 4.5S1 8 1 8z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M6.6 3.9C7 3.8 7.5 3.8 8 3.8c4.5 0 7 4.2 7 4.2a12 12 0 0 1-2.4 2.9M4.2 5.3A11.6 11.6 0 0 0 1 8s2.5 4.2 7 4.2c.8 0 1.5-.1 2.2-.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const getPasswordChecks = (value) => ({
  length: value.length > 8,
  number: /[0-9]/.test(value),
  special: /[^A-Za-z0-9]/.test(value),
});

const Signup = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { setCurrentUser } = useAuth();

  const passwordChecks = getPasswordChecks(password);

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:3000/signup", {
        email: email,
        password: password,
        username: username,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("email", res.data.email);  

      setCurrentUser(res.data.userId);
      setLoading(false);

      window.location.href = "/";
    } catch (err) {
      console.error("Singup Error", err);
       alert(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Signup failed. Please try again."
       );
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <header className="auth-topbar">
        <div className="brand">
          <img src={logo} alt="" className="brand-mark" />
          <span className="brand-name">CodeHarbor</span>
        </div>
      </header>

      <main className="auth-main">
        <div className="auth-card">
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">A few details and you're in.</p>

          <form className="auth-form" onSubmit={handleSignup} noValidate>
            <div className="field">
              <label className="field-label" htmlFor="Username">
                Username
              </label>
              <div className="field-control">
                <PersonIcon />
                <input
                  autoComplete="off"
                  name="Username"
                  id="Username"
                  className="field-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="Email">
                Email address
              </label>
              <div className="field-control">
                <MailIcon />
                <input
                  autoComplete="off"
                  name="Email"
                  id="Email"
                  className="field-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="Password">
                Password
              </label>
              <div className="field-control">
                <LockIcon />
                <input
                  autoComplete="off"
                  name="Password"
                  id="Password"
                  className="field-input field-input--password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="field-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {password && (
                <ul className="password-checklist">
                  <li className={passwordChecks.length ? "met" : ""}>8+ characters</li>
                  <li className={passwordChecks.number ? "met" : ""}>At least one Digit</li>
                  <li className={passwordChecks.special ? "met" : ""}>At least one special character</li>
                </ul>
              )}
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Creating account…
                </>
              ) : (
                "Create account"
              )}
            </button>

            <p className="auth-terms">
              By creating an account, you agree to the Terms of Service and acknowledge the Privacy Policy.
            </p>
          </form>
        </div>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/auth" className="auth-link">Log in</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Signup;
