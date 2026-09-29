import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import logo from "../assets/mindcare-logo.jpeg";
import "./Register.css";

// Two soft watercolor mountains at the bottom of the page
const Mountains = () => (
  <svg
    className="reg-mountains"
    viewBox="0 0 400 170"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="mtBlue" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#8b9cc2" stopOpacity="0.55" />
        <stop offset="1" stopColor="#b7bfd6" stopOpacity="0.1" />
      </linearGradient>
      <linearGradient id="mtRust" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#cf8459" stopOpacity="0.6" />
        <stop offset="1" stopColor="#e6b592" stopOpacity="0.1" />
      </linearGradient>
    </defs>
    <path
      d="M-20 170 L60 62 Q95 24 140 70 L215 170 Z"
      fill="url(#mtBlue)"
    />
    <path
      d="M150 170 L275 40 Q305 12 340 46 L430 170 Z"
      fill="url(#mtRust)"
    />
  </svg>
);

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    gender: "",
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const email = formData.email.trim().toLowerCase();

      const payload = {
        name: formData.name,
        email,
        password: formData.password,
        gender: formData.gender,
        age: formData.age ? Number(formData.age) : undefined,
      };

      // Backend sends a 6-digit code to the email (no token until verified)
      await API.post("/auth/register", payload);

      navigate("/verify-otp", { state: { email } });
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reg-page">
      <div className="reg-grain"></div>
      <Mountains />

      <div className="reg-content">
        {/* Sun with the logo in the middle */}
        <div className="reg-sun">
          <div className="reg-rays"></div>
          <div className="reg-sun-disc"></div>
          <div className="reg-logo">
            <img src={logo} alt="MindCare logo" />
          </div>
        </div>

        <h1 className="reg-title">Create Account</h1>
        <p className="reg-subtitle">Start your calm wellbeing journey</p>

        <form className="reg-card" onSubmit={handleRegister}>
          {error && <p className="reg-error">{error}</p>}

          <label className="reg-label" htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            className="reg-input"
            type="text"
            name="name"
            placeholder="Your name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label className="reg-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="reg-input"
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label className="reg-label" htmlFor="password">
            Password
          </label>
          <div className="reg-pass-wrap">
            <input
              id="password"
              className="reg-input"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
            <button
              type="button"
              className="reg-toggle"
              onClick={() => setShowPassword((s) => !s)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="reg-row">
            <div>
              <label className="reg-label" htmlFor="age">
                Age
              </label>
              <input
                id="age"
                className="reg-input"
                type="number"
                name="age"
                placeholder="Age"
                value={formData.age}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="reg-label" htmlFor="gender">
                Gender
              </label>
              <select
                id="gender"
                className="reg-input"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <button className="reg-btn" type="submit" disabled={loading}>
            {loading ? "Sending code..." : "Register"}
          </button>
        </form>

        <p className="reg-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;