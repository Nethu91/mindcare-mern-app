import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import bgImage from "../assets/mood-bg.jpeg";
import calmImg from "../assets/Calm support.jpeg";
import bookingImg from "../assets/Easy booking.jpeg";
import guidanceImg from "../assets/rusted guidance.jpeg";
import { Emoji3D } from "./MoodTracker";

/* ============================================================
   THEME – fixed palette sampled from mood-bg.jpeg
   (dusty teal → slate blue → soft purple → rose / peach)
   ============================================================ */

const THEME = {
  hue: 240, // used by the 3D icons (periwinkle / slate-blue)
  accent: "#7F93C4", // periwinkle
  accentDark: "#5F6DA6", // slate purple
  accent2: "#E3A4B4", // rose (bottom of the photo)
  teal: "#8FB8BE", // teal (top of the photo)
  ink: "#2E3452",
  text: "#5A6283",
  soft: "#F3F0F9",
  line: "#D9D6EC",
  gradient: "linear-gradient(135deg, #8FB8BE 0%, #7F93C4 50%, #A28BC0 100%)",
  gradientWarm: "linear-gradient(135deg, #E3A4B4 0%, #B793C4 100%)",
};

/* ============================================================
   CUTE 3D ICONS (pure SVG – glossy, soft, with tiny faces)
   ============================================================ */

let cUid = 0;
const useCUid = () => {
  const ref = useRef(null);
  if (ref.current === null) ref.current = `c3d${++cUid}`;
  return ref.current;
};

function Icon3D({ name, size = 32, hue = 240, variant = 0 }) {
  const u = useCUid();
  const id = (k) => `${u}-${k}`;
  const f = (k) => `url(#${id(k)})`;

  // soft 3D ball-style gradient
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

  // tiny cute face: eyes + smile + blush
  const face = (cx, cy, s = 1, color = "#3b2a3f") => (
    <g>
      <ellipse cx={cx - 9 * s} cy={cy} rx={2.8 * s} ry={3.4 * s} fill={color} />
      <ellipse cx={cx + 9 * s} cy={cy} rx={2.8 * s} ry={3.4 * s} fill={color} />
      <circle cx={cx - 8.2 * s} cy={cy - 1.2 * s} r={1 * s} fill="#fff" />
      <circle cx={cx + 9.8 * s} cy={cy - 1.2 * s} r={1 * s} fill="#fff" />
      <path
        d={`M${cx - 4 * s} ${cy + 5 * s} q${4 * s} ${4.5 * s} ${8 * s} 0`}
        fill="none"
        stroke={color}
        strokeWidth={2 * s}
        strokeLinecap="round"
      />
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
          <path
            d="M22 12 H78 a14 14 0 0 1 14 14 V58 a14 14 0 0 1 -14 14 H56 L34 92 V72 H22 a14 14 0 0 1 -14 -14 V26 a14 14 0 0 1 14 -14 Z"
            fill={f("b")}
          />
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

    case "search":
      content = (
        <g>
          <defs>
            {R("g", "#FFFFFF", "#E6EFFB", "#A9BFE6")}
            {R("r", H.l, H.m, H.d)}
          </defs>
          <line x1="66" y1="66" x2="90" y2="90" stroke={H.d} strokeWidth="14" strokeLinecap="round" />
          <circle cx="42" cy="42" r="30" fill={f("g")} stroke={f("r")} strokeWidth="10" />
          {gloss(31, 30, 10, 4.5, -35, 0.95)}
        </g>
      );
      break;

    case "counselor": {
      const longHair = variant % 2 === 0;
      content = (
        <g>
          <defs>
            {R("skin", "#FFE8D6", "#F6BE98", "#D88F63")}
            {R("coat", H.l, H.m, H.d)}
          </defs>
          {longHair && <ellipse cx="50" cy="46" rx="27" ry="30" fill="#4a2e22" />}
          <path d="M10 98 C10 72 28 64 50 64 C72 64 90 72 90 98 Z" fill={f("coat")} />
          <rect x="43" y="52" width="14" height="16" rx="6" fill="#EDB087" />
          <path d="M40 64 L50 80 L60 64 Z" fill="#fff" />
          <circle cx="50" cy="38" r="23" fill={f("skin")} />
          <path
            d={
              longHair
                ? "M26 40 C23 8 77 8 74 40 C66 26 34 26 26 40 Z"
                : "M27 38 C24 6 76 6 73 38 C71 26 59 19 50 19 C41 19 29 26 27 38 Z"
            }
            fill="#4a2e22"
          />
          <ellipse cx="41" cy="40" rx="2.8" ry="3.4" fill="#2b1608" />
          <ellipse cx="59" cy="40" rx="2.8" ry="3.4" fill="#2b1608" />
          <circle cx="41.9" cy="38.8" r="1" fill="#fff" />
          <circle cx="59.9" cy="38.8" r="1" fill="#fff" />
          <path d="M44 49 q6 5 12 0" fill="none" stroke="#B5523E" strokeWidth="2.4" strokeLinecap="round" />
          <ellipse cx="34" cy="47" rx="4.5" ry="3" fill="#FF8FA3" opacity="0.5" />
          <ellipse cx="66" cy="47" rx="4.5" ry="3" fill="#FF8FA3" opacity="0.5" />
          <path d="M36 68 C30 84 46 90 52 80" fill="none" stroke="#4a4a5a" strokeWidth="3" strokeLinecap="round" />
          <circle cx="52" cy="80" r="4.5" fill="#D9DEE6" stroke="#4a4a5a" strokeWidth="1.5" />
          {gloss(40, 24, 7, 2.8, -25, 0.55)}
        </g>
      );
      break;
    }

    case "pin":
      content = (
        <g>
          <defs>{R("p", "#FFD3D8", "#F77A86", "#C2303F")}</defs>
          <path d="M50 96 C24 68 18 56 18 40 A32 32 0 0 1 82 40 C82 56 76 68 50 96 Z" fill={f("p")} />
          <circle cx="50" cy="40" r="15" fill="#fff" />
          <circle cx="50" cy="40" r="7" fill="#F77A86" opacity="0.6" />
          {gloss(36, 22, 10, 4.5, -35, 0.7)}
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

    case "dot":
      content = (
        <g>
          <defs>{R("g", "#D3FADE", "#4FD27C", "#1E9A47")}</defs>
          <circle cx="50" cy="50" r="38" fill={f("g")} />
          {gloss(38, 34, 14, 7.5, -30, 0.85)}
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
        filter: "drop-shadow(0 4px 5px rgba(60,60,110,0.28))",
      }}
    >
      {content}
    </svg>
  );
}

/* ============================================================
   COUNSELOR PAGE
   ============================================================ */

// Only Online & Offline.  "Physical" is kept as the stored value so the
// backend / existing appointments keep working – the label shows "Offline".
const MODES = [
  { value: "Online", label: "Online", icon: "laptop" },
  { value: "Physical", label: "Offline", icon: "hospital" },
];

function Counselor() {
  const navigate = useNavigate();
  const theme = THEME;
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

  // soft pastel avatar colours that match the background photo
  const avatarPalette = ["#F6D3DC", "#CFE3E6", "#DAD0EE", "#F7E3CF", "#CDD6F2", "#F0CFE6"];
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

      setBookingSuccess(response.data.message || "Appointment booked successfully!");
      setAppointmentDate("");
      setAppointmentTime("");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to book appointment. Please try again.");
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
      text: "Select online or offline counseling and choose a date and time that is comfortable for you.",
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
      {/* full-screen blurred copy of the photo (fills desktop sides) */}
      <div style={{ ...S.bgBlur, backgroundImage: `url(${bgImage})` }}></div>

      {/* sharp phone-width copy of the photo */}
      <div style={S.bgPhone}>
        <div
          style={{
            ...S.bgPhoneImage,
            backgroundImage: `linear-gradient(rgba(255,255,255,0.06), rgba(255,255,255,0.16)), url(${bgImage})`,
          }}
        ></div>
      </div>

      <div style={S.container}>
        {/* Header */}
        <div style={S.header}>
          <div style={{ minWidth: 0 }}>
            <h1 style={S.title}>Counselor Support</h1>
            <p style={S.subtitle}>Connect with Sri Lankan counselors and get emotional support.</p>
          </div>

          <div style={S.headerBadge}>
            <Icon3D name="chat" size={26} hue={theme.hue} />
            Private &amp; Safe
          </div>
        </div>

        {/* Hero */}
        <div style={S.heroCard}>
          <div style={{ minWidth: 0 }}>
            <h2 style={S.heroTitle}>Need someone to talk to?</h2>
            <p style={S.heroText}>
              Choose a counselor, select your session type, and request an appointment at a comfortable time.
            </p>
          </div>

          <div style={S.heroIcon}>
            <Icon3D name="brain" size={52} />
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
                      border: active ? `2.5px solid ${theme.accent}` : "1px solid rgba(255,255,255,0.8)",
                      background: active
                        ? `linear-gradient(145deg, #FFFFFF, ${theme.soft})`
                        : "rgba(255,255,255,0.66)",
                      boxShadow: active
                        ? `0 14px 30px ${theme.line}`
                        : "0 6px 16px rgba(46,52,82,0.08)",
                    }}
                  >
                    {/* Top row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
                      <div style={{ ...S.avatarBox, backgroundColor: getAvatarColor(counselor._id) }}>
                        <Icon3D name="counselor" size={50} hue={theme.hue} variant={getAvatarVariant(counselor._id)} />
                      </div>

                      <div style={S.counselorInfo}>
                        <h3 style={S.counselorName}>{counselor.name}</h3>
                        <p style={S.counselorRole}>{counselor.role}</p>
                        <p style={S.specialty}>{counselor.specialization}</p>
                      </div>

                      <span
                        style={{
                          ...S.toggleBadge,
                          color: active ? theme.accentDark : theme.text,
                          border: `1px solid ${active ? theme.accent : "rgba(0,0,0,0.06)"}`,
                        }}
                      >
                        {active ? "▲" : "▼"}
                      </span>
                    </div>

                    <div style={S.miniInfoRow}>
                      <span style={S.miniBadge}>
                        <Icon3D name="pin" size={15} />
                        {counselor.location}
                      </span>
                      {counselor.experience && (
                        <span style={S.miniBadge}>
                          <Icon3D name="hourglass" size={15} />
                          {counselor.experience}
                        </span>
                      )}
                      <span style={{ ...S.miniBadge, color: "#168a55" }}>
                        <Icon3D name="dot" size={12} />
                        {counselor.availability || "Available"}
                      </span>
                    </div>

                    {/* Details + booking */}
                    {active && (
                      <div
                        style={{
                          marginTop: 14,
                          paddingTop: 14,
                          borderTop: `1.5px solid ${theme.line}`,
                          width: "100%",
                          cursor: "default",
                          textAlign: "left",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
                          <div style={S.detailBox}>
                            <h3 style={S.detailTitle}>Specialized In</h3>
                            <p style={S.detailText}>{counselor.specialization}</p>
                          </div>
                          <div style={S.detailBox}>
                            <h3 style={S.detailTitle}>About Counselor</h3>
                            <p style={S.detailText}>{counselor.about || "No description provided."}</p>
                          </div>
                          <div style={S.detailBox}>
                            <h3 style={S.detailTitle}>Session Location</h3>
                            <p style={S.detailText}>{counselor.location}</p>
                          </div>
                        </div>

                        <div style={S.bookingBox}>
                          <h3 style={{ ...S.sectionTitle, fontSize: 17, marginBottom: 12 }}>
                            Book Session with {counselor.name}
                          </h3>

                          {bookingSuccess && <p style={S.success}>{bookingSuccess}</p>}

                          <label style={{ ...S.label, marginTop: 0 }}>Session Type</label>
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
                                    background: activeMode ? theme.gradient : "rgba(255,255,255,0.8)",
                                    color: activeMode ? "#FFFFFF" : theme.ink,
                                    transform: activeMode ? "translateY(-2px)" : "none",
                                  }}
                                >
                                  <Icon3D name={mode.icon} size={32} hue={theme.hue} />
                                  {mode.label}
                                </button>
                              );
                            })}
                          </div>

                          <div style={S.dateTimeRow}>
                            <div style={{ minWidth: 0 }}>
                              <label style={S.label}>Date</label>
                              <input
                                style={S.input}
                                type="date"
                                value={appointmentDate}
                                onChange={(e) => setAppointmentDate(e.target.value)}
                              />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <label style={S.label}>Time</label>
                              <input
                                style={S.input}
                                type="time"
                                value={appointmentTime}
                                onChange={(e) => setAppointmentTime(e.target.value)}
                              />
                            </div>
                          </div>

                          <button
                            style={{ ...S.bookButton, opacity: bookingLoading ? 0.7 : 1 }}
                            type="button"
                            onClick={handleBooking}
                            disabled={bookingLoading}
                          >
                            {bookingLoading ? "Booking..." : "Request Appointment"}
                          </button>

                          <p style={S.safeNote}>
                            <Icon3D name="lock" size={18} />
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
   STYLES  (mobile-first, max width 480px)
   ============================================================ */

const glass = {
  background: "rgba(255,255,255,0.6)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.8)",
  boxShadow: "0 16px 36px rgba(46,52,82,0.14)",
};

const makeStyles = (t) => ({
  page: {
    position: "relative",
    minHeight: "100dvh",
    padding: "max(16px, env(safe-area-inset-top)) 12px max(48px, env(safe-area-inset-bottom))",
    fontFamily: "'Poppins', Arial, sans-serif",
    boxSizing: "border-box",
    overflowX: "hidden",
    background: t.soft,
    WebkitTextSizeAdjust: "100%",
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
    height: "100dvh",
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
    width: "100%",
    maxWidth: "480px",
    margin: "0 auto",
    position: "relative",
    zIndex: 2,
    display: "grid",
    gap: "16px",
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "12px",
  },

  title: {
    fontSize: "28px",
    color: t.ink,
    margin: "0 0 6px 0",
    fontWeight: "800",
    lineHeight: 1.15,
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
    padding: "8px 16px 8px 10px",
    borderRadius: "20px",
    color: t.ink,
    fontWeight: "800",
    fontSize: "14px",
  },

  heroCard: {
    ...glass,
    borderRadius: "26px",
    padding: "18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },

  heroTitle: {
    color: t.ink,
    fontSize: "20px",
    margin: "0 0 6px 0",
    fontWeight: "800",
  },

  heroText: {
    color: t.text,
    lineHeight: "1.55",
    margin: 0,
    fontSize: "13.5px",
  },

  heroIcon: {
    width: "68px",
    height: "68px",
    borderRadius: "22px",
    background: `linear-gradient(135deg, ${t.soft}, #FFFFFF)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 12px 24px rgba(46,52,82,0.14)",
    flexShrink: 0,
  },

  panel: {
    ...glass,
    borderRadius: "26px",
    padding: "16px",
  },

  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "rgba(255,255,255,0.85)",
    padding: "12px 14px",
    borderRadius: "20px",
    boxShadow: "inset 0 0 14px rgba(46,52,82,0.07)",
    marginBottom: "18px",
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    background: "transparent",
    color: t.ink,
    fontSize: "16px", // 16px stops iOS zoom-on-focus
    fontFamily: "inherit",
  },

  sectionTitle: {
    color: t.ink,
    fontSize: "20px",
    margin: "0 0 14px 0",
    fontWeight: "800",
  },

  counselorList: {
    display: "grid",
    gap: "12px",
  },

  counselorCard: {
    width: "100%",
    boxSizing: "border-box",
    borderRadius: "22px",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "10px",
    textAlign: "left",
    cursor: "pointer",
    transition: "0.25s ease",
    fontFamily: "inherit",
  },

  avatarBox: {
    width: "62px",
    height: "62px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 20px rgba(46,52,82,0.14)",
    flexShrink: 0,
    overflow: "hidden",
  },

  counselorInfo: {
    flex: 1,
    minWidth: 0,
  },

  toggleBadge: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.85)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "800",
    flexShrink: 0,
  },

  counselorName: {
    color: t.ink,
    fontSize: "15.5px",
    margin: "0 0 2px 0",
    fontWeight: "800",
    lineHeight: 1.25,
  },

  counselorRole: {
    color: t.accentDark,
    margin: "0 0 2px 0",
    fontWeight: "700",
    fontSize: "12.5px",
  },

  specialty: {
    color: t.text,
    margin: 0,
    fontSize: "12.5px",
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
    background: "rgba(255,255,255,0.85)",
    color: t.text,
    padding: "5px 9px",
    borderRadius: "12px",
    fontSize: "11.5px",
    fontWeight: "700",
  },

  emptyBox: {
    padding: "26px",
    textAlign: "center",
    background: "rgba(255,255,255,0.55)",
    borderRadius: "20px",
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

  detailBox: {
    background: "rgba(255,255,255,0.72)",
    borderRadius: "18px",
    padding: "12px 14px",
    textAlign: "left",
  },

  detailTitle: {
    color: t.ink,
    margin: "0 0 4px 0",
    fontSize: "14px",
    fontWeight: "800",
  },

  detailText: {
    color: t.text,
    margin: 0,
    lineHeight: "1.5",
    fontSize: "13.5px",
  },

  bookingBox: {
    background: "rgba(255,255,255,0.8)",
    borderRadius: "20px",
    padding: "16px 14px",
    border: "1px solid rgba(255,255,255,0.9)",
    boxShadow: "0 6px 18px rgba(46,52,82,0.06)",
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
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "10px",
    marginBottom: "6px",
  },

  modeButton: {
    border: "none",
    padding: "12px 6px",
    minHeight: "76px",
    borderRadius: "20px",
    fontWeight: "800",
    fontSize: "13.5px",
    fontFamily: "inherit",
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(46,52,82,0.12)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    transition: "0.25s ease",
    WebkitTapHighlightColor: "transparent",
  },

  dateTimeRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },

  label: {
    display: "block",
    color: t.ink,
    fontWeight: "800",
    fontSize: "13.5px",
    margin: "14px 0 6px 0",
  },

  input: {
    width: "100%",
    minWidth: 0,
    padding: "12px",
    border: "none",
    outline: "none",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.92)",
    color: t.ink,
    fontSize: "16px", // 16px stops iOS zoom-on-focus
    fontFamily: "inherit",
    boxShadow: "inset 0 0 12px rgba(46,52,82,0.08)",
    boxSizing: "border-box",
  },

  bookButton: {
    width: "100%",
    marginTop: "18px",
    padding: "15px",
    border: "none",
    borderRadius: "20px",
    background: t.gradient,
    color: "white",
    fontSize: "16px",
    fontWeight: "800",
    fontFamily: "inherit",
    cursor: "pointer",
    boxShadow: "0 12px 24px rgba(95,109,166,0.35)",
    WebkitTapHighlightColor: "transparent",
  },

  safeNote: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    color: t.text,
    fontSize: "12.5px",
    textAlign: "center",
    margin: "14px 0 0 0",
    lineHeight: "1.5",
  },

  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "14px",
  },

  supportCard: {
    ...glass,
    borderRadius: "24px",
    padding: "18px",
    textAlign: "left",
    cursor: "pointer",
    overflow: "hidden",
  },

  supportTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },

  supportIcon: {
    width: "62px",
    height: "62px",
    borderRadius: "20px",
    background: `linear-gradient(135deg, ${t.soft}, #FFFFFF)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    padding: "6px",
    boxSizing: "border-box",
    boxShadow: "0 10px 20px rgba(46,52,82,0.12)",
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
    background: t.gradient,
    color: "white",
    fontSize: "12px",
    fontWeight: "800",
  },

  supportTitle: {
    color: t.ink,
    fontSize: "18px",
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
    margin: "14px 0 12px 0",
  },

  supportMiniText: {
    color: t.accentDark,
    fontSize: "13px",
    fontWeight: "800",
    margin: 0,
  },
});

export default Counselor;
