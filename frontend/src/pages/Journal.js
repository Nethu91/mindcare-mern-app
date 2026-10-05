import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { apiError } from "../utils/apiError";
import bgImage from "../assets/mood-bg.jpeg";
import { Emoji3D } from "./MoodTracker";

/* ============================================================
   MOODS (value sent to the backend stays the same)
   ============================================================ */

const MOODS = [
  { name: "Happy", face: "Happy", color: "#FFD166" },
  { name: "Peaceful", face: "Calm", color: "#A8DADC" },
  { name: "Anxious", face: "Anxious", color: "#CDB4DB" },
  { name: "Sad", face: "Sad", color: "#B8C0FF" },
  { name: "Angry", face: "Angry", color: "#FF8FAB" },
];

const moodOf = (name) =>
  MOODS.find((m) => m.name === name) || {
    name,
    face: "Neutral",
    color: "#E5E0EA",
  };

/* ============================================================
   THEME – colours are picked automatically from the background
   photo so the banner / buttons always match it (no more purple)
   ============================================================ */

const buildTheme = (h = 168, s = 40) => ({
  hue: h,
  accent: `hsl(${h} ${s}% 52%)`,
  accentDark: `hsl(${h} ${s}% 36%)`,
  bannerFrom: `hsl(${h} ${s}% 56% / 0.93)`,
  bannerTo: `hsl(${h} ${s}% 38% / 0.93)`,
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
          // colourful, mid-tone pixels count more than white / grey / black
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
   SMALL 3D ICONS (pure SVG)
   ============================================================ */

let jUid = 0;
const useJUid = () => {
  const ref = useRef(null);
  if (ref.current === null) ref.current = `j3d${++jUid}`;
  return ref.current;
};

function Icon3D({ name, size = 32, hue = 168 }) {
  const u = useJUid();
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

  let content = null;

  if (name === "book") {
    content = (
      <g>
        <defs>
          {R("b", `hsl(${hue} 65% 86%)`, `hsl(${hue} 50% 55%)`, `hsl(${hue} 55% 30%)`)}
          {R("p", "#FFFFFF", "#F6F1E6", "#DDD2BC")}
        </defs>
        <rect x="22" y="24" width="62" height="62" rx="8" fill={`hsl(${hue} 55% 24%)`} />
        <rect x="20" y="22" width="58" height="60" rx="5" fill={f("p")} />
        <rect x="14" y="16" width="62" height="64" rx="8" fill={f("b")} />
        <rect x="14" y="16" width="9" height="64" rx="4" fill="#000" opacity="0.18" />
        <rect x="32" y="34" width="34" height="6" rx="3" fill="#fff" opacity="0.9" />
        <rect x="32" y="46" width="26" height="5" rx="2.5" fill="#fff" opacity="0.7" />
        <path d="M60 16 V38 L65 33 L70 38 V16 Z" fill="#FF6B6B" />
        {gloss(30, 24, 9, 3.5, -10, 0.55)}
      </g>
    );
  } else if (name === "plus") {
    content = (
      <g>
        <defs>
          {R("g", `hsl(${hue} 60% 80%)`, `hsl(${hue} 50% 52%)`, `hsl(${hue} 55% 30%)`)}
        </defs>
        <circle cx="50" cy="50" r="42" fill={f("g")} />
        <path d="M50 28 V72 M28 50 H72" stroke="#fff" strokeWidth="11" strokeLinecap="round" />
        {gloss(36, 26, 14, 6, -30, 0.5)}
      </g>
    );
  } else if (name === "close") {
    content = (
      <g>
        <defs>{R("g", "#FFD0D0", "#F2646A", "#B8232F")}</defs>
        <circle cx="50" cy="50" r="42" fill={f("g")} />
        <path d="M32 32 L68 68 M68 32 L32 68" stroke="#fff" strokeWidth="11" strokeLinecap="round" />
        {gloss(36, 26, 14, 6, -30, 0.5)}
      </g>
    );
  } else if (name === "trash") {
    content = (
      <g>
        <defs>{R("t", "#FFC9C9", "#F2646A", "#B8232F")}</defs>
        <rect x="38" y="12" width="24" height="12" rx="5" fill="none" stroke="#B8232F" strokeWidth="6" />
        <rect x="18" y="22" width="64" height="12" rx="6" fill={f("t")} />
        <path d="M26 38 H74 L69 86 Q68.5 91 63.5 91 H36.5 Q31.5 91 31 86 Z" fill={f("t")} />
        <rect x="40" y="48" width="6" height="30" rx="3" fill="#fff" opacity="0.65" />
        <rect x="54" y="48" width="6" height="30" rx="3" fill="#fff" opacity="0.65" />
        {gloss(34, 28, 8, 3, -10, 0.7)}
      </g>
    );
  } else if (name === "calendar") {
    content = (
      <g>
        <defs>
          {R("c", "#FFFFFF", "#F4F1EA", "#D8D0BE")}
          {R("h", `hsl(${hue} 60% 78%)`, `hsl(${hue} 50% 52%)`, `hsl(${hue} 55% 30%)`)}
        </defs>
        <rect x="14" y="20" width="72" height="68" rx="12" fill={f("c")} />
        <path d="M14 32 a12 12 0 0 1 12 -12 H74 a12 12 0 0 1 12 12 V44 H14 Z" fill={f("h")} />
        <rect x="30" y="10" width="8" height="18" rx="4" fill="#4a2508" />
        <rect x="62" y="10" width="8" height="18" rx="4" fill="#4a2508" />
        <circle cx="34" cy="62" r="5" fill={`hsl(${hue} 50% 52%)`} />
        <circle cx="50" cy="62" r="5" fill={`hsl(${hue} 50% 52%)`} />
        <circle cx="66" cy="62" r="5" fill={`hsl(${hue} 50% 52%)`} />
        <circle cx="34" cy="77" r="5" fill={`hsl(${hue} 50% 52%)`} />
        {gloss(30, 28, 9, 3, -10, 0.6)}
      </g>
    );
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
   JOURNAL PAGE
   ============================================================ */

export default function Journal() {
  const navigate = useNavigate();
  const theme = useImageTheme(bgImage);
  const S = useMemo(() => makeStyles(theme), [theme]);

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    title: "",
    content: "",
    mood: "Happy",
    tags: "",
  });

  useEffect(() => {
    API.get("/wellbeing/journal")
      .then((r) => setEntries(r.data))
      .catch((e) => setError(apiError(e)))
      .finally(() => setLoading(false));
  }, []);

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await API.post("/wellbeing/journal", {
        ...draft,
        tags: draft.tags
          .split(",")
          .map((t) => t.trim().replace(/^#/, ""))
          .filter(Boolean),
      });
      setEntries([r.data, ...entries]);
      setOpen(false);
      setDraft({ title: "", content: "", mood: "Happy", tags: "" });
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this journal entry?")) return;
    setBusy(true);
    try {
      await API.delete(`/wellbeing/journal/${id}`);
      setEntries(entries.filter((e) => e._id !== id));
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  const now = new Date();
  const thisMonth = entries.filter((e) => {
    const d = new Date(e.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

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
        <button style={S.back} onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>

        {/* Banner */}
        <div style={S.banner}>
          <div style={S.bannerIcon}>
            <Icon3D name="book" size={46} hue={theme.hue} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h1 style={S.bannerTitle}>My Journal</h1>
            <p style={S.bannerText}>
              Your private reflection space. Entries are saved to your account.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div style={S.statsRow}>
          <div style={S.statChip}>
            <Icon3D name="book" size={30} hue={theme.hue} />
            <div>
              <div style={S.statNum}>{entries.length}</div>
              <div style={S.statLabel}>Entries</div>
            </div>
          </div>
          <div style={S.statChip}>
            <Icon3D name="calendar" size={30} hue={theme.hue} />
            <div>
              <div style={S.statNum}>{thisMonth}</div>
              <div style={S.statLabel}>This month</div>
            </div>
          </div>
        </div>

        {error && (
          <p role="alert" style={S.error}>
            {error}
          </p>
        )}

        <button style={S.newBtn} onClick={() => setOpen(!open)}>
          <Icon3D name={open ? "close" : "plus"} size={26} hue={theme.hue} />
          {open ? "Close" : "New Entry"}
        </button>

        {open && (
          <form onSubmit={save} style={S.card}>
            <label style={S.label}>
              Title
              <input
                required
                maxLength={150}
                style={S.input}
                placeholder="Give this entry a title"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </label>

            <div style={S.label}>How are you feeling?</div>
            <div style={S.moodGrid}>
              {MOODS.map((m) => {
                const active = draft.mood === m.name;
                return (
                  <button
                    type="button"
                    key={m.name}
                    onClick={() => setDraft({ ...draft, mood: m.name })}
                    style={{
                      ...S.moodChip,
                      border: active
                        ? `3px solid ${m.color}`
                        : "1px solid rgba(255,255,255,0.8)",
                      background: active
                        ? `linear-gradient(145deg, #fff, ${m.color})`
                        : "rgba(255,255,255,0.65)",
                      transform: active ? "translateY(-4px) scale(1.05)" : "none",
                    }}
                  >
                    <Emoji3D name={m.face} size={40} />
                    <span style={S.moodName}>{m.name}</span>
                  </button>
                );
              })}
            </div>

            <label style={S.label}>
              Your thoughts
              <textarea
                required
                maxLength={20000}
                style={S.textarea}
                placeholder="Write freely, this is just for you..."
                value={draft.content}
                onChange={(e) => setDraft({ ...draft, content: e.target.value })}
              />
            </label>

            <label style={S.label}>
              Tags (comma separated)
              <input
                style={S.input}
                placeholder="gratitude, study, family"
                value={draft.tags}
                onChange={(e) => setDraft({ ...draft, tags: e.target.value })}
              />
            </label>

            <button style={{ ...S.saveBtn, opacity: busy ? 0.7 : 1 }} disabled={busy}>
              {busy ? "Saving..." : "Save Entry"}
            </button>
          </form>
        )}

        <h2 style={S.sectionTitle}>Recent Entries</h2>

        {loading ? (
          <div style={S.empty}>
            <p style={S.emptyText}>Loading…</p>
          </div>
        ) : (
          !entries.length && (
            <div style={S.empty}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                <Emoji3D name="Calm" size={56} />
              </div>
              <p style={S.emptyText}>No entries yet. Write your first reflection.</p>
            </div>
          )
        )}

        <div style={{ display: "grid", gap: 14 }}>
          {entries.map((e) => {
            const m = moodOf(e.mood);
            return (
              <article key={e._id} style={S.entry}>
                <div style={S.entryTop}>
                  <div style={{ ...S.entryEmoji, backgroundColor: m.color }}>
                    <Emoji3D name={m.face} size={40} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h3 style={S.entryTitle}>{e.title}</h3>
                    <p style={S.entryMeta}>
                      <Icon3D name="calendar" size={14} hue={theme.hue} />
                      {new Date(e.createdAt).toLocaleDateString()} · {e.mood}
                    </p>
                  </div>
                </div>

                <p style={S.entryText}>{e.content}</p>

                {(e.tags || []).length > 0 && (
                  <div style={S.tagRow}>
                    {e.tags.map((t) => (
                      <span key={t} style={S.tag}>
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                <button style={S.delBtn} disabled={busy} onClick={() => remove(e._id)}>
                  <Icon3D name="trash" size={16} />
                  Delete
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   STYLES
   ============================================================ */

const glass = {
  background: "rgba(255,255,255,0.6)",
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
  },
  back: {
    border: "none",
    padding: "10px 16px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.7)",
    color: t.ink,
    fontWeight: "800",
    cursor: "pointer",
    marginBottom: "14px",
    boxShadow: "0 10px 24px rgba(30,30,40,0.1)",
  },
  banner: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "20px",
    borderRadius: "28px",
    background: `linear-gradient(135deg, ${t.bannerFrom}, ${t.bannerTo})`,
    boxShadow: "0 18px 40px rgba(30,30,40,0.2)",
    border: "1px solid rgba(255,255,255,0.35)",
    marginBottom: "16px",
  },
  bannerIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.28)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  bannerTitle: {
    margin: "0 0 4px",
    color: "#fff",
    fontSize: "26px",
    fontWeight: "800",
  },
  bannerText: {
    margin: 0,
    color: "rgba(255,255,255,0.9)",
    fontSize: "13px",
    lineHeight: "1.5",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "16px",
  },
  statChip: {
    ...glass,
    borderRadius: "22px",
    padding: "14px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  statNum: {
    color: t.ink,
    fontSize: "22px",
    fontWeight: "800",
    lineHeight: "1.1",
  },
  statLabel: {
    color: t.text,
    fontSize: "12px",
    fontWeight: "600",
  },
  error: {
    color: "#b91c1c",
    background: "rgba(254,226,226,0.92)",
    padding: "10px 14px",
    borderRadius: "14px",
    marginBottom: "14px",
    textAlign: "center",
    fontSize: "14px",
  },
  newBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "14px",
    border: "none",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.8)",
    color: t.ink,
    fontSize: "16px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 12px 26px rgba(30,30,40,0.12)",
    marginBottom: "16px",
  },
  card: {
    ...glass,
    borderRadius: "28px",
    padding: "20px",
    marginBottom: "18px",
  },
  label: {
    display: "block",
    color: t.ink,
    fontSize: "14px",
    fontWeight: "700",
    marginBottom: "14px",
  },
  input: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    marginTop: "8px",
    border: "none",
    outline: "none",
    borderRadius: "18px",
    padding: "14px 16px",
    fontSize: "15px",
    fontFamily: "inherit",
    color: t.ink,
    background: "rgba(255,255,255,0.85)",
    boxShadow: "inset 0 0 14px rgba(30,30,40,0.07)",
  },
  textarea: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    marginTop: "8px",
    height: "130px",
    resize: "none",
    border: "none",
    outline: "none",
    borderRadius: "20px",
    padding: "14px 16px",
    fontSize: "15px",
    fontFamily: "inherit",
    color: t.ink,
    background: "rgba(255,255,255,0.85)",
    boxShadow: "inset 0 0 14px rgba(30,30,40,0.07)",
  },
  moodGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "8px",
    marginBottom: "16px",
  },
  moodChip: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    padding: "10px 2px 8px",
    borderRadius: "18px",
    cursor: "pointer",
    boxShadow: "0 8px 16px rgba(30,30,40,0.1)",
    transition: "0.3s ease",
    minWidth: 0,
  },
  moodName: {
    fontSize: "10.5px",
    fontWeight: "800",
    color: t.ink,
  },
  saveBtn: {
    width: "100%",
    padding: "15px",
    border: "none",
    borderRadius: "22px",
    background: `linear-gradient(135deg, ${t.accent}, ${t.accentDark})`,
    color: "#fff",
    fontSize: "16px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 14px 28px rgba(30,30,40,0.22)",
  },
  sectionTitle: {
    color: t.ink,
    fontSize: "21px",
    fontWeight: "800",
    margin: "6px 0 14px",
  },
  empty: {
    ...glass,
    borderRadius: "22px",
    padding: "28px",
    textAlign: "center",
  },
  emptyText: {
    margin: 0,
    color: t.text,
  },
  entry: {
    ...glass,
    borderRadius: "26px",
    padding: "18px",
  },
  entryTop: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
  },
  entryEmoji: {
    width: "56px",
    height: "56px",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 20px rgba(30,30,40,0.14)",
    flexShrink: 0,
  },
  entryTitle: {
    margin: "0 0 4px",
    color: t.ink,
    fontSize: "17px",
    fontWeight: "800",
    wordBreak: "break-word",
  },
  entryMeta: {
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: t.text,
    fontSize: "12px",
    fontWeight: "600",
  },
  entryText: {
    margin: "0 0 12px",
    color: t.text,
    lineHeight: "1.65",
    fontSize: "14px",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  tagRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginBottom: "12px",
  },
  tag: {
    background: "rgba(255,255,255,0.8)",
    border: `1px solid ${t.line}`,
    color: t.accentDark,
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "700",
  },
  delBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    border: "none",
    background: "rgba(254,226,226,0.9)",
    color: "#B8232F",
    padding: "8px 14px",
    borderRadius: "14px",
    fontSize: "13px",
    fontWeight: "800",
    cursor: "pointer",
  },
});