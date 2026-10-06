import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import BottomNav from "../components/BottomNav";
import bgImage from "../assets/mood-bg.jpeg";

/* ============================================================
   3D ICONS (pure SVG, same style as Meditation page)
   ============================================================ */
let iconUid = 0;
const useIconUid = () => {
  const ref = useRef(null);
  if (ref.current === null) ref.current = `med3d${++iconUid}`;
  return ref.current;
};

const sparklePts = (x, y, s) =>
  `${x},${y - s} ${x + s * 0.3},${y - s * 0.3} ${x + s},${y} ${x + s * 0.3},${y + s * 0.3} ${x},${y + s} ${x - s * 0.3},${y + s * 0.3} ${x - s},${y} ${x - s * 0.3},${y - s * 0.3}`;

function Icon3D({ name, size = 48, muted = false, style }) {
  const u = useIconUid();
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
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#fff" opacity={o} transform={`rotate(${rot} ${cx} ${cy})`} />
  );

  let content = null;
  switch (name) {
    case "pill":
      content = (
        <g>
          <defs>
            {R("a", "#FFD1E3", "#FF7FB0", "#D93D82")}
            {R("b", "#FFFFFF", "#F1ECFA", "#C9BCE0")}
          </defs>
          <g transform="rotate(-40 50 50)">
            <rect x="14" y="32" width="72" height="36" rx="18" fill={f("b")} />
            <path d="M50 32 H68 A18 18 0 0 1 68 68 H50 Z" fill={f("a")} />
            {gloss(34, 41, 13, 3.5, 0, 0.85)}
            {gloss(66, 41, 8, 3, 0, 0.55)}
          </g>
          <polygon points={sparklePts(82, 20, 8)} fill="#fff" />
        </g>
      );
      break;
    case "clock":
      content = (
        <g>
          <defs>{R("ck", "#FFFFFF", "#EDE4FA", "#B9A2E0")}</defs>
          <circle cx="50" cy="50" r="42" fill={f("ck")} stroke="#8E52E0" strokeWidth="7" />
          <path d="M50 50 V26" stroke="#4a2a7a" strokeWidth="6" strokeLinecap="round" />
          <path d="M50 50 L67 60" stroke="#4a2a7a" strokeWidth="6" strokeLinecap="round" />
          <circle cx="50" cy="50" r="5" fill="#8E52E0" />
          {gloss(34, 30, 9, 4, -35, 0.8)}
        </g>
      );
      break;
    case "bell":
      content = (
        <g>
          <defs>
            {muted ? R("bl", "#F4F0FA", "#CFC6DD", "#9A8DB0") : R("bl", "#FFF3B0", "#FFC93C", "#E08A00")}
          </defs>
          <circle cx="50" cy="12" r="6" fill={f("bl")} />
          <path d="M50 14 C34 14 28 28 28 44 V58 L16 72 H84 L72 58 V44 C72 28 66 14 50 14 Z" fill={f("bl")} />
          <ellipse cx="50" cy="81" rx="10" ry="8" fill={f("bl")} />
          {gloss(40, 36, 6, 13, -15, 0.6)}
          {muted && (
            <g>
              <line x1="18" y1="18" x2="84" y2="90" stroke="#fff" strokeWidth="12" strokeLinecap="round" />
              <line x1="18" y1="18" x2="84" y2="90" stroke="#E0455C" strokeWidth="7" strokeLinecap="round" />
            </g>
          )}
        </g>
      );
      break;
    case "check":
      content = (
        <g>
          <defs>{R("g", "#BDF7CF", "#3FCB6E", "#17913F")}</defs>
          <circle cx="50" cy="50" r="42" fill={f("g")} />
          <path d="M29 52 L44 67 L72 35" fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
          {gloss(36, 26, 14, 6, -30, 0.55)}
        </g>
      );
      break;
    case "lotus":
      content = (
        <g>
          <defs>
            {R("l", "#FFE6F1", "#FFB3D1", "#F27FAE")}
            {R("pc", "#FFF0F6", "#FF9EC6", "#E0508F")}
            {R("lf", "#C8F7B4", "#5FCB5B", "#2E8E3E")}
          </defs>
          <ellipse cx="50" cy="86" rx="36" ry="9" fill={f("lf")} />
          {[-68, 68, -36, 36].map((a) => (
            <path key={a} d="M50 18 C63 36 63 60 50 82 C37 60 37 36 50 18 Z" fill={f("l")} transform={`rotate(${a} 50 82)`} />
          ))}
          <path d="M50 14 C64 34 64 60 50 82 C36 60 36 34 50 14 Z" fill={f("pc")} />
          {gloss(45, 36, 4, 11, 8, 0.6)}
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
        filter: "drop-shadow(0 4px 4px rgba(49,34,68,0.28))",
        ...style,
      }}
    >
      {content}
    </svg>
  );
}

/* ============================================================
   HELPERS
   ============================================================ */
const errMsg = (e) =>
  e.response?.data?.message || "Unable to connect. Please try again.";

const fmt = (t) => {
  const [h, m] = (t || "").split(":").map(Number);
  if (Number.isNaN(h)) return t;
  return `${h % 12 || 12}:${String(m || 0).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

const ICON_BG = ["#A8DADC", "#CDB4DB", "#FFAFCC", "#FFD6A5", "#B8C0FF"];

/* ---------- 3D button ---------- */
const BTN = {
  purple: {
    face: "linear-gradient(135deg,#9B5DE5,#F15BB5)",
    edge: "#6D2FB8",
    glow: "rgba(155,93,229,0.35)",
    text: "#fff",
  },
  red: {
    face: "linear-gradient(135deg,#FB7185,#EF4444)",
    edge: "#B91C1C",
    glow: "rgba(239,68,68,0.35)",
    text: "#fff",
  },
  soft: {
    face: "linear-gradient(180deg,#FFFFFF,#EDE9FE)",
    edge: "#C4B5FD",
    glow: "rgba(124,58,237,0.18)",
    text: "#6D28D9",
  },
};

function Btn3D({ children, color = "purple", onClick, disabled, type = "button", style }) {
  const [down, setDown] = useState(false);
  const c = BTN[color];
  const up = () => setDown(false);
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onPointerDown={() => setDown(true)}
      onPointerUp={up}
      onPointerLeave={up}
      onPointerCancel={up}
      style={{
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        color: c.text,
        fontWeight: 800,
        fontSize: 16,
        fontFamily: "inherit",
        borderRadius: 18,
        padding: "14px 18px",
        background: c.face,
        boxShadow: down
          ? `0 2px 0 ${c.edge}, 0 4px 8px ${c.glow}`
          : `0 6px 0 ${c.edge}, 0 12px 20px ${c.glow}, inset 0 2px 0 rgba(255,255,255,0.4)`,
        transform: down ? "translateY(4px)" : "translateY(0)",
        transition: "transform .08s, box-shadow .08s",
        opacity: disabled ? 0.6 : 1,
        WebkitTapHighlightColor: "transparent",
        touchAction: "manipulation",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      style={{
        width: 56,
        height: 32,
        borderRadius: 20,
        border: "none",
        padding: 3,
        cursor: "pointer",
        background: on
          ? "linear-gradient(135deg,#9B5DE5,#F15BB5)"
          : "linear-gradient(180deg,#CBD5E1,#E2E8F0)",
        boxShadow: "inset 0 3px 6px rgba(0,0,0,0.25), 0 2px 0 rgba(255,255,255,0.7)",
        display: "flex",
        justifyContent: on ? "flex-end" : "flex-start",
        flexShrink: 0,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <span
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 30%,#fff,#E9D5FF)",
          boxShadow: "0 3px 6px rgba(0,0,0,0.3)",
        }}
      />
    </button>
  );
}

const emptyForm = {
  medicineName: "",
  dosage: "",
  time: "08:00",
  note: "",
  reminderEnabled: true,
};

/* ============================================================
   PAGE
   ============================================================ */
export default function Medication() {
  const navigate = useNavigate();
  const [meds, setMeds] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    try {
      const res = await API.get("/medications");
      setMeds(res.data);
      setError("");
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const sorted = useMemo(
    () => [...meds].sort((a, b) => a.time.localeCompare(b.time)),
    [meds]
  );

  const activeCount = meds.filter((m) => m.reminderEnabled).length;

  const next = useMemo(() => {
    const on = sorted.filter((m) => m.reminderEnabled);
    if (!on.length) return null;
    const d = new Date();
    const cur = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    return on.find((m) => m.time >= cur) || on[0];
  }, [sorted]);

  const flash = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 2500);
  };

  const add = async (e) => {
    e.preventDefault();
    if (!form.medicineName.trim() || !form.time) {
      setError("Medicine name and time are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await API.post("/medications", { ...form, medicineName: form.medicineName.trim() });
      setForm(emptyForm);
      await load();
      flash("Reminder added");
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this reminder?")) return;
    try {
      await API.delete(`/medications/${id}`);
      setMeds((m) => m.filter((x) => x._id !== id));
      flash("Reminder deleted");
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const toggle = async (med, value) => {
    setMeds((m) => m.map((x) => (x._id === med._id ? { ...x, reminderEnabled: value } : x)));
    try {
      await API.put(`/medications/${med._id}`, { reminderEnabled: value });
    } catch (err) {
      setMeds((m) => m.map((x) => (x._id === med._id ? { ...x, reminderEnabled: !value } : x)));
      setError(errMsg(err));
    }
  };

  return (
    <div style={S.page}>
      <div style={{ ...S.bgBlur, backgroundImage: `url(${bgImage})` }} />
      <div style={S.bgPhone}>
        <div
          style={{
            ...S.bgPhoneImage,
            backgroundImage: `linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.22)), url(${bgImage})`,
          }}
        />
      </div>

      <div style={S.container}>
        {/* header */}
        <div style={S.header}>
          <Btn3D
            color="soft"
            onClick={() => navigate("/dashboard")}
            style={{ padding: "10px 16px", fontSize: 14, marginBottom: 8 }}
          >
            ← Back to Dashboard
          </Btn3D>
          <h1 style={S.title}>Medication</h1>
          <p style={S.subtitle}>
            Keep track of your medicines and never miss a dose.
          </p>
        </div>

        {error && <div style={S.errorBox}>{error}</div>}
        {success && <div style={S.successBox}>{success}</div>}

        {/* hero / next dose */}
        <div style={S.heroCard}>
          <div style={{ minWidth: 0 }}>
            <div style={S.heroLabel}>Next dose</div>
            {next ? (
              <>
                <div style={S.heroTime}>{fmt(next.time)}</div>
                <div style={S.heroText}>
                  {next.medicineName}
                  {next.dosage ? ` · ${next.dosage}` : ""}
                </div>
              </>
            ) : (
              <div style={S.heroText}>No active reminders yet. Add one below.</div>
            )}
          </div>
          <div style={S.heroIcon}>
            <Icon3D name={next ? "clock" : "lotus"} size={46} />
          </div>
        </div>

        {/* stats */}
        <div style={S.statsGrid}>
          <div style={S.statCard}>
            <div style={S.statIcon}>
              <Icon3D name="pill" size={30} />
            </div>
            <h3 style={S.statNumber}>{meds.length}</h3>
            <p style={S.statText}>Medicines</p>
          </div>
          <div style={S.statCard}>
            <div style={S.statIcon}>
              <Icon3D name="bell" size={28} />
            </div>
            <h3 style={S.statNumber}>{activeCount}</h3>
            <p style={S.statText}>Active</p>
          </div>
          <div style={S.statCard}>
            <div style={S.statIcon}>
              <Icon3D name="bell" size={28} muted />
            </div>
            <h3 style={S.statNumber}>{meds.length - activeCount}</h3>
            <p style={S.statText}>Paused</p>
          </div>
        </div>

        {/* add form */}
        <form style={S.card} onSubmit={add}>
          <div style={S.cardHead}>
            <h2 style={S.sectionTitle}>Add reminder</h2>
            <div style={S.panelIcon}>
              <Icon3D name="pill" size={34} />
            </div>
          </div>

          <label style={S.label}>Medicine name</label>
          <input
            style={S.input}
            placeholder="e.g. Vitamin D"
            value={form.medicineName}
            onChange={(e) => setForm({ ...form, medicineName: e.target.value })}
          />

          <div style={S.row}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <label style={S.label}>Dosage</label>
              <input
                style={S.input}
                placeholder="1 tablet"
                value={form.dosage}
                onChange={(e) => setForm({ ...form, dosage: e.target.value })}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <label style={S.label}>Time</label>
              <input
                style={S.input}
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>
          </div>

          <label style={S.label}>Note (optional)</label>
          <textarea
            style={{ ...S.input, minHeight: 70, resize: "none" }}
            placeholder="After meals..."
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />

          <div style={{ ...S.row, margin: "10px 0 18px" }}>
            <Icon3D name="bell" size={22} muted={!form.reminderEnabled} />
            <span style={S.toggleText}>Reminder {form.reminderEnabled ? "on" : "off"}</span>
            <Toggle
              on={form.reminderEnabled}
              onChange={(v) => setForm({ ...form, reminderEnabled: v })}
            />
          </div>

          <Btn3D type="submit" disabled={saving} style={{ width: "100%" }}>
            {saving ? "Saving..." : "Save Reminder"}
          </Btn3D>
        </form>

        {/* list */}
        <h2 style={{ ...S.sectionTitle, margin: "24px 4px 14px" }}>Your reminders</h2>

        {loading ? (
          <div style={{ ...S.card, textAlign: "center" }}>Loading...</div>
        ) : sorted.length === 0 ? (
          <div style={{ ...S.card, textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Icon3D name="lotus" size={70} />
            </div>
            <p style={{ margin: "12px 0 0", color: "#6D597A", fontSize: 14 }}>
              No reminders yet. Add your first one above.
            </p>
          </div>
        ) : (
          sorted.map((m, i) => (
            <div
              key={m._id}
              style={{ ...S.card, opacity: m.reminderEnabled ? 1 : 0.72, padding: 16 }}
            >
              <div style={S.row}>
                <div style={{ ...S.itemIcon, backgroundColor: ICON_BG[i % ICON_BG.length] }}>
                  <Icon3D name="pill" size={38} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={S.medName}>{m.medicineName}</h3>
                  <div style={S.metaRow}>
                    <span style={S.metaBadge}>
                      <Icon3D name="clock" size={14} /> {fmt(m.time)}
                    </span>
                    {m.dosage ? (
                      <span style={S.metaBadge}>
                        <Icon3D name="pill" size={15} /> {m.dosage}
                      </span>
                    ) : null}
                    <span style={S.metaBadge}>
                      <Icon3D name={m.reminderEnabled ? "check" : "bell"} size={14} muted={!m.reminderEnabled} />
                      {m.reminderEnabled ? "Active" : "Paused"}
                    </span>
                  </div>
                </div>

                <Toggle on={m.reminderEnabled} onChange={(v) => toggle(m, v)} />
              </div>

              {m.note ? <p style={S.note}>{m.note}</p> : null}

              <Btn3D
                color="red"
                onClick={() => remove(m._id)}
                style={{ width: "100%", marginTop: 14, padding: "10px 14px", fontSize: 14 }}
              >
                Delete
              </Btn3D>
            </div>
          ))
        )}
      </div>

      <BottomNav />
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
  boxShadow: "0 18px 40px rgba(49,34,68,0.14)",
};

const S = {
  page: {
    position: "relative",
    minHeight: "100vh",
    padding: "20px 14px 120px",
    fontFamily: "'Poppins', Arial, sans-serif",
    boxSizing: "border-box",
    overflowX: "hidden",
    background: "#d9d3e6",
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
    maxWidth: 480,
    height: "100%",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    boxShadow: "0 0 40px rgba(0,0,0,0.15)",
  },
  container: { maxWidth: 480, margin: "0 auto", position: "relative", zIndex: 2 },
  header: { display: "flex", flexDirection: "column", alignItems: "flex-start", marginBottom: 20, gap: 4 },
  title: { fontSize: 30, color: "#312244", margin: "6px 0 4px", fontWeight: 900 },
  subtitle: { color: "#6D597A", fontSize: 14, margin: 0, lineHeight: 1.5 },

  heroCard: {
    ...glass,
    borderRadius: 28,
    padding: 20,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
    marginBottom: 18,
    boxShadow: "0 25px 60px rgba(49,34,68,0.15)",
  },
  heroLabel: { fontSize: 12, color: "#9B5DE5", fontWeight: 900, textTransform: "uppercase", letterSpacing: 1 },
  heroTime: { fontSize: 32, fontWeight: 900, color: "#312244", lineHeight: 1.1, margin: "2px 0" },
  heroText: { color: "#6D597A", fontSize: 14, lineHeight: 1.5, margin: 0 },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    background: "linear-gradient(135deg,#CDB4DB,#FFC8DD)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 18px 35px rgba(49,34,68,0.16)",
    flexShrink: 0,
  },

  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 18 },
  statCard: {
    ...glass,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: 4,
    padding: "14px 6px",
    borderRadius: 22,
    minWidth: 0,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg,#F3E8FF,#FFFFFF)",
    marginBottom: 4,
  },
  statNumber: { color: "#312244", margin: 0, fontSize: 22, fontWeight: 900 },
  statText: { color: "#6D597A", margin: 0, fontSize: 12, fontWeight: 700 },

  card: { ...glass, borderRadius: 28, padding: 20, marginBottom: 16, boxSizing: "border-box" },
  cardHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  sectionTitle: { color: "#312244", fontSize: 21, margin: 0, fontWeight: 900 },
  panelIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg,#CDB4DB,#FFC8DD)",
    boxShadow: "0 15px 30px rgba(49,34,68,0.15)",
    flexShrink: 0,
  },

  label: { display: "block", fontSize: 13, fontWeight: 800, color: "#6D597A", margin: "12px 0 6px" },
  input: {
    width: "100%",
    boxSizing: "border-box",
    fontSize: 16, // 16px stops iOS zoom on focus
    fontFamily: "inherit",
    padding: "12px 14px",
    borderRadius: 16,
    border: "1px solid rgba(155,93,229,0.25)",
    background: "rgba(255,255,255,0.9)",
    boxShadow: "inset 0 2px 4px rgba(49,34,68,0.08)",
    outline: "none",
    color: "#312244",
  },
  row: { display: "flex", gap: 12, alignItems: "center" },
  toggleText: { flex: 1, fontWeight: 800, color: "#6D597A", fontSize: 14 },

  itemIcon: {
    width: 56,
    height: 56,
    borderRadius: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 14px 24px rgba(49,34,68,0.13)",
    flexShrink: 0,
  },
  medName: {
    color: "#312244",
    fontSize: 16,
    margin: "0 0 6px",
    fontWeight: 900,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  metaRow: { display: "flex", gap: 6, flexWrap: "wrap" },
  metaBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    background: "rgba(255,255,255,0.72)",
    color: "#6D597A",
    padding: "5px 9px",
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 800,
  },
  note: {
    margin: "12px 0 0",
    fontSize: 13,
    color: "#6D597A",
    background: "rgba(243,232,255,0.7)",
    padding: "8px 12px",
    borderRadius: 14,
    lineHeight: 1.5,
  },

  errorBox: { background: "rgba(254,226,226,0.95)", color: "#B91C1C", padding: "10px 14px", borderRadius: 14, marginBottom: 14, fontSize: 14 },
  successBox: { background: "rgba(220,252,231,0.95)", color: "#15803D", padding: "10px 14px", borderRadius: 14, marginBottom: 14, fontSize: 14 },
};