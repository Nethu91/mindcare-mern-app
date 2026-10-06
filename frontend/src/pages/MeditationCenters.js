import { useEffect, useState } from "react";
import API from "../api/axios";
import { apiError } from "../utils/apiError";
import { useSearchParams, useNavigate } from "react-router-dom";
import { distance, isOpen } from "../utils/centers";
import moodBg from "../assets/mood-bg.jpeg";

/* ─── Hide the global notification bell only on this page ─── */
const HIDE_BELL_STYLE = `
  .notification-toolbar { display: none !important; }
`;

/* ─── Category config (cute emoji per category) ─── */
const getCategory = (classes = []) => {
  const txt = classes.join(" ").toLowerCase();
  if (txt.includes("vipassana") || txt.includes("theravada"))
    return { emoji: "🪷", label: "Buddhist", grad: "linear-gradient(145deg,#b3a3e6,#7d7ca8)", dark: "#4d4d78", light: "#ebe8f6", text: "#4d4d78" };
  if (txt.includes("yoga") || txt.includes("pranayama"))
    return { emoji: "🌼", label: "Yoga", grad: "linear-gradient(145deg,#9fdcbf,#5aa795)", dark: "#2f6f63", light: "#e0f3ea", text: "#2f6f63" };
  if (txt.includes("sound") || txt.includes("healing"))
    return { emoji: "🎶", label: "Healing", grad: "linear-gradient(145deg,#f7d09b,#e8a578)", dark: "#a8613a", light: "#fbeadb", text: "#a8613a" };
  if (txt.includes("counseling") || txt.includes("therapy") || txt.includes("cbt"))
    return { emoji: "💬", label: "Therapy", grad: "linear-gradient(145deg,#9fd0ea,#6b9bc4)", dark: "#3d6a91", light: "#e0eef7", text: "#3d6a91" };
  if (txt.includes("forest") || txt.includes("silent"))
    return { emoji: "🌲", label: "Forest", grad: "linear-gradient(145deg,#a9dcab,#68a67a)", dark: "#3a7050", light: "#e3f3e5", text: "#3a7050" };
  if (txt.includes("tibetan"))
    return { emoji: "🪔", label: "Tibetan", grad: "linear-gradient(145deg,#d4abe6,#a57cc2)", dark: "#74498f", light: "#f2e6f8", text: "#74498f" };
  if (txt.includes("mindfulness") || txt.includes("mbsr") || txt.includes("mbct"))
    return { emoji: "🌸", label: "Mindfulness", grad: "linear-gradient(145deg,#f7b6c4,#dc86a6)", dark: "#a14a6c", light: "#fbe6ec", text: "#a14a6c" };
  return { emoji: "🫧", label: "Meditation", grad: "linear-gradient(145deg,#b5b2ee,#8a86cc)", dark: "#55529a", light: "#ebeafa", text: "#55529a" };
};

/* ─── Cute emoji (Twemoji – same look on every device) ───── */
const toCode = (s) =>
  Array.from(s)
    .map((c) => c.codePointAt(0).toString(16))
    .filter((h) => h !== "fe0f")
    .join("-");

function Emoji3D({ children, size = 20, float = false }) {
  const [failed, setFailed] = useState(false);
  const url = `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${toCode(children)}.svg`;

  if (failed) {
    return (
      <span className="mc2-e3d" style={{ fontSize: size * 0.9 }} aria-hidden="true">
        {children}
      </span>
    );
  }
  return (
    <img
      className={`mc2-e3d ${float ? "mc2-e3d--float" : ""}`}
      src={url}
      alt=""
      width={size}
      height={size}
      draggable="false"
      onError={() => setFailed(true)}
      aria-hidden="true"
    />
  );
}

/* ─── Stars ───────────────────────────────────────────────── */
function Stars({ rating }) {
  if (rating == null) return null;
  return (
    <span className="mc2-stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? "#f5a524" : "#d9d6e3"} style={{ filter: "drop-shadow(0 1px 0 rgba(120,70,0,.25))" }}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span className="mc2-rating-val">{rating.toFixed(1)}</span>
    </span>
  );
}

/* ─── Single Card ─────────────────────────────────────────── */
function CenterCard({ c, position, expanded, onToggle, index }) {
  const cat = getCategory(c.classes);
  const open = isOpen(c);
  const km =
    position && Number.isFinite(c.latitude) && Number.isFinite(c.longitude)
      ? distance(position, c).toFixed(1)
      : null;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    c.name + " " + c.address
  )}`;

  return (
    <div
      className={`mc2-card ${expanded ? "mc2-card--open" : ""}`}
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms`, "--cat-dark": cat.dark }}
    >
      <div
        className="mc2-card-tap"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onKeyDown={(e) => e.key === "Enter" && onToggle()}
      >
        {/* orb badge */}
        <div className="mc2-badge">
          <div className="mc2-orb" style={{ background: cat.grad, "--orb-dark": cat.dark }}>
            <Emoji3D size={30}>{cat.emoji}</Emoji3D>
          </div>
          <span className="mc2-badge-label" style={{ background: cat.light, color: cat.text }}>
            {cat.label}
          </span>
        </div>

        {/* Content */}
        <div className="mc2-content">
          <div className="mc2-top-row">
            <h3 className="mc2-name">{c.name}</h3>
            <span
              className="mc2-status"
              style={{
                background: open ? "#dff5e8" : "#fde4e4",
                color: open ? "#1d6b4a" : "#9b2c2c",
                boxShadow: `0 2px 0 ${open ? "#b6e0c8" : "#f2bcbc"}`,
              }}
            >
              <span className="mc2-status-dot" style={{ background: open ? "#2fb872" : "#e24b4b" }} />
              {open ? "Open" : "Closed"}
            </span>
          </div>

          <p className="mc2-address">
            <Emoji3D size={13}>📌</Emoji3D>
            <span className="mc2-address-text">{c.address}</span>
          </p>

          <div className="mc2-meta">
            <Stars rating={c.rating} />
            {c.reviewCount > 0 && <span className="mc2-reviews">({c.reviewCount} reviews)</span>}
            {km && (
              <span className="mc2-km">
                <Emoji3D size={12}>📍</Emoji3D> {km} km
              </span>
            )}
          </div>

          {(c.classes || []).length > 0 && (
            <div className="mc2-chips">
              {c.classes.slice(0, 3).map((cl, i) => (
                <span key={i} className="mc2-chip" style={{ color: cat.text, background: cat.light, boxShadow: `0 2px 0 ${cat.text}22` }}>
                  {cl}
                </span>
              ))}
              {c.classes.length > 3 && (
                <span className="mc2-chip mc2-chip-more" style={{ color: cat.text, background: cat.light }}>
                  +{c.classes.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Chevron */}
        <div className="mc2-chevron-wrap">
          <div className={`mc2-chevron ${expanded ? "mc2-chevron--up" : ""}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div className="mc2-detail">
          <div className="mc2-detail-divider" style={{ background: cat.grad }} />

          {c.description && <p className="mc2-desc">{c.description}</p>}

          {(c.hours || []).length > 0 && (
            <div className="mc2-hours-note">
              <Emoji3D size={18}>🕐</Emoji3D>
              <span>
                {open
                  ? "Currently open — check address for exact timings"
                  : "Currently closed — check address for opening hours"}
              </span>
            </div>
          )}

          <div className="mc2-actions">
            <a className="mc2-btn mc2-btn--dirs" href={mapsUrl} target="_blank" rel="noreferrer">
              <Emoji3D size={18}>🧭</Emoji3D>
              Directions
            </a>
            {c.phone && (
              <a className="mc2-btn mc2-btn--call" href={`tel:${c.phone.replace(/[^+0-9]/g, "")}`}>
                <Emoji3D size={18}>📞</Emoji3D>
                {c.phone}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────── */
export default function MeditationCenters() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [centers, setCenters] = useState([]);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  const [position, setPosition] = useState(null);
  const [expandedId, setExpandedId] = useState(params.get("center"));
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    API.get("/wellbeing/centers")
      .then((r) => setCenters(r.data))
      .catch((e) => setError(apiError(e)))
      .finally(() => setLoading(false));
  }, []);

  function locate() {
    if (!navigator.geolocation) { setError("Location unavailable on this device."); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => { setPosition(p.coords); setError(""); setFilter("Nearby"); setLocating(false); },
      () => { setError("Location denied. You can still search by town."); setLocating(false); },
    );
  }

  /* filter + sort */
  let list = centers.filter((c) =>
    [c.name, c.address, ...(c.classes || [])].join(" ").toLowerCase().includes(q.toLowerCase()),
  );
  if (filter === "Open Now") list = list.filter(isOpen);
  if (filter === "Top Rated") list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  if (filter === "Nearby" && position)
    list = [...list].sort((a, b) =>
      (Number.isFinite(a.latitude) && Number.isFinite(a.longitude) ? distance(position, a) : Infinity) -
      (Number.isFinite(b.latitude) && Number.isFinite(b.longitude) ? distance(position, b) : Infinity),
    );

  const FILTERS = [
    { id: "All", icon: "🌈" },
    { id: "Top Rated", icon: "⭐" },
    { id: "Open Now", icon: "🟢" },
    { id: "Nearby", icon: "📍" },
  ];

  return (
    <>
      <style>{HIDE_BELL_STYLE}</style>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@500;600;700;800;900&display=swap');

        .mc2-page {
          --ink: #2a2842;
          --ink-soft: #5b5a78;
          --teal: #5f9ba0;
          --teal-deep: #3f777d;
          --slate: #6f6f94;
          --slate-deep: #4b4b72;
          --mauve: #a58aa8;
          --rose: #e6a7a3;
          --glass: rgba(255,255,255,0.62);
          --glass-strong: rgba(255,255,255,0.8);

          font-family: 'Nunito', 'Segoe UI', sans-serif;
          min-height: 100dvh;
          width: 100%;
          max-width: 520px;                           /* phone-style single column, like before */
          margin: 0 auto;
          padding: 0 clamp(12px, 3vw, 28px) 40px;
          box-sizing: border-box;
          position: relative;
          isolation: isolate;
          color: var(--ink);
          overflow-x: hidden;
        }
        .mc2-page *, .mc2-page *::before, .mc2-page *::after { box-sizing: border-box; }

        /* ── Outside the column: smooth blue-grey → mauve → dusty-rose gradient ── */
        .mc2-root {
          position: relative;
          isolation: isolate;
          min-height: 100dvh;
          width: 100%;
        }
        .mc2-bg {
          position: fixed; inset: 0; z-index: -1;
          background: linear-gradient(180deg, #8ea4b0 0%, #7d7b98 55%, #b88f95 100%);
          pointer-events: none;
        }

        /* ── Inside the column: mood-bg image, same width as the content ── */
        .mc2-page::before {
          content: "";
          position: fixed; z-index: -2;
          top: 0; left: 50%;
          width: min(520px, 100vw);
          height: 100vh;
          height: 100lvh;
          background-color: #b9a9c4;
          background-image: var(--mood-bg);
          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
          transform: translateX(-50%) translateZ(0);
          will-change: transform;
          box-shadow: 0 0 40px rgba(42,40,66,0.25);
        }
        .mc2-page::after {
          content: "";
          position: fixed; z-index: -1;
          top: 0; left: 50%;
          width: min(520px, 100vw);
          height: 100vh;
          height: 100lvh;
          background: linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.18) 100%);
          transform: translateX(-50%) translateZ(0);
          pointer-events: none;
        }

        /* ── Cute emoji ── */
        .mc2-e3d {
          display: inline-block;
          flex-shrink: 0;
          line-height: 1;
          vertical-align: middle;
          user-select: none;
          -webkit-user-drag: none;
          filter: drop-shadow(0 2px 3px rgba(42,40,66,0.28));
        }
        .mc2-e3d--float { animation: mc2Float 3.4s ease-in-out infinite; }
        @keyframes mc2Float {
          0%,100% { transform: translateY(0) rotate(-4deg); }
          50%     { transform: translateY(-6px) rotate(4deg); }
        }

        /* ── Header ── */
        .mc2-header {
          margin: clamp(10px, 2vw, 22px) 0 0;
          border-radius: 28px;
          padding: clamp(16px, 3vw, 28px);
          position: relative;
          overflow: hidden;
          background: linear-gradient(150deg, rgba(95,155,160,0.85) 0%, rgba(111,111,148,0.85) 55%, rgba(165,138,168,0.85) 100%);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1.5px solid rgba(255,255,255,0.55);
          box-shadow:
            0 8px 0 rgba(75,75,114,0.35),
            0 22px 40px rgba(42,40,66,0.28),
            inset 0 2px 0 rgba(255,255,255,0.45);
        }
        .mc2-header::before {
          content: "";
          position: absolute; inset: 0; z-index: 0;
          background:
            radial-gradient(circle at 85% 10%, rgba(255,255,255,0.35) 0%, transparent 45%),
            radial-gradient(circle at 5% 100%, rgba(230,167,163,0.35) 0%, transparent 45%);
        }
        .mc2-header-inner { position: relative; z-index: 1; }

        /* floating cute decorations */
        .mc2-deco { position: absolute; z-index: 1; pointer-events: none; opacity: 0.9; }
        .mc2-deco--1 { top: 16px; right: 18px; }
        .mc2-deco--2 { bottom: 16px; right: 64px; }
        .mc2-deco--3 { top: 56px; right: 70px; }

        .mc2-back {
          display: inline-flex; align-items: center; gap: 6px;
          border: none; cursor: pointer;
          background: linear-gradient(180deg, rgba(255,255,255,0.95), rgba(235,232,246,0.95));
          color: var(--slate-deep);
          border-radius: 14px; padding: 8px 15px;
          font-family: inherit; font-size: 13px; font-weight: 800;
          box-shadow: 0 5px 0 rgba(75,75,114,0.45), 0 10px 14px rgba(42,40,66,0.25), inset 0 1px 0 #fff;
          transition: transform 0.12s, box-shadow 0.12s;
          margin-bottom: 18px;
        }
        .mc2-back:active { transform: translateY(4px); box-shadow: 0 1px 0 rgba(75,75,114,0.45), 0 3px 6px rgba(42,40,66,0.25), inset 0 1px 0 #fff; }

        .mc2-title-row { display: flex; align-items: center; gap: 12px; }
        .mc2-header h1 {
          font-size: clamp(24px, 4.5vw, 34px); font-weight: 900; color: #fff; margin: 0;
          letter-spacing: -0.4px; line-height: 1.1;
          text-shadow: 0 2px 0 rgba(42,40,66,0.35), 0 6px 14px rgba(42,40,66,0.25);
        }
        .mc2-header-sub {
          color: rgba(255,255,255,0.92); font-size: clamp(13px, 2vw, 15px); font-weight: 600; margin: 8px 0 0;
          text-shadow: 0 1px 2px rgba(42,40,66,0.3);
        }
        .mc2-header-count {
          display: inline-flex; align-items: center; gap: 7px; margin-top: 14px;
          background: rgba(255,255,255,0.9); color: var(--slate-deep);
          border-radius: 20px; padding: 6px 14px;
          font-size: 12px; font-weight: 800;
          box-shadow: 0 4px 0 rgba(75,75,114,0.35), inset 0 1px 0 #fff;
        }
        .mc2-header-dot { width: 8px; height: 8px; border-radius: 50%; background: #2fb872; box-shadow: 0 0 0 3px rgba(47,184,114,0.25); }

        /* ── Search ── */
        .mc2-search-section { padding: 22px 0 0; }
        .mc2-search-wrap { position: relative; }
        .mc2-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); z-index: 1; pointer-events: none; display: flex; }
        .mc2-search {
          width: 100%;
          background: var(--glass-strong);
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          border: 1.5px solid rgba(255,255,255,0.9);
          border-radius: 18px;
          padding: 14px 14px 14px 48px;
          font-size: 14px; font-weight: 600; font-family: inherit;
          color: var(--ink); outline: none;
          box-shadow: inset 0 3px 6px rgba(75,75,114,0.14), 0 5px 0 rgba(255,255,255,0.45), 0 12px 24px rgba(42,40,66,0.14);
          transition: box-shadow 0.2s, border-color 0.2s;
        }
        .mc2-search:focus {
          border-color: var(--teal);
          box-shadow: inset 0 3px 6px rgba(75,75,114,0.14), 0 0 0 4px rgba(95,155,160,0.28), 0 12px 24px rgba(42,40,66,0.14);
        }
        .mc2-search::placeholder { color: #8a89a8; font-weight: 600; }

        /* ── Filters: wrap so nothing gets cut off ── */
        .mc2-filters {
          display: flex; flex-wrap: wrap;
          gap: 14px 10px;
          padding: 20px 2px 10px;
        }
        .mc2-filter, .mc2-locate {
          flex-shrink: 0; display: flex; align-items: center; gap: 7px;
          border: none; cursor: pointer; white-space: nowrap;
          border-radius: 16px; padding: 9px 16px;
          font-size: 12.5px; font-weight: 800; font-family: inherit;
          transition: transform 0.12s, box-shadow 0.12s;
        }
        .mc2-filter {
          background: linear-gradient(180deg, #ffffff, #e9e6f3);
          color: var(--slate-deep);
          box-shadow: 0 5px 0 #b9b5d3, 0 10px 14px rgba(42,40,66,0.18), inset 0 1px 0 #fff;
        }
        .mc2-filter:hover { transform: translateY(-1px); }
        .mc2-filter:active, .mc2-filter.active { transform: translateY(4px); }
        .mc2-filter.active {
          background: linear-gradient(180deg, #7bb5b9, var(--teal-deep));
          color: #fff;
          box-shadow: 0 1px 0 #2a5a5f, 0 4px 8px rgba(42,40,66,0.25), inset 0 2px 4px rgba(255,255,255,0.35);
          text-shadow: 0 1px 1px rgba(0,0,0,0.25);
        }
        .mc2-locate {
          background: linear-gradient(180deg, #f6c4c0, #de8f94);
          color: #fff;
          box-shadow: 0 5px 0 #b4666d, 0 10px 14px rgba(42,40,66,0.2), inset 0 1px 0 rgba(255,255,255,0.6);
          text-shadow: 0 1px 1px rgba(120,40,50,0.35);
        }
        .mc2-locate:hover { transform: translateY(-1px); }
        .mc2-locate:active { transform: translateY(4px); box-shadow: 0 1px 0 #b4666d, 0 3px 6px rgba(42,40,66,0.2), inset 0 1px 0 rgba(255,255,255,0.6); }
        .mc2-locate:disabled { opacity: 0.7; cursor: not-allowed; transform: translateY(2px); box-shadow: 0 3px 0 #b4666d; }

        /* ── List header ── */
        .mc2-list-hd {
          display: flex; align-items: center; justify-content: space-between; gap: 10px;
          margin: 14px 0 16px; padding: 12px 16px;
          background: var(--glass); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
          border: 1.5px solid rgba(255,255,255,0.75);
          border-radius: 20px;
          box-shadow: 0 5px 0 rgba(255,255,255,0.35), 0 12px 24px rgba(42,40,66,0.14), inset 0 1px 0 #fff;
        }
        .mc2-list-hd h2 { font-size: 17px; font-weight: 900; color: var(--ink); margin: 0; letter-spacing: -0.3px; }
        .mc2-list-hd p { font-size: 12px; color: var(--slate); margin: 2px 0 0; font-weight: 700; }
        .mc2-badge-count {
          flex-shrink: 0;
          background: linear-gradient(180deg, #8d8dbb, var(--slate-deep));
          color: #fff; border-radius: 14px; padding: 6px 13px;
          font-size: 12px; font-weight: 800;
          box-shadow: 0 4px 0 #34345a, inset 0 1px 0 rgba(255,255,255,0.4);
        }

        /* ── Cards: 1 column on phones, 2 on tablets/laptops ── */
        .mc2-list {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .mc2-card {
          min-width: 0;
          background: var(--glass);
          backdrop-filter: blur(18px) saturate(1.2);
          -webkit-backdrop-filter: blur(18px) saturate(1.2);
          border-radius: 26px;
          border: 1.5px solid rgba(255,255,255,0.8);
          box-shadow:
            0 7px 0 rgba(255,255,255,0.4),
            0 8px 0 rgba(75,75,114,0.12),
            0 18px 34px rgba(42,40,66,0.2),
            inset 0 2px 0 rgba(255,255,255,0.85);
          overflow: hidden;
          animation: mc2FadeUp 0.35s ease both;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        @keyframes mc2FadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mc2-card:hover { transform: translateY(-3px); }
        .mc2-card--open { background: var(--glass-strong); border-color: #fff; }

        .mc2-card-tap {
          display: flex; align-items: center; gap: 0;
          cursor: pointer; user-select: none;
          min-height: 108px; padding: 14px 8px 14px 14px;
        }
        .mc2-card-tap:focus-visible { outline: 3px solid var(--teal); outline-offset: -3px; border-radius: 26px; }

        /* orb badge */
        .mc2-badge {
          flex-shrink: 0; width: 70px;
          display: flex; flex-direction: column; align-items: center; gap: 8px;
        }
        .mc2-orb {
          width: 58px; height: 58px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          position: relative;
          box-shadow:
            0 5px 0 var(--orb-dark),
            0 12px 16px rgba(42,40,66,0.3),
            inset 0 -6px 10px rgba(0,0,0,0.14),
            inset 0 4px 8px rgba(255,255,255,0.6);
        }
        .mc2-orb::before {
          content: ""; position: absolute;
          top: 5px; left: 11px; width: 24px; height: 12px;
          border-radius: 50%;
          background: linear-gradient(180deg, rgba(255,255,255,0.75), rgba(255,255,255,0));
          transform: rotate(-18deg);
          pointer-events: none;
        }
        .mc2-orb .mc2-e3d { position: relative; z-index: 1; }
        .mc2-badge-label {
          font-size: 10px; font-weight: 800; border-radius: 8px; padding: 2px 8px; line-height: 1.3;
          max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }

        /* content */
        .mc2-content { flex: 1; min-width: 0; padding: 2px 6px 2px 12px; }
        .mc2-top-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
        .mc2-name { font-size: 14.5px; font-weight: 800; color: var(--ink); margin: 0; line-height: 1.3; flex: 1; min-width: 0; overflow-wrap: anywhere; }
        .mc2-status {
          flex-shrink: 0; display: flex; align-items: center; gap: 5px;
          font-size: 10px; font-weight: 800; border-radius: 10px; padding: 3px 9px; white-space: nowrap;
        }
        .mc2-status-dot { width: 6px; height: 6px; border-radius: 50%; }

        .mc2-address {
          display: flex; align-items: center; gap: 6px;
          font-size: 11.5px; color: var(--ink-soft); font-weight: 600; margin: 0 0 7px;
          min-width: 0;
        }
        .mc2-address-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }

        .mc2-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 7px; margin-bottom: 8px; }
        .mc2-stars { display: flex; align-items: center; gap: 2px; }
        .mc2-rating-val { font-size: 12px; font-weight: 800; color: #8a5a10; margin-left: 4px; }
        .mc2-reviews { font-size: 11px; color: #7d7c99; font-weight: 600; }
        .mc2-km {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 11px; color: var(--slate-deep); font-weight: 800;
          background: #e6e4f3; border-radius: 9px; padding: 2px 8px;
          box-shadow: 0 2px 0 #c9c5e0;
        }

        .mc2-chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .mc2-chip { font-size: 10px; font-weight: 800; border-radius: 9px; padding: 3px 9px; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .mc2-chip-more { opacity: 0.75; }

        /* chevron */
        .mc2-chevron-wrap { flex-shrink: 0; padding: 0 6px 0 2px; }
        .mc2-chevron {
          width: 34px; height: 34px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(180deg, #8d8dbb, var(--slate-deep));
          box-shadow: 0 4px 0 #34345a, 0 8px 10px rgba(42,40,66,0.25), inset 0 1px 0 rgba(255,255,255,0.45);
          transition: transform 0.25s;
        }
        .mc2-chevron--up { transform: rotate(180deg); }

        /* ── Expanded detail ── */
        .mc2-detail { padding: 0 16px 20px; animation: mc2Reveal 0.22s ease; }
        @keyframes mc2Reveal {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mc2-detail-divider { height: 3px; border-radius: 3px; margin-bottom: 14px; opacity: 0.55; }
        .mc2-desc { font-size: 13px; color: #3c3b57; font-weight: 600; line-height: 1.7; margin: 0 0 14px; }
        .mc2-hours-note {
          display: flex; align-items: center; gap: 9px;
          background: rgba(255,255,255,0.75);
          border-radius: 14px; padding: 10px 13px; margin-bottom: 16px;
          font-size: 12px; color: var(--slate-deep); font-weight: 700;
          box-shadow: inset 0 2px 5px rgba(75,75,114,0.12), 0 2px 0 rgba(255,255,255,0.7);
        }
        .mc2-actions { display: flex; gap: 12px; flex-wrap: wrap; }
        .mc2-btn {
          flex: 1; min-width: 130px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          border: none; border-radius: 16px; padding: 13px 16px;
          font-size: 13px; font-weight: 900; font-family: inherit;
          text-decoration: none; cursor: pointer;
          transition: transform 0.12s, box-shadow 0.12s;
        }
        .mc2-btn:hover { transform: translateY(-1px); }
        .mc2-btn--dirs {
          background: linear-gradient(180deg, #7bb5b9, var(--teal-deep));
          color: #fff; text-shadow: 0 1px 1px rgba(0,0,0,0.3);
          box-shadow: 0 6px 0 #2a5a5f, 0 14px 18px rgba(42,40,66,0.25), inset 0 2px 0 rgba(255,255,255,0.45);
        }
        .mc2-btn--call {
          background: linear-gradient(180deg, #ffffff, #e6e3f1);
          color: var(--slate-deep); flex: 1.4; font-size: 12.5px;
          box-shadow: 0 6px 0 #b4b0d0, 0 14px 18px rgba(42,40,66,0.2), inset 0 1px 0 #fff;
          white-space: nowrap;
        }
        .mc2-btn:active { transform: translateY(5px); }
        .mc2-btn--dirs:active { box-shadow: 0 1px 0 #2a5a5f, 0 3px 6px rgba(42,40,66,0.25), inset 0 2px 0 rgba(255,255,255,0.45); }
        .mc2-btn--call:active { box-shadow: 0 1px 0 #b4b0d0, 0 3px 6px rgba(42,40,66,0.2), inset 0 1px 0 #fff; }

        /* ── States ── */
        .mc2-error {
          display: flex; align-items: center; gap: 8px;
          margin: 12px 0 0; background: rgba(254,242,242,0.95);
          border-radius: 14px; padding: 11px 14px;
          font-size: 12.5px; color: #9b2c2c; font-weight: 700;
          box-shadow: 0 4px 0 #f2bcbc, 0 10px 16px rgba(42,40,66,0.12);
        }
        .mc2-hint {
          margin: 8px 0 0; padding: 8px 14px; width: fit-content; max-width: 100%;
          font-size: 12px; color: var(--slate-deep); font-weight: 700;
          background: var(--glass-strong); border-radius: 12px;
          display: flex; align-items: center; gap: 7px;
        }

        .mc2-loading {
          display: flex; flex-direction: column; align-items: center;
          margin: 40px auto 0; padding: 40px 24px; gap: 16px; max-width: 420px;
          background: var(--glass); backdrop-filter: blur(14px); border-radius: 26px;
          box-shadow: 0 6px 0 rgba(255,255,255,0.35), 0 16px 30px rgba(42,40,66,0.15);
        }
        .mc2-spinner-ring {
          width: 50px; height: 50px; border-radius: 50%;
          border: 4px solid rgba(111,111,148,0.2); border-top-color: var(--slate-deep);
          animation: mc2Spin 0.75s linear infinite;
        }
        @keyframes mc2Spin { to { transform: rotate(360deg); } }
        .mc2-loading p { font-size: 14px; color: var(--slate-deep); font-weight: 800; margin: 0; }

        .mc2-empty {
          display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px;
          margin: 40px auto 0; padding: 36px 24px; max-width: 420px;
          background: var(--glass); backdrop-filter: blur(14px); border-radius: 26px;
          box-shadow: 0 6px 0 rgba(255,255,255,0.35), 0 16px 30px rgba(42,40,66,0.15);
        }
        .mc2-empty-icon {
          width: 84px; height: 84px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(145deg, #bfe3df, #8fb8c0);
          box-shadow: 0 6px 0 #5f8f98, 0 14px 20px rgba(42,40,66,0.22), inset 0 4px 8px rgba(255,255,255,0.6), inset 0 -6px 10px rgba(0,0,0,0.12);
        }
        .mc2-empty h3 { font-size: 16px; font-weight: 900; color: var(--ink); margin: 0; }
        .mc2-empty p { font-size: 13px; color: var(--ink-soft); font-weight: 600; margin: 0; }

        /* ── Small phones ── */
        @media (max-width: 380px) {
          .mc2-badge { width: 60px; }
          .mc2-orb { width: 50px; height: 50px; }
          .mc2-name { font-size: 13.5px; }
          .mc2-deco--3 { display: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .mc2-e3d--float, .mc2-card, .mc2-detail { animation: none; }
        }
      `}</style>

      <div className="mc2-root">
      <div className="mc2-bg" aria-hidden="true" />
      <div className="mc2-page" style={{ "--mood-bg": `url(${moodBg})` }}>

        {/* ── Header ── */}
        <div className="mc2-header">
          <span className="mc2-deco mc2-deco--1"><Emoji3D size={26} float>🌸</Emoji3D></span>
          <span className="mc2-deco mc2-deco--2"><Emoji3D size={22} float>✨</Emoji3D></span>
          <span className="mc2-deco mc2-deco--3"><Emoji3D size={20} float>🫧</Emoji3D></span>
          <div className="mc2-header-inner">
            <button className="mc2-back" onClick={() => navigate("/dashboard")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Dashboard
            </button>
            <div className="mc2-title-row">
              <Emoji3D size={42} float>🪷</Emoji3D>
              <h1>Meditation Centers</h1>
            </div>
            <p className="mc2-header-sub">Find peaceful spaces near you in Sri Lanka</p>
            {!loading && (
              <div className="mc2-header-count">
                <span className="mc2-header-dot" />
                {centers.length} Centers Available
              </div>
            )}
          </div>
        </div>

        {/* ── Search ── */}
        <div className="mc2-search-section">
          <div className="mc2-search-wrap">
            <span className="mc2-search-icon"><Emoji3D size={18}>🔍</Emoji3D></span>
            <input
              className="mc2-search"
              placeholder="Search by name, city or class type…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search meditation centers"
            />
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="mc2-filters" role="group" aria-label="Filter options">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              className={`mc2-filter ${filter === f.id ? "active" : ""}`}
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
            >
              <Emoji3D size={16}>{f.icon}</Emoji3D> {f.id}
            </button>
          ))}
          <button className="mc2-locate" onClick={locate} disabled={locating}>
            <Emoji3D size={16}>{locating ? "⏳" : "🎯"}</Emoji3D> {locating ? "Locating…" : "Use Location"}
          </button>
        </div>

        {/* ── Hint / Error ── */}
        {filter === "Nearby" && !position && !loading && (
          <p className="mc2-hint">
            <Emoji3D size={16}>💡</Emoji3D>
            Tap "Use Location" to sort centers by distance.
          </p>
        )}
        {error && (
          <p className="mc2-error" role="alert">
            <Emoji3D size={16}>🥺</Emoji3D> {error}
          </p>
        )}

        {/* ── Content ── */}
        {loading ? (
          <div className="mc2-loading">
            <div className="mc2-spinner-ring" />
            <p>Loading centers…</p>
          </div>
        ) : list.length === 0 ? (
          <div className="mc2-empty">
            <div className="mc2-empty-icon"><Emoji3D size={44} float>🌱</Emoji3D></div>
            <h3>No Centers Found</h3>
            <p>{q ? `No results for "${q}". Try a different search.` : "Try changing your filter."}</p>
          </div>
        ) : (
          <>
            <div className="mc2-list-hd">
              <div>
                <h2>Centers</h2>
                <p>{filter !== "All" ? `Filtered: ${filter}` : "All meditation centers"}</p>
              </div>
              <span className="mc2-badge-count">{list.length} found</span>
            </div>
            <div className="mc2-list" role="list">
              {list.map((c, i) => (
                <CenterCard
                  key={c._id}
                  c={c}
                  position={position}
                  expanded={expandedId === c._id}
                  onToggle={() => setExpandedId(expandedId === c._id ? null : c._id)}
                  index={i}
                />
              ))}
            </div>
          </>
        )}
      </div>
      </div>
    </>
  );
}
