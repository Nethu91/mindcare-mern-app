import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import bgImage from "../assets/mood-bg.jpeg";

/* ============================================================
   3D EMOJI (pure SVG – no image files needed)
   ============================================================ */

let uidCounter = 0;

const useUid = () => {
  const ref = useRef(null);

  if (ref.current === null) {
    ref.current = `e3d${++uidCounter}`;
  }

  return ref.current;
};

const PALETTES = {
  Happy: {
    light: "#FFE58A",
    mid: "#FFB92E",
    dark: "#E27A0B",
  },
  Calm: {
    light: "#D6F6F2",
    mid: "#84D4E0",
    dark: "#3E9FBF",
  },
  Sad: {
    light: "#C6E6FF",
    mid: "#6FB0F0",
    dark: "#3A6FC4",
  },
  Angry: {
    light: "#FFB49C",
    mid: "#FF5A3C",
    dark: "#BE1E1E",
  },
  Anxious: {
    light: "#E9DAFF",
    mid: "#B48DF2",
    dark: "#7548C2",
  },
  Excited: {
    light: "#FFDDEC",
    mid: "#FF8FBF",
    dark: "#DB3F8A",
  },
  Neutral: {
    light: "#FFE58A",
    mid: "#FFB92E",
    dark: "#E27A0B",
  },
};

const INK = "#4a2508";

const starPoints = (cx, cy, R, r) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 ? r : R;

    return `${(cx + rad * Math.cos(a)).toFixed(1)},${(
      cy +
      rad * Math.sin(a)
    ).toFixed(1)}`;
  }).join(" ");

const sparklePoints = (x, y, s) =>
  `${x},${y - s} 
   ${x + s * 0.3},${y - s * 0.3} 
   ${x + s},${y} 
   ${x + s * 0.3},${y + s * 0.3} 
   ${x},${y + s} 
   ${x - s * 0.3},${y + s * 0.3} 
   ${x - s},${y} 
   ${x - s * 0.3},${y - s * 0.3}`;

const Eye = ({ cx, cy, r = 8, px = 0, py = 0, pr }) => {
  const pupil = pr || r * 0.62;

  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#fff" />

      <circle
        cx={cx + px}
        cy={cy + py}
        r={pupil}
        fill="#2b1608"
      />

      <circle
        cx={cx + px - pupil * 0.35}
        cy={cy + py - pupil * 0.35}
        r={pupil * 0.32}
        fill="#fff"
      />
    </g>
  );
};

const Blush = ({ opacity = 0.35 }) => (
  <g fill="#ff5b6e" opacity={opacity}>
    <ellipse cx="20" cy="60" rx="8" ry="4.5" />
    <ellipse cx="80" cy="60" rx="8" ry="4.5" />
  </g>
);

const stroke = (w = 4.5) => ({
  fill: "none",
  stroke: INK,
  strokeWidth: w,
  strokeLinecap: "round",
  strokeLinejoin: "round",
});

const OpenMouth = ({ uid, top = 56, depth = 36 }) => {
  const d = `M27 ${top} Q50 ${top + depth} 73 ${top} Z`;

  return (
    <g>
      <clipPath id={`${uid}-m`}>
        <path d={d} />
      </clipPath>

      <path d={d} fill="#7a1f2b" />

      <g clipPath={`url(#${uid}-m)`}>
        <ellipse
          cx="50"
          cy={top + depth * 0.55}
          rx="13"
          ry="8"
          fill="#ff6f8f"
        />

        <path
          d={`M25 ${top} L75 ${top} L73 ${top + 8}
          Q50 ${top + 13} 27 ${top + 8} Z`}
          fill="#fff"
        />
      </g>
    </g>
  );
};

const DotEyes = ({ y = 45, r = 5.5, dx = 17 }) => (
  <g>
    <circle cx={50 - dx} cy={y} r={r} fill="#2b1608" />
    <circle cx={50 + dx} cy={y} r={r} fill="#2b1608" />

    <circle
      cx={50 - dx - r * 0.35}
      cy={y - r * 0.35}
      r={r * 0.32}
      fill="#fff"
    />

    <circle
      cx={50 + dx - r * 0.35}
      cy={y - r * 0.35}
      r={r * 0.32}
      fill="#fff"
    />
  </g>
);

const Sparkle = ({ x, y, s, fill = "#fff" }) => (
  <polygon
    points={sparklePoints(x, y, s)}
    fill={fill}
  />
);

const Drop = ({ x, y, s = 1 }) => (
  <path
    d={`M${x} ${y}
    Q${x + 10 * s} ${y + 14 * s}
    ${x} ${y + 21 * s}
    Q${x - 10 * s} ${y + 14 * s}
    ${x} ${y}Z`}
    fill="#9bdcff"
    stroke="#fff"
    strokeWidth="1.5"
  />
);

/* ============================================================
   FACE
   ============================================================ */

const Face = ({ name, uid, level = 4 }) => {
  const L = level;

  switch (name) {
    case "Happy":
      if (L === 1) {
        return (
          <g>
            <DotEyes />
            <path d="M38 62 Q50 68 62 62" {...stroke(4)} />
          </g>
        );
      }

      if (L === 2) {
        return (
          <g>
            <DotEyes />
            <path d="M33 60 Q50 75 67 60" {...stroke(4.5)} />
            <Blush opacity={0.2} />
          </g>
        );
      }

      if (L === 3) {
        return (
          <g>
            <path d="M25 42 Q33 30 41 42" {...stroke(5)} />
            <path d="M59 42 Q67 30 75 42" {...stroke(5)} />
            <path d="M29 57 Q50 84 71 57" {...stroke(4.5)} />
            <Blush opacity={0.3} />
          </g>
        );
      }

      return (
        <g>
          <path d="M25 42 Q33 30 41 42" {...stroke(5)} />
          <path d="M59 42 Q67 30 75 42" {...stroke(5)} />

          <OpenMouth
            uid={uid}
            top={L === 5 ? 52 : 54}
            depth={L === 5 ? 42 : 30}
          />

          <Blush opacity={L === 5 ? 0.5 : 0.35} />

          {L === 5 && (
            <g>
              <Sparkle x={10} y={22} s={7} />
              <Sparkle x={91} y={16} s={6} fill="#FFF3B0" />
            </g>
          )}
        </g>
      );

    case "Calm":
      return (
        <g>
          {L === 1 ? (
            <DotEyes />
          ) : (
            <>
              <path
                d={`M25 46 Q33 ${L === 2 ? 51 : 55} 41 46`}
                {...stroke(4.5)}
              />

              <path
                d={`M59 46 Q67 ${L === 2 ? 51 : 55} 75 46`}
                {...stroke(4.5)}
              />
            </>
          )}

          <path
            d={
              L === 1
                ? "M42 66 L58 66"
                : L === 2
                ? "M40 66 Q50 70 60 66"
                : L === 3
                ? "M39 66 Q50 74 61 66"
                : "M35 65 Q50 78 65 65"
            }
            {...stroke(4.5)}
          />

          {L >= 3 && (
            <Blush
              opacity={
                L === 3
                  ? 0.25
                  : L === 4
                  ? 0.35
                  : 0.45
              }
            />
          )}

          {L === 5 && (
            <>
              <Sparkle x={12} y={24} s={6} />
              <Sparkle x={90} y={20} s={5} />
            </>
          )}
        </g>
      );

    case "Sad":
      if (L === 1) {
        return (
          <g>
            <DotEyes y={48} />
            <path d="M40 69 Q50 65 60 69" {...stroke(4)} />
          </g>
        );
      }

      if (L === 2) {
        return (
          <g>
            <path d="M26 39 L41 34" {...stroke(3.5)} />
            <path d="M74 39 L59 34" {...stroke(3.5)} />

            <Eye cx={33} cy={48} r={8} py={1.5} />
            <Eye cx={67} cy={48} r={8} py={1.5} />

            <path d="M38 71 Q50 63 62 71" {...stroke(4.5)} />
          </g>
        );
      }

      if (L === 5) {
        return (
          <g>
            <path d="M24 34 L42 27" {...stroke(4)} />
            <path d="M76 34 L58 27" {...stroke(4)} />

            <path d="M25 50 Q33 40 41 50" {...stroke(5)} />
            <path d="M59 50 Q67 40 75 50" {...stroke(5)} />

            <path
              d="M34 80 Q50 56 66 80 Z"
              fill="#7a1f2b"
            />

            <Drop x={27} y={54} s={1.1} />
            <Drop x={73} y={54} s={1.1} />
          </g>
        );
      }

      return (
        <g>
          <path d="M24 36 L42 29" {...stroke(4)} />
          <path d="M76 36 L58 29" {...stroke(4)} />

          <Eye cx={33} cy={47} r={8.5} py={2} />
          <Eye cx={67} cy={47} r={8.5} py={2} />

          <path d="M36 74 Q50 60 64 74" {...stroke(4.5)} />

          {L === 4 && (
            <path
              d="M27 60 Q34 70 27 76 Q20 70 27 60 Z"
              fill="#9bdcff"
              stroke="#fff"
              strokeWidth="1.5"
            />
          )}
        </g>
      );

    case "Angry":
      if (L === 1) {
        return (
          <g>
            <DotEyes y={49} />

            <path d="M26 40 L42 44" {...stroke(4)} />
            <path d="M74 40 L58 44" {...stroke(4)} />

            <path d="M41 69 L59 69" {...stroke(4.5)} />
          </g>
        );
      }

      if (L === 2) {
        return (
          <g>
            <Eye cx={34} cy={51} r={7} px={1.5} py={1} />
            <Eye cx={66} cy={51} r={7} px={-1.5} py={1} />

            <path d="M24 37 L44 46" {...stroke(5)} />
            <path d="M76 37 L56 46" {...stroke(5)} />

            <path d="M38 70 Q50 65 62 70" {...stroke(4.5)} />
          </g>
        );
      }

      if (L === 3) {
        return (
          <g>
            <Eye cx={34} cy={51} r={7.5} px={2} py={1} />
            <Eye cx={66} cy={51} r={7.5} px={-2} py={1} />

            <path d="M22 36 L44 46" {...stroke(5.5)} />
            <path d="M78 36 L56 46" {...stroke(5.5)} />

            <path d="M35 73 Q50 62 65 73" {...stroke(5)} />

            <g fill="#ff2d2d" opacity="0.2">
              <ellipse cx="20" cy="62" rx="8" ry="4.5" />
              <ellipse cx="80" cy="62" rx="8" ry="4.5" />
            </g>
          </g>
        );
      }

      if (L === 5) {
        return (
          <g>
            <Eye
              cx={34}
              cy={52}
              r={7.5}
              pr={3.2}
              px={2}
              py={1}
            />

            <Eye
              cx={66}
              cy={52}
              r={7.5}
              pr={3.2}
              px={-2}
              py={1}
            />

            <path d="M17 31 L46 47" {...stroke(8)} />
            <path d="M83 31 L54 47" {...stroke(8)} />

            <rect
              x="30"
              y="64"
              width="40"
              height="15"
              rx="5"
              fill="#fff"
              stroke={INK}
              strokeWidth="3"
            />

            <path
              d="M40 64 L40 79
              M50 64 L50 79
              M60 64 L60 79
              M30 71.5 L70 71.5"
              stroke={INK}
              strokeWidth="2"
            />

            <g fill="#ff2d2d" opacity="0.4">
              <ellipse cx="18" cy="62" rx="8" ry="4.5" />
              <ellipse cx="82" cy="62" rx="8" ry="4.5" />
            </g>
          </g>
        );
      }

      return (
        <g>
          <Eye cx={34} cy={52} r={7.5} px={2} py={1} />
          <Eye cx={66} cy={52} r={7.5} px={-2} py={1} />

          <path d="M20 35 L45 47" {...stroke(6.5)} />
          <path d="M80 35 L55 47" {...stroke(6.5)} />

          <path d="M34 74 Q50 60 66 74" {...stroke(5)} />

          <g fill="#ff2d2d" opacity="0.3">
            <ellipse cx="20" cy="62" rx="8" ry="4.5" />
            <ellipse cx="80" cy="62" rx="8" ry="4.5" />
          </g>
        </g>
      );

    case "Anxious":
      if (L === 1) {
        return (
          <g>
            <DotEyes />

            <path d="M28 37 L41 34" {...stroke(3.5)} />
            <path d="M72 37 L59 34" {...stroke(3.5)} />

            <path
              d="M38 68 Q44 65 50 68 T62 68"
              {...stroke(3.5)}
            />
          </g>
        );
      }

      if (L === 2) {
        return (
          <g>
            <path d="M25 37 Q33 31 43 33" {...stroke(3.5)} />
            <path d="M75 37 Q67 31 57 33" {...stroke(3.5)} />

            <Eye cx={33} cy={48} r={8.5} py={1} />
            <Eye cx={67} cy={48} r={8.5} py={1} />

            <path
              d="M36 70 Q41 65 46 70 T56 70 T64 70"
              {...stroke(3.5)}
            />
          </g>
        );
      }

      if (L === 3) {
        return (
          <g>
            <path d="M24 36 Q33 29 43 32" {...stroke(4)} />
            <path d="M76 36 Q67 29 57 32" {...stroke(4)} />

            <Eye
              cx={33}
              cy={48}
              r={9.5}
              pr={3.8}
              py={1}
            />

            <Eye
              cx={67}
              cy={48}
              r={9.5}
              pr={3.8}
              py={1}
            />

            <path
              d="M33 71 Q38 65 43 71 T53 71 T63 71"
              {...stroke(4)}
            />
          </g>
        );
      }

      if (L === 5) {
        return (
          <g>
            <path d="M21 34 Q31 22 44 30" {...stroke(4.5)} />
            <path d="M79 34 Q69 22 56 30" {...stroke(4.5)} />

            <Eye cx={33} cy={48} r={11} pr={2.8} />
            <Eye cx={67} cy={48} r={11} pr={2.8} />

            <ellipse
              cx="50"
              cy="73"
              rx="9"
              ry="7"
              fill="#7a1f2b"
              stroke={INK}
              strokeWidth="2.5"
            />

            <Drop x={85} y={20} />
            <Drop x={13} y={30} s={0.85} />
          </g>
        );
      }

      return (
        <g>
          <path d="M23 36 Q33 28 43 32" {...stroke(4)} />
          <path d="M77 36 Q67 28 57 32" {...stroke(4)} />

          <Eye
            cx={33}
            cy={48}
            r={10}
            pr={3.6}
            py={1}
          />

          <Eye
            cx={67}
            cy={48}
            r={10}
            pr={3.6}
            py={1}
          />

          <path
            d="M32 71 Q37 64 42 71 T52 71 T62 71 T68 71"
            {...stroke(4)}
          />

          <Drop x={84} y={22} />
        </g>
      );

    case "Excited":
      if (L === 1) {
        return (
          <g>
            <DotEyes r={6} />
            <path d="M37 62 Q50 72 63 62" {...stroke(4)} />
            <Blush opacity={0.25} />
          </g>
        );
      }

      if (L === 2) {
        return (
          <g>
            <Eye cx={33} cy={45} r={9} py={-1} />
            <Eye cx={67} cy={45} r={9} py={-1} />

            <path d="M32 60 Q50 78 68 60" {...stroke(4.5)} />

            <Blush opacity={0.3} />

            <Sparkle
              x={90}
              y={18}
              s={5}
              fill="#FFD43B"
            />
          </g>
        );
      }

      if (L === 3) {
        return (
          <g>
            <Eye cx={33} cy={44} r={9.5} py={-1} />
            <Eye cx={67} cy={44} r={9.5} py={-1} />

            <OpenMouth
              uid={uid}
              top={58}
              depth={26}
            />

            <Blush opacity={0.3} />

            <Sparkle x={10} y={22} s={6} />

            <Sparkle
              x={91}
              y={16}
              s={5}
              fill="#FFD43B"
            />
          </g>
        );
      }

      return (
        <g>
          {[33, 67].map((x) => (
            <polygon
              key={x}
              points={starPoints(
                x,
                44,
                L === 5 ? 15 : 12,
                L === 5 ? 6.5 : 5
              )}
              fill="#FFD43B"
              stroke="#E08A00"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          ))}

          <OpenMouth
            uid={uid}
            top={L === 5 ? 56 : 58}
            depth={L === 5 ? 42 : 34}
          />

          <Sparkle x={10} y={22} s={7} />

          <Sparkle
            x={92}
            y={14}
            s={5}
            fill="#FFD43B"
          />

          {L === 5 && (
            <>
              <Sparkle
                x={8}
                y={52}
                s={4}
                fill="#FFD43B"
              />

              <Sparkle
                x={94}
                y={46}
                s={5}
              />
            </>
          )}
        </g>
      );

    default:
      return (
        <g>
          <Eye cx={34} cy={46} r={7} />
          <Eye cx={66} cy={46} r={7} />

          <path
            d="M38 68 L62 68"
            {...stroke(4.5)}
          />
        </g>
      );
  }
};

/* ============================================================
   BASE GLOSSY SPHERE
   ============================================================ */

const Sphere = ({
  palette,
  uid,
  size,
  children,
  ...rest
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    style={{
      display: "block",
      overflow: "visible",
      filter:
        "drop-shadow(0 6px 5px rgba(49,34,68,0.28))",
    }}
    {...rest}
  >
    <defs>
      <radialGradient
        id={`${uid}-b`}
        cx="35%"
        cy="28%"
        r="85%"
      >
        <stop
          offset="0%"
          stopColor={palette.light}
        />

        <stop
          offset="55%"
          stopColor={palette.mid}
        />

        <stop
          offset="100%"
          stopColor={palette.dark}
        />
      </radialGradient>

      <radialGradient
        id={`${uid}-h`}
        cx="50%"
        cy="50%"
        r="50%"
      >
        <stop
          offset="0%"
          stopColor="#fff"
          stopOpacity="0.9"
        />

        <stop
          offset="100%"
          stopColor="#fff"
          stopOpacity="0"
        />
      </radialGradient>

      <radialGradient
        id={`${uid}-g`}
        cx="50%"
        cy="100%"
        r="60%"
      >
        <stop
          offset="0%"
          stopColor="#fff"
          stopOpacity="0.4"
        />

        <stop
          offset="100%"
          stopColor="#fff"
          stopOpacity="0"
        />
      </radialGradient>
    </defs>

    <circle
      cx="50"
      cy="50"
      r="46"
      fill={`url(#${uid}-b)`}
    />

    <ellipse
      cx="50"
      cy="90"
      rx="30"
      ry="12"
      fill={`url(#${uid}-g)`}
    />

    <ellipse
      cx="35"
      cy="22"
      rx="19"
      ry="10"
      fill={`url(#${uid}-h)`}
      transform="rotate(-25 35 22)"
    />

    {children}
  </svg>
);

export function Emoji3D({
  name,
  size = 48,
  level = 4,
  ...rest
}) {
  const uid = useUid();

  const palette =
    PALETTES[name] || PALETTES.Neutral;

  return (
    <Sphere
      palette={palette}
      uid={uid}
      size={size}
      {...rest}
    >
      <Face
        name={PALETTES[name] ? name : "Neutral"}
        uid={uid}
        level={level}
      />
    </Sphere>
  );
}

/* ============================================================
   GAUGE METER
   ============================================================ */

const GAUGE_COLORS = [
  "#4ADE80",
  "#84CC16",
  "#FACC15",
  "#FB923C",
  "#EF4444",
];

const CX = 170;
const CY = 160;
const R_OUT = 112;
const R_IN = 70;

const polar = (r, deg) => {
  const a = (deg * Math.PI) / 180;

  return [
    CX + r * Math.cos(a),
    CY + r * Math.sin(a),
  ];
};

const segmentPath = (i) => {
  const a0 = 180 + i * 36 + 1.2;
  const a1 = 180 + (i + 1) * 36 - 1.2;

  const [x0, y0] = polar(R_OUT, a0);
  const [x1, y1] = polar(R_OUT, a1);
  const [x2, y2] = polar(R_IN, a1);
  const [x3, y3] = polar(R_IN, a0);

  return `
    M${x0} ${y0}
    A${R_OUT} ${R_OUT} 0 0 1 ${x1} ${y1}
    L${x2} ${y2}
    A${R_IN} ${R_IN} 0 0 0 ${x3} ${y3}
    Z
  `;
};

function MoodMeter({
  value,
  onChange,
  mood,
}) {
  const rotation = (value - 3) * 36;

  const [rx0, ry0] = polar(62, 180);
  const [rx1, ry1] = polar(62, 360);

  const [sx0, sy0] = polar(74, 180);
  const [sx1, sy1] = polar(74, 360);

  return (
    <svg
      viewBox="0 0 340 190"
      style={{
        width: "100%",
        maxWidth: 360,
        display: "block",
        margin: "0 auto",
        overflow: "visible",
      }}
      role="img"
      aria-label={`Intensity ${value} of 5`}
    >
      {GAUGE_COLORS.map((c, i) => (
        <path
          key={i}
          d={segmentPath(i)}
          fill={c}
          opacity={
            value === i + 1 ? 1 : 0.75
          }
          style={{
            cursor: "pointer",
            transition: "opacity 0.3s",
          }}
          onClick={() => onChange(i + 1)}
        />
      ))}

      <path
        d={`M${sx0} ${sy0} A74 74 0 0 1 ${sx1} ${sy1}`}
        fill="none"
        stroke="rgba(0,0,0,0.18)"
        strokeWidth="8"
        pointerEvents="none"
      />

      <path
        d={`M${rx0} ${ry0} A62 62 0 0 1 ${rx1} ${ry1}`}
        fill="none"
        stroke="#1c1c1c"
        strokeWidth="9"
        pointerEvents="none"
      />

      {GAUGE_COLORS.map((c, i) => {
        const [fx, fy] = polar(
          142,
          180 + (i + 0.5) * 36
        );

        const active =
          value === i + 1;

        const s =
          active ? 48 : 38;

        return (
          <Emoji3D
            key={i}
            name={mood}
            level={i + 1}
            size={s}
            x={fx - s / 2}
            y={fy - s / 2}
            style={{
              cursor: "pointer",
              overflow: "visible",
              filter:
                "drop-shadow(0 5px 4px rgba(49,34,68,0.3))",
            }}
            onClick={() =>
              onChange(i + 1)
            }
          />
        );
      })}

      <g
        style={{
          transform: `rotate(${rotation}deg)`,
          transformOrigin: `${CX}px ${CY}px`,
          transformBox: "view-box",
          transition:
            "transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        pointerEvents="none"
      >
        <polygon
          points={`${CX - 7},${CY} ${CX + 7},${CY} ${CX},${CY - 92}`}
          fill="#1c1c1c"
        />

        <polygon
          points={`${CX - 7},${CY} ${CX},${CY - 92} ${CX},${CY}`}
          fill="#3a3a3a"
        />
      </g>

      <circle
        cx={CX}
        cy={CY}
        r="12"
        fill="#fff"
        stroke="#1c1c1c"
        strokeWidth="5"
      />
    </svg>
  );
}

/* ============================================================
   WEEKLY CHART
   ============================================================ */

const DAY_LABELS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

const MAX_BAR = 110;

const startOfDay = (d) =>
  new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate()
  );

function WeeklyChart({ history }) {
  const [now, setNow] =
    useState(new Date());

  const [active, setActive] =
    useState(null);

  useEffect(() => {
    const t = setInterval(
      () => setNow(new Date()),
      60000
    );

    return () =>
      clearInterval(t);
  }, []);

  const today =
    startOfDay(now);

  const todayIdx =
    (today.getDay() + 6) % 7;

  const monday =
    new Date(today);

  monday.setDate(
    today.getDate() - todayIdx
  );

  const days =
    DAY_LABELS.map((label) => ({
      label,
      ratings: [],
    }));

  history.forEach((h) => {
    if (!h.createdAt) return;

    const idx = Math.round(
      (startOfDay(
        new Date(h.createdAt)
      ) -
        monday) /
        86400000
    );

    if (idx >= 0 && idx < 7) {
      days[idx].ratings.push(
        h.rating
      );
    }
  });

  const data =
    days.map((d) => ({
      ...d,

      count:
        d.ratings.length,

      avg:
        d.ratings.length
          ? d.ratings.reduce(
              (a, b) => a + b,
              0
            ) /
            d.ratings.length
          : 0,
    }));

  const total =
    data.reduce(
      (s, d) =>
        s + d.count,
      0
    );

  const weekAvg =
    total
      ? (
          data.reduce(
            (s, d) =>
              s +
              d.avg *
                d.count,
            0
          ) / total
        ).toFixed(1)
      : "-";

  return (
    <div
      style={{
        ...glass,
        borderRadius: 28,
        padding: 20,
        marginBottom: 18,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <h2
          style={{
            ...styles.sectionTitle,
            margin: 0,
          }}
        >
          This Week
        </h2>

        <span
          style={
            styles.recordBadge2
          }
        >
          Avg {weekAvg} ·{" "}
          {total} entries
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems:
            "flex-end",
          gap: 8,
          height:
            MAX_BAR + 50,
        }}
      >
        {data.map(
          (d, i) => {
            const isToday =
              i === todayIdx;

            const h =
              d.count
                ? Math.max(
                    (d.avg / 5) *
                      MAX_BAR,
                    18
                  )
                : 10;

            return (
              <div
                key={d.label}
                style={{
                  flex: 1,
                  display:
                    "flex",
                  flexDirection:
                    "column",
                  alignItems:
                    "center",
                  justifyContent:
                    "flex-end",
                  cursor:
                    "pointer",
                }}
                onClick={() =>
                  setActive(
                    active === i
                      ? null
                      : i
                  )
                }
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color:
                      "#7C3AED",
                    height: 16,
                    opacity:
                      d.count &&
                      (isToday ||
                        active ===
                          i)
                        ? 1
                        : 0,
                    transition:
                      "opacity 0.3s",
                  }}
                >
                  {d.avg.toFixed(
                    1
                  )}
                </span>

                <div
                  title={`${d.label}: ${d.count} entries`}
                  style={{
                    width: "100%",
                    height: h,
                    borderRadius:
                      12,

                    background:
                      isToday
                        ? "linear-gradient(180deg,#A855F7,#7C3AED)"
                        : d.count
                        ? "#DDD0FB"
                        : "#EFEAFB",

                    transition:
                      "height 0.7s cubic-bezier(0.34,1.56,0.64,1)",
                  }}
                />

                <span
                  style={{
                    marginTop: 8,
                    fontSize: 11,
                    fontWeight: 700,

                    color:
                      isToday
                        ? "#7C3AED"
                        : "#9b8fb0",
                  }}
                >
                  {d.label}
                </span>
              </div>
            );
          }
        )}
      </div>

      {active !== null && (
        <p
          style={{
            margin:
              "12px 0 0",
            fontSize: 13,
            color:
              "#5b4a6b",
            textAlign:
              "center",
          }}
        >
          <b>
            {
              DAY_LABELS[
                active
              ]
            }
          </b>{" "}
          ·{" "}
          {data[active]
            .count
            ? `${data[active].count} entries, avg intensity ${data[
                active
              ].avg.toFixed(
                1
              )} / 5`
            : "No entries"}
        </p>
      )}
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

function MoodTracker() {
  // NEW: React Router navigation
  const navigate = useNavigate();

  const moods = [
    {
      name: "Happy",
      color: "#FFD166",
      message:
        "You are glowing today!",
    },
    {
      name: "Calm",
      color: "#A8DADC",
      message:
        "Peaceful and relaxed mind.",
    },
    {
      name: "Sad",
      color: "#B8C0FF",
      message:
        "It is okay to feel sad sometimes.",
    },
    {
      name: "Angry",
      color: "#FF8FAB",
      message:
        "Take a deep breath and relax.",
    },
    {
      name: "Anxious",
      color: "#CDB4DB",
      message:
        "You are stronger than your worries.",
    },
    {
      name: "Excited",
      color: "#FFAFCC",
      message:
        "Amazing energy today!",
    },
  ];

  const moodGuide = [
    [
      "Happy",
      "Positive energy",
    ],
    [
      "Calm",
      "Relaxed mind",
    ],
    [
      "Sad",
      "Needs support",
    ],
    [
      "Angry",
      "Take a break",
    ],
    [
      "Anxious",
      "Breathe slowly",
    ],
    [
      "Excited",
      "High motivation",
    ],
  ];

  const ratingLevels = [
    {
      value: 1,
      title: "Very Mild",
      description:
        "A gentle feeling, barely noticeable.",
    },
    {
      value: 2,
      title: "Mild",
      description:
        "You feel it, but it's manageable.",
    },
    {
      value: 3,
      title: "Moderate",
      description:
        "A noticeable feeling affecting your mood.",
    },
    {
      value: 4,
      title: "Strong",
      description:
        "A powerful feeling that's hard to ignore.",
    },
    {
      value: 5,
      title: "Very Strong",
      description:
        "An intense feeling taking over your mind.",
    },
  ];

  const [
    selectedMood,
    setSelectedMood,
  ] = useState(null);

  const [rating, setRating] =
    useState(3);

  const [note, setNote] =
    useState("");

  const [history, setHistory] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [
    loadingHistory,
    setLoadingHistory,
  ] = useState(true);

  const [error, setError] =
    useState("");

  const [toast, setToast] =
    useState(null);

  useEffect(() => {
    loadMoodHistory();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!toast) return;

    const t = setTimeout(
      () =>
        setToast(null),
      3000
    );

    return () =>
      clearTimeout(t);
  }, [toast]);

  const loadMoodHistory =
    async () => {
      try {
        setLoadingHistory(
          true
        );

        const response =
          await API.get(
            "/moods"
          );

        const mapped =
          response.data.map(
            (item) => {
              const moodDetails =
                moods.find(
                  (m) =>
                    m.name ===
                    item.mood
                ) || {
                  name:
                    item.mood,
                  color:
                    "#CDB4DB",
                };

              const ratingInfo =
                ratingLevels.find(
                  (r) =>
                    r.value ===
                    item.rating
                );

              return {
                id: item._id,

                createdAt:
                  item.createdAt,

                mood:
                  moodDetails,

                rating:
                  item.rating,

                ratingText:
                  ratingInfo?.title ||
                  `${item.rating}`,

                note:
                  item.note,

                date: new Date(
                  item.createdAt
                ).toLocaleDateString(),

                time: new Date(
                  item.createdAt
                ).toLocaleTimeString(
                  [],
                  {
                    hour:
                      "2-digit",
                    minute:
                      "2-digit",
                  }
                ),
              };
            }
          );

        setHistory(mapped);
        setError("");
      } catch (err) {
        console.error(err);

        setError(
          "Failed to load mood history."
        );
      } finally {
        setLoadingHistory(
          false
        );
      }
    };

  const getColorForValue = (
    value
  ) =>
    GAUGE_COLORS[
      value - 1
    ] || "#8B5CF6";

  const saveMood =
    async () => {
      if (!selectedMood) {
        alert(
          "Please select your mood first"
        );

        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await API.post(
            "/moods",
            {
              mood:
                selectedMood.name,
              rating: rating,
              note: note,
            }
          );

        const saved =
          response.data
            .moodEntry;

        const ratingInfo =
          ratingLevels.find(
            (r) =>
              r.value ===
              rating
          );

        const newMood = {
          id: saved._id,

          createdAt:
            saved.createdAt,

          mood:
            selectedMood,

          rating: rating,

          ratingText:
            ratingInfo?.title,

          note:
            saved.note,

          date: new Date(
            saved.createdAt
          ).toLocaleDateString(),

          time: new Date(
            saved.createdAt
          ).toLocaleTimeString(
            [],
            {
              hour:
                "2-digit",
              minute:
                "2-digit",
            }
          ),
        };

        setHistory([
          newMood,
          ...history,
        ]);

        setToast(
          selectedMood.name
        );

        setSelectedMood(null);
        setNote("");
        setRating(3);
      } catch (err) {
        console.error(err);

        alert(
          err.response?.data
            ?.message ||
            "Failed to save mood. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

  const currentLevel =
    ratingLevels.find(
      (r) =>
        r.value === rating
    );

  return (
    <div style={styles.page}>
      {/* Background */}
      <div
        style={{
          ...styles.bgBlur,
          backgroundImage: `url(${bgImage})`,
        }}
      />

      <div
        style={
          styles.bgPhone
        }
      >
        <div
          style={{
            ...styles.bgPhoneImage,

            backgroundImage: `linear-gradient(
              rgba(255,255,255,0.12),
              rgba(255,255,255,0.22)
            ), url(${bgImage})`,
          }}
        />
      </div>

      <div
        style={
          styles.container
        }
      >
        {/* =========================================
            NEW BACK TO DASHBOARD BUTTON
            ========================================= */}
        <button
          type="button"
          onClick={() =>
            navigate(
              "/dashboard"
            )
          }
          style={
            styles.backButton
          }
        >
          ← Back to Dashboard
        </button>

        {/* Header */}
        <div
          style={
            styles.header
          }
        >
          <div>
            <h1
              style={
                styles.title
              }
            >
              Mood Tracker
            </h1>

            <p
              style={
                styles.subtitle
              }
            >
              How are you
              feeling today?
            </p>
          </div>

          <div
            style={
              styles.dateBox
            }
          >
            <span
              style={
                styles.dateText
              }
            >
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>

        {error && (
          <div
            style={
              styles.errorBox
            }
          >
            {error}
          </div>
        )}

        {toast && (
          <div
            style={
              styles.toast
            }
          >
            <Emoji3D
              name={toast}
              size={30}
            />

            <span>
              {toast} mood
              saved
              successfully!
            </span>
          </div>
        )}

        <div
          style={
            styles.topGrid
          }
        >
          {/* Main card */}
          <div
            style={
              styles.mainCard
            }
          >
            <h2
              style={
                styles.sectionTitle
              }
            >
              Select Your Mood
            </h2>

            <div
              style={
                styles.moodGrid
              }
            >
              {moods.map(
                (mood) => (
                  <button
                    key={
                      mood.name
                    }
                    onClick={() =>
                      setSelectedMood(
                        mood
                      )
                    }
                    style={{
                      ...styles.moodCard,

                      border:
                        selectedMood?.name ===
                        mood.name
                          ? `3px solid ${mood.color}`
                          : "1px solid rgba(255,255,255,0.7)",

                      background:
                        selectedMood?.name ===
                        mood.name
                          ? `linear-gradient(145deg, white, ${mood.color})`
                          : "rgba(255,255,255,0.65)",

                      transform:
                        selectedMood?.name ===
                        mood.name
                          ? "translateY(-6px) scale(1.04)"
                          : "translateY(0)",
                    }}
                  >
                    <div
                      style={{
                        ...styles.topLine,

                        backgroundColor:
                          mood.color,
                      }}
                    />

                    <div
                      style={
                        styles.emoji
                      }
                    >
                      <Emoji3D
                        name={
                          mood.name
                        }
                        size={52}
                      />
                    </div>

                    <span
                      style={
                        styles.moodName
                      }
                    >
                      {mood.name}
                    </span>
                  </button>
                )
              )}
            </div>

            {/* Selected mood */}
            <div
              style={
                styles.selectedBox
              }
            >
              {selectedMood ? (
                <>
                  <div
                    style={{
                      ...styles.selectedEmojiBox,

                      backgroundColor:
                        selectedMood.color,
                    }}
                  >
                    <Emoji3D
                      name={
                        selectedMood.name
                      }
                      level={
                        rating
                      }
                      size={44}
                    />
                  </div>

                  <div>
                    <h3
                      style={
                        styles.selectedTitle
                      }
                    >
                      You feel{" "}
                      {
                        selectedMood.name
                      }
                    </h3>

                    <p
                      style={
                        styles.selectedText
                      }
                    >
                      {
                        selectedMood.message
                      }
                    </p>
                  </div>
                </>
              ) : (
                <p
                  style={
                    styles.selectedText
                  }
                >
                  Select a mood
                  to continue
                </p>
              )}
            </div>

            {/* Rating */}
            {selectedMood && (
              <div
                style={
                  styles.ratingSection
                }
              >
                <h4
                  style={
                    styles.ratingSectionTitle
                  }
                >
                  Rate the
                  Intensity
                </h4>

                <MoodMeter
                  value={
                    rating
                  }
                  onChange={
                    setRating
                  }
                  mood={
                    selectedMood.name
                  }
                />

                <p
                  style={{
                    ...styles.ratingSectionCaption,

                    color:
                      getColorForValue(
                        rating
                      ),
                  }}
                >
                  {rating} / 5 ·{" "}
                  {
                    currentLevel?.title
                  }
                </p>
              </div>
            )}

            {/* Note */}
            <textarea
              style={
                styles.textArea
              }
              placeholder="Write your thoughts here..."
              value={note}
              onChange={(e) =>
                setNote(
                  e.target.value
                )
              }
            />

            {/* Save */}
            <button
              style={{
                ...styles.saveButton,

                background:
                  "linear-gradient(135deg,#7C3AED,#A855F7,#EC4899)",

                opacity:
                  loading
                    ? 0.7
                    : 1,
              }}
              onClick={
                saveMood
              }
              disabled={
                loading
              }
            >
              {loading
                ? "Saving..."
                : "Save Mood"}
            </button>
          </div>

          {/* Side card */}
          <div
            style={
              styles.sideCard
            }
          >
            <h2
              style={
                styles.sectionTitle
              }
            >
              Today's Mood
            </h2>

            <div
              style={
                styles.summaryMood
              }
            >
              <Emoji3D
                name={
                  selectedMood
                    ? selectedMood.name
                    : "Neutral"
                }
                level={rating}
                size={84}
              />
            </div>

            <h3
              style={
                styles.summaryTitle
              }
            >
              {selectedMood
                ? `${selectedMood.name} (${currentLevel?.title})`
                : "No Mood Selected"}
            </h3>

            <p
              style={
                styles.summaryText
              }
            >
              {selectedMood
                ? selectedMood.message
                : "Choose your mood and rate how intense it feels."}
            </p>

            <div
              style={{
                background:
                  "rgba(247,243,255,0.85)",

                borderRadius:
                  "18px",

                padding:
                  "18px",

                marginBottom:
                  "18px",

                textAlign:
                  "left",
              }}
            >
              <h4
                style={{
                  margin:
                    "0 0 8px",

                  color:
                    getColorForValue(
                      rating
                    ),
                }}
              >
                Intensity ·{" "}
                {
                  currentLevel?.title
                }
              </h4>

              <p
                style={{
                  margin: 0,
                  color:
                    "#555",
                }}
              >
                {
                  currentLevel?.description
                }
              </p>
            </div>

            {/* Stats */}
            <div
              style={
                styles.statsBox
              }
            >
              <div
                style={
                  styles.statItem
                }
              >
                <h3
                  style={
                    styles.statNumber
                  }
                >
                  {loadingHistory
                    ? "..."
                    : history.length}
                </h3>

                <p
                  style={
                    styles.statLabel
                  }
                >
                  Total Records
                </p>
              </div>

              <div
                style={
                  styles.statItem
                }
              >
                <h3
                  style={
                    styles.statNumber
                  }
                >
                  {history.length >
                  0
                    ? history[0]
                        .mood.name
                    : "-"}
                </h3>

                <p
                  style={
                    styles.statLabel
                  }
                >
                  Last Mood
                </p>
              </div>
            </div>

            {/* Daily Reminder */}
            <div
              style={{
                marginTop:
                  "20px",

                background:
                  "rgba(255,247,232,0.88)",

                borderRadius:
                  "18px",

                padding:
                  "18px",

                border:
                  "1px solid #FFE5A8",

                textAlign:
                  "left",
              }}
            >
              <h4
                style={{
                  margin:
                    "0 0 8px",

                  color:
                    "#B7791F",
                }}
              >
                💡 Daily
                Reminder
              </h4>

              <p
                style={{
                  margin: 0,
                  color:
                    "#666",
                  lineHeight:
                    "24px",
                }}
              >
                Every feeling
                is temporary.
                Recording your
                emotions helps
                you understand
                yourself better.
              </p>
            </div>

            {/* Mood Guide */}
            <div
              style={{
                marginTop:
                  "20px",

                background:
                  "linear-gradient(135deg,rgba(238,242,255,0.9),rgba(249,245,255,0.9))",

                borderRadius:
                  "20px",

                padding:
                  "18px",

                border:
                  "1px solid #DDD6FE",

                textAlign:
                  "left",
              }}
            >
              <h3
                style={{
                  color:
                    "#6D28D9",

                  marginTop: 0,

                  marginBottom:
                    "12px",
                }}
              >
                📊 Mood Guide
              </h3>

              <div
                style={{
                  color:
                    "#555",

                  display:
                    "grid",

                  gap:
                    "10px",
                }}
              >
                {moodGuide.map(
                  ([
                    name,
                    text,
                  ]) => (
                    <div
                      key={
                        name
                      }
                      style={{
                        display:
                          "flex",

                        alignItems:
                          "center",

                        gap:
                          "12px",
                      }}
                    >
                      <Emoji3D
                        name={
                          name
                        }
                        size={30}
                      />

                      <span>
                        <b>
                          {
                            name
                          }
                        </b>{" "}
                        → {text}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Chart */}
        <WeeklyChart
          history={history}
        />

        {/* Mood History */}
        <div
          style={
            styles.historyCard
          }
        >
          <div
            style={
              styles.historyHeader
            }
          >
            <h2
              style={
                styles.sectionTitle
              }
            >
              Mood History
            </h2>

            <span
              style={
                styles.recordBadge
              }
            >
              {loadingHistory
                ? "..."
                : `${history.length} records`}
            </span>
          </div>

          {loadingHistory ? (
            <div
              style={
                styles.emptyBox
              }
            >
              <p
                style={
                  styles.emptyText
                }
              >
                Loading mood
                history...
              </p>
            </div>
          ) : history.length ===
            0 ? (
            <div
              style={
                styles.emptyBox
              }
            >
              <div
                style={{
                  display:
                    "flex",

                  justifyContent:
                    "center",

                  marginBottom:
                    10,
                }}
              >
                <Emoji3D
                  name="Neutral"
                  size={52}
                />
              </div>

              <p
                style={
                  styles.emptyText
                }
              >
                No mood records
                yet
              </p>
            </div>
          ) : (
            <div
              style={
                styles.historyList
              }
            >
              {history.map(
                (item) => (
                  <div
                    key={
                      item.id
                    }
                    style={
                      styles.historyItem
                    }
                  >
                    <div
                      style={{
                        ...styles.historyIcon,

                        backgroundColor:
                          item.mood
                            .color,
                      }}
                    >
                      <Emoji3D
                        name={
                          item.mood
                            .name
                        }
                        size={40}
                      />
                    </div>

                    <div
                      style={
                        styles.historyContent
                      }
                    >
                      <div
                        style={{
                          display:
                            "flex",

                          justifyContent:
                            "space-between",

                          alignItems:
                            "center",

                          gap:
                            "8px",
                        }}
                      >
                        <h3
                          style={
                            styles.historyMood
                          }
                        >
                          {
                            item
                              .mood
                              .name
                          }
                        </h3>

                        <span
                          style={{
                            display:
                              "inline-flex",

                            alignItems:
                              "center",

                            gap:
                              "6px",

                            background:
                              item.rating ===
                              5
                                ? "#FEE2E2"
                                : item.rating ===
                                  4
                                ? "#FED7AA"
                                : item.rating ===
                                  3
                                ? "#FEF3C7"
                                : item.rating ===
                                  2
                                ? "#DCFCE7"
                                : "#BBF7D0",

                            color:
                              "#6D28D9",

                            padding:
                              "6px 12px",

                            borderRadius:
                              "14px",

                            fontSize:
                              "12px",

                            fontWeight:
                              "700",

                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          <span
                            style={{
                              width:
                                8,

                              height:
                                8,

                              borderRadius:
                                "50%",

                              background:
                                getColorForValue(
                                  item.rating
                                ),
                            }}
                          />

                          {
                            item.ratingText
                          }
                        </span>
                      </div>

                      <p
                        style={{
                          color:
                            "#666",

                          marginTop:
                            "8px",

                          lineHeight:
                            "24px",
                        }}
                      >
                        {item.note ||
                          "No notes were added for this mood."}
                      </p>

                      <span
                        style={
                          styles.historyDate
                        }
                      >
                        {
                          item.date
                        }{" "}
                        •{" "}
                        {
                          item.time
                        }
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   GLASS STYLE
   ============================================================ */

const glass = {
  background:
    "rgba(255,255,255,0.58)",

  backdropFilter:
    "blur(16px)",

  WebkitBackdropFilter:
    "blur(16px)",

  border:
    "1px solid rgba(255,255,255,0.75)",

  boxShadow:
    "0 18px 40px rgba(49,34,68,0.14)",
};

/* ============================================================
   STYLES
   ============================================================ */

const styles = {
  page: {
    position:
      "relative",

    minHeight:
      "100vh",

    padding:
      "24px 16px 60px",

    fontFamily:
      "'Poppins', Arial, sans-serif",

    boxSizing:
      "border-box",

    overflowX:
      "hidden",

    background:
      "#d9d3e6",
  },

  bgBlur: {
    position:
      "fixed",

    inset: 0,

    zIndex: 0,

    backgroundSize:
      "cover",

    backgroundPosition:
      "center",

    backgroundRepeat:
      "no-repeat",

    filter:
      "blur(28px)",

    transform:
      "scale(1.15)",
  },

  bgPhone: {
    position:
      "fixed",

    top: 0,

    left: 0,

    right: 0,

    height:
      "100vh",

    zIndex: 1,

    display:
      "flex",

    justifyContent:
      "center",

    pointerEvents:
      "none",
  },

  bgPhoneImage: {
    width:
      "100%",

    maxWidth:
      "480px",

    height:
      "100%",

    backgroundSize:
      "cover",

    backgroundPosition:
      "center",

    backgroundRepeat:
      "no-repeat",

    boxShadow:
      "0 0 40px rgba(0,0,0,0.15)",
  },

  container: {
    maxWidth:
      "480px",

    margin:
      "0 auto",

    position:
      "relative",

    zIndex: 2,
  },

  /* NEW BACK BUTTON STYLE */
  backButton: {
    ...glass,

    display:
      "inline-flex",

    alignItems:
      "center",

    gap:
      "6px",

    marginBottom:
      "14px",

    padding:
      "9px 18px",

    borderRadius:
      "16px",

    color:
      "#312244",

    fontWeight:
      "800",

    fontSize:
      "13px",

    fontFamily:
      "inherit",

    cursor:
      "pointer",

    WebkitTapHighlightColor:
      "transparent",
  },

  header: {
    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    marginBottom:
      "20px",

    flexWrap:
      "wrap",

    gap:
      "12px",
  },

  title: {
    fontSize:
      "30px",

    color:
      "#312244",

    margin:
      "0 0 4px 0",

    fontWeight:
      "800",
  },

  subtitle: {
    fontSize:
      "14px",

    color:
      "#4a3d5c",

    margin: 0,
  },

  dateBox: {
    padding:
      "10px 16px",

    borderRadius:
      "16px",

    background:
      "rgba(255,255,255,0.7)",

    boxShadow:
      "0 8px 20px rgba(49,34,68,0.1)",

    backdropFilter:
      "blur(12px)",

    WebkitBackdropFilter:
      "blur(12px)",
  },

  dateText: {
    color:
      "#4A4E69",

    fontWeight:
      "700",

    fontSize:
      "13px",
  },

  errorBox: {
    color:
      "#b91c1c",

    background:
      "rgba(254,226,226,0.9)",

    padding:
      "10px 14px",

    borderRadius:
      "14px",

    marginBottom:
      "15px",

    textAlign:
      "center",

    fontSize:
      "14px",
  },

  toast: {
    display:
      "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    gap:
      "10px",

    color:
      "#166534",

    background:
      "rgba(220,252,231,0.95)",

    padding:
      "10px 14px",

    borderRadius:
      "14px",

    marginBottom:
      "15px",

    fontSize:
      "14px",

    fontWeight:
      "700",
  },

  topGrid: {
    display:
      "grid",

    gridTemplateColumns:
      "1fr",

    gap:
      "18px",

    marginBottom:
      "18px",
  },

  mainCard: {
    ...glass,

    borderRadius:
      "28px",

    padding:
      "20px",
  },

  sideCard: {
    ...glass,

    borderRadius:
      "28px",

    padding:
      "20px",

    textAlign:
      "center",
  },

  sectionTitle: {
    color:
      "#312244",

    fontSize:
      "21px",

    margin:
      "0 0 18px 0",

    fontWeight:
      "800",
  },

  moodGrid: {
    display:
      "grid",

    gridTemplateColumns:
      "repeat(3, 1fr)",

    gap:
      "12px",

    marginBottom:
      "20px",
  },

  moodCard: {
    minHeight:
      "116px",

    borderRadius:
      "22px",

    cursor:
      "pointer",

    boxShadow:
      "0 10px 20px rgba(49,34,68,0.12)",

    display:
      "flex",

    flexDirection:
      "column",

    justifyContent:
      "center",

    alignItems:
      "center",

    position:
      "relative",

    overflow:
      "hidden",

    transition:
      "0.35s ease",
  },

  topLine: {
    position:
      "absolute",

    top: 0,

    left: 0,

    width:
      "100%",

    height:
      "6px",
  },

  emoji: {
    marginBottom:
      "8px",

    marginTop:
      "6px",

    display:
      "flex",
  },

  moodName: {
    fontSize:
      "14px",

    fontWeight:
      "800",

    color:
      "#312244",
  },

  selectedBox: {
    minHeight:
      "80px",

    borderRadius:
      "22px",

    padding:
      "16px",

    background:
      "rgba(255,255,255,0.65)",

    display:
      "flex",

    alignItems:
      "center",

    gap:
      "14px",

    marginBottom:
      "16px",

    boxShadow:
      "inset 0 0 18px rgba(255,255,255,0.7)",
  },

  selectedEmojiBox: {
    width:
      "60px",

    height:
      "60px",

    borderRadius:
      "18px",

    display:
      "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    boxShadow:
      "0 10px 20px rgba(49,34,68,0.14)",

    flexShrink: 0,
  },

  selectedTitle: {
    color:
      "#312244",

    margin:
      "0 0 4px 0",

    fontSize:
      "18px",
  },

  selectedText: {
    color:
      "#5b4a6b",

    margin: 0,

    lineHeight:
      "1.5",

    fontSize:
      "14px",
  },

  ratingSection: {
    marginBottom:
      "18px",

    padding:
      "16px 12px 14px",

    borderRadius:
      "20px",

    background:
      "rgba(255,255,255,0.6)",

    boxShadow:
      "inset 0 0 14px rgba(255,255,255,0.6)",

    textAlign:
      "center",
  },

  ratingSectionTitle: {
    margin:
      "0 0 12px",

    color:
      "#312244",

    fontSize:
      "15px",

    textAlign:
      "left",
  },

  ratingSectionCaption: {
    margin:
      "8px 0 0",

    fontSize:
      "15px",

    fontWeight:
      "800",
  },

  textArea: {
    width:
      "100%",

    height:
      "110px",

    resize:
      "none",

    border:
      "none",

    outline:
      "none",

    borderRadius:
      "22px",

    padding:
      "16px",

    fontSize:
      "15px",

    fontFamily:
      "inherit",

    color:
      "#312244",

    background:
      "rgba(255,255,255,0.8)",

    boxShadow:
      "inset 0 0 18px rgba(49,34,68,0.08)",

    marginBottom:
      "16px",

    boxSizing:
      "border-box",
  },

  saveButton: {
    width:
      "100%",

    padding:
      "15px",

    border:
      "none",

    borderRadius:
      "22px",

    background:
      "linear-gradient(135deg, #9B5DE5, #F15BB5)",

    color:
      "white",

    fontSize:
      "16px",

    fontWeight:
      "800",

    cursor:
      "pointer",

    boxShadow:
      "0 14px 28px rgba(155,93,229,0.35)",
  },

  summaryMood: {
    display:
      "flex",

    justifyContent:
      "center",

    margin:
      "12px 0 16px",
  },

  summaryTitle: {
    color:
      "#312244",

    fontSize:
      "20px",

    margin:
      "0 0 10px 0",
  },

  summaryText: {
    color:
      "#5b4a6b",

    lineHeight:
      "1.6",

    marginBottom:
      "20px",

    fontSize:
      "14px",
  },

  statsBox: {
    display:
      "grid",

    gridTemplateColumns:
      "1fr 1fr",

    gap:
      "12px",
  },

  statItem: {
    background:
      "rgba(255,255,255,0.75)",

    borderRadius:
      "20px",

    padding:
      "16px",

    boxShadow:
      "0 10px 20px rgba(49,34,68,0.08)",
  },

  statNumber: {
    color:
      "#312244",

    fontSize:
      "22px",

    margin:
      "0 0 5px 0",
  },

  statLabel: {
    color:
      "#5b4a6b",

    margin: 0,

    fontSize:
      "13px",
  },

  historyCard: {
    ...glass,

    borderRadius:
      "28px",

    padding:
      "20px",
  },

  historyHeader: {
    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    flexWrap:
      "wrap",

    gap:
      "10px",
  },

  recordBadge: {
    background:
      "rgba(255,255,255,0.75)",

    padding:
      "8px 14px",

    borderRadius:
      "20px",

    color:
      "#5b4a6b",

    fontWeight:
      "700",

    fontSize:
      "13px",

    marginBottom:
      "18px",
  },

  recordBadge2: {
    background:
      "rgba(255,255,255,0.75)",

    padding:
      "6px 12px",

    borderRadius:
      "20px",

    color:
      "#5b4a6b",

    fontWeight:
      "700",

    fontSize:
      "12px",
  },

  emptyBox: {
    textAlign:
      "center",

    padding:
      "30px",

    background:
      "rgba(255,255,255,0.55)",

    borderRadius:
      "22px",
  },

  emptyText: {
    color:
      "#5b4a6b",

    margin: 0,
  },

  historyList: {
    display:
      "grid",

    gap:
      "14px",
  },

  historyItem: {
    display:
      "flex",

    alignItems:
      "center",

    gap:
      "14px",

    padding:
      "14px",

    borderRadius:
      "22px",

    background:
      "rgba(255,255,255,0.75)",

    boxShadow:
      "0 10px 22px rgba(49,34,68,0.09)",
  },

  historyIcon: {
    width:
      "56px",

    height:
      "56px",

    borderRadius:
      "18px",

    display:
      "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    boxShadow:
      "0 10px 20px rgba(49,34,68,0.14)",

    flexShrink: 0,
  },

  historyContent: {
    flex: 1,

    minWidth: 0,
  },

  historyMood: {
    color:
      "#312244",

    margin:
      "0 0 5px 0",

    fontSize:
      "17px",
  },

  historyDate: {
    color:
      "#7d6d89",

    fontSize:
      "12px",
  },
};

export default MoodTracker;