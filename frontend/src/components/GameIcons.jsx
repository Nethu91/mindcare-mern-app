import React, { useRef } from "react";

/* ============================================================
   Shared theme (sampled from mood-bg.jpeg) + cute 3D SVG icons
   Used by MindRelaxGames.jsx
   ============================================================ */

export const THEME = {
  hue: 240,
  accent: "#7F93C4",
  accentDark: "#5F6DA6",
  teal: "#8FB8BE",
  rose: "#E3A4B4",
  ink: "#2E3452",
  text: "#5A6283",
  soft: "#F3F0F9",
  line: "#D9D6EC",
  gradient: "linear-gradient(135deg, #8FB8BE 0%, #7F93C4 50%, #A28BC0 100%)",
  gradientWarm: "linear-gradient(135deg, #E3A4B4 0%, #B793C4 100%)",
};

export const glass = {
  background: "rgba(255,255,255,0.64)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.8)",
  boxShadow: "0 16px 36px rgba(46,52,82,0.14)",
};

let gUid = 0;
const useGUid = () => {
  const ref = useRef(null);
  if (ref.current === null) ref.current = `g3d${++gUid}`;
  return ref.current;
};

export function Icon3D({ name, size = 28, hue = 240 }) {
  const u = useGUid();
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
    case "puzzle":
      content = (
        <g>
          <defs>{R("p", H.l, H.m, H.d)}</defs>
          <path d="M20 30 H42 a8 8 0 1 1 16 0 H80 V50 a8 8 0 1 1 0 16 V88 H20 Z" fill={f("p")} />
          {face(48, 66, 0.8)}
          {gloss(34, 40, 12, 4, -20, 0.7)}
        </g>
      );
      break;

    case "flower":
      content = (
        <g>
          <defs>
            {R("pt", "#FFE3EE", "#FF9DBD", "#DE5C8A")}
            {R("c", "#FFF6C4", "#FFD056", "#E8951A")}
          </defs>
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <circle key={a} cx={50 + 27 * Math.cos((a * Math.PI) / 180)} cy={50 + 27 * Math.sin((a * Math.PI) / 180)} r="21" fill={f("pt")} />
          ))}
          <circle cx="50" cy="50" r="21" fill={f("c")} />
          {face(50, 49, 0.6, "#7a4a10")}
          {gloss(34, 26, 8, 3.5, -30, 0.7)}
        </g>
      );
      break;

    case "shuffle":
      content = (
        <g>
          <defs>{R("s", H.l, H.m, H.d)}</defs>
          <circle cx="50" cy="50" r="40" fill={f("s")} />
          <path d="M25 38 H56 M48 29 L58 38 L48 47" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M75 62 H44 M52 53 L42 62 L52 71" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          {gloss(36, 26, 14, 5, -30, 0.7)}
        </g>
      );
      break;

    case "eye":
      content = (
        <g>
          <defs>
            {R("w", "#FFFFFF", "#F4F2FB", "#C9C6E3")}
            {R("i", H.l, H.m, H.d)}
          </defs>
          <path d="M6 50 Q50 8 94 50 Q50 92 6 50 Z" fill={f("w")} stroke={H.d} strokeWidth="3" />
          <circle cx="50" cy="50" r="22" fill={f("i")} />
          <circle cx="50" cy="50" r="10" fill="#2b2540" />
          <circle cx="43" cy="42" r="5" fill="#fff" />
        </g>
      );
      break;

    case "target":
      content = (
        <g>
          <defs>
            {R("r", "#FFC9CF", "#F2646E", "#B8232F")}
            {R("w", "#FFFFFF", "#F4F2FB", "#CFCDE6")}
          </defs>
          <circle cx="50" cy="50" r="42" fill={f("r")} />
          <circle cx="50" cy="50" r="30" fill={f("w")} />
          <circle cx="50" cy="50" r="19" fill={f("r")} />
          <circle cx="50" cy="50" r="8" fill="#fff" />
          {gloss(34, 28, 12, 4, -30, 0.6)}
        </g>
      );
      break;

    case "party":
      content = (
        <g>
          <defs>{R("c", "#FFE6A8", "#FFA94D", "#E0701A")}</defs>
          <path d="M14 90 L36 36 L64 64 Z" fill={f("c")} />
          <path d="M26 66 L40 80 M32 50 L52 70" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
          <circle cx="62" cy="24" r="5" fill="#F472B6" />
          <circle cx="82" cy="44" r="5" fill="#38BDF8" />
          <circle cx="50" cy="12" r="4" fill="#FACC15" />
          <circle cx="86" cy="70" r="4" fill="#4ADE80" />
          <path d="M70 40 Q78 30 86 36" fill="none" stroke="#A78BFA" strokeWidth="4" strokeLinecap="round" />
          <path d="M44 28 Q50 20 58 22" fill="none" stroke="#F472B6" strokeWidth="4" strokeLinecap="round" />
          {gloss(30, 62, 4, 12, 30, 0.6)}
        </g>
      );
      break;

    case "gamepad":
      content = (
        <g>
          <defs>{R("b", H.l, H.m, H.d)}</defs>
          <rect x="6" y="26" width="88" height="50" rx="25" fill={f("b")} />
          <path d="M26 42 V58 M18 50 H34" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
          <circle cx="68" cy="43" r="6" fill="#FF9DBD" />
          <circle cx="80" cy="53" r="6" fill="#FFD056" />
          <circle cx="56" cy="53" r="2.5" fill="#fff" opacity="0.8" />
          {gloss(32, 34, 16, 4, -8, 0.55)}
        </g>
      );
      break;

    case "trophy":
      content = (
        <g>
          <defs>{R("g", "#FFF6C4", "#FFD056", "#D9860F")}</defs>
          <path d="M28 24 H12 C12 46 24 52 32 52" fill="none" stroke="#E8A62A" strokeWidth="7" strokeLinecap="round" />
          <path d="M72 24 H88 C88 46 76 52 68 52" fill="none" stroke="#E8A62A" strokeWidth="7" strokeLinecap="round" />
          <path d="M26 10 H74 V38 C74 58 62 68 50 68 C38 68 26 58 26 38 Z" fill={f("g")} />
          <rect x="43" y="66" width="14" height="14" fill="#E8A62A" />
          <rect x="28" y="80" width="44" height="12" rx="5" fill={f("g")} />
          <path d="M50 24 L54 34 L64 35 L56 42 L59 52 L50 46 L41 52 L44 42 L36 35 L46 34 Z" fill="#fff" opacity="0.85" />
          {gloss(36, 22, 5, 11, 15, 0.7)}
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

    case "bucket":
      content = (
        <g>
          <defs>{R("b", "#CFEAFB", "#5DB4EC", "#2570B5")}</defs>
          <path d="M26 36 Q50 -2 74 36" fill="none" stroke="#8C93B8" strokeWidth="5" strokeLinecap="round" />
          <path d="M18 38 H82 L72 90 H28 Z" fill={f("b")} />
          <ellipse cx="50" cy="38" rx="32" ry="8" fill="#FF9DBD" />
          <path d="M30 40 V54 a4 4 0 0 0 8 0 V44 Z" fill="#FF9DBD" />
          {gloss(34, 62, 4, 14, 8, 0.6)}
        </g>
      );
      break;

    case "brush":
      content = (
        <g>
          <defs>{R("t", "#FFE3EE", "#FF9DBD", "#DE5C8A")}</defs>
          <line x1="84" y1="14" x2="46" y2="52" stroke="#B9763A" strokeWidth="12" strokeLinecap="round" />
          <line x1="52" y1="46" x2="40" y2="58" stroke="#C9CFDA" strokeWidth="14" strokeLinecap="round" />
          <path d="M42 56 C30 54 14 62 14 80 C14 90 28 90 38 80 C48 72 50 62 42 56 Z" fill={f("t")} />
          {gloss(26, 72, 5, 3, -30, 0.7)}
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

export default Icon3D;
