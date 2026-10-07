import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import bgImage from "../assets/mood-bg.jpeg";

/* ============================================================
   CUTE 3D ICONS (pure SVG – glossy, soft, tiny faces)
   Same style as the Counselor page
   ============================================================ */

let cUid = 0;
const useCUid = () => {
  const ref = useRef(null);
  if (ref.current === null) ref.current = `a3d${++cUid}`;
  return ref.current;
};

function Icon3D({ name, size = 28, hue = 240 }) {
  const u = useCUid();
  const id = (k) => `${u}-${k}`;
  const f = (k) => `url(#${id(k)})`;
  const R = (k, a, b, c) => (
    <radialGradient id={id(k)} cx="32%" cy="25%" r="90%">
      <stop offset="0%" stopColor={a} />
      <stop offset="50%" stopColor={b} />
      <stop offset="100%" stopColor={c} />
    </radialGradient>
  );
  const gloss = (cx, cy, rx, ry, rot = -25, o = 0.75) => (
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#fff" opacity={o} transform={`rotate(${rot} ${cx} ${cy})`} />
  );
  const face = (cx, cy, s = 1, color = "#3b2a3f") => (
    <g>
      <ellipse cx={cx - 9 * s} cy={cy} rx={2.8 * s} ry={3.4 * s} fill={color} />
      <ellipse cx={cx + 9 * s} cy={cy} rx={2.8 * s} ry={3.4 * s} fill={color} />
      <circle cx={cx - 8.2 * s} cy={cy - 1.2 * s} r={1 * s} fill="#fff" />
      <circle cx={cx + 9.8 * s} cy={cy - 1.2 * s} r={1 * s} fill="#fff" />
      <path d={`M${cx - 4 * s} ${cy + 5 * s} q${4 * s} ${4.5 * s} ${8 * s} 0`} fill="none" stroke={color} strokeWidth={2 * s} strokeLinecap="round" />
      <ellipse cx={cx - 15 * s} cy={cy + 5 * s} rx={4 * s} ry={2.6 * s} fill="#FF8FA3" opacity="0.55" />
      <ellipse cx={cx + 15 * s} cy={cy + 5 * s} rx={4 * s} ry={2.6 * s} fill="#FF8FA3" opacity="0.55" />
    </g>
  );
  const H = {
    l: `hsl(${hue} 70% 90%)`,
    m: `hsl(${hue} 50% 66%)`,
    d: `hsl(${hue} 45% 42%)`,
  };

  let content = null;

  switch (name) {
    case "chat":
      content = (
        <g>
          <defs>{R("b", H.l, H.m, H.d)}</defs>
          <path d="M22 12 H78 a14 14 0 0 1 14 14 V58 a14 14 0 0 1 -14 14 H56 L34 92 V72 H22 a14 14 0 0 1 -14 -14 V26 a14 14 0 0 1 14 -14 Z" fill={f("b")} />
          {face(50, 40, 1)}
          {gloss(30, 22, 15, 4.5, -8, 0.6)}
        </g>
      );
      break;

    case "brain":
      content = (
        <g>
          <defs>{R("br", "#FFE9F0", "#FFA9C2", "#E2628A")}</defs>
          <circle cx="32" cy="48" r="22" fill={f("br")} />
          <circle cx="68" cy="48" r="22" fill={f("br")} />
          <circle cx="42" cy="30" r="19" fill={f("br")} />
          <circle cx="58" cy="30" r="19" fill={f("br")} />
          <circle cx="40" cy="66" r="18" fill={f("br")} />
          <circle cx="60" cy="66" r="18" fill={f("br")} />
          <path d="M50 14 V84" stroke="#D3507B" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.55" />
          {face(50, 50, 1, "#7a2a47")}
          {gloss(30, 28, 10, 4.5, -35, 0.8)}
        </g>
      );
      break;

    case "calendar":
      content = (
        <g>
          <defs>
            {R("c", "#FFFFFF", "#F4F2FB", "#C9C6E3")}
            {R("t", "#FFC2CF", "#EE7A93", "#C23E5E")}
          </defs>
          <rect x="10" y="16" width="80" height="76" rx="18" fill={f("c")} />
          <path d="M10 34 V34 a18 18 0 0 1 18 -18 H72 a18 18 0 0 1 18 18 V40 H10 Z" fill={f("t")} />
          <rect x="29" y="6" width="9" height="20" rx="4.5" fill="#8C93B8" />
          <rect x="62" y="6" width="9" height="20" rx="4.5" fill="#8C93B8" />
          {face(50, 62, 0.85)}
          {gloss(28, 26, 12, 3.5, -10, 0.55)}
        </g>
      );
      break;

    case "hourglass":
      content = (
        <g>
          <defs>
            {R("w", "#F7E2BE", "#D29A52", "#94602A")}
            {R("s", "#FFF4C2", "#FFD056", "#E8951A")}
          </defs>
          <path d="M30 18 H70 C70 40 56 46 50 50 C56 54 70 60 70 82 H30 C30 60 44 54 50 50 C44 46 30 40 30 18 Z" fill="#EEF6FC" stroke="#A9CCE0" strokeWidth="2.5" />
          <path d="M37 80 H63 C61 70 55 62 50 58 C45 62 39 70 37 80 Z" fill={f("s")} />
          <path d="M38 22 H62 C60 31 55 37 50 41 C45 37 40 31 38 22 Z" fill={f("s")} />
          <rect x="22" y="8" width="56" height="11" rx="5.5" fill={f("w")} />
          <rect x="22" y="81" width="56" height="11" rx="5.5" fill={f("w")} />
          {gloss(38, 30, 3, 9, 8, 0.8)}
        </g>
      );
      break;

    case "check":
      content = (
        <g>
          <defs>{R("g", "#D3FADE", "#4FD27C", "#1E9A47")}</defs>
          <circle cx="50" cy="50" r="40" fill={f("g")} />
          <path d="M30 51 L44 65 L71 36" fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
          {gloss(36, 30, 14, 6, -30, 0.8)}
        </g>
      );
      break;

    case "clock":
      content = (
        <g>
          <defs>
            {R("c", "#FFFFFF", "#F4F2FB", "#C9C6E3")}
            {R("r", H.l, H.m, H.d)}
          </defs>
          <circle cx="50" cy="50" r="38" fill={f("c")} stroke={f("r")} strokeWidth="9" />
          <path d="M50 28 V50 L64 58" fill="none" stroke="#5F6DA6" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="50" cy="50" r="4" fill="#E3A4B4" />
          {gloss(36, 28, 11, 4, -35, 0.85)}
        </g>
      );
      break;

    case "laptop":
      content = (
        <g>
          <defs>
            {R("sc", H.l, H.m, H.d)}
            {R("bs", "#FFFFFF", "#E1E5EC", "#AEB5C2")}
          </defs>
          <rect x="16" y="14" width="68" height="52" rx="9" fill="#3e4452" />
          <rect x="21" y="19" width="58" height="42" rx="5" fill={f("sc")} />
          {face(50, 38, 0.8)}
          <path d="M6 70 H94 L88 84 H12 Z" fill={f("bs")} />
          <rect x="40" y="74" width="20" height="4" rx="2" fill="#AEB5C2" />
          {gloss(34, 26, 12, 3.5, -20, 0.6)}
        </g>
      );
      break;

    case "hospital":
      content = (
        <g>
          <defs>{R("h", "#FFFFFF", "#F1F6FB", "#C3D2E0")}</defs>
          <rect x="10" y="10" width="80" height="80" rx="22" fill={f("h")} />
          <path d="M42 26 H58 V42 H74 V58 H58 V74 H42 V58 H26 V42 H42 Z" fill="#EF5B63" />
          {gloss(30, 24, 13, 4.5, -20, 0.9)}
        </g>
      );
      break;

    case "clipboard":
      content = (
        <g>
          <defs>
            {R("b", "#FFF3DC", "#F2CF94", "#C99A52")}
            {R("p", "#FFFFFF", "#F6F4FC", "#D6D3EC")}
          </defs>
          <rect x="16" y="12" width="68" height="82" rx="14" fill={f("b")} />
          <rect x="24" y="24" width="52" height="64" rx="8" fill={f("p")} />
          <rect x="34" y="6" width="32" height="16" rx="8" fill="#8C93B8" />
          <path d="M32 44 l5 5 l9 -10" fill="none" stroke="#4FD27C" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M32 66 l5 5 l9 -10" fill="none" stroke="#4FD27C" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="52" y="44" width="16" height="4.5" rx="2.2" fill="#C5C2E0" />
          <rect x="52" y="66" width="16" height="4.5" rx="2.2" fill="#C5C2E0" />
          {gloss(30, 20, 9, 3, -20, 0.6)}
        </g>
      );
      break;

    case "leaf":
      content = (
        <g>
          <defs>{R("l", "#DDFBD0", "#6FD27A", "#2E9A4E")}</defs>
          <path d="M14 86 C10 40 40 10 88 12 C90 60 62 90 14 86 Z" fill={f("l")} />
          <path d="M18 82 C36 62 52 46 76 26" fill="none" stroke="#2E9A4E" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
          {face(54, 52, 0.8, "#20502e")}
          {gloss(36, 30, 12, 4, -40, 0.7)}
        </g>
      );
      break;

    case "lock":
      content = (
        <g>
          <defs>{R("g", "#FFF6C4", "#FFD056", "#E8951A")}</defs>
          <path d="M33 44 V32 A17 17 0 0 1 67 32 V44" fill="none" stroke="#BFC6D2" strokeWidth="9" strokeLinecap="round" />
          <rect x="18" y="42" width="64" height="50" rx="14" fill={f("g")} />
          <circle cx="50" cy="64" r="7" fill="#7a4a10" />
          <rect x="47" y="67" width="6" height="12" rx="3" fill="#7a4a10" />
          {gloss(34, 50, 11, 4.5, -20, 0.75)}
        </g>
      );
      break;

    case "sparkle":
      content = (
        <g>
          <defs>{R("s", "#FFF9D0", "#FFD95A", "#F2A31B")}</defs>
          <path d="M50 6 C54 36 64 46 94 50 C64 54 54 64 50 94 C46 64 36 54 6 50 C36 46 46 36 50 6 Z" fill={f("s")} />
          {gloss(42, 36, 8, 3.5, -40, 0.85)}
        </g>
      );
      break;

    default:
      content = null;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        display: "block",
        overflow: "visible",
        flexShrink: 0,
        filter: "drop-shadow(0 3px 4px rgba(60,60,110,0.28))",
      }}
    >
      {content}
    </svg>
  );
}

/* Only Online + Offline.  "Physical" stays as the stored value so the
   backend / old appointments keep working – the label shows "Offline". */
const SESSION_TYPES = [
  { key: "Online", label: "Online", icon: "laptop" },
  { key: "Physical", label: "Offline", icon: "hospital" },
];

const typeInfo = (type) => {
  if (type === "Online") return { label: "Online", icon: "laptop" };
  if (type === "Physical") return { label: "Offline", icon: "hospital" };
  if (type === "Phone Call") return { label: "Phone", icon: "chat" }; // old bookings only
  return { label: type || "Online", icon: "laptop" };
};

function Appointments() {
  const navigate = useNavigate();

  const [counselors, setCounselors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loadingCounselors, setLoadingCounselors] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    counselorId: "",
    type: "Online",
    date: "",
    time: "",
    reason: "",
  });
  const [selectedFilter, setSelectedFilter] = useState("All");

  useEffect(() => {
    loadCounselors();
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCounselors = async () => {
    try {
      setLoadingCounselors(true);
      const response = await API.get("/counselors");
      setCounselors(response.data);
      if (response.data.length > 0) {
        setForm((prev) => ({ ...prev, counselorId: response.data[0]._id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCounselors(false);
    }
  };

  const loadAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const response = await API.get("/appointments/my");
      setAppointments(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createAppointment = async () => {
    if (!form.counselorId || !form.type || !form.date || !form.time || !form.reason.trim()) {
      alert("Please fill all appointment details");
      return;
    }
    try {
      setSubmitting(true);
      await API.post("/appointments", {
        counselorId: form.counselorId,
        type: form.type,
        date: form.date,
        time: form.time,
        reason: form.reason,
      });
      const bookedCounselor = counselors.find((c) => c._id === form.counselorId)?.name || "Counselor";
      const bookedDate = form.date;
      const bookedTime = form.time;
      setForm({
        counselorId: counselors[0]?._id || "",
        type: "Online",
        date: "",
        time: "",
        reason: "",
      });
      await loadAppointments();
      navigate("/dashboard", {
        state: {
          bookingSuccess: true,
          counselorName: bookedCounselor,
          date: bookedDate,
          time: bookedTime,
        },
      });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to book appointment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const cancelAppointment = async (id) => {
    try {
      await API.put(`/appointments/${id}/cancel`);
      setAppointments((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: "Cancelled" } : item))
      );
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to cancel appointment.");
    }
  };

  const filteredAppointments =
    selectedFilter === "All" ? appointments : appointments.filter((item) => item.status === selectedFilter);

  const totalAppointments = appointments.length;
  const pendingCount = appointments.filter((a) => a.status === "Pending").length;
  const confirmedCount = appointments.filter((a) => a.status === "Accepted").length;

  const getStatusBadge = (status) => {
    if (status === "Accepted" || status === "Confirmed") {
      return { bg: "rgba(16,185,129,0.14)", color: "#065f46", border: "1px solid rgba(16,185,129,0.3)", dot: "#10b981", label: "Accepted" };
    }
    if (status === "Pending") {
      return { bg: "rgba(245,158,11,0.14)", color: "#92400e", border: "1px solid rgba(245,158,11,0.3)", dot: "#f59e0b", label: "Pending Review" };
    }
    return { bg: "rgba(239,68,68,0.14)", color: "#991b1b", border: "1px solid rgba(239,68,68,0.3)", dot: "#ef4444", label: "Cancelled" };
  };

  const avatarPalette = ["#F6D3DC", "#CFE3E6", "#DAD0EE", "#F7E3CF", "#CDD6F2", "#F0CFE6"];
  const avatarColor = (name) => avatarPalette[(name?.charCodeAt(0) || 0) % avatarPalette.length];

  return (
    <div className="appt2-page">
      <style>{`
        .appt2-page {
          --accent: #7F93C4;
          --accent-dark: #5F6DA6;
          --teal: #8FB8BE;
          --rose: #E3A4B4;
          --ink: #2E3452;
          --text: #5A6283;
          --soft: #F3F0F9;
          --line: #D9D6EC;
          --grad: linear-gradient(135deg, #8FB8BE 0%, #7F93C4 50%, #A28BC0 100%);
          position: relative;
          min-height: 100dvh;
          width: 100%;
          box-sizing: border-box;
          padding: max(16px, env(safe-area-inset-top)) 12px max(48px, env(safe-area-inset-bottom));
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          color: var(--ink);
          background: var(--soft);
          overflow-x: hidden;
          -webkit-text-size-adjust: 100%;
        }
        .appt2-page *, .appt2-page *::before, .appt2-page *::after { box-sizing: border-box; }

        /* Background photo (same as Counselor page) */
        .appt2-bg-blur {
          position: fixed; inset: 0; z-index: 0;
          background-size: cover; background-position: center; background-repeat: no-repeat;
          filter: blur(28px); transform: scale(1.15);
        }
        .appt2-bg-phone {
          position: fixed; top: 0; left: 0; right: 0; height: 100dvh; z-index: 1;
          display: flex; justify-content: center; pointer-events: none;
        }
        .appt2-bg-phone > div {
          width: 100%; max-width: 480px; height: 100%;
          background-size: cover; background-position: center; background-repeat: no-repeat;
          box-shadow: 0 0 40px rgba(0,0,0,0.15);
        }

        .appt2-container {
          position: relative; z-index: 2;
          width: 100%; max-width: 480px; margin: 0 auto;
          display: grid; gap: 16px;
        }

        /* shared glass */
        .appt2-glass {
          background: rgba(255,255,255,0.62);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.8);
          box-shadow: 0 16px 36px rgba(46,52,82,0.14);
        }

        /* Header */
        .appt2-header {
          border-radius: 26px; padding: 18px;
          background: var(--grad);
          color: #fff;
          box-shadow: 0 16px 36px rgba(95,109,166,0.32);
          position: relative; overflow: hidden;
        }
        .appt2-header::before {
          content: ""; position: absolute; inset: 0;
          background: radial-gradient(circle at top right, rgba(255,255,255,0.3), transparent 60%);
          pointer-events: none;
        }
        .appt2-header > * { position: relative; z-index: 1; }
        .appt2-back-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.22);
          border: 1px solid rgba(255,255,255,0.4);
          color: #fff; padding: 8px 14px; border-radius: 14px;
          font-size: 13px; font-weight: 700; font-family: inherit;
          cursor: pointer; margin-bottom: 12px;
          -webkit-tap-highlight-color: transparent;
        }
        .appt2-title { font-size: 26px; font-weight: 800; margin: 0 0 6px; line-height: 1.15; text-shadow: 0 2px 8px rgba(0,0,0,0.15); }
        .appt2-subtitle { font-size: 13.5px; margin: 0 0 12px; color: rgba(255,255,255,0.92); line-height: 1.5; }
        .appt2-header-pill {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.22); border: 1px solid rgba(255,255,255,0.38);
          padding: 6px 13px; border-radius: 16px; font-size: 12.5px; font-weight: 700;
        }
        .appt2-header-dot { width: 8px; height: 8px; border-radius: 50%; background: #34D399; box-shadow: 0 0 10px #34D399; }

        /* Stats */
        .appt2-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .appt2-stat-card {
          border-radius: 20px; padding: 12px 6px;
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          text-align: center; min-width: 0;
        }
        .appt2-stat-icon {
          width: 46px; height: 46px; border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, var(--soft), #fff);
          box-shadow: 0 6px 14px rgba(46,52,82,0.1);
        }
        .appt2-stat-card h3 { font-size: 22px; font-weight: 800; color: var(--ink); margin: 0; line-height: 1.1; }
        .appt2-stat-card p { font-size: 11px; font-weight: 700; color: var(--text); margin: 0; line-height: 1.25; }

        /* Cards */
        .appt2-card { border-radius: 26px; padding: 18px 16px; }
        .appt2-card-header {
          display: flex; align-items: center; justify-content: space-between; gap: 10px;
          margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1.5px solid var(--line);
        }
        .appt2-card-header h2 { font-size: 19px; font-weight: 800; color: var(--ink); margin: 0 0 3px; }
        .appt2-card-header p { font-size: 12.5px; color: var(--text); margin: 0; line-height: 1.4; }
        .appt2-card-badge-icon {
          width: 46px; height: 46px; border-radius: 15px; flex-shrink: 0;
          background: linear-gradient(135deg, var(--soft), #fff);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 14px rgba(46,52,82,0.12);
        }

        .appt2-form-group { margin-bottom: 14px; }
        .appt2-label {
          display: block; font-size: 12px; font-weight: 800; text-transform: uppercase;
          letter-spacing: 0.5px; color: var(--text); margin-bottom: 6px;
        }
        .appt2-select, .appt2-input, .appt2-textarea {
          width: 100%; min-width: 0;
          background: rgba(255,255,255,0.92);
          border: 1.5px solid var(--line);
          border-radius: 16px; padding: 12px;
          font-size: 16px; /* 16px stops iOS zoom-on-focus */
          font-family: inherit; color: var(--ink); outline: none;
          box-shadow: inset 0 0 10px rgba(46,52,82,0.05);
          transition: border-color .2s, box-shadow .2s;
        }
        .appt2-select:focus, .appt2-input:focus, .appt2-textarea:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(127,147,196,0.25);
        }
        .appt2-textarea { resize: vertical; min-height: 90px; line-height: 1.45; }

        /* Session type (Online / Offline) */
        .appt2-mode-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .appt2-mode-btn {
          border: none; min-height: 76px; padding: 10px 6px;
          border-radius: 20px; font-size: 13.5px; font-weight: 800; font-family: inherit;
          background: rgba(255,255,255,0.85); color: var(--ink);
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
          cursor: pointer; box-shadow: 0 8px 18px rgba(46,52,82,0.12);
          transition: all .25s ease; -webkit-tap-highlight-color: transparent;
        }
        .appt2-mode-btn.active { background: var(--grad); color: #fff; transform: translateY(-2px); }

        .appt2-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

        .appt2-submit-btn {
          width: 100%; padding: 15px; border: none; border-radius: 20px;
          background: var(--grad); color: #fff; font-size: 16px; font-weight: 800; font-family: inherit;
          cursor: pointer; box-shadow: 0 12px 24px rgba(95,109,166,0.35);
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-top: 6px; -webkit-tap-highlight-color: transparent;
        }
        .appt2-submit-btn:disabled { opacity: .65; cursor: not-allowed; }

        .appt2-safe-banner {
          display: flex; align-items: center; gap: 8px; justify-content: center;
          background: rgba(127,147,196,0.14); border-radius: 14px;
          padding: 10px 12px; margin-top: 14px;
          color: var(--accent-dark); font-size: 12px; font-weight: 700; line-height: 1.4; text-align: center;
        }

        /* Filters */
        .appt2-filter-row {
          display: flex; gap: 6px; flex-wrap: wrap;
          margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1.5px solid var(--line);
        }
        .appt2-filter-btn {
          border: 1.5px solid var(--line); border-radius: 14px; padding: 6px 11px;
          font-size: 12px; font-weight: 800; font-family: inherit; cursor: pointer;
          background: rgba(255,255,255,0.8); color: var(--text);
          display: inline-flex; align-items: center; gap: 5px;
          -webkit-tap-highlight-color: transparent;
        }
        .appt2-filter-btn.active { background: var(--grad); color: #fff; border-color: transparent; box-shadow: 0 6px 14px rgba(95,109,166,0.3); }
        .appt2-filter-count { background: rgba(0,0,0,0.08); border-radius: 8px; padding: 1px 6px; font-size: 10.5px; }
        .appt2-filter-btn.active .appt2-filter-count { background: rgba(255,255,255,0.28); }

        /* List */
        .appt2-list { display: flex; flex-direction: column; gap: 12px; max-height: 600px; overflow-y: auto; padding-right: 2px; }
        .appt2-list::-webkit-scrollbar { width: 5px; }
        .appt2-list::-webkit-scrollbar-thumb { background: var(--line); border-radius: 10px; }

        .appt2-item-card {
          background: rgba(255,255,255,0.9); border-radius: 20px;
          border: 1.5px solid rgba(217,214,236,0.8);
          box-shadow: 0 6px 18px rgba(46,52,82,0.07);
          padding: 14px;
        }
        .appt2-item-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
        .appt2-counselor-group { display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1; }
        .appt2-avatar {
          width: 42px; height: 42px; border-radius: 14px; flex-shrink: 0;
          color: var(--accent-dark); font-weight: 800; font-size: 17px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 10px rgba(46,52,82,0.12);
        }
        .appt2-item-title { font-size: 15px; font-weight: 800; color: var(--ink); margin: 0 0 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .appt2-item-reason { font-size: 12px; color: var(--text); margin: 0; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .appt2-status-pill { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 10px; font-size: 11px; font-weight: 800; white-space: nowrap; }
        .appt2-status-dot { width: 6px; height: 6px; border-radius: 50%; }

        .appt2-item-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(96px, 1fr)); gap: 6px; margin-bottom: 12px; }
        .appt2-item-cell { background: var(--soft); border-radius: 12px; padding: 7px 9px; display: flex; flex-direction: column; gap: 3px; min-width: 0; }
        .appt2-cell-label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #8C93B8; }
        .appt2-cell-val { font-size: 12px; font-weight: 800; color: var(--ink); display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }

        .appt2-item-actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; }
        .appt2-action-view, .appt2-action-cancel {
          font-size: 12px; font-weight: 800; font-family: inherit;
          padding: 8px 14px; border-radius: 12px; cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }
        .appt2-action-view { border: 1.5px solid var(--line); background: var(--soft); color: var(--accent-dark); }
        .appt2-action-cancel { border: 1px solid rgba(239,68,68,0.28); background: rgba(239,68,68,0.08); color: #DC2626; }

        .appt2-empty { text-align: center; padding: 32px 16px; color: var(--text); }
        .appt2-empty-icon { display: flex; justify-content: center; margin-bottom: 8px; }
        .appt2-empty p { font-size: 14px; font-weight: 700; margin: 0; display: flex; align-items: center; justify-content: center; gap: 8px; }

        /* Bottom help cards */
        .appt2-bottom-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
        .appt2-help-card { border-radius: 24px; padding: 18px; text-align: center; cursor: pointer; -webkit-tap-highlight-color: transparent; }
        .appt2-help-icon {
          width: 56px; height: 56px; border-radius: 18px; margin: 0 auto 10px;
          background: linear-gradient(135deg, var(--soft), #fff);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 16px rgba(46,52,82,0.12);
        }
        .appt2-help-card h3 { font-size: 17px; font-weight: 800; color: var(--ink); margin: 0 0 4px; }
        .appt2-help-card p { font-size: 13px; color: var(--text); margin: 0 0 10px; line-height: 1.5; }
        .appt2-help-link { color: var(--accent-dark); font-size: 12.5px; font-weight: 800; }
      `}</style>

      {/* Background photo */}
      <div className="appt2-bg-blur" style={{ backgroundImage: `url(${bgImage})` }}></div>
      <div className="appt2-bg-phone">
        <div
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.06), rgba(255,255,255,0.16)), url(${bgImage})`,
          }}
        ></div>
      </div>

      <div className="appt2-container">
        {/* Header */}
        <div className="appt2-header">
          <button className="appt2-back-btn" onClick={() => navigate("/counselor")}>
            ← Back to Counselors
          </button>
          <h1 className="appt2-title">Counseling Sessions</h1>
          <p className="appt2-subtitle">
            Manage your confidential mental wellness sessions, booking requests, and counselor appointments.
          </p>
          <div className="appt2-header-pill">
            <span className="appt2-header-dot"></span>
            <span>Direct Booking Active</span>
          </div>
        </div>

        {/* Stats */}
        <div className="appt2-stats-grid">
          <div className="appt2-stat-card appt2-glass">
            <div className="appt2-stat-icon"><Icon3D name="calendar" size={30} /></div>
            <h3>{totalAppointments}</h3>
            <p>Total</p>
          </div>
          <div className="appt2-stat-card appt2-glass">
            <div className="appt2-stat-icon"><Icon3D name="hourglass" size={30} /></div>
            <h3>{pendingCount}</h3>
            <p>Pending</p>
          </div>
          <div className="appt2-stat-card appt2-glass">
            <div className="appt2-stat-icon"><Icon3D name="check" size={30} /></div>
            <h3>{confirmedCount}</h3>
            <p>Confirmed</p>
          </div>
        </div>

        {/* Booking */}
        <div className="appt2-card appt2-glass">
          <div className="appt2-card-header">
            <div>
              <h2>Book New Session</h2>
              <p>Select your counselor and preferred session slot</p>
            </div>
            <div className="appt2-card-badge-icon"><Icon3D name="brain" size={32} /></div>
          </div>

          <div className="appt2-form-group">
            <label className="appt2-label">Select Counselor</label>
            <select
              name="counselorId"
              value={form.counselorId}
              onChange={handleChange}
              className="appt2-select"
              disabled={loadingCounselors}
            >
              {loadingCounselors ? (
                <option>Loading counselors...</option>
              ) : counselors.length === 0 ? (
                <option>No counselors available</option>
              ) : (
                counselors.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="appt2-form-group">
            <label className="appt2-label">Session Type</label>
            <div className="appt2-mode-grid">
              {SESSION_TYPES.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setForm({ ...form, type: item.key })}
                  className={`appt2-mode-btn ${form.type === item.key ? "active" : ""}`}
                >
                  <Icon3D name={item.icon} size={32} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="appt2-form-group">
            <div className="appt2-two-col">
              <div>
                <label className="appt2-label">Date</label>
                <input type="date" name="date" value={form.date} onChange={handleChange} className="appt2-input" />
              </div>
              <div>
                <label className="appt2-label">Time</label>
                <input type="time" name="time" value={form.time} onChange={handleChange} className="appt2-input" />
              </div>
            </div>
          </div>

          <div className="appt2-form-group">
            <label className="appt2-label">Reason for Appointment</label>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              placeholder="Briefly describe what you'd like to discuss or work on..."
              className="appt2-textarea"
            ></textarea>
          </div>

          <button
            className="appt2-submit-btn"
            onClick={createAppointment}
            disabled={submitting || loadingCounselors || counselors.length === 0}
          >
            {submitting ? (
              <>
                <Icon3D name="hourglass" size={22} /> Booking Appointment...
              </>
            ) : (
              <>
                <Icon3D name="sparkle" size={22} /> Request Appointment
              </>
            )}
          </button>

          <div className="appt2-safe-banner">
            <Icon3D name="lock" size={20} />
            <span>100% Confidential &amp; Private. Handled under clinical ethical standards.</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="appt2-card appt2-glass">
          <div className="appt2-card-header">
            <div>
              <h2>Session Timeline</h2>
              <p>Track your pending requests and upcoming appointments</p>
            </div>
            <div className="appt2-card-badge-icon"><Icon3D name="clipboard" size={32} /></div>
          </div>

          <div className="appt2-filter-row">
            {["All", "Accepted", "Pending", "Cancelled"].map((filter) => {
              const count =
                filter === "All" ? appointments.length : appointments.filter((a) => a.status === filter).length;
              return (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`appt2-filter-btn ${selectedFilter === filter ? "active" : ""}`}
                >
                  <span>{filter}</span>
                  <span className="appt2-filter-count">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="appt2-list">
            {loadingAppointments ? (
              <div className="appt2-empty">
                <p>
                  <Icon3D name="hourglass" size={24} /> Loading your appointments...
                </p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="appt2-empty">
                <div className="appt2-empty-icon"><Icon3D name="calendar" size={52} /></div>
                <p>No {selectedFilter !== "All" ? selectedFilter.toLowerCase() : ""} appointments found.</p>
              </div>
            ) : (
              filteredAppointments.map((item) => {
                const badge = getStatusBadge(item.status);
                const counselorName = item.counselorId?.name || "Counselor";
                const initial = counselorName.charAt(0).toUpperCase();
                const tInfo = typeInfo(item.type);

                return (
                  <div key={item._id} className="appt2-item-card">
                    <div className="appt2-item-top">
                      <div className="appt2-counselor-group">
                        <div className="appt2-avatar" style={{ background: avatarColor(counselorName) }}>
                          {initial}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <h3 className="appt2-item-title">{counselorName}</h3>
                          <p className="appt2-item-reason">{item.reason}</p>
                        </div>
                      </div>

                      <span
                        className="appt2-status-pill"
                        style={{ background: badge.bg, color: badge.color, border: badge.border }}
                      >
                        <span className="appt2-status-dot" style={{ background: badge.dot }}></span>
                        {badge.label}
                      </span>
                    </div>

                    <div className="appt2-item-grid">
                      <div className="appt2-item-cell">
                        <span className="appt2-cell-label">Session Type</span>
                        <span className="appt2-cell-val">
                          <Icon3D name={tInfo.icon} size={16} /> {tInfo.label}
                        </span>
                      </div>

                      <div className="appt2-item-cell">
                        <span className="appt2-cell-label">Date</span>
                        <span className="appt2-cell-val">
                          <Icon3D name="calendar" size={16} />
                          {new Date(item.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="appt2-item-cell">
                        <span className="appt2-cell-label">Time</span>
                        <span className="appt2-cell-val">
                          <Icon3D name="clock" size={16} /> {item.time}
                        </span>
                      </div>
                    </div>

                    <div className="appt2-item-actions">
                      <button
                        className="appt2-action-view"
                        onClick={() =>
                          alert(
                            `Counselor: ${counselorName}\nDate: ${new Date(item.date).toLocaleDateString()}\nTime: ${item.time}\nType: ${tInfo.label}\nReason: ${item.reason}\nStatus: ${item.status}`
                          )
                        }
                      >
                        View Details
                      </button>

                      {["Pending", "Accepted"].includes(item.status) && (
                        <button className="appt2-action-cancel" onClick={() => cancelAppointment(item._id)}>
                          ✕ Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Bottom support cards */}
        <div className="appt2-bottom-grid">
          <div className="appt2-help-card appt2-glass" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="appt2-help-icon"><Icon3D name="chat" size={36} /></div>
            <h3>Session Reminder</h3>
            <p>Keep track of your counseling appointments and attend on time for best outcomes.</p>
            <span className="appt2-help-link">View appointments ↑</span>
          </div>

          <div className="appt2-help-card appt2-glass" onClick={() => navigate("/counselor")}>
            <div className="appt2-help-icon"><Icon3D name="leaf" size={36} /></div>
            <h3>Before the Session</h3>
            <p>Prepare your thoughts, feelings, and questions before meeting the counselor.</p>
            <span className="appt2-help-link">Go to counselors →</span>
          </div>

          <div className="appt2-help-card appt2-glass" onClick={() => navigate("/emergency")}>
            <div className="appt2-help-icon"><Icon3D name="lock" size={36} /></div>
            <h3>Confidential Support</h3>
            <p>Your mental wellness journey is private, safe, and respected at all times.</p>
            <span className="appt2-help-link">Get urgent support →</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Appointments;
