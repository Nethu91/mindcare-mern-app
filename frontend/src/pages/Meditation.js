import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/mood-bg.jpeg";

/* ============================================================
   3D ICONS (pure SVG – no image files needed)
   ============================================================ */

let iconUidCounter = 0;
const useIconUid = () => {
  const ref = useRef(null);
  if (ref.current === null) ref.current = `m3d${++iconUidCounter}`;
  return ref.current;
};

const ICON_INK = "#4a2508";

const iconStarPoints = (cx, cy, R, r) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 ? r : R;
    return `${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`;
  }).join(" ");

const iconSparkle = (x, y, s) =>
  `${x},${y - s} ${x + s * 0.3},${y - s * 0.3} ${x + s},${y} ${x + s * 0.3},${y + s * 0.3} ${x},${y + s} ${x - s * 0.3},${y + s * 0.3} ${x - s},${y} ${x - s * 0.3},${y - s * 0.3}`;

function Icon3D({ name, size = 48, muted = false, style }) {
  const u = useIconUid();
  const id = (k) => `${u}-${k}`;
  const f = (k) => `url(#${id(k)})`;

  // glossy radial gradient (light -> mid -> dark)
  const R = (k, a, b, c) => (
    <radialGradient id={id(k)} cx="35%" cy="28%" r="85%">
      <stop offset="0%" stopColor={a} />
      <stop offset="55%" stopColor={b} />
      <stop offset="100%" stopColor={c} />
    </radialGradient>
  );

  // white shine spot
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

  switch (name) {
    case "wind":
      content = (
        <g>
          <defs>{R("c", "#FFFFFF", "#E3F5FB", "#8CCBE0")}</defs>
          <path d="M10 82 H58 C74 82 76 66 62 66" fill="none" stroke="#2FA9B8" strokeWidth="8" strokeLinecap="round" />
          <path d="M12 80 H58 C70 80 72 69 62 68" fill="none" stroke="#9BEAE4" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M24 93 H50 C61 93 61 82 53 82" fill="none" stroke="#2FA9B8" strokeWidth="6" strokeLinecap="round" />
          <circle cx="34" cy="40" r="16" fill={f("c")} />
          <circle cx="54" cy="30" r="20" fill={f("c")} />
          <circle cx="72" cy="42" r="14" fill={f("c")} />
          <rect x="22" y="38" width="62" height="20" rx="10" fill={f("c")} />
          {gloss(48, 22, 10, 5, -25, 0.9)}
        </g>
      );
      break;

    case "meditate":
      content = (
        <g>
          <defs>
            {R("skin", "#FFE0C7", "#F5B88F", "#D98A5E")}
            {R("body", "#E1C8FF", "#A56BF0", "#6B35C4")}
            {R("legs", "#D2AEFF", "#8E52E0", "#5A2AAE")}
            {R("glow", "#FFFFFF", "#FFEAF6", "#F7C2E4")}
          </defs>
          <circle cx="50" cy="52" r="44" fill={f("glow")} opacity="0.55" />
          <ellipse cx="50" cy="78" rx="34" ry="12" fill={f("legs")} />
          <path d="M28 76 C28 52 37 42 50 42 C63 42 72 52 72 76 Z" fill={f("body")} />
          <circle cx="35" cy="74" r="5.5" fill={f("skin")} />
          <circle cx="65" cy="74" r="5.5" fill={f("skin")} />
          <circle cx="50" cy="28" r="13" fill={f("skin")} />
          <path d="M36.5 26 C37 12 63 12 63.5 26 C58 19 42 19 36.5 26 Z" fill={ICON_INK} />
          <path d="M43 30 q3 2.2 6 0" fill="none" stroke={ICON_INK} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M51 30 q3 2.2 6 0" fill="none" stroke={ICON_INK} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M46.5 36 q3.5 2.5 7 0" fill="none" stroke="#C25A4A" strokeWidth="1.8" strokeLinecap="round" />
          {gloss(42, 54, 4, 9, -10, 0.4)}
          {gloss(44, 22, 4, 2, -25, 0.5)}
        </g>
      );
      break;

    case "moon":
      content = (
        <g>
          <defs>{R("m", "#FFF6BF", "#FFD54F", "#F29E1F")}</defs>
          <path
            d="M66 14 C38 14 18 36 18 60 C18 80 36 92 56 90 C70 89 82 80 86 68 C64 76 44 60 48 38 C50 28 56 20 66 16 Z"
            fill={f("m")}
          />
          {gloss(32, 46, 5, 12, 20, 0.55)}
          <polygon points={iconSparkle(78, 26, 10)} fill="#FFF3B0" stroke="#F2B21F" strokeWidth="1" />
          <polygon points={iconSparkle(88, 50, 6)} fill="#fff" />
          <polygon points={iconSparkle(62, 8, 5)} fill="#fff" />
        </g>
      );
      break;

    case "heartBlue":
    case "heartPurple":
    case "heartEmpty": {
      const pal =
        name === "heartBlue"
          ? ["#C6E6FF", "#5AA5F2", "#2C5FC0"]
          : name === "heartPurple"
          ? ["#EBD3FF", "#A56BF0", "#6B35C4"]
          : ["#FFFFFF", "#F5EEFC", "#D8C7EE"];
      content = (
        <g>
          <defs>{R("h", pal[0], pal[1], pal[2])}</defs>
          <path
            d="M50 86 C20 62 10 42 22 28 C32 17 46 22 50 33 C54 22 68 17 78 28 C90 42 80 62 50 86 Z"
            fill={f("h")}
            stroke={name === "heartEmpty" ? "#CBB8E6" : "none"}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {gloss(33, 34, 9, 5, -35, name === "heartEmpty" ? 0.9 : 0.7)}
        </g>
      );
      break;
    }

    case "book":
      content = (
        <g>
          <defs>
            {R("b", "#B4D6FF", "#4F8DE8", "#2753B5")}
            {R("p", "#FFFFFF", "#F6F1E6", "#DDD2BC")}
          </defs>
          <rect x="22" y="24" width="62" height="62" rx="8" fill="#1F3F8F" />
          <rect x="20" y="22" width="58" height="60" rx="5" fill={f("p")} />
          <rect x="14" y="16" width="62" height="64" rx="8" fill={f("b")} />
          <rect x="14" y="16" width="9" height="64" rx="4" fill="#2753B5" opacity="0.6" />
          <rect x="32" y="34" width="34" height="6" rx="3" fill="#fff" opacity="0.9" />
          <rect x="32" y="46" width="26" height="5" rx="2.5" fill="#fff" opacity="0.7" />
          <path d="M60 16 V38 L65 33 L70 38 V16 Z" fill="#FF5A6E" />
          {gloss(30, 24, 9, 3.5, -10, 0.55)}
        </g>
      );
      break;

    case "flower":
      content = (
        <g>
          <defs>
            {R("p", "#FFE3EF", "#FF8FBF", "#DB3F8A")}
            {R("c", "#FFF3B0", "#FFC93C", "#E08A00")}
          </defs>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="50" cy="28" rx="12" ry="19" fill={f("p")} transform={`rotate(${a} 50 50)`} />
          ))}
          <circle cx="50" cy="50" r="13" fill={f("c")} />
          {gloss(45, 45, 4, 2.5, -25, 0.9)}
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
          <path d="M50 18 C63 36 63 60 50 82 C37 60 37 36 50 18 Z" fill={f("l")} transform="rotate(-68 50 82)" />
          <path d="M50 18 C63 36 63 60 50 82 C37 60 37 36 50 18 Z" fill={f("l")} transform="rotate(68 50 82)" />
          <path d="M50 18 C63 36 63 60 50 82 C37 60 37 36 50 18 Z" fill={f("l")} transform="rotate(-36 50 82)" />
          <path d="M50 18 C63 36 63 60 50 82 C37 60 37 36 50 18 Z" fill={f("l")} transform="rotate(36 50 82)" />
          <path d="M50 14 C64 34 64 60 50 82 C36 60 36 34 50 14 Z" fill={f("pc")} />
          {gloss(45, 36, 4, 11, 8, 0.6)}
        </g>
      );
      break;

    case "sun":
      content = (
        <g>
          <defs>{R("s", "#FFF4B0", "#FFB92E", "#E27A0B")}</defs>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <rect key={a} x="46" y="4" width="8" height="16" rx="4" fill="#FFB92E" transform={`rotate(${a} 50 50)`} />
          ))}
          <circle cx="50" cy="50" r="27" fill={f("s")} />
          {gloss(41, 38, 10, 5.5, -30, 0.8)}
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

    case "leaf":
      content = (
        <g>
          <defs>{R("lf", "#CFF8BC", "#5FCB5B", "#2E8E3E")}</defs>
          <path d="M18 80 C12 44 38 16 84 16 C88 58 62 86 18 80 Z" fill={f("lf")} />
          <path d="M22 78 C42 58 58 40 78 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" opacity="0.75" />
          {gloss(46, 30, 12, 4.5, -35, 0.55)}
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

    case "sparkle":
      content = (
        <g>
          <defs>{R("sp", "#FFF8C2", "#FFD43B", "#E08A00")}</defs>
          <polygon points={iconSparkle(46, 54, 40)} fill={f("sp")} stroke="#E08A00" strokeWidth="1.5" strokeLinejoin="round" />
          <polygon points={iconSparkle(80, 22, 14)} fill={f("sp")} stroke="#E08A00" strokeWidth="1.2" strokeLinejoin="round" />
          {gloss(38, 42, 5, 2.5, -40, 0.8)}
        </g>
      );
      break;

    case "rainbow":
      content = (
        <g>
          <defs>{R("rc", "#FFFFFF", "#F2F6FF", "#C9D6F2")}</defs>
          <path d="M10 74 A40 40 0 0 1 90 74" fill="none" stroke="#FF5A6E" strokeWidth="8" strokeLinecap="round" />
          <path d="M20 74 A30 30 0 0 1 80 74" fill="none" stroke="#FFC93C" strokeWidth="8" strokeLinecap="round" />
          <path d="M30 74 A20 20 0 0 1 70 74" fill="none" stroke="#4F8DE8" strokeWidth="8" strokeLinecap="round" />
          <circle cx="14" cy="76" r="11" fill={f("rc")} />
          <circle cx="27" cy="80" r="9" fill={f("rc")} />
          <circle cx="86" cy="76" r="11" fill={f("rc")} />
          <circle cx="73" cy="80" r="9" fill={f("rc")} />
        </g>
      );
      break;

    case "star":
      content = (
        <g>
          <defs>{R("st", "#FFF8C2", "#FFD43B", "#E08A00")}</defs>
          <polygon points={iconStarPoints(50, 54, 42, 19)} fill={f("st")} stroke="#E08A00" strokeWidth="3" strokeLinejoin="round" />
          {gloss(40, 40, 8, 3.5, -35, 0.8)}
        </g>
      );
      break;

    case "bell":
      content = (
        <g>
          <defs>
            {muted
              ? R("bl", "#F4F0FA", "#CFC6DD", "#9A8DB0")
              : R("bl", "#FFF3B0", "#FFC93C", "#E08A00")}
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

function Meditation({ breathing = false }) {
  const navigate = useNavigate();

  const categories = [
    "All",
    "Breathing",
    "Mindfulness",
    "Sleep",
    "Anxiety",
    "Focus",
    "Gratitude",
  ];

  const sessions = [
    {
      id: 1,
      title: "Calm Breathing",
      category: "Breathing",
      duration: "5 min",
      level: "Beginner",
      mood: "Calm",
      icon: "wind",
      color: "#A8DADC",
      description:
        "A simple breathing meditation to calm your body and reduce emotional pressure.",
      steps: [
        "Sit comfortably and relax your shoulders.",
        "Breathe in slowly for 4 seconds.",
        "Hold your breath for 2 seconds.",
        "Breathe out gently for 6 seconds.",
      ],
    },
    {
      id: 2,
      title: "Mindful Awareness",
      category: "Mindfulness",
      duration: "10 min",
      level: "Easy",
      mood: "Present",
      icon: "meditate",
      color: "#CDB4DB",
      description:
        "Focus on the present moment and gently observe your thoughts without judgment.",
      steps: [
        "Close your eyes softly.",
        "Notice your breathing.",
        "Observe your thoughts calmly.",
        "Bring your attention back to the present.",
      ],
    },
    {
      id: 3,
      title: "Deep Sleep Meditation",
      category: "Sleep",
      duration: "15 min",
      level: "Calm",
      mood: "Rest",
      icon: "moon",
      color: "#B8C0FF",
      description:
        "A soft meditation session to relax your mind and prepare your body for sleep.",
      steps: [
        "Lie down comfortably.",
        "Relax your forehead and jaw.",
        "Release tension from your body.",
        "Let your breathing become slow and gentle.",
      ],
    },
    {
      id: 4,
      title: "Anxiety Release",
      category: "Anxiety",
      duration: "8 min",
      level: "Supportive",
      mood: "Relief",
      icon: "heartBlue",
      color: "#FFAFCC",
      description:
        "A guided meditation to reduce anxious feelings and create a sense of safety.",
      steps: [
        "Place one hand on your chest.",
        "Take slow deep breaths.",
        "Remind yourself that you are safe.",
        "Let each exhale release tension.",
      ],
    },
    {
      id: 5,
      title: "Focus Reset",
      category: "Focus",
      duration: "7 min",
      level: "Easy",
      mood: "Clear",
      icon: "book",
      color: "#A8DADC",
      description:
        "Clear mental distractions and gently bring your attention back to your task.",
      steps: [
        "Sit upright and breathe slowly.",
        "Notice distractions without reacting.",
        "Choose one task to focus on.",
        "Return your attention whenever it wanders.",
      ],
    },
    {
      id: 6,
      title: "Gratitude Reflection",
      category: "Gratitude",
      duration: "6 min",
      level: "Beginner",
      mood: "Positive",
      icon: "flower",
      color: "#FFD166",
      description:
        "A gentle reflection session to build positive thoughts and emotional balance.",
      steps: [
        "Think of one thing you are thankful for.",
        "Notice how it makes you feel.",
        "Breathe in appreciation.",
        "Carry that kindness into your day.",
      ],
    },
    {
      id: 7,
      title: "Body Scan Relaxation",
      category: "Mindfulness",
      duration: "12 min",
      level: "Calm",
      mood: "Relaxed",
      icon: "lotus",
      color: "#FFC8DD",
      description:
        "Slowly scan your body from head to toe and release physical tension.",
      steps: [
        "Start from the top of your head.",
        "Notice each part of your body.",
        "Relax tight areas gently.",
        "End with slow breathing.",
      ],
    },
    {
      id: 8,
      title: "Morning Peace",
      category: "Breathing",
      duration: "5 min",
      level: "Beginner",
      mood: "Fresh",
      icon: "sun",
      color: "#FFD6A5",
      description:
        "Start your morning with calm breathing and positive intention.",
      steps: [
        "Sit comfortably.",
        "Take three deep breaths.",
        "Set one peaceful intention.",
        "Begin your day with kindness.",
      ],
    },
  ];

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSession, setSelectedSession] = useState(sessions[0]);
  const [favorites, setFavorites] = useState([]);
  const [completedSessions, setCompletedSessions] = useState([]);
  const [timerRunning, setTimerRunning] = useState(false);
  const [breathPhase, setBreathPhase] = useState("Breathe In");
  const [elapsed, setElapsed] = useState(0); // milliseconds
  const startTimeRef = useRef(0);
  const audioCtxRef = useRef(null);
  const goalNotifiedRef = useRef(false);
  const [goalReached, setGoalReached] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  const filteredSessions =
    selectedCategory === "All"
      ? sessions
      : sessions.filter((item) => item.category === selectedCategory);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    if (!timerRunning) return;
    const phases = ["Breathe In", "Hold", "Breathe Out", "Relax"];
    let step = 0;
    setBreathPhase(phases[step]);
    const timer = setInterval(() => {
      step = (step + 1) % phases.length;
      setBreathPhase(phases[step]);
    }, 3000);
    return () => clearInterval(timer);
  }, [timerRunning, selectedSession.id]);

  // Real-time stopwatch: runs while the practice is running,
  // keeps its value when paused, resumes from the same time.
  useEffect(() => {
    if (!timerRunning) return;
    startTimeRef.current = Date.now() - elapsed;
    const id = setInterval(() => {
      setElapsed(Date.now() - startTimeRef.current);
    }, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerRunning]);

  const formatTime = (ms) => {
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const sec = total % 60;
    const mm = String(m).padStart(2, "0");
    const ss = String(sec).padStart(2, "0");
    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
  };

  const targetMinutes = parseInt(selectedSession.duration, 10) || 0;
  const progress = targetMinutes
    ? Math.min(elapsed / (targetMinutes * 60000), 1)
    : 0;

  // Soft 3-note bell (no audio file needed)
  const playChime = () => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t0 = ctx.currentTime + i * 0.45;
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.35, t0 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 1.7);
    });
  };

  // Notify once when the goal time is reached
  useEffect(() => {
    if (!timerRunning || !targetMinutes) return;
    if (goalNotifiedRef.current) return;
    if (elapsed >= targetMinutes * 60000) {
      goalNotifiedRef.current = true;
      setGoalReached(true);
      if (soundOn) playChime();
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, timerRunning]);

  const clearGoal = () => {
    goalNotifiedRef.current = false;
    setGoalReached(false);
  };

  const resetStopwatch = () => {
    setTimerRunning(false);
    setElapsed(0);
    setBreathPhase("Breathe In");
    clearGoal();
  };

  const startMeditation = () => {
    // Create / resume the audio engine on a user click so the
    // browser allows the chime to play later.
    try {
      if (!audioCtxRef.current) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (Ctx) audioCtxRef.current = new Ctx();
      }
      if (audioCtxRef.current?.state === "suspended") {
        audioCtxRef.current.resume();
      }
    } catch (e) {
      console.error(e);
    }
    setTimerRunning(true);
  };
  const stopMeditation = () => {
    setTimerRunning(false);
    setBreathPhase("Breathe In");
  };

  const completeSession = () => {
    if (!completedSessions.includes(selectedSession.id)) {
      setCompletedSessions([...completedSessions, selectedSession.id]);
    }
    setTimerRunning(false);
    alert(
      `Meditation session completed successfully 🌿\nTime practiced: ${formatTime(elapsed)}`
    );
    setElapsed(0);
    clearGoal();
  };

  return (
    <div style={styles.page}>
      <div
        style={{
          ...styles.bgBlur,
          backgroundImage: `url(${bgImage})`,
        }}
      ></div>

      <div style={styles.bgPhone}>
        <div
          style={{
            ...styles.bgPhoneImage,
            backgroundImage: `linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.22)), url(${bgImage})`,
          }}
        ></div>
      </div>

      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <button
              style={styles.backButton}
              onClick={() => navigate("/dashboard")}
            >
              ← Back to Dashboard
            </button>

            <h1 style={styles.title}>{breathing ? "Breathing Practice" : "Meditation"}</h1>
            <p style={styles.subtitle}>
              Practice guided meditation, breathing, mindfulness, sleep calm,
              and stress relief.
            </p>
          </div>

          <div style={{ ...styles.headerBadge, display: "flex", alignItems: "center", gap: "8px" }}>
            <Icon3D name="meditate" size={24} /> Mindfulness Space
          </div>
        </div>

        <div style={styles.heroCard}>
          <div style={{ minWidth: 0 }}>
            <h2 style={styles.heroTitle}>Create a peaceful moment for yourself</h2>
            <p style={styles.heroText}>
              Choose a meditation session, follow the breathing guide, and
              complete short mindfulness practices to support your mental
              wellbeing.
            </p>
          </div>

          <div style={styles.heroIcon}>
            <Icon3D name="lotus" size={46} />
          </div>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              <Icon3D name="meditate" size={30} />
            </div>
            <div>
              <h3 style={styles.statNumber}>{sessions.length}</h3>
              <p style={styles.statText}>Meditations</p>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              <Icon3D name="check" size={30} />
            </div>
            <div>
              <h3 style={styles.statNumber}>{completedSessions.length}</h3>
              <p style={styles.statText}>Completed</p>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              <Icon3D name="heartPurple" size={30} />
            </div>
            <div>
              <h3 style={styles.statNumber}>{favorites.length}</h3>
              <p style={styles.statText}>Favorites</p>
            </div>
          </div>
        </div>

        <div style={styles.mainGrid}>
          <div style={styles.leftPanel}>
            <div style={styles.panelHeader}>
              <div>
                <h2 style={styles.sectionTitle}>Meditation Library</h2>
                <p style={styles.sectionSubText}>
                  Select a category and choose a guided session.
                </p>
              </div>
              <div style={styles.panelIcon}>
                <Icon3D name="leaf" size={34} />
              </div>
            </div>

            <div style={styles.categoryRow}>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    ...styles.categoryButton,
                    background:
                      selectedCategory === category
                        ? "linear-gradient(135deg, #9B5DE5, #F15BB5)"
                        : "rgba(255,255,255,0.68)",
                    color:
                      selectedCategory === category ? "#FFFFFF" : "#312244",
                  }}
                >
                  {category}
                </button>
              ))}
            </div>

            <div style={styles.sessionList}>
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  style={{
                    ...styles.sessionCard,
                    border:
                      selectedSession.id === session.id
                        ? "3px solid #9B5DE5"
                        : "1px solid rgba(255,255,255,0.75)",
                    background:
                      selectedSession.id === session.id
                        ? "linear-gradient(145deg, #FFFFFF, #F3E8FF)"
                        : "rgba(255,255,255,0.64)",
                  }}
                  onClick={() => {
                    setSelectedSession(session);
                    setTimerRunning(false);
                    setElapsed(0);
                    clearGoal();
                    setBreathPhase("Breathe In");
                  }}
                >
                  <div
                    style={{
                      ...styles.sessionIcon,
                      backgroundColor: session.color,
                    }}
                  >
                    <Icon3D name={session.icon} size={38} />
                  </div>

                  <div style={styles.sessionInfo}>
                    <h3 style={styles.sessionTitle}>{session.title}</h3>
                    <p style={styles.sessionDesc}>{session.description}</p>

                    <div style={styles.metaRow}>
                      <span style={styles.metaBadge}>
                        <Icon3D name="clock" size={14} /> {session.duration}
                      </span>
                      <span style={styles.metaBadge}>
                        <Icon3D name="sparkle" size={14} /> {session.level}
                      </span>
                      <span style={styles.metaBadge}>
                        <Icon3D name="rainbow" size={16} /> {session.mood}
                      </span>
                    </div>
                  </div>

                  <button
                    style={styles.favoriteButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(session.id);
                    }}
                  >
                    <Icon3D
                      name={favorites.includes(session.id) ? "heartPurple" : "heartEmpty"}
                      size={22}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.rightPanel}>
            <div style={styles.practiceCard}>
              <div
                style={{
                  ...styles.meditationVisual,
                  background: `linear-gradient(135deg, ${selectedSession.color}, #FFFFFF)`,
                }}
              >
                <div
                  style={{
                    ...styles.breathCircle,
                    transform: timerRunning ? "scale(1.18)" : "scale(1)",
                  }}
                >
                  <Icon3D name={selectedSession.icon} size={86} />
                </div>
              </div>

              <h2 style={styles.practiceTitle}>{selectedSession.title}</h2>
              <p style={styles.practiceText}>{selectedSession.description}</p>

              <div style={styles.breathBadge}>
                {timerRunning ? breathPhase : "Ready to Begin"}
              </div>

              <div style={styles.stopwatchBox}>
                <span style={styles.stopwatchLabel}>
                  <Icon3D name="clock" size={16} /> Session Time
                </span>
                <div style={styles.stopwatchTime}>{formatTime(elapsed)}</div>

                <div style={styles.progressTrack}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${progress * 100}%`,
                    }}
                  ></div>
                </div>

                {goalReached && (
                  <div style={styles.goalBanner}>
                    <Icon3D name="star" size={20} /> <span>Goal reached! Great job, you can keep going or tap Complete.</span>
                  </div>
                )}

                <div style={styles.stopwatchFooter}>
                  <span>Goal: {selectedSession.duration}</span>
                  <button
                    style={styles.resetButton}
                    onClick={() => setSoundOn(!soundOn)}
                  >
                    <Icon3D name="bell" size={16} muted={!soundOn} />
                    {soundOn ? "Sound On" : "Sound Off"}
                  </button>
                  <button
                    style={styles.resetButton}
                    onClick={resetStopwatch}
                    disabled={elapsed === 0 && !timerRunning}
                  >
                    ↺ Reset
                  </button>
                </div>
              </div>

              <div style={styles.practiceInfoGrid}>
                <div style={styles.infoBox}>
                  <span style={styles.infoLabel}>Category</span>
                  <strong style={styles.infoValue}>
                    {selectedSession.category}
                  </strong>
                </div>

                <div style={styles.infoBox}>
                  <span style={styles.infoLabel}>Duration</span>
                  <strong style={styles.infoValue}>
                    {selectedSession.duration}
                  </strong>
                </div>

                <div style={styles.infoBox}>
                  <span style={styles.infoLabel}>Mood</span>
                  <strong style={styles.infoValue}>{selectedSession.mood}</strong>
                </div>
              </div>

              <div style={styles.buttonRow}>
                {!timerRunning ? (
                  <button style={styles.primaryButton} onClick={startMeditation}>
                    Start Practice
                  </button>
                ) : (
                  <button style={styles.secondaryButton} onClick={stopMeditation}>
                    Pause Practice
                  </button>
                )}

                <button style={styles.completeButton} onClick={completeSession}>
                  Complete
                </button>
              </div>
            </div>

            <div style={styles.stepsCard}>
              <h3 style={styles.stepsTitle}>Guided Steps</h3>

              {selectedSession.steps.map((step, index) => (
                <div key={index} style={styles.stepItem}>
                  <div style={styles.stepNumber}>{index + 1}</div>
                  <p style={styles.stepText}>{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const glass = {
  background: "rgba(255,255,255,0.58)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.75)",
  boxShadow: "0 18px 40px rgba(49,34,68,0.14)",
};

const styles = {
  page: {
    position: "relative",
    minHeight: "100vh",
    padding: "20px 14px 50px",
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

  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: "20px",
    gap: "12px",
  },

  backButton: {
    border: "none",
    padding: "10px 16px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.65)",
    color: "#6D597A",
    fontWeight: "800",
    cursor: "pointer",
    marginBottom: "12px",
    boxShadow: "0 10px 24px rgba(49,34,68,0.1)",
  },

  title: {
    fontSize: "30px",
    color: "#312244",
    margin: "0 0 7px 0",
    fontWeight: "900",
  },

  subtitle: {
    color: "#6D597A",
    fontSize: "14px",
    margin: 0,
    lineHeight: "1.5",
  },

  headerBadge: {
    padding: "10px 18px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.55)",
    boxShadow: "0 12px 25px rgba(49,34,68,0.12)",
    color: "#4A4E69",
    fontWeight: "800",
    fontSize: "13px",
  },

  heroCard: {
    ...glass,
    background: "rgba(255,255,255,0.55)",
    border: "1px solid rgba(255,255,255,0.75)",
    borderRadius: "28px",
    padding: "20px",
    boxShadow: "0 25px 60px rgba(49,34,68,0.15)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
    gap: "14px",
  },

  heroTitle: {
    color: "#312244",
    fontSize: "20px",
    margin: "0 0 8px 0",
    fontWeight: "900",
  },

  heroText: {
    color: "#6D597A",
    lineHeight: "1.6",
    margin: 0,
    fontSize: "13px",
  },

  heroIcon: {
    width: "60px",
    height: "60px",
    borderRadius: "20px",
    background: "linear-gradient(135deg, #CDB4DB, #FFC8DD)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
    boxShadow: "0 18px 35px rgba(49,34,68,0.16)",
    flexShrink: 0,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
    marginBottom: "18px",
  },

  statCard: {
    ...glass,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "8px",
    padding: "14px 6px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.56)",
    border: "1px solid rgba(255,255,255,0.78)",
    boxShadow: "0 20px 45px rgba(49,34,68,0.13)",
    minWidth: 0,
  },

  statIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #F3E8FF, #FFFFFF)",
    fontSize: "22px",
  },

  statNumber: {
    color: "#312244",
    margin: "0 0 2px 0",
    fontSize: "22px",
    fontWeight: "900",
  },

  statText: {
    color: "#6D597A",
    margin: 0,
    fontSize: "12px",
    fontWeight: "700",
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "18px",
    marginBottom: "18px",
  },

  leftPanel: {
    ...glass,
    background: "rgba(255,255,255,0.54)",
    border: "1px solid rgba(255,255,255,0.78)",
    borderRadius: "28px",
    padding: "20px",
    boxShadow: "0 25px 60px rgba(49,34,68,0.16)",
    minWidth: 0,
  },

  rightPanel: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "18px",
    minWidth: 0,
  },

  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    marginBottom: "18px",
  },

  sectionTitle: {
    color: "#312244",
    fontSize: "21px",
    margin: "0 0 7px 0",
    fontWeight: "900",
  },

  sectionSubText: {
    color: "#6D597A",
    margin: 0,
    lineHeight: "1.5",
    fontSize: "13px",
  },

  panelIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "26px",
    background: "linear-gradient(135deg, #CDB4DB, #FFC8DD)",
    boxShadow: "0 15px 30px rgba(49,34,68,0.15)",
    flexShrink: 0,
  },

  categoryRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "18px",
  },

  categoryButton: {
    border: "none",
    padding: "10px 14px",
    borderRadius: "16px",
    fontWeight: "900",
    fontSize: "13px",
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(49,34,68,0.09)",
  },

  sessionList: {
    display: "grid",
    gap: "14px",
  },

  sessionCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px",
    borderRadius: "24px",
    boxShadow: "0 16px 34px rgba(49,34,68,0.11)",
    cursor: "pointer",
    transition: "0.3s ease",
    position: "relative",
  },

  sessionIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    boxShadow: "0 14px 24px rgba(49,34,68,0.13)",
    flexShrink: 0,
  },

  sessionInfo: {
    flex: 1,
    minWidth: 0,
  },

  sessionTitle: {
    color: "#312244",
    fontSize: "16px",
    margin: "0 0 5px 0",
    fontWeight: "900",
  },

  sessionDesc: {
    color: "#6D597A",
    margin: "0 0 10px 0",
    lineHeight: "1.5",
    fontSize: "13px",
  },

  metaRow: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
  },

  metaBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    background: "rgba(255,255,255,0.72)",
    color: "#6D597A",
    padding: "5px 9px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "800",
  },

  favoriteButton: {
    border: "none",
    background: "rgba(255,255,255,0.76)",
    width: "36px",
    height: "36px",
    borderRadius: "14px",
    cursor: "pointer",
    fontSize: "18px",
    boxShadow: "0 10px 20px rgba(49,34,68,0.1)",
    flexShrink: 0,
    alignSelf: "flex-start",
  },

  practiceCard: {
    ...glass,
    background: "rgba(255,255,255,0.54)",
    border: "1px solid rgba(255,255,255,0.78)",
    borderRadius: "28px",
    padding: "20px",
    boxShadow: "0 25px 60px rgba(49,34,68,0.16)",
    textAlign: "center",
  },

  meditationVisual: {
    height: "210px",
    borderRadius: "26px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "18px",
    overflow: "hidden",
  },

  breathCircle: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 20px 45px rgba(49,34,68,0.18)",
    transition: "1.2s ease",
  },

  breathIcon: {
    fontSize: "56px",
  },

  practiceTitle: {
    color: "#312244",
    margin: "0 0 8px 0",
    fontWeight: "900",
    fontSize: "22px",
  },

  practiceText: {
    color: "#6D597A",
    lineHeight: "1.6",
    margin: "0 0 16px 0",
    fontSize: "14px",
  },

  breathBadge: {
    display: "inline-block",
    padding: "9px 16px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.72)",
    color: "#9B5DE5",
    fontWeight: "900",
    marginBottom: "18px",
  },

  stopwatchBox: {
    background: "rgba(255,255,255,0.7)",
    borderRadius: "22px",
    padding: "16px",
    marginBottom: "18px",
  },

  stopwatchLabel: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#8D7D99",
    fontSize: "12px",
    fontWeight: "800",
    marginBottom: "6px",
  },

  stopwatchTime: {
    color: "#7C3AED",
    fontSize: "44px",
    fontWeight: "900",
    letterSpacing: "2px",
    fontVariantNumeric: "tabular-nums",
    lineHeight: "1.1",
    marginBottom: "12px",
  },

  progressTrack: {
    width: "100%",
    height: "8px",
    borderRadius: "10px",
    background: "rgba(155,93,229,0.15)",
    overflow: "hidden",
    marginBottom: "10px",
  },

  progressFill: {
    height: "100%",
    borderRadius: "10px",
    background: "linear-gradient(90deg, #9B5DE5, #F15BB5)",
    transition: "width 0.3s linear",
  },

  stopwatchFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#6D597A",
    fontSize: "12px",
    fontWeight: "800",
  },

  goalBanner: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(112,214,164,0.3)",
    color: "#2F855A",
    borderRadius: "14px",
    padding: "10px 12px",
    fontSize: "13px",
    fontWeight: "800",
    marginBottom: "10px",
    lineHeight: "1.4",
  },

  resetButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    border: "none",
    background: "rgba(155,93,229,0.12)",
    color: "#7C3AED",
    padding: "6px 12px",
    borderRadius: "12px",
    fontWeight: "800",
    fontSize: "12px",
    cursor: "pointer",
  },

  practiceInfoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "8px",
    marginBottom: "18px",
  },

  infoBox: {
    background: "rgba(255,255,255,0.7)",
    borderRadius: "16px",
    padding: "11px 6px",
    minWidth: 0,
  },

  infoLabel: {
    display: "block",
    color: "#8D7D99",
    fontSize: "11px",
    marginBottom: "5px",
    fontWeight: "800",
  },

  infoValue: {
    color: "#312244",
    fontSize: "13px",
  },

  buttonRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },

  primaryButton: {
    padding: "14px",
    border: "none",
    borderRadius: "22px",
    background: "linear-gradient(135deg, #9B5DE5, #F15BB5)",
    color: "white",
    fontSize: "15px",
    fontWeight: "900",
    cursor: "pointer",
    boxShadow: "0 18px 35px rgba(155,93,229,0.35)",
  },

  secondaryButton: {
    padding: "14px",
    border: "none",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.75)",
    color: "#6D597A",
    fontSize: "15px",
    fontWeight: "900",
    cursor: "pointer",
  },

  completeButton: {
    padding: "14px",
    border: "none",
    borderRadius: "22px",
    background: "rgba(112,214,164,0.35)",
    color: "#2F855A",
    fontSize: "15px",
    fontWeight: "900",
    cursor: "pointer",
  },

  stepsCard: {
    ...glass,
    padding: "20px",
    borderRadius: "28px",
    background: "rgba(255,255,255,0.56)",
    border: "1px solid rgba(255,255,255,0.78)",
    boxShadow: "0 20px 45px rgba(49,34,68,0.13)",
  },

  stepsTitle: {
    color: "#312244",
    margin: "0 0 16px 0",
    fontSize: "20px",
    fontWeight: "900",
  },

  stepItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.65)",
    marginBottom: "10px",
  },

  stepNumber: {
    width: "34px",
    height: "34px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #9B5DE5, #F15BB5)",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "900",
    flexShrink: 0,
  },

  stepText: {
    color: "#6D597A",
    margin: 0,
    lineHeight: "1.5",
    fontSize: "14px",
  },
};

export default Meditation;