import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import logo from "../assets/mindcare-logo.jpeg";
import "./Login.css";

// Layered lotus flower drawn with SVG (used as the background pattern)
const OUTER = Array.from({ length: 8 }, (_, i) => i * 45);
const INNER = Array.from({ length: 8 }, (_, i) => 22.5 + i * 45);

const Lotus = ({ className }) => (
  <svg className={`lotus ${className}`} viewBox="-100 -100 200 200" aria-hidden="true">
    {OUTER.map((a) => (
      <path
        key={`o${a}`}
        className="petal-out"
        d="M0 0 C-22 -30 -18 -70 0 -92 C18 -70 22 -30 0 0 Z"
        transform={`rotate(${a})`}
      />
    ))}
    {INNER.map((a) => (
      <path
        key={`i${a}`}
        className="petal-in"
        d="M0 0 C-14 -20 -12 -46 0 -60 C12 -46 14 -20 0 0 Z"
        transform={`rotate(${a})`}
      />
    ))}
    <circle className="lotus-core" r="9" />
  </svg>
);

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/login", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/dashboard");
    } catch (err) {
      // Email not verified yet -> backend sent a new code, open the verify page
      if (err.response?.data?.needsVerification) {
        navigate("/verify-otp", {
          state: { email: err.response.data.email },
        });
        return;
      }

      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background lotus pattern */}
      <Lotus className="lotus-main" />
      <Lotus className="lotus-l1" />
      <Lotus className="lotus-r1" />
      <Lotus className="lotus-l2" />
      <Lotus className="lotus-r2" />

      <div className="login-content">
        <div className="login-logo">
          <img src={logo} alt="MindCare logo" />
        </div>

        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">
          Login to continue your MindCare journey
        </p>

        <form className="login-card" onSubmit={handleLogin}>
          {error && <p className="login-error">{error}</p>}

          <label className="login-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="login-input"
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label className="login-label" htmlFor="password">
            Password
          </label>
          <div className="password-wrap">
            <input
              id="password"
              className="login-input"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="toggle-pass"
              onClick={() => setShowPassword((s) => !s)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="login-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;