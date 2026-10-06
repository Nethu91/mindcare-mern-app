import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import bgImage from "../assets/mood-bg.jpeg";
import calmImg from "../assets/Calm support.jpeg";
import bookingImg from "../assets/Easy booking.jpeg";
import guidanceImg from "../assets/rusted guidance.jpeg";
import { Emoji3D } from "./MoodTracker";

/* ============================================================
   THEME – colours are picked automatically from the background
   photo so everything matches it (calm, no random purple)
   ============================================================ */

const buildTheme = (h = 168, s = 40) => ({
  hue: h,
  accent: `hsl(${h} ${s}% 52%)`,
  accentDark: `hsl(${h} ${s}% 36%)`,
  ink: `hsl(${h} 30% 15%)`,
  text: `hsl(${h} 15% 32%)`,
  soft: `hsl(${h} 45% 94%)`,
  line: `hsl(${h} 30% 82%)`,
});

const DEFAULT_THEME = buildTheme();

const rgbToHsl = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, s * 100, l * 100];
};

function useImageTheme(src) {
  const [theme, setTheme] = useState(DEFAULT_THEME);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      try {
        const N = 24;
        const canvas = document.createElement("canvas");
        canvas.width = N;
        canvas.height = N;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, N, N);
        const data = ctx.getImageData(0, 0, N, N).data;

        let r = 0;
        let g = 0;
        let b = 0;
        let wSum = 0;
        for (let i = 0; i < data.length; i += 4) {
          const [, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
          const w = (s / 100) * (1 - Math.abs(l - 50) / 50) + 0.01;
          r += data[i] * w;
          g += data[i + 1] * w;
          b += data[i + 2] * w;
          wSum += w;
        }
        const [h, s] = rgbToHsl(r / wSum, g / wSum, b / wSum);
        setTheme(buildTheme(Math.round(h), Math.min(55, Math.max(28, Math.round(s)))));
      } catch (e) {
        // keep the default theme
      }
    };
    img.src = src;
  }, [src]);

  return theme;
}

/* ============================================================
   3D ICONS (pure SVG – no image files needed)
   ============================================================ */

let cUid = 0;
const useCUid = () => {
  const ref = useRef(null);
  if (ref.current === null) ref.current = `c3d${++cUid}`;
  return ref.current;
};

function Icon3D({ name, size = 32, hue = 168, variant = 0 }) {
  const u = useCUid();
  const id = (k) => `${u}-${k}`;
  const f = (k) => `url(#${id(k)})`;
  const R = (k, a, b, c) => (
    <radialGradient id={id(k)} cx="35%" cy="28%" r="85%">
      <stop offset="0%" stopColor={a} />
      <stop offset="55%" stopColor={b} />
      <stop offset="100%" stopColor={c} />
    </radialGradient>
  );
  const gloss = (cx, cy, rx, ry, rot = -25, o = 0.7) => (
    <ellipse
      cx={cx}
      cy={cy}
      rx={rx}
      ry={ry}
      fill="#fff"
      opacity={o}
      transform={`rotate(${rot} ${cx} ${cy})`}
    />
  );
  const H = {
    l: `hsl(${hue} 65% 86%)`,
    m: `hsl(${hue} 50% 55%)`,
    d: `hsl(${hue} 55% 30%)`,
  };

  let content = null;

  switch (name) {
    case "chat":
      content = (
        <g>
          <defs>{R("b", H.l, H.m, H.d)}</defs>
          <path
            d="M20 14 H80 a12 12 0 0 1 12 12 V58 a12 12 0 0 1 -12 12 H54 L34 90 V70 H20 a12 12 0 0 1 -12 -12 V26 a12 12 0 0 1 12 -12 Z"
            fill={f("b")}
          />
          <circle cx="30" cy="42" r="6" fill="#fff" />
          <circle cx="50" cy="42" r="6" fill="#fff" />
          <circle cx="70" cy="42" r="6" fill="#fff" />
          {gloss(30, 24, 14, 4.5, -8, 0.5)}
        </g>
      );
      break;

    case "brain":
      content = (
        <g>
          <defs>{R("br", "#FFE1EA", "#FF93B0", "#D9456F")}</defs>
          <circle cx="34" cy="46" r="22" fill={f("br")} />
          <circle cx="66" cy="46" r="22" fill={f("br")} />
          <circle cx="42" cy="30" r="18" fill={f("br")} />
          <circle cx="58" cy="30" r="18" fill={f("br")} />
          <circle cx="40" cy="64" r="18" fill={f("br")} />
          <circle cx="60" cy="64" r="18" fill={f("br")} />
          <path d="M50 14 V82" stroke="#C93A63" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M24 40 C32 36 36 44 44 40 M56 52 C64 48 70 56 78 50 M28 62 C36 58 40 66 46 62 M54 30 C62 26 66 34 74 30" stroke="#C93A63" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8" />
          {gloss(32, 28, 9, 4, -35, 0.7)}
        </g>
      );
      break;

    case "search":
      content = (
        <g>
          <defs>
            {R("g", "#FFFFFF", "#DDF1FB", "#8CC9E6")}
            {R("r", H.l, H.m, H.d)}
          </defs>
          <line x1="64" y1="64" x2="88" y2="88" stroke={H.d} strokeWidth="13" strokeLinecap="round" />
          <circle cx="42" cy="42" r="30" fill={f("g")} stroke={f("r")} strokeWidth="9" />
          {gloss(32, 30, 10, 4.5, -35, 0.9)}
        </g>
      );
      break;

    case "counselor": {
      const longHair = variant % 2 === 0;
      content = (
        <g>
          <defs>
            {R("skin", "#FFE3CC", "#F2B58C", "#CF8559")}
            {R("coat", H.l, H.m, H.d)}
          </defs>
          {longHair && <ellipse cx="50" cy="44" rx="25" ry="28" fill="#3b2314" />}
          <path d="M12 96 C12 72 28 64 50 64 C72 64 88 72 88 96 Z" fill={f("coat")} />
          <rect x="43" y="52" width="14" height="16" rx="6" fill="#E5A57C" />
          <path d="M40 64 L50 80 L60 64 Z" fill="#fff" />
          <circle cx="50" cy="38" r="21" fill={f("skin")} />
          <path
            d={
              longHair
                ? "M28 38 C26 10 74 10 72 38 C64 26 36 26 28 38 Z"
                : "M28 36 C26 8 74 8 72 36 C70 26 58 20 50 20 C42 20 30 26 28 36 Z"
            }
            fill="#3b2314"
          />
          <circle cx="42" cy="40" r="2.6" fill="#2b1608" />
          <circle cx="58" cy="40" r="2.6" fill="#2b1608" />
          <path d="M44 49 q6 5 12 0" fill="none" stroke="#B5523E" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="35" cy="46" r="4" fill="#FF8FA3" opacity="0.4" />
          <circle cx="65" cy="46" r="4" fill="#FF8FA3" opacity="0.4" />
          <path d="M36 68 C30 84 46 90 52 80" fill="none" stroke="#4a4a5a" strokeWidth="3" strokeLinecap="round" />
          <circle cx="52" cy="80" r="4.5" fill="#D9DEE6" stroke="#4a4a5a" strokeWidth="1.5" />
          {gloss(42, 26, 6, 2.5, -25, 0.5)}
        </g>
      );
      break;
    }

    case "pin":
      content = (
        <g>
          <defs>{R("p", "#FFC9C9", "#F2646A", "#B8232F")}</defs>
          <path d="M50 94 C26 68 20 56 20 40 A30 30 0 0 1 80 40 C80 56 74 68 50 94 Z" fill={f("p")} />
          <circle cx="50" cy="40" r="12" fill="#fff" />
          {gloss(38, 22, 9, 4, -35, 0.6)}
        </g>
      );
      break;

    case "hourglass":
      content = (
        <g>
          <defs>
            {R("w", "#F4D9A8", "#C9893F", "#8A5420")}
            {R("s", "#FFF1B0", "#FFC93C", "#E08A00")}
          </defs>
          <path d="M30 18 H70 C70 40 56 46 50 50 C56 54 70 60 70 82 H30 C30 60 44 54 50 50 C44 46 30 40 30 18 Z" fill="#E6F4FB" stroke="#9CC9DE" strokeWidth="2.5" />
          <path d="M37 80 H63 C61 70 55 62 50 58 C45 62 39 70 37 80 Z" fill={f("s")} />
          <path d="M38 22 H62 C60 31 55 37 50 41 C45 37 40 31 38 22 Z" fill={f("s")} />
          <rect x="22" y="8" width="56" height="11" rx="5" fill={f("w")} />
          <rect x="22" y="81" width="56" height="11" rx="5" fill={f("w")} />
          {gloss(38, 30, 3, 9, 8, 0.7)}
        </g>
      );
      break;

    case "dot":
      content = (
        <g>
          <defs>{R("g", "#C8F8D4", "#3FCB6E", "#17913F")}</defs>
          <circle cx="50" cy="50" r="38" fill={f("g")} />
          {gloss(38, 34, 13, 7, -30, 0.8)}
        </g>
      );
      break;

    case "laptop":
      content = (
        <g>
          <defs>
            {R("sc", H.l, H.m, H.d)}
            {R("bs", "#FFFFFF", "#DCE1E8", "#A5ACB8")}
          </defs>
          <rect x="16" y="18" width="68" height="48" rx="8" fill="#3a3f4b" />
          <rect x="21" y="23" width="58" height="38" rx="4" fill={f("sc")} />
          <path d="M6 70 H94 L88 82 H12 Z" fill={f("bs")} />
          <rect x="40" y="73" width="20" height="4" rx="2" fill="#A5ACB8" />
          {gloss(36, 32, 12, 4, -20, 0.55)}
        </g>
      );
      break;

    case "hospital":
      content = (
        <g>
          <defs>{R("h", "#FFFFFF", "#EEF4F9", "#BCCCDA")}</defs>
          <rect x="12" y="12" width="76" height="76" rx="18" fill={f("h")} />
          <path d="M42 26 H58 V42 H74 V58 H58 V74 H42 V58 H26 V42 H42 Z" fill="#E5484D" />
          {gloss(30, 24, 12, 4, -20, 0.8)}
        </g>
      );
      break;

    case "phone":
      content = (
        <g>
          <defs>
            {R("b", "#5b6270", "#3a3f4b", "#20242c")}
            {R("sc", H.l, H.m, H.d)}
            {R("g", "#C8F8D4", "#3FCB6E", "#17913F")}
          </defs>
          <rect x="26" y="8" width="48" height="84" rx="12" fill={f("b")} />
          <rect x="31" y="18" width="38" height="62" rx="5" fill={f("sc")} />
          <circle cx="50" cy="52" r="12" fill={f("g")} />
          <path d="M45 56 C45 48 52 46 54 48 L55 51 L52 53 C53 55 54 56 56 57 L58 54 L61 55 C62 58 56 62 45 56 Z" fill="#fff" transform="translate(-1 -1)" />
          <circle cx="50" cy="86" r="2.5" fill="#8b93a3" />
          {gloss(38, 28, 6, 3, -25, 0.5)}
        </g>
      );
      break;

    case "lock":
      content = (
        <g>
          <defs>{R("g", "#FFF3B0", "#FFC93C", "#E08A00")}</defs>
          <path d="M33 44 V32 A17 17 0 0 1 67 32 V44" fill="none" stroke="#B9C0CC" strokeWidth="9" strokeLinecap="round" />
          <rect x="20" y="42" width="60" height="48" rx="12" fill={f("g")} />
          <circle cx="50" cy="63" r="7" fill="#7a4a10" />
          <rect x="47" y="66" width="6" height="12" rx="3" fill="#7a4a10" />
          {gloss(34, 50, 10, 4, -20, 0.7)}
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
        filter: "drop-shadow(0 4px 4px rgba(49,34,68,0.25))",
      }}
    >
      {content}
    </svg>
  );
}

/* ============================================================
   COUNSELOR PAGE
   ============================================================ */

const MODES = [
  { value: "Online", label: "Online", icon: "laptop" },
  { value: "Physical", label: "Physical", icon: "hospital" },
  { value: "Phone Call", label: "Phone", icon: "phone" },
];

function Counselor() {
  const navigate = useNavigate();
  const theme = useImageTheme(bgImage);
  const S = useMemo(() => makeStyles(theme), [theme]);

  const [counselors, setCounselors] = useState([]);
  const [selectedCounselor, setSelectedCounselor] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedMode, setSelectedMode] = useState("Online");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");

  // Soft fallback colours for counselors that don't carry a colour in the DB
  const avatarPalette = ["#FFC8DD", "#A8DADC", "#CDB4DB", "#FFD166", "#B8C0FF", "#FFAFCC"];
  const hashOf = (id) => {
    const str = String(id);
    let sum = 0;
    for (let i = 0; i < str.length; i++) sum += str.charCodeAt(i);
    return sum;
  };
  const getAvatarColor = (id) => avatarPalette[hashOf(id) % avatarPalette.length];
  const getAvatarVariant = (id) => hashOf(id) % 2;

  useEffect(() => {
    loadCounselors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCounselors = async () => {
    try {
      setLoading(true);

      const response = await API.get("/counselors");

      setCounselors(response.data);

      if (response.data.length > 0) {
        setSelectedCounselor(response.data[0]);
      }

      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load counselors.");
    } finally {
      setLoading(false);
    }
  };

  const filteredCounselors = counselors.filter((counselor) => {
    const search = searchTerm.toLowerCase();

    return (
      counselor.name?.toLowerCase().includes(search) ||
      counselor.role?.toLowerCase().includes(search) ||
      counselor.specialization?.toLowerCase().includes(search) ||
      counselor.location?.toLowerCase().includes(search)
    );
  });

  const handleBooking = async () => {
    if (!selectedCounselor) {
      alert("Please select a counselor.");
      return;
    }

    if (!appointmentDate || !appointmentTime) {
      alert("Please select appointment date and time");
      return;
    }

    try {
      setBookingLoading(true);
      setBookingSuccess("");

      const response = await API.post("/appointments", {
        counselorId: selectedCounselor._id,
        date: appointmentDate,
        time: appointmentTime,
        reason: selectedMode,
      });

      setBookingSuccess(
        response.data.message || "Appointment booked successfully!"
      );

      setAppointmentDate("");
      setAppointmentTime("");
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          "Failed to book appointment. Please try again."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const supportCards = [
    {
      img: calmImg,
      alt: "Calm support",
      badge: "Wellness",
      title: "Calm Support",
      text: "Get emotional support for stress, anxiety, sadness, study pressure, and personal problems in a safe space.",
      link: "Go to Mood Tracker →",
      to: "/mood",
    },
    {
      img: bookingImg,
      alt: "Easy booking",
      badge: "Booking",
      title: "Easy Booking",
      text: "Select online, physical, or phone counseling and choose a date and time that is comfortable for you.",
      link: "Go to Appointments →",
      to: "/appointments",
    },
    {
      img: guidanceImg,
      alt: "Trusted guidance",
      badge: "Guidance",
      title: "Trusted Guidance",
      text: "Connect with experienced counselors for mental wellness advice, self-confidence support, and personal growth.",
      link: "Go to Assessment →",
      to: "/assessment",
    },
  ];

  return (
    <div style={S.page}>
      <div style={{ ...S.bgBlur, backgroundImage: `url(${bgImage})` }}></div>

      <div style={S.bgPhone}>
        <div
          style={{
            ...S.bgPhoneImage,
            backgroundImage: `linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.22)), url(${bgImage})`,
          }}
        ></div>
      </div>

      <div style={S.container}>
        {/* Header */}
        <div style={S.header}>
          <div>
            <h1 style={S.title}>Counselor Support</h1>
            <p style={S.subtitle}>
              Connect with Sri Lankan counselors and get emotional support.
            </p>
          </div>

          <div style={S.headerBadge}>
            <Icon3D name="chat" size={24} hue={theme.hue} />
            Private &amp; Safe
          </div>
        </div>

        {/* Hero */}
        <div style={S.heroCard}>
          <div style={{ minWidth: 0 }}>
            <h2 style={S.heroTitle}>Need someone to talk to?</h2>
            <p style={S.heroText}>
              Choose a counselor, select your session type, and request an
              appointment at a comfortable time.
            </p>
          </div>

          <div style={S.heroIcon}>
            <Icon3D name="brain" size={50} />
          </div>
        </div>

        {/* Counselor list */}
        <div style={S.panel}>
          <div style={S.searchBox}>
            <Icon3D name="search" size={24} hue={theme.hue} />
            <input
              style={S.searchInput}
              type="text"
              placeholder="Search counselor, specialty or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <h2 style={S.sectionTitle}>Available Counselors</h2>

          <div style={S.counselorList}>
            {loading ? (
              <div style={S.emptyBox}>
                <p style={S.emptyText}>Loading counselors...</p>
              </div>
            ) : error ? (
              <div style={S.errorBox}>{error}</div>
            ) : filteredCounselors.length === 0 ? (
              <div style={S.emptyBox}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                  <Emoji3D name="Sad" level={2} size={52} />
                </div>
                <p style={S.emptyText}>No counselors found</p>
              </div>
            ) : (
              filteredCounselors.map((counselor) => {
                const active = selectedCounselor?._id === counselor._id;
                return (
                  <div
                    key={counselor._id}
                    onClick={() => setSelectedCounselor(active ? null : counselor)}
                    style={{
                      ...S.counselorCard,
                      flexDirection: "column",
                      alignItems: "stretch",
                      border: active
                        ? `3px solid ${theme.accent}`
                        : "1px solid rgba(255,255,255,0.75)",
                      background: active
                        ? `linear-gradient(145deg, #FFFFFF, ${theme.soft})`
                        : "rgba(255,255,255,0.64)",
                      transform: active ? "translateY(-2px)" : "translateY(0)",
                      boxShadow: active
                        ? `0 14px 32px ${theme.line || "rgba(0,0,0,0.12)"}`
                        : "0 6px 16px rgba(30,30,40,0.06)",
                    }}
                  >
                    {/* Top Row: Avatar + Info + Toggle Badge */}
                    <div style={{ display: "flex", alignItems: "center", gap: 14, width: "100%" }}>
                      <div
                        style={{
                          ...S.avatarBox,
                          backgroundColor: getAvatarColor(counselor._id),
                        }}
                      >
                        <Icon3D
                          name="counselor"
                          size={52}
                          hue={theme.hue}
                          variant={getAvatarVariant(counselor._id)}
                        />
                      </div>

                      <div style={S.counselorInfo}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                          <h3 style={S.counselorName}>{counselor.name}</h3>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: active ? theme.accentDark : theme.text,
                              background: active ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.55)",
                              padding: "4px 10px",
                              borderRadius: 12,
                              border: `1px solid ${active ? theme.accent : "rgba(0,0,0,0.06)"}`,
                              flexShrink: 0,
                            }}
                          >
                            {active ? "▲ Hide Details" : "▼ View Details"}
                          </span>
                        </div>

                        <p style={S.counselorRole}>{counselor.role}</p>
                        <p style={S.specialty}>{counselor.specialization}</p>

                        <div style={S.miniInfoRow}>
                          <span style={S.miniBadge}>
                            <Icon3D name="pin" size={14} />
                            {counselor.location}
                          </span>
                          {counselor.experience && (
                            <span style={S.miniBadge}>
                              <Icon3D name="hourglass" size={14} />
                              {counselor.experience}
                            </span>
                          )}
                          <span style={{ ...S.miniBadge, color: "#10b981" }}>
                            <Icon3D name="dot" size={12} />
                            {counselor.availability || "Available"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* In-Place Details & Booking Section */}
                    {active && (
                      <div
                        style={{
                          marginTop: 16,
                          paddingTop: 16,
                          borderTop: `1.5px solid ${theme.line || "rgba(0,0,0,0.08)"}`,
                          width: "100%",
                          cursor: "default",
                          textAlign: "left",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Details Grid */}
                        <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
                          <div style={S.detailBox}>
                            <h3 style={S.detailTitle}>Specialized In</h3>
                            <p style={S.detailText}>{counselor.specialization}</p>
                          </div>

                          <div style={S.detailBox}>
                            <h3 style={S.detailTitle}>About Counselor</h3>
                            <p style={S.detailText}>
                              {counselor.about || "No description provided."}
                            </p>
                          </div>

                          <div style={S.detailBox}>
                            <h3 style={S.detailTitle}>Session Location</h3>
                            <p style={S.detailText}>{counselor.location}</p>
                          </div>
                        </div>

                        {/* In-Place Booking Form */}
                        <div
                          style={{
                            background: "rgba(255,255,255,0.78)",
                            borderRadius: 20,
                            padding: "18px 16px",
                            border: "1px solid rgba(255,255,255,0.9)",
                            boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
                          }}
                        >
                          <h3 style={{ ...S.sectionTitle, fontSize: 17, marginBottom: 12 }}>
                            Book Session with {counselor.name}
                          </h3>

                          {bookingSuccess && <p style={S.success}>{bookingSuccess}</p>}

                          <div style={S.modeGrid}>
                            {MODES.map((mode) => {
                              const activeMode = selectedMode === mode.value;
                              return (
                                <button
                                  key={mode.value}
                                  type="button"
                                  onClick={() => setSelectedMode(mode.value)}
                                  style={{
                                    ...S.modeButton,
                                    background: activeMode
                                      ? `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`
                                      : "rgba(255,255,255,0.75)",
                                    color: activeMode ? "#FFFFFF" : theme.ink,
                                    transform: activeMode ? "translateY(-2px)" : "none",
                                  }}
                                >
                                  <Icon3D name={mode.icon} size={28} hue={theme.hue} />
                                  {mode.label}
                                </button>
                              );
                            })}
                          </div>

                          <label style={S.label}>Appointment Date</label>
                          <input
                            style={S.input}
                            type="date"
                            value={appointmentDate}
                            onChange={(e) => setAppointmentDate(e.target.value)}
                          />

                          <label style={S.label}>Appointment Time</label>
                          <input
                            style={S.input}
                            type="time"
                            value={appointmentTime}
                            onChange={(e) => setAppointmentTime(e.target.value)}
                          />

                          <button
                            style={{
                              ...S.bookButton,
                              opacity: bookingLoading ? 0.7 : 1,
                              marginTop: 12,
                            }}
                            type="button"
                            onClick={handleBooking}
                            disabled={bookingLoading}
                          >
                            {bookingLoading ? "Booking..." : "Request Appointment"}
                          </button>

                          <p style={{ ...S.safeNote, marginTop: 10 }}>
                            <Icon3D name="lock" size={16} />
                            Your session details are private and confidential.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Bottom cards */}
        <div style={S.bottomGrid}>
          {supportCards.map((card) => (
            <div key={card.title} style={S.supportCard} onClick={() => navigate(card.to)}>
              <div style={S.supportTopRow}>
                <div style={S.supportIcon}>
                  <img src={card.img} alt={card.alt} style={S.supportImg} />
                </div>
                <span style={S.supportBadge}>{card.badge}</span>
              </div>

              <h3 style={S.supportTitle}>{card.title}</h3>
              <p style={S.supportText}>{card.text}</p>
              <div style={S.supportLine}></div>
              <p style={S.supportMiniText}>{card.link}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   STYLES
   ============================================================ */

const glass = {
  background: "rgba(255,255,255,0.58)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.75)",
  boxShadow: "0 18px 40px rgba(30,30,40,0.14)",
};

const makeStyles = (t) => ({
  page: {
    position: "relative",
    minHeight: "100vh",
    padding: "20px 14px 60px",
    fontFamily: "'Poppins', Arial, sans-serif",
    boxSizing: "border-box",
    overflowX: "hidden",
    background: t.soft,
  },

  bgBlur: {
    position: "fixed",
    inset: 0,
    zIndex: 0,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    filter: "blur(28px)",
    transform: "scale(1.15)",
  },

  bgPhone: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: "100vh",
    zIndex: 1,
    display: "flex",
    justifyContent: "center",
    pointerEvents: "none",
  },

  bgPhoneImage: {
    width: "100%",
    maxWidth: "480px",
    height: "100%",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    boxShadow: "0 0 40px rgba(0,0,0,0.15)",
  },

  container: {
    maxWidth: "480px",
    margin: "0 auto",
    position: "relative",
    zIndex: 2,
    display: "grid",
    gap: "18px",
  },

  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "12px",
  },

  title: {
    fontSize: "30px",
    color: t.ink,
    margin: "0 0 6px 0",
    fontWeight: "800",
  },

  subtitle: {
    color: t.text,
    fontSize: "14px",
    margin: 0,
    lineHeight: "1.5",
  },

  headerBadge: {
    ...glass,
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    borderRadius: "20px",
    color: t.ink,
    fontWeight: "800",
    fontSize: "14px",
  },

  heroCard: {
    ...glass,
    borderRadius: "28px",
    padding: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "14px",
  },

  heroTitle: {
    color: t.ink,
    fontSize: "21px",
    margin: "0 0 8px 0",
    fontWeight: "800",
  },

  heroText: {
    color: t.text,
    lineHeight: "1.6",
    margin: 0,
    fontSize: "13.5px",
  },

  heroIcon: {
    width: "72px",
    height: "72px",
    borderRadius: "24px",
    background: `linear-gradient(135deg, ${t.soft}, #FFFFFF)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 14px 28px rgba(30,30,40,0.14)",
    flexShrink: 0,
  },

  panel: {
    ...glass,
    borderRadius: "28px",
    padding: "20px",
  },

  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "rgba(255,255,255,0.8)",
    padding: "13px 16px",
    borderRadius: "22px",
    boxShadow: "inset 0 0 16px rgba(30,30,40,0.07)",
    marginBottom: "20px",
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    background: "transparent",
    color: t.ink,
    fontSize: "14px",
    fontFamily: "inherit",
  },

  sectionTitle: {
    color: t.ink,
    fontSize: "21px",
    margin: "0 0 16px 0",
    fontWeight: "800",
  },

  counselorList: {
    display: "grid",
    gap: "14px",
  },

  counselorCard: {
    width: "100%",
    borderRadius: "24px",
    padding: "14px",
    display: "flex",
    gap: "12px",
    alignItems: "center",
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 12px 24px rgba(30,30,40,0.11)",
    transition: "0.3s ease",
    fontFamily: "inherit",
  },

  avatarBox: {
    width: "66px",
    height: "66px",
    borderRadius: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 12px 22px rgba(30,30,40,0.14)",
    flexShrink: 0,
    overflow: "hidden",
  },

  counselorInfo: {
    flex: 1,
    minWidth: 0,
  },

  counselorName: {
    color: t.ink,
    fontSize: "16px",
    margin: "0 0 3px 0",
    fontWeight: "800",
  },

  counselorRole: {
    color: t.accentDark,
    margin: "0 0 4px 0",
    fontWeight: "700",
    fontSize: "13px",
  },

  specialty: {
    color: t.text,
    margin: "0 0 8px 0",
    fontSize: "13px",
    lineHeight: "1.4",
  },

  miniInfoRow: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
  },

  miniBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    background: "rgba(255,255,255,0.8)",
    color: t.text,
    padding: "5px 9px",
    borderRadius: "12px",
    fontSize: "11.5px",
    fontWeight: "700",
  },

  emptyBox: {
    padding: "28px",
    textAlign: "center",
    background: "rgba(255,255,255,0.5)",
    borderRadius: "22px",
  },

  emptyText: {
    color: t.text,
    margin: 0,
  },

  errorBox: {
    textAlign: "center",
    color: "#b91c1c",
    background: "rgba(254,226,226,0.92)",
    padding: "12px",
    borderRadius: "16px",
    fontSize: "14px",
  },

  profileAvatar: {
    width: "104px",
    height: "104px",
    borderRadius: "34px",
    margin: "0 auto 16px auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 16px 30px rgba(30,30,40,0.18)",
    overflow: "hidden",
  },

  profileName: {
    color: t.ink,
    fontSize: "23px",
    margin: "0 0 6px 0",
    fontWeight: "800",
  },

  profileRole: {
    color: t.text,
    margin: "0 0 14px 0",
    fontWeight: "700",
    fontSize: "14px",
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 14px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.8)",
    color: t.ink,
    fontWeight: "800",
    fontSize: "13px",
    marginBottom: "16px",
  },

  detailBox: {
    background: "rgba(255,255,255,0.68)",
    borderRadius: "20px",
    padding: "14px",
    textAlign: "left",
    marginBottom: "10px",
  },

  detailTitle: {
    color: t.ink,
    margin: "0 0 6px 0",
    fontSize: "14px",
    fontWeight: "800",
  },

  detailText: {
    color: t.text,
    margin: 0,
    lineHeight: "1.5",
    fontSize: "14px",
  },

  success: {
    color: "#166534",
    background: "rgba(220,252,231,0.95)",
    padding: "10px 12px",
    borderRadius: "14px",
    fontWeight: "700",
    fontSize: "14px",
    textAlign: "center",
    margin: "0 0 14px 0",
  },

  modeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
    marginBottom: "16px",
  },

  modeButton: {
    border: "none",
    padding: "12px 6px",
    borderRadius: "20px",
    fontWeight: "800",
    fontSize: "12.5px",
    fontFamily: "inherit",
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(30,30,40,0.11)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    transition: "0.3s ease",
  },

  label: {
    display: "block",
    color: t.ink,
    fontWeight: "800",
    fontSize: "14px",
    margin: "14px 0 8px 0",
  },

  input: {
    width: "100%",
    padding: "14px",
    border: "none",
    outline: "none",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.85)",
    color: t.ink,
    fontSize: "15px",
    fontFamily: "inherit",
    boxShadow: "inset 0 0 14px rgba(30,30,40,0.07)",
    boxSizing: "border-box",
  },

  bookButton: {
    width: "100%",
    marginTop: "20px",
    padding: "15px",
    border: "none",
    borderRadius: "22px",
    background: `linear-gradient(135deg, ${t.accent}, ${t.accentDark})`,
    color: "white",
    fontSize: "16px",
    fontWeight: "800",
    fontFamily: "inherit",
    cursor: "pointer",
    boxShadow: "0 14px 28px rgba(30,30,40,0.22)",
  },

  safeNote: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    color: t.text,
    fontSize: "12.5px",
    textAlign: "center",
    margin: "16px 0 0 0",
    lineHeight: "1.5",
  },

  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "14px",
  },

  supportCard: {
    ...glass,
    borderRadius: "26px",
    padding: "20px",
    textAlign: "left",
    cursor: "pointer",
    overflow: "hidden",
  },

  supportTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px",
  },

  supportIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "20px",
    background: `linear-gradient(135deg, ${t.soft}, #FFFFFF)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    padding: "6px",
    boxSizing: "border-box",
    boxShadow: "0 12px 22px rgba(30,30,40,0.12)",
  },

  supportImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    mixBlendMode: "multiply",
  },

  supportBadge: {
    padding: "6px 12px",
    borderRadius: "16px",
    background: `linear-gradient(135deg, ${t.accent}, ${t.accentDark})`,
    color: "white",
    fontSize: "12px",
    fontWeight: "800",
  },

  supportTitle: {
    color: t.ink,
    fontSize: "19px",
    margin: "0 0 8px 0",
    fontWeight: "800",
  },

  supportText: {
    color: t.text,
    lineHeight: "1.6",
    margin: 0,
    fontSize: "13.5px",
  },

  supportLine: {
    width: "100%",
    height: "1px",
    background: t.line,
    margin: "16px 0 12px 0",
  },

  supportMiniText: {
    color: t.accentDark,
    fontSize: "13px",
    fontWeight: "800",
    margin: 0,
  },
});

export default Counselor;