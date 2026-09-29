import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";

const RESEND_SECONDS = 60;

function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  // Email is passed from the Register page: navigate("/verify-otp", { state: { email } })
  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  // No email -> user opened this page directly, send them back
  useEffect(() => {
    if (!email) navigate("/register", { replace: true });
  }, [email, navigate]);

  // Resend countdown
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Enter the 6-digit code.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await API.post("/auth/verify-otp", { email, otp });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setError("");
      setInfo("");
      await API.post("/auth/resend-otp", { email });
      setInfo("A new code has been sent to your email.");
      setSecondsLeft(RESEND_SECONDS);
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend the code.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Verify your email</h2>

        <p style={styles.text}>
          We sent a 6-digit code to <strong>{email}</strong>. It expires in 10
          minutes.
        </p>

        <input
          style={styles.input}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="000000"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && handleVerify()}
        />

        {error && <p style={styles.error}>{error}</p>}
        {info && <p style={styles.info}>{info}</p>}

        <button
          style={styles.button}
          onClick={handleVerify}
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify email"}
        </button>

        <button
          style={styles.link}
          onClick={handleResend}
          disabled={secondsLeft > 0}
        >
          {secondsLeft > 0 ? `Resend code in ${secondsLeft}s` : "Resend code"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    background: "#F5F3FF",
  },
  card: {
    width: "100%",
    maxWidth: 380,
    background: "#fff",
    borderRadius: 20,
    padding: 28,
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },
  title: { margin: "0 0 8px" },
  text: { color: "#555", fontSize: 14, marginBottom: 20 },
  input: {
    width: "100%",
    boxSizing: "border-box",
    fontSize: 28,
    letterSpacing: 10,
    textAlign: "center",
    padding: "12px 8px",
    borderRadius: 12,
    border: "1px solid #D1D5DB",
    outline: "none",
  },
  error: { color: "#DC2626", fontSize: 13, marginTop: 12 },
  info: { color: "#059669", fontSize: 13, marginTop: 12 },
  button: {
    width: "100%",
    marginTop: 18,
    padding: 14,
    border: "none",
    borderRadius: 12,
    background: "#7C3AED",
    color: "#fff",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
  },
  link: {
    marginTop: 14,
    background: "none",
    border: "none",
    color: "#7C3AED",
    fontSize: 14,
    cursor: "pointer",
  },
};

export default VerifyOtp;