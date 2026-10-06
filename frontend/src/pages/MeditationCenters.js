import { useEffect, useState, useRef } from "react";
import API from "../api/axios";
import { apiError } from "../utils/apiError";
import { useSearchParams, useNavigate } from "react-router-dom";
import { distance, isOpen } from "../utils/centers";

/* ─── Hide the global notification bell only on this page ─── */
const HIDE_BELL_STYLE = `
  .notification-toolbar { display: none !important; }
`;

/* ─── Category config ─────────────────────────────────────── */
const getCategory = (classes = []) => {
  const txt = classes.join(" ").toLowerCase();
  if (txt.includes("vipassana") || txt.includes("theravada"))
    return { emoji: "☸️", label: "Buddhist", grad: "linear-gradient(135deg,#7c3aed,#4f46e5)", light: "#ede9fe", text: "#4f46e5" };
  if (txt.includes("yoga") || txt.includes("pranayama"))
    return { emoji: "🌿", label: "Yoga", grad: "linear-gradient(135deg,#059669,#34d399)", light: "#d1fae5", text: "#047857" };
  if (txt.includes("sound") || txt.includes("healing"))
    return { emoji: "🎵", label: "Healing", grad: "linear-gradient(135deg,#d97706,#fbbf24)", light: "#fef3c7", text: "#92400e" };
  if (txt.includes("counseling") || txt.includes("therapy") || txt.includes("cbt"))
    return { emoji: "💬", label: "Therapy", grad: "linear-gradient(135deg,#2563eb,#60a5fa)", light: "#dbeafe", text: "#1d4ed8" };
  if (txt.includes("forest") || txt.includes("silent"))
    return { emoji: "🌲", label: "Forest", grad: "linear-gradient(135deg,#16a34a,#4ade80)", light: "#dcfce7", text: "#15803d" };
  if (txt.includes("tibetan"))
    return { emoji: "🪔", label: "Tibetan", grad: "linear-gradient(135deg,#9333ea,#c084fc)", light: "#f3e8ff", text: "#7e22ce" };
  if (txt.includes("mindfulness") || txt.includes("mbsr") || txt.includes("mbct"))
    return { emoji: "🪷", label: "Mindfulness", grad: "linear-gradient(135deg,#db2777,#f472b6)", light: "#fce7f3", text: "#be185d" };
  return { emoji: "🧘", label: "Meditation", grad: "linear-gradient(135deg,#6366f1,#a78bfa)", light: "#eef2ff", text: "#4338ca" };
};

/* ─── Stars ───────────────────────────────────────────────── */
function Stars({ rating }) {
  if (rating == null) return null;
  return (
    <span className="mc2-stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? "#f59e0b" : "#e5e7eb"}>
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
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* ── Tap area ── */}
      <div
        className="mc2-card-tap"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onKeyDown={(e) => e.key === "Enter" && onToggle()}
      >
        {/* Left accent bar */}
        <div className="mc2-accent-bar" style={{ background: cat.grad }} />

        {/* Badge */}
        <div className="mc2-badge" style={{ background: cat.light, color: cat.text }}>
          <span className="mc2-badge-emoji">{cat.emoji}</span>
          <span className="mc2-badge-label">{cat.label}</span>
        </div>

        {/* Content */}
        <div className="mc2-content">
          <div className="mc2-top-row">
            <h3 className="mc2-name">{c.name}</h3>
            <span
              className="mc2-status"
              style={{
                background: open ? "#d1fae5" : "#fee2e2",
                color: open ? "#065f46" : "#991b1b",
              }}
            >
              <span className="mc2-status-dot" style={{ background: open ? "#10b981" : "#ef4444" }} />
              {open ? "Open" : "Closed"}
            </span>
          </div>

          <p className="mc2-address">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
            {c.address}
          </p>

          <div className="mc2-meta">
            <Stars rating={c.rating} />
            {c.reviewCount > 0 && (
              <span className="mc2-reviews">({c.reviewCount} reviews)</span>
            )}
            {km && <span className="mc2-km">📍 {km} km</span>}
          </div>

          {(c.classes || []).length > 0 && (
            <div className="mc2-chips">
              {c.classes.slice(0, 3).map((cl, i) => (
                <span key={i} className="mc2-chip" style={{ borderColor: cat.text, color: cat.text }}>
                  {cl}
                </span>
              ))}
              {c.classes.length > 3 && (
                <span className="mc2-chip mc2-chip-more" style={{ borderColor: cat.text, color: cat.text }}>
                  +{c.classes.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Chevron */}
        <div className={`mc2-chevron ${expanded ? "mc2-chevron--up" : ""}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* ── Expanded panel ── */}
      {expanded && (
        <div className="mc2-detail">
          <div className="mc2-detail-divider" style={{ background: cat.grad }} />

          {c.description && (
            <p className="mc2-desc">{c.description}</p>
          )}

          {(c.hours || []).length > 0 && (
            <div className="mc2-hours-note">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              <span>
                {open
                  ? "Currently open — check address for exact timings"
                  : "Currently closed — check address for opening hours"}
              </span>
            </div>
          )}

          <div className="mc2-actions">
            <a className="mc2-btn mc2-btn--dirs" href={mapsUrl} target="_blank" rel="noreferrer">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polygon points="3 11 22 2 13 21 11 13 3 11" />
              </svg>
              Directions
            </a>
            {c.phone && (
              <a className="mc2-btn mc2-btn--call" href={`tel:${c.phone.replace(/[^+0-9]/g, "")}`}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.38 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.54a16 16 0 0 0 6.29 6.29l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
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
    { id: "All", icon: "✦" },
    { id: "Top Rated", icon: "★" },
    { id: "Open Now", icon: "🟢" },
    { id: "Nearby", icon: "📍" },
  ];

  return (
    <>
      {/* Hide global notification bell on this page */}
      <style>{HIDE_BELL_STYLE}</style>

      {/* ── Page CSS ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        /* === Shell === */
        .mc2-page {
          font-family: 'Inter', 'Segoe UI', sans-serif;
          min-height: 100dvh;
          max-width: 480px;
          margin: 0 auto;
          padding-bottom: 32px;
          position: relative;
          isolation: isolate;
          color: #0f0a1e;
          overflow-x: hidden;
        }

        /* blurred bg */
        .mc2-page::before {
          content: "";
          position: fixed; inset: 0; z-index: -2;
          background: radial-gradient(ellipse at 20% 0%, #ddd6fe 0%, transparent 60%),
                      radial-gradient(ellipse at 80% 100%, #fce7f3 0%, transparent 60%),
                      #f8f6ff;
        }

        /* === Header === */
        .mc2-header {
          background: linear-gradient(155deg, #5b21b6 0%, #7c3aed 45%, #a21caf 100%);
          padding: 40px 20px 32px;
          position: relative;
          overflow: hidden;
        }
        .mc2-header::before {
          content: "";
          position: absolute; inset: 0; z-index: 0;
          background:
            radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 50%),
            radial-gradient(circle at 10% 90%, rgba(255,255,255,0.08) 0%, transparent 40%);
        }
        .mc2-header-inner { position: relative; z-index: 1; }
        .mc2-back {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 12px;
          padding: 7px 14px;
          color: white; font-size: 13px; font-weight: 600;
          cursor: pointer;
          backdrop-filter: blur(8px);
          transition: background 0.2s;
          margin-bottom: 20px;
        }
        .mc2-back:hover { background: rgba(255,255,255,0.25); }
        .mc2-header h1 {
          font-size: 26px; font-weight: 900;
          color: #fff; margin: 0 0 6px;
          letter-spacing: -0.8px; line-height: 1.1;
        }
        .mc2-header-sub {
          color: rgba(255,255,255,0.75);
          font-size: 13px; font-weight: 500; margin: 0;
        }
        .mc2-header-count {
          display: inline-flex; align-items: center;
          margin-top: 14px;
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 20px; padding: 5px 14px;
          color: white; font-size: 12px; font-weight: 700;
          backdrop-filter: blur(6px);
          gap: 6px;
        }
        .mc2-header-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; }

        /* === Search === */
        .mc2-search-section {
          padding: 20px 16px 0;
        }
        .mc2-search-wrap {
          position: relative;
        }
        .mc2-search-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          font-size: 15px; z-index: 1; pointer-events: none;
        }
        .mc2-search {
          width: 100%; box-sizing: border-box;
          background: rgba(255,255,255,0.92);
          border: 1.5px solid #e9d5ff;
          border-radius: 16px;
          padding: 13px 14px 13px 42px;
          font-size: 14px; font-family: inherit;
          color: #0f0a1e; outline: none;
          box-shadow: 0 2px 16px rgba(124,58,237,0.08);
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .mc2-search:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 3.5px rgba(124,58,237,0.12);
        }
        .mc2-search::placeholder { color: #a78bfa; }

        /* === Filters === */
        .mc2-filters {
          display: flex; gap: 8px;
          padding: 14px 16px 0;
          overflow-x: auto; scrollbar-width: none;
        }
        .mc2-filters::-webkit-scrollbar { display: none; }
        .mc2-filter {
          flex-shrink: 0;
          display: flex; align-items: center; gap: 5px;
          border: 1.5px solid #ddd6fe;
          border-radius: 20px; padding: 7px 15px;
          font-size: 12.5px; font-weight: 600; font-family: inherit;
          cursor: pointer;
          background: rgba(255,255,255,0.75);
          color: #6d28d9;
          transition: all 0.18s;
          white-space: nowrap;
        }
        .mc2-filter.active {
          background: linear-gradient(135deg,#7c3aed,#a21caf);
          color: white; border-color: transparent;
          box-shadow: 0 4px 14px rgba(124,58,237,0.35);
        }
        .mc2-filter:not(.active):hover { background: #f5f3ff; border-color: #c4b5fd; }
        .mc2-locate {
          flex-shrink: 0; display: flex; align-items: center; gap: 5px;
          border: 1.5px dashed #c4b5fd;
          border-radius: 20px; padding: 7px 15px;
          font-size: 12.5px; font-weight: 600; font-family: inherit;
          cursor: pointer; background: transparent; color: #7c3aed;
          transition: background 0.18s;
        }
        .mc2-locate:hover { background: #f5f3ff; }
        .mc2-locate:disabled { opacity: 0.6; cursor: not-allowed; }

        /* === List header === */
        .mc2-list-hd {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 18px 10px;
        }
        .mc2-list-hd-left {
          display: flex; flex-direction: column; gap: 2px;
        }
        .mc2-list-hd h2 {
          font-size: 17px; font-weight: 800;
          color: #0f0a1e; margin: 0; letter-spacing: -0.4px;
        }
        .mc2-list-hd p {
          font-size: 12px; color: #7c3aed; margin: 0; font-weight: 500;
        }
        .mc2-badge-count {
          background: linear-gradient(135deg,#7c3aed,#a21caf);
          color: white; border-radius: 12px;
          padding: 4px 12px; font-size: 12px; font-weight: 700;
        }

        /* === Cards === */
        .mc2-list { padding: 0 14px; }
        .mc2-card {
          background: rgba(255,255,255,0.82);
          backdrop-filter: blur(16px);
          border-radius: 22px;
          margin-bottom: 14px;
          border: 1.5px solid rgba(255,255,255,0.7);
          box-shadow: 0 4px 24px rgba(15,10,30,0.07), 0 1px 4px rgba(124,58,237,0.06);
          overflow: hidden;
          animation: mc2FadeUp 0.35s ease both;
          transition: box-shadow 0.22s, transform 0.22s, border-color 0.22s;
        }
        @keyframes mc2FadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mc2-card:hover {
          box-shadow: 0 12px 40px rgba(124,58,237,0.16), 0 2px 8px rgba(15,10,30,0.08);
          transform: translateY(-2px);
        }
        .mc2-card--open {
          border-color: #c4b5fd;
          box-shadow: 0 8px 32px rgba(124,58,237,0.18);
        }

        .mc2-card-tap {
          display: flex; align-items: stretch;
          cursor: pointer; gap: 0; padding: 0;
          user-select: none;
          min-height: 92px;
        }

        /* accent left bar */
        .mc2-accent-bar {
          width: 5px; flex-shrink: 0;
          border-radius: 22px 0 0 22px;
          transition: width 0.2s;
        }
        .mc2-card--open .mc2-accent-bar { width: 6px; }

        /* badge block */
        .mc2-badge {
          flex-shrink: 0; width: 64px;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 4px;
          margin: 12px 0 12px 10px;
          border-radius: 16px; padding: 10px 6px;
        }
        .mc2-badge-emoji { font-size: 24px; line-height: 1; }
        .mc2-badge-label { font-size: 9px; font-weight: 700; text-align: center; line-height: 1.2; }

        /* content */
        .mc2-content { flex: 1; min-width: 0; padding: 14px 8px 14px 10px; }
        .mc2-top-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 4px; }
        .mc2-name {
          font-size: 13.5px; font-weight: 700; color: #0f0a1e;
          margin: 0; line-height: 1.3; flex: 1;
        }
        .mc2-status {
          flex-shrink: 0; display: flex; align-items: center; gap: 4px;
          font-size: 10px; font-weight: 700;
          border-radius: 8px; padding: 3px 8px;
          white-space: nowrap;
        }
        .mc2-status-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

        .mc2-address {
          display: flex; align-items: center; gap: 4px;
          font-size: 11.5px; color: #6b7280; margin: 0 0 7px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .mc2-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
        .mc2-stars { display: flex; align-items: center; gap: 2px; }
        .mc2-rating-val { font-size: 12px; font-weight: 700; color: #92400e; margin-left: 4px; }
        .mc2-reviews { font-size: 11px; color: #9ca3af; }
        .mc2-km { font-size: 11px; color: #6366f1; font-weight: 600;
          background: #eef2ff; border-radius: 8px; padding: 2px 7px; }

        /* chips */
        .mc2-chips { display: flex; flex-wrap: wrap; gap: 4px; }
        .mc2-chip {
          font-size: 9.5px; font-weight: 600;
          border: 1px solid; border-radius: 7px;
          padding: 2px 8px; background: transparent; white-space: nowrap;
        }
        .mc2-chip-more { opacity: 0.65; }

        /* chevron */
        .mc2-chevron {
          flex-shrink: 0; display: flex; align-items: center;
          padding: 0 14px 0 4px;
          transition: transform 0.25s;
        }
        .mc2-chevron--up { transform: rotate(180deg); }

        /* ── Expanded Detail ── */
        .mc2-detail {
          padding: 0 16px 18px;
          animation: mc2Reveal 0.22s ease;
        }
        @keyframes mc2Reveal {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mc2-detail-divider {
          height: 2px; border-radius: 2px;
          margin-bottom: 14px; opacity: 0.3;
        }
        .mc2-desc {
          font-size: 13px; color: #374151;
          line-height: 1.7; margin: 0 0 14px;
        }
        .mc2-hours-note {
          display: flex; align-items: center; gap: 7px;
          background: #f5f3ff; border-radius: 10px;
          padding: 9px 12px; margin-bottom: 14px;
          font-size: 12px; color: #5b21b6; font-weight: 500;
        }
        .mc2-actions { display: flex; gap: 10px; flex-wrap: wrap; }
        .mc2-btn {
          flex: 1; min-width: 120px;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          border: none; border-radius: 14px;
          padding: 12px 16px;
          font-size: 13px; font-weight: 700; font-family: inherit;
          text-decoration: none; cursor: pointer;
          transition: opacity 0.15s, transform 0.15s, box-shadow 0.15s;
        }
        .mc2-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .mc2-btn--dirs {
          background: linear-gradient(135deg,#7c3aed,#a21caf);
          color: white;
          box-shadow: 0 4px 14px rgba(124,58,237,0.38);
        }
        .mc2-btn--call {
          background: #f5f3ff; color: #6d28d9;
          border: 1.5px solid #ddd6fe;
          flex: 1.4;
          font-size: 12px;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }

        /* === States === */
        .mc2-error {
          margin: 10px 16px 0;
          background: #fef2f2; border: 1px solid #fecaca;
          border-radius: 12px; padding: 10px 14px;
          font-size: 12.5px; color: #991b1b; font-weight: 500;
        }
        .mc2-hint {
          font-size: 12px; color: #7c3aed; font-weight: 500;
          padding: 8px 18px 0; display: flex; align-items: center; gap: 5px;
        }

        /* Loading */
        .mc2-loading {
          display: flex; flex-direction: column; align-items: center;
          padding: 80px 24px; gap: 18px;
        }
        .mc2-spinner-ring {
          width: 48px; height: 48px;
          border: 3px solid #ede9fe;
          border-top-color: #7c3aed;
          border-radius: 50%;
          animation: mc2Spin 0.75s linear infinite;
        }
        @keyframes mc2Spin { to { transform: rotate(360deg); } }
        .mc2-loading p { font-size: 14px; color: #7c3aed; font-weight: 600; margin: 0; }

        /* Empty */
        .mc2-empty {
          display: flex; flex-direction: column; align-items: center;
          padding: 72px 24px; text-align: center; gap: 10px;
        }
        .mc2-empty-icon {
          width: 80px; height: 80px;
          background: linear-gradient(135deg,#ede9fe,#fce7f3);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 38px; margin-bottom: 4px;
        }
        .mc2-empty h3 { font-size: 16px; font-weight: 700; color: #1e1b2e; margin: 0; }
        .mc2-empty p { font-size: 13px; color: #9ca3af; margin: 0; }
      `}</style>

      <div className="mc2-page">

        {/* ── Header ── */}
        <div className="mc2-header">
          <div className="mc2-header-inner">
            <button className="mc2-back" onClick={() => navigate("/dashboard")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Dashboard
            </button>
            <h1>🧘 Meditation Centers</h1>
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
            <span className="mc2-search-icon">🔍</span>
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
              {f.icon} {f.id}
            </button>
          ))}
          <button
            className="mc2-locate"
            onClick={locate}
            disabled={locating}
          >
            {locating ? "⏳" : "📡"} {locating ? "Locating…" : "Use Location"}
          </button>
        </div>

        {/* ── Hint / Error ── */}
        {filter === "Nearby" && !position && !loading && (
          <p className="mc2-hint">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            Tap "Use Location" to sort centers by distance.
          </p>
        )}
        {error && <p className="mc2-error" role="alert">⚠️ {error}</p>}

        {/* ── Content ── */}
        {loading ? (
          <div className="mc2-loading">
            <div className="mc2-spinner-ring" />
            <p>Loading centers…</p>
          </div>
        ) : list.length === 0 ? (
          <div className="mc2-empty">
            <div className="mc2-empty-icon">🌿</div>
            <h3>No Centers Found</h3>
            <p>{q ? `No results for "${q}". Try a different search.` : "Try changing your filter."}</p>
          </div>
        ) : (
          <>
            <div className="mc2-list-hd">
              <div className="mc2-list-hd-left">
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
                  onToggle={() =>
                    setExpandedId(expandedId === c._id ? null : c._id)
                  }
                  index={i}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
