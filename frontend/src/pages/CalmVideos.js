import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
// Background image: frontend/src/assets/mood-bg.jpeg
import moodBg from "../assets/mood-bg.jpeg";

const LS_KEY = "calmFavorites";

const CATEGORIES = ["All", "Favorites", "Meditation", "Breathing", "Sleep", "Stress Relief"];

const CAT_EMOJI = {
  All: ["🌈", "#CDB4DB"],
  Favorites: ["💜", "#F8BBD0"],
  Meditation: ["🧘", "#C8E6C9"],
  Breathing: ["🌬️", "#B2EBF2"],
  Sleep: ["🌙", "#B8C0FF"],
  "Stress Relief": ["🌿", "#CAFFBF"],
};

// [id, category, title, duration, level, mood, emoji, color, youtubeId, description]
const RAW = [
  // MEDITATION
  [1, "Meditation", "Peaceful Mind Meditation", "10 min", "Easy", "Relaxation", "🧘‍♀️", "#CDB4DB", "ZToicYcHIOU", "A gentle meditation video to help you feel peaceful, centered, and balanced."],
  [2, "Meditation", "Positive Energy Morning Calm", "7 min", "Beginner", "Positive Start", "☀️", "#FFD166", "ssss7V1_eyA", "Start your morning with calm thoughts, positive energy, and self-kindness."],
  [3, "Meditation", "5-Minute Daily Mindfulness", "5 min", "Quick", "Mindful Focus", "🌸", "#F8BBD0", "dEZkS2A4Jqg", "A quick reset to anchor your awareness to the present moment wherever you are."],
  [4, "Meditation", "Letting Go of Anxiety & Overthinking", "15 min", "Medium", "Anxiety Relief", "🕊️", "#B3E5FC", "O-6f5wQXSu8", "Release persistent racing thoughts and bring deep serenity to an overwhelmed mind."],
  [5, "Meditation", "Loving-Kindness (Metta) Practice", "12 min", "Gentle", "Self-Compassion", "💖", "#FFCDD2", "sz7cpV7ERsM", "Cultivate feelings of warmth, goodwill, and unconditional kindness toward yourself."],
  [6, "Meditation", "Full Body Scan for Relaxation", "15 min", "Gentle", "Body Awareness", "🌿", "#C8E6C9", "15q-N-_kkrU", "Systematically release physical tightness and connect with sensations in your body."],
  [7, "Meditation", "Inner Peace & Clarity Meditation", "10 min", "Easy", "Mental Clarity", "💎", "#E1BEE7", "QHkXvPq2pQE", "Clear mental fog and reconnect with your inner stillness and calm confidence."],
  [8, "Meditation", "Grounding for Emotional Balance", "8 min", "Beginner", "Grounding", "🏔️", "#D7CCC8", "6p_yaNFSYao", "Root your energy deeply into the earth to feel stable, safe, and emotionally secure."],
  [9, "Meditation", "Stress Release & Healing Light", "14 min", "Calm", "Deep Healing", "✨", "#FFF9C4", "syx3a1CYY00", "Visualize radiant soothing light melting away layers of tension and emotional exhaustion."],
  [10, "Meditation", "Quiet The Chattering Mind", "10 min", "Easy", "Quiet Mind", "🍃", "#DCEDC8", "vj0JDwQLof4", "Simple guidance to soothe an overstimulated brain and return to quiet stillness."],
  [11, "Meditation", "Mindful Awareness & Focus", "8 min", "Beginner", "Daily Focus", "🚶", "#B2DFDB", "2FGR-OspxsU", "Train your mind to remain attentive and non-judgmental during daily routines."],
  [12, "Meditation", "Self-Love & Confidence Boost", "12 min", "Intermediate", "Confidence", "🌺", "#F48FB1", "itZMM5gCboo", "Rebuild inner strength, self-respect, and trust in your personal growth journey."],
  [13, "Meditation", "Serenity Ocean Guided Meditation", "10 min", "Calm", "Serenity", "🌊", "#80DEEA", "W19PdslWCaY", "Let gentle ocean waves wash away feelings of fatigue, leaving you revitalized."],
  [14, "Meditation", "Zen Garden Tranquility Meditation", "15 min", "Easy", "Peace", "🎋", "#C5E1A5", "2OEL4P1Rz04", "Immerse yourself in a serene Japanese zen garden soundscape and mindful breath."],
  [15, "Meditation", "Gratitude Practice for Joy", "6 min", "Beginner", "Gratitude", "🌻", "#FFE082", "sTANio_2E0Q", "Shift your mental state into appreciation and notice the simple wonders around you."],
  // BREATHING
  [16, "Breathing", "5 Minute Calm Breathing Exercise", "5 min", "Beginner", "Anxiety Relief", "🌬️", "#A8DADC", "inpok4MKVLM", "A short, steady breathing session to slow your heart rate and ease nervous tension."],
  [17, "Breathing", "Box Breathing (4-4-4-4) Technique", "4 min", "Beginner", "Focus & Calm", "⏹️", "#B2EBF2", "bF_1ZiFta-E", "Navy SEAL technique: Inhale 4s, hold 4s, exhale 4s, hold 4s for peak composure."],
  [18, "Breathing", "Quick Panic Control Exercise", "4 min", "Quick", "Panic Relief", "💙", "#FFAFCC", "odADwWzHR24", "A guided exercise to halt acute panic symptoms and ground your nervous system."],
  [19, "Breathing", "4-7-8 Relaxing Breath for Calm", "6 min", "Easy", "Deep Relax", "🍃", "#C8E6C9", "1Dv-ldGLnIY", "Natural tranquilizer for the nervous system: 4s inhale, 7s hold, 8s slow exhale."],
  [20, "Breathing", "Diaphragmatic Belly Breathing", "5 min", "Beginner", "Lung Health", "🎈", "#FFE0B2", "g2Wo6bupnEQ", "Learn proper deep abdominal breathing to maximize oxygen intake and relieve stress."],
  [21, "Breathing", "Resonant Coherent Breathing (5.5s)", "8 min", "Medium", "Heart Rhythm", "💓", "#F8BBD0", "ub3P8v1gJ5c", "Breathe at optimal 5.5 breaths per minute to synchronize heart rate variability."],
  [22, "Breathing", "Alternate Nostril Breathing (Nadi Shodhana)", "7 min", "Intermediate", "Balance", "🧘", "#D1C4E9", "8VwufJrUhic", "Ancient yogic breath practice to harmonize the left and right hemispheres of the brain."],
  [23, "Breathing", "Wim Hof Style Energizing Breath", "10 min", "Advanced", "Energy Boost", "⚡", "#FFF176", "tybOi4hjZFQ", "Powerful rhythmic breathing cycles to reset cellular energy and enhance immunity."],
  [24, "Breathing", "Soothing Ocean Breath (Ujjayi)", "6 min", "Easy", "Inner Warmth", "🌊", "#80CBC4", "G2159iH_9eA", "Create gentle ocean-like throat sounds to quiet internal chatter and foster peace."],
  [25, "Breathing", "Slow Pace 6 Breaths Per Minute", "10 min", "Gentle", "Heart Rate Drop", "⏱️", "#B0BEC5", "aNXKjGFUlMs", "Gentle paced breathing with visual cues to trigger deep parasympathetic relaxation."],
  [26, "Breathing", "Physiological Sigh Instant Reset", "3 min", "Quick", "Instant Reset", "😮‍💨", "#E0F2F1", "m8rRzTtP7Tc", "Two quick inhales followed by one long exhale for the fastest autonomic reset known."],
  [27, "Breathing", "Square Breathing Visual Pacer", "5 min", "Beginner", "Stress Drop", "🫧", "#E1F5FE", "tEmt1Znux58", "Follow an expanding calming circle to bring immediate order and calmness to breathing."],
  [28, "Breathing", "Evening Unwind Breathwork", "8 min", "Calm", "Wind Down", "🌇", "#FFCCBC", "nmFUDkj1Aq0", "Smooth evening breath cycles designed to ease away the fatigue of a long workday."],
  [29, "Breathing", "Breathwork for Emotional Balance", "7 min", "Easy", "Balance", "⚖️", "#D7CCC8", "4bIr4_XF6_4", "Gentle rhythm helping you step back from acute emotional spikes into inner stability."],
  [30, "Breathing", "Morning Oxygen Boost Breathing", "5 min", "Beginner", "Fresh Start", "🌅", "#FFE082", "7Ep5mKuRmAA", "Fill your lungs with morning freshness, boost natural alertness, and awaken your body."],
  // SLEEP
  [31, "Sleep", "Deep Sleep Relaxation & Body Scan", "15 min", "Calm", "Better Sleep", "🌙", "#B8C0FF", "aEqlQvczMJQ", "Relax your body and mind before sleep with soft, comforting guided relaxation."],
  [32, "Sleep", "Fall Asleep Fast Guided Meditation", "20 min", "Gentle", "Sleep Induction", "🛌", "#D1C4E9", "ft_DXg58iYk", "Soothing spoken guidance designed to transition your consciousness into deep slumber."],
  [33, "Sleep", "Delta Wave Sleep Frequency & Guidance", "30 min", "Deep", "Heavy Sleep", "🌌", "#9FA8DA", "1ZYbU82GVz4", "Delta waves harmonize neural activity to support rejuvenating Stage 3 & 4 restorative sleep."],
  [34, "Sleep", "Rain Sounds & Whispering Meditation", "25 min", "Easy", "Cozy Sleep", "🌧️", "#B0BEC5", "mPZkdNFkNps", "Gentle rainfall against a window pane coupled with calming nighttime relaxation cues."],
  [35, "Sleep", "Sleep Talk-Down for Racing Thoughts", "20 min", "Gentle", "Calm Thoughts", "💤", "#CE93D8", "6vO1wPAmiMQ", "Turn off repetitive bedtime worries and let your nervous system sink into safe comfort."],
  [36, "Sleep", "Dream Induction Guided Hypnosis", "25 min", "Medium", "Dream Calm", "🪐", "#B39DDB", "86HUcY864b4", "Hypnotic relaxation deepening techniques that effortlessly unlock pleasant dreamscapes."],
  [37, "Sleep", "Yoga Nidra for Deep Restful Sleep", "20 min", "Gentle", "Pure Rest", "🕯️", "#FFE082", "7H0FKzeuWEY", "Yogic sleep practice proven to restore cognitive reserves equal to several hours of rest."],
  [38, "Sleep", "Floating in Space Sleep Journey", "18 min", "Calm", "Weightless", "🚀", "#90CAF9", "n_0mZ1Qv3oY", "A weightless visualization through quiet starlit galaxies toward gentle dreams."],
  [39, "Sleep", "Warm Cabin Fireplace Sleep Story", "22 min", "Cozy", "Comfort", "🪵", "#FFAB91", "1v0E51bCq-0", "Crackling firewood in a cozy mountain lodge while snow falls peacefully outside."],
  [40, "Sleep", "Slow Ocean Tide Sleep Melody", "30 min", "Deep", "Drift Away", "🌊", "#80DEEA", "bn9F19Hi1Lk", "Endless gentle shorelines rhythmic breathing that lulls you into peaceful slumber."],
  [41, "Sleep", "Peaceful Forest Night Sleep", "15 min", "Easy", "Nature Calm", "🌲", "#A5D6A7", "lE6RYpe9IT0", "Night breeze through tall pine trees and gentle crickets creating nature's lullaby."],
  [42, "Sleep", "Nighttime Gratitude Sleep Reflection", "12 min", "Beginner", "Thankful Heart", "⭐", "#FFF59D", "2K8TgzH2x6g", "Close out the day with thankfulness, releasing regrets and preparing for deep rest."],
  [43, "Sleep", "Releasing Muscle Tension for Sleep", "15 min", "Gentle", "Tension Release", "🛌", "#C5CAE9", "5Hl6s8-mR3I", "Progressive muscle relaxation from head to toe to eliminate sleep-blocking aches."],
  [44, "Sleep", "Starry Night Sky Sleep Journey", "20 min", "Deep", "Deep Trance", "🌠", "#B388FF", "2O58k8m_t8E", "Lying under a pristine dome of shooting stars while your eyelids grow deliciously heavy."],
  [45, "Sleep", "Gentle Lullaby Piano Sleep Melody", "25 min", "Calm", "Peaceful Slumber", "🎹", "#F48FB1", "5qap5aO4i9A", "Soft, minimalist piano chords that quiet racing thoughts until you drift off to sleep."],
  // STRESS RELIEF
  [46, "Stress Relief", "Stress Relief Nature Session", "8 min", "Easy", "Stress Free", "🌿", "#CAFFBF", "lFcSrYw-ARY", "A calming nature-inspired session to help release daily stress."],
  [47, "Stress Relief", "Letting Go of Tension Quick Session", "10 min", "Easy", "Tension Free", "🎈", "#FFCCBC", "z6X5oEIg6Ak", "Release tight shoulders and neck stiffness through gentle guided awareness."],
  [48, "Stress Relief", "Release Work Anxiety & Pressure", "12 min", "Medium", "Calm Mind", "💼", "#B2DFDB", "MIr3RsUWrdo", "Step away from work deadlines and high-stress situations with grounding audio."],
  [49, "Stress Relief", "Healing Forest Sounds & Music", "15 min", "Gentle", "Nature Therapy", "🍃", "#C8E6C9", "eKFTSSKCzWA", "Japanese Shinrin-yoku (forest bathing) sounds to reduce cortisol and blood pressure."],
  [50, "Stress Relief", "De-Stress in 5 Minutes", "5 min", "Quick", "Fast Relief", "🧘‍♂️", "#FFD166", "inpok4MKVLM", "Fast-acting guided intervention when you need immediate calm under pressure."],
];

const VIDEOS = RAW.map(([id, category, title, duration, level, mood, thumbnail, color, yt, description]) => ({
  id, category, title, duration, level, mood, thumbnail, color, description, ytId: yt,
  videoUrl: `https://www.youtube.com/embed/${yt}`,
  watchUrl: `https://www.youtube.com/watch?v=${yt}`,
}));

const PHASES = [
  { label: "Inhale", s: 4 },
  { label: "Hold", s: 7 },
  { label: "Exhale", s: 8 },
];

// Soft film-grain texture (same frosted look as the screenshot)
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .6 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap');

/* ===== Stop accidental zoom / text-size jumps on touch devices ===== */
html, body {
  touch-action: manipulation;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}
.puff, .heart-btn, .cv-card, button, a {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

@keyframes glyphBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
@keyframes decorFloat { 0%,100% { transform: translateY(0) rotate(-6deg); } 50% { transform: translateY(-8px) rotate(6deg); } }
@keyframes pulseDot { 0%,100% { opacity: 1; } 50% { opacity: .35; } }

/* ===== Cute glossy 3D emoji bubble ===== */
.e3d {
  --c: #E1BEE7;
  display: inline-flex; align-items: center; justify-content: center;
  position: relative; flex-shrink: 0; border-radius: 36%;
    transition: transform .3s cubic-bezier(.34,1.56,.64,1);
  background:
    radial-gradient(circle at 30% 22%, #ffffff 0%, rgba(255,255,255,0) 38%),
    radial-gradient(circle at 50% 60%, var(--c) 0%, var(--c) 55%, color-mix(in srgb, var(--c) 65%, #4B3F72) 135%);
  box-shadow:
    inset -5px -8px 12px rgba(43,37,64,.20),
    inset 5px 6px 10px rgba(255,255,255,.85),
    0 4px 0 color-mix(in srgb, var(--c) 55%, #4B3F72),
    0 12px 18px rgba(43,37,64,.22);
}
/* gloss highlight */
.e3d::after {
  content: ""; position: absolute; top: 8%; left: 12%; width: 42%; height: 20%;
  border-radius: 50%; transform: rotate(-24deg); pointer-events: none;
  background: linear-gradient(180deg, rgba(255,255,255,.95), rgba(255,255,255,0));
}
/* tiny sparkle dot */
.e3d::before {
  content: ""; position: absolute; top: 14%; right: 14%; width: 9%; height: 9%;
  border-radius: 50%; background: rgba(255,255,255,.9); pointer-events: none;
}
.e3d-glyph {
  line-height: 1; display: inline-block;
  filter:
    drop-shadow(0 1px 0 rgba(43,37,64,.28))
    drop-shadow(0 2px 0 rgba(43,37,64,.22))
    drop-shadow(0 3px 0 rgba(43,37,64,.16))
    drop-shadow(0 7px 5px rgba(43,37,64,.32));
}
.e3d-float .e3d-glyph { animation: glyphBob 3.6s ease-in-out infinite; }

/* floating decorative emojis (header corners) */
.decor { position: absolute; z-index: 2; pointer-events: none; animation: decorFloat 4.5s ease-in-out infinite;
  filter: drop-shadow(0 3px 0 rgba(43,37,64,.2)) drop-shadow(0 8px 6px rgba(43,37,64,.28)); }

/* ===== Frosted, grainy column (like the screenshot) ===== */
.shell { position: relative; }
.shell::before {
  content: ""; position: absolute; inset: 0; pointer-events: none; z-index: 0;
  background-image: ${GRAIN}; background-size: 180px 180px; opacity: .12; mix-blend-mode: soft-light;
}
.shell > * { position: relative; z-index: 1; }

/* ===== Glass cards ===== */
.glass {
  background: linear-gradient(160deg, rgba(255,255,255,.78), rgba(255,255,255,.55));
  backdrop-filter: blur(12px) saturate(1.3) brightness(1.06); -webkit-backdrop-filter: blur(12px) saturate(1.3) brightness(1.06);
  border: 1px solid rgba(255,255,255,.85);
  box-shadow: 0 5px 0 rgba(255,255,255,.55), 0 18px 34px rgba(43,37,64,.16), inset 0 1px 0 rgba(255,255,255,.9);
}

/* ===== Puffy 3D buttons ===== */
.puff {
  --edge: #CFC6E3;
  border: none; cursor: pointer; color: #2B2540; font-family: inherit; font-weight: 800;
  background: linear-gradient(180deg, #ffffff 0%, #ECE7F6 100%);
  box-shadow: 0 4px 0 var(--edge), 0 10px 16px rgba(43,37,64,.16), inset 0 1px 0 #fff;
  transition: transform .12s ease, box-shadow .12s ease;
}
/* hover only on devices that really have hover (prevents sticky hover on touch) */
@media (hover: hover) {
  .puff:hover { transform: translateY(-1px); }
  .heart-btn:hover { transform: translateY(-1px); }
}
.puff:active { transform: translateY(3px); box-shadow: 0 1px 0 var(--edge), 0 4px 8px rgba(43,37,64,.14), inset 0 1px 0 #fff; }
.puff.on { --edge: #2F6872; color: #fff; background: linear-gradient(180deg, #7DB4BB 0%, #4B8791 100%); }
.puff.rose { --edge: #B8606A; color: #fff; background: linear-gradient(180deg, #F6A5AC 0%, #E27C88 100%); }
.puff.violet { --edge: #4B3F72; color: #fff; background: linear-gradient(180deg, #8F7FC0 0%, #6B5B95 100%); }
.puff:disabled { cursor: default; opacity: .55; }

/* ===== Round glossy favourite button ===== */
.heart-btn {
  border: none; cursor: pointer; padding: 0; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  background: radial-gradient(circle at 32% 26%, #ffffff 0%, #F4F0FB 60%, #E6E0F3 100%);
  box-shadow:
    inset -3px -5px 9px rgba(120,100,170,.16),
    inset 3px 4px 7px rgba(255,255,255,.95),
    0 8px 16px rgba(43,37,64,.2);
  transition: transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .2s ease;
}
.heart-btn:active { transform: scale(.9); }
.heart-btn:disabled { cursor: default; opacity: .85; }
.heart-btn:focus-visible { outline: 3px solid #6B5B95; outline-offset: 2px; }
.heart3d { filter: drop-shadow(0 2px 0 rgba(120,100,170,.35)) drop-shadow(0 4px 3px rgba(43,37,64,.25)); }
.heart3d-on { animation: heartPop .45s cubic-bezier(.34,1.56,.64,1); }
@keyframes heartPop { 0% { transform: scale(.6); } 100% { transform: scale(1); } }
@media (prefers-reduced-motion: reduce) { .heart3d-on { animation: none !important; } }

.pill-row::-webkit-scrollbar { display: none; }
.badge3d { display:inline-flex; align-items:center; gap:5px; padding:3px 11px 3px 4px; border-radius:999px;
  background: linear-gradient(180deg,#fff,#F1ECF8); color:#4F4768; font-size:12px; font-weight:800;
  box-shadow: 0 2px 0 #D9D0EA, 0 5px 8px rgba(43,37,64,.1); }

.cv-card:focus-visible, .puff:focus-visible, input:focus-visible { outline: 3px solid #6B5B95; outline-offset: 2px; }
input::placeholder { color: #7A7394; font-weight: 700; }
@media (prefers-reduced-motion: reduce) {
  .e3d-glyph, .decor, .puff, .e3d { animation: none !important; transition: none !important; }
}
`;

/**
 * Cute glossy 3D emoji: a puffy "clay bubble" with gloss, sparkle, extruded glyph and a soft base.
 * ratio = bubble size relative to the emoji size.
 */
function Emoji3D({ char, size = 34, bg = "#E1BEE7", float = false, ratio = 2.1 }) {
  const box = Math.round(size * ratio);
  return (
    <span
      className={`e3d${float ? " e3d-float" : ""}`}
      style={{ width: box, height: box, fontSize: size, "--c": bg }}
      aria-hidden="true"
    >
      <span className="e3d-glyph">{char}</span>
    </span>
  );
}

/** Glossy 3D heart (puffy lavender when off, rich pink-purple when saved) */
function Heart3D({ on, size = 26 }) {
  const id = on ? "hOn" : "hOff";
  const stops = on
    ? ["#FFD3EA", "#EE7DB8", "#8F5BD1"]
    : ["#FFFFFF", "#E6DCF8", "#B9A6E3"];
  return (
    <svg className={`heart3d${on ? " heart3d-on" : ""}`} width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <radialGradient id={id} cx="35%" cy="28%" r="80%">
          <stop offset="0%" stopColor={stops[0]} />
          <stop offset="55%" stopColor={stops[1]} />
          <stop offset="100%" stopColor={stops[2]} />
        </radialGradient>
        <linearGradient id={`${id}Gloss`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M16 28.2C6.2 21.2 3 15.8 3 11.6 3 7.7 6 5 9.6 5c2.7 0 5 1.4 6.4 3.7C17.4 6.4 19.7 5 22.4 5 26 5 29 7.7 29 11.6c0 4.2-3.2 9.6-13 16.6z"
        fill={`url(#${id})`}
        stroke={on ? "#7B49BA" : "#A894D6"}
        strokeOpacity="0.45"
        strokeWidth="0.8"
      />
      <ellipse cx="10.6" cy="10" rx="4.2" ry="2.5" transform="rotate(-32 10.6 10)" fill={`url(#${id}Gloss)`} />
      <circle cx="21.8" cy="9.6" r="1.1" fill="#fff" fillOpacity="0.85" />
    </svg>
  );
}

// ---------- YouTube player with "video unavailable" detection ----------
let ytPromise = null;
function loadYT() {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (!ytPromise) {
    ytPromise = new Promise((resolve, reject) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prev) prev();
        resolve(window.YT);
      };
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      s.onerror = () => {
        ytPromise = null;
        reject(new Error("YouTube API blocked"));
      };
      document.head.appendChild(s);
    });
  }
  return ytPromise;
}

function YouTubePlayer({ video }) {
  const mountRef = useRef(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error | fallback
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(video.title)}`;

  useEffect(() => {
    let cancelled = false;
    let player = null;
    const host = mountRef.current;
    if (!host) return;
    host.innerHTML = "";
    const el = document.createElement("div");
    host.appendChild(el);

    loadYT()
      .then((YT) => {
        if (cancelled) return;
        player = new YT.Player(el, {
          videoId: video.ytId,
          width: "100%",
          height: "100%",
          playerVars: { autoplay: 1, rel: 0, modestbranding: 1, playsinline: 1 },
          events: {
            onReady: () => !cancelled && setStatus("ready"),
            onError: () => !cancelled && setStatus("error"),
          },
        });
      })
      .catch(() => !cancelled && setStatus("fallback"));

    return () => {
      cancelled = true;
      try {
        player && player.destroy();
      } catch {}
    };
  }, [video.ytId]);

  if (status === "fallback") {
    return (
      <iframe
        style={styles.iframe}
        src={`${video.videoUrl}?autoplay=1&rel=0&modestbranding=1`}
        title={video.title}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      />
    );
  }

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
      {status === "loading" && <div style={styles.playerMsg}>Loading video…</div>}
      {status === "error" && (
        <div style={{ ...styles.playerMsg, background: "#1d1830" }}>
          <p style={{ margin: "0 0 12px", fontWeight: 700 }}>This video can't be played here.</p>
          <a href={video.watchUrl} target="_blank" rel="noopener noreferrer" style={styles.playerMsgBtn}>
            Open on YouTube ↗
          </a>
          <a href={searchUrl} target="_blank" rel="noopener noreferrer" style={styles.playerMsgBtn}>
            Find similar videos ↗
          </a>
        </div>
      )}
    </div>
  );
}

function CalmVideos() {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [playingVideoId, setPlayingVideoId] = useState(null);
  const [playKey, setPlayKey] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [toast, setToast] = useState("");

  // ---------- Responsive ----------
  // Uses the full border-box width (padding included) so that changing the
  // padding between mobile/desktop can never flip the breakpoint back and forth.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setIsMobile(el.getBoundingClientRect().width <= 500);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2400);
  }, []);

  // ---------- Favorites (localStorage + backend) ----------
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY)) || [];
    } catch {
      return [];
    }
  });
  const [savingFavoriteId, setSavingFavoriteId] = useState(null);

  const persistLocal = (ids) => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(ids));
    } catch {}
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/favorites");
        const raw = Array.isArray(res.data) ? res.data : res.data?.favorites || [];
        const ids = raw
          .map((item) => (item && typeof item === "object" ? item.videoId : item))
          .map(Number)
          .filter(Boolean);
        // Merge (never wipe) what is saved on this device
        setFavorites((prev) => {
          const merged = Array.from(new Set([...prev, ...ids]));
          persistLocal(merged);
          return merged;
        });
      } catch (err) {
        console.log("Favorites load failed, using saved copy:", err);
      }
    };
    load();
  }, []);

  const toggleFavorite = async (id) => {
    const wasFav = favorites.includes(id);
    const next = wasFav ? favorites.filter((x) => x !== id) : [...favorites, id];
    setFavorites(next);
    persistLocal(next);
    setSavingFavoriteId(id);

    try {
      if (wasFav) await API.delete(`/favorites/${id}`);
      else {
        const v = VIDEOS.find((x) => x.id === id);
        await API.post("/favorites", {
          videoId: id,
          title: v?.title,
          category: v?.category,
          duration: v?.duration,
          videoUrl: v?.videoUrl,
          thumbnail: v?.thumbnail,
        });
      }
      showToast(wasFav ? "Removed from favorites" : "Added to favorites 💜");
    } catch (err) {
      console.log("Favorite sync failed:", err?.response?.status, err?.response?.data || err?.message);
      // Keep the change locally so the button still works
      showToast(wasFav ? "Removed (saved on this device)" : "Added (saved on this device)");
    } finally {
      setSavingFavoriteId(null);
    }
  };

  // ---------- Filtering ----------
  const q = query.trim().toLowerCase();
  const filteredVideos = VIDEOS.filter((v) => {
    const catOk =
      selectedCategory === "All"
        ? true
        : selectedCategory === "Favorites"
        ? favorites.includes(v.id)
        : v.category === selectedCategory;
    const qOk = !q || `${v.title} ${v.mood} ${v.description}`.toLowerCase().includes(q);
    return catOk && qOk;
  });

  // ---------- Player ----------
  const handlePlayVideo = (video) => {
    setPlayingVideoId(video.id);
    setPlayKey((k) => k + 1);
    setTimeout(() => {
      document
        .getElementById(`video-${video.id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 60);
  };

  const handleStopVideo = (e) => {
    e?.stopPropagation();
    setPlayingVideoId(null);
  };

  // ---------- 4-7-8 breathing guide ----------
  const [breathing, setBreathing] = useState(false);
  const [bState, setBState] = useState({ phase: 0, left: PHASES[0].s });

  useEffect(() => {
    if (!breathing) return;
    const t = setInterval(() => {
      setBState((b) =>
        b.left > 1
          ? { ...b, left: b.left - 1 }
          : { phase: (b.phase + 1) % 3, left: PHASES[(b.phase + 1) % 3].s }
      );
    }, 1000);
    return () => clearInterval(t);
  }, [breathing]);

  const toggleBreathing = () => {
    setBState({ phase: 0, left: PHASES[0].s });
    setBreathing((b) => !b);
  };

  const circleScale = !breathing ? 1 : bState.phase === 0 ? 1.3 : bState.phase === 1 ? 1.3 : 0.85;
  const circleDur = !breathing ? 0.4 : bState.phase === 1 ? 0.3 : PHASES[bState.phase].s;

  const favCount = favorites.length;
  const emojiSize = isMobile ? 26 : 32;

  return (
    <div style={styles.page}>
      <style>{CSS}</style>

      {/* Full-screen background image (visible on both sides of the column) */}
      <div style={{ ...styles.bgLayer, backgroundImage: `url(${moodBg})` }} />

      {toast && (
        <div style={styles.toast} role="status">
          {toast}
        </div>
      )}

      {/* Centered frosted column */}
      <div
        ref={containerRef}
        className="shell"
        style={{ ...styles.shell, padding: isMobile ? "18px 14px 40px" : "28px 26px 56px" }}
      >
        {/* ===== Header card ===== */}
        <div className="glass" style={styles.header}>
          <span className="decor" style={{ top: 12, right: 18, fontSize: 26 }}>🌸</span>
          <span className="decor" style={{ top: 52, right: isMobile ? 70 : 120, fontSize: 20, animationDelay: "-1.5s" }}>🫧</span>
          <span className="decor" style={{ bottom: 18, right: 38, fontSize: 24, animationDelay: "-3s" }}>✨</span>

          <button
            type="button"
            className="puff"
            style={styles.backButton}
            onClick={() => navigate("/dashboard")}
          >
            ‹ &nbsp;Back to Dashboard
          </button>

          <h1 style={{ ...styles.title, fontSize: isMobile ? 30 : 38 }}>
            <Emoji3D char="🎥" size={isMobile ? 22 : 26} bg="#E1BEE7" float ratio={1.9} />
            Calm Videos
          </h1>
          <p style={styles.subtitle}>
            Breathing, meditation, sleep and stress relief videos that play right here.
          </p>

          <span className="badge3d" style={{ padding: "6px 14px 6px 12px", fontSize: 13 }}>
            <span style={styles.greenDot} />
            {VIDEOS.length} Videos Available
          </span>
        </div>

        {/* ===== Search ===== */}
        <div style={styles.searchWrap}>
          <span style={styles.searchIcon}>
            <Emoji3D char="🔍" size={14} bg="#B3E5FC" ratio={1.9} />
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, mood or type…"
            style={styles.search}
            aria-label="Search videos"
          />
        </div>

        {/* ===== Category pills ===== */}
        <div className="pill-row" style={styles.categoryRow}>
          {CATEGORIES.map((category) => {
            const active = selectedCategory === category;
            const [emo, col] = CAT_EMOJI[category];
            return (
              <button
                type="button"
                key={category}
                className={`puff${active ? " on" : ""}`}
                onClick={() => setSelectedCategory(category)}
                style={styles.categoryButton}
              >
                <Emoji3D char={emo} size={13} bg={col} ratio={1.9} />
                {category === "Favorites" ? `Favorites (${favCount})` : category}
              </button>
            );
          })}
        </div>

        {/* ===== Stats ===== */}
        <div style={{ ...styles.statsGrid, gap: isMobile ? 10 : 14 }}>
          <div className="glass" style={styles.statCard}>
            <Emoji3D char="🎬" size={isMobile ? 20 : 24} bg="#B8C0FF" />
            <h3 style={styles.statNumber}>{VIDEOS.length}</h3>
            <p style={styles.statText}>Videos</p>
          </div>

          <button
            type="button"
            className="glass puff"
            style={{ ...styles.statCard, ...styles.statButton }}
            onClick={() => setSelectedCategory("Favorites")}
            title="Show my favorites"
          >
            <Emoji3D char="💜" size={isMobile ? 20 : 24} bg="#F8BBD0" />
            <h3 style={styles.statNumber}>{favCount}</h3>
            <p style={styles.statText}>Favorites</p>
          </button>

          <button
            type="button"
            className="glass puff"
            style={{ ...styles.statCard, ...styles.statButton }}
            onClick={() => setSelectedCategory("Meditation")}
            title="Show meditations"
          >
            <Emoji3D char="🧘" size={isMobile ? 20 : 24} bg="#C8E6C9" />
            <h3 style={styles.statNumber}>{VIDEOS.filter((v) => v.category === "Meditation").length}</h3>
            <p style={styles.statText}>Meditations</p>
          </button>
        </div>

        {/* ===== List header ===== */}
        <div className="glass" style={styles.listHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Video Sessions</h2>
            <p style={styles.sectionSubText}>Tap any video to play it right where it is.</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
            {playingVideoId && (
              <button type="button" className="puff rose" style={styles.stopAllButton} onClick={handleStopVideo}>
                ⏹ Close
              </button>
            )}
            <span className="puff violet" style={styles.foundPill}>{filteredVideos.length} found</span>
          </div>
        </div>

        {/* ===== Video list ===== */}
        <div style={styles.videoList}>
          {filteredVideos.length === 0 && (
            <div className="glass" style={styles.emptyBox}>
              <Emoji3D char={selectedCategory === "Favorites" ? "🤍" : "🔍"} size={28} bg="#E1BEE7" float />
              <p style={styles.emptyText}>
                {selectedCategory === "Favorites" && !q
                  ? "No favorites yet. Tap the heart on any video to save it here."
                  : "No videos match your search. Try another word or category."}
              </p>
            </div>
          )}

          {filteredVideos.map((video) => {
            const isPlaying = playingVideoId === video.id;
            const isFav = favorites.includes(video.id);

            return (
              <div
                id={`video-${video.id}`}
                key={video.id}
                className="glass cv-card card3d"
                tabIndex={0}
                role="button"
                aria-label={`Play ${video.title}`}
                style={{
                  ...styles.videoCard,
                  border: isPlaying ? "3px solid #6B5B95" : "1px solid rgba(255,255,255,0.85)",
                  background: isPlaying
                    ? "rgba(255,255,255,0.93)"
                    : "linear-gradient(160deg, rgba(255,255,255,.82), rgba(255,255,255,.6))",
                  padding: isMobile ? 12 : 16,
                }}
                onClick={() => !isPlaying && handlePlayVideo(video)}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && e.target === e.currentTarget && !isPlaying) {
                    e.preventDefault();
                    handlePlayVideo(video);
                  }
                }}
              >
                {isPlaying && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={styles.inlinePlayerHeader}>
                      <div style={styles.nowPlaying}>
                        <span style={styles.pulseDot}></span>
                        <span style={styles.nowPlayingText}>Now playing</span>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <a
                          href={video.watchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles.ytLink}
                          onClick={(e) => e.stopPropagation()}
                        >
                          YouTube ↗
                        </a>
                        <button type="button" className="puff" style={styles.closePlayerBtn} onClick={handleStopVideo}>
                          ✕ Close
                        </button>
                      </div>
                    </div>
                    <div style={{ ...styles.videoPlayerContainer, height: isMobile ? 200 : 290 }}>
                      <YouTubePlayer key={`inline-${video.id}-${playKey}`} video={video} />
                    </div>
                  </div>
                )}

                <div style={{ ...styles.cardContentRow, gap: isMobile ? 12 : 16 }}>
                  {!isPlaying && (
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <Emoji3D char={video.thumbnail} size={emojiSize} bg={video.color} />
                      <div style={styles.playOverlay}>
                        <span style={styles.playIcon}>▶</span>
                      </div>
                    </div>
                  )}

                  <div style={styles.videoInfo}>
                    <div style={styles.titleRow}>
                      <h3 style={{ ...styles.videoTitle, fontSize: isMobile ? 15 : 17 }}>{video.title}</h3>
                      <button
                        type="button"
                        className="heart-btn"
                        style={styles.favoriteButton}
                        disabled={savingFavoriteId === video.id}
                        aria-pressed={isFav}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(video.id);
                        }}
                        title={isFav ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Heart3D on={isFav} size={26} />
                      </button>
                    </div>
                    <p style={styles.videoDescription}>{video.description}</p>
                    <div style={styles.videoMetaRow}>
                      <span className="badge3d">
                        <Emoji3D char="⏱️" size={10} bg="#B3E5FC" ratio={1.9} /> {video.duration}
                      </span>
                      <span className="badge3d">
                        <Emoji3D char="✨" size={10} bg="#FFF59D" ratio={1.9} /> {video.level}
                      </span>
                      <span className="badge3d">
                        <Emoji3D char="🌈" size={10} bg="#F8BBD0" ratio={1.9} /> {video.mood}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ===== Side cards (now stacked under the list) ===== */}
        <div style={styles.rightPanel}>
          <div className="glass" style={styles.sideCard}>
            <Emoji3D char="💡" size={28} bg="#FFE082" float />
            <h3 style={styles.sideTitle}>Calm Tip</h3>
            <p style={styles.sideText}>
              Find a quiet spot, put on headphones, breathe slowly, and let the audio guide your mind to stillness.
            </p>
          </div>

          <div className="glass" style={styles.sideCard}>
            <Emoji3D char="🌬️" size={28} bg="#B2EBF2" float />
            <h3 style={styles.sideTitle}>4-7-8 Breathing</h3>

            <div style={styles.breathStage}>
              <div
                style={{
                  ...styles.breathCircle,
                  transform: `scale(${circleScale})`,
                  transition: `transform ${circleDur}s ease-in-out`,
                }}
              >
                {breathing ? (
                  <>
                    <strong style={{ fontSize: 24 }}>{bState.left}</strong>
                    <span style={{ fontSize: 12 }}>{PHASES[bState.phase].label}</span>
                  </>
                ) : (
                  <span style={{ fontSize: 13, fontWeight: 800 }}>Ready</span>
                )}
              </div>
            </div>

            <div style={styles.breathingSteps}>
              {PHASES.map((p, i) => (
                <div
                  key={p.label}
                  style={{
                    ...styles.stepItem,
                    background:
                      breathing && bState.phase === i
                        ? "linear-gradient(180deg,#fff,#F1ECF8)"
                        : "rgba(255,255,255,0.55)",
                    outline: breathing && bState.phase === i ? "2px solid #6B5B95" : "none",
                  }}
                >
                  <strong style={styles.stepNum}>{p.s}s</strong>
                  <span style={styles.stepDesc}>{p.label}</span>
                </div>
              ))}
            </div>

            <button type="button" className="puff violet" style={styles.breathBtn} onClick={toggleBreathing}>
              {breathing ? "Stop" : "Start breathing"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const INK = "#2B2540";
const SOFT = "#4F4768";

const styles = {
  page: {
    minHeight: "100vh",
    background: "#C9C3D9",
    fontFamily: "'Nunito', 'Segoe UI', Arial, sans-serif",
    position: "relative",
    overflowX: "hidden",
    boxSizing: "border-box",
  },
  // Full screen mood-bg.jpeg, shown as-is (cover) on the left & right of the column
  bgLayer: {
    position: "fixed",
    inset: 0,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    zIndex: 0,
  },
  // The centered frosted/grainy panel
  shell: {
    maxWidth: 560,
    minHeight: "100vh",
    margin: "0 auto",
    boxSizing: "border-box",
    background: "linear-gradient(180deg, rgba(255,255,255,.46), rgba(255,255,255,.34))",
    backdropFilter: "blur(12px) saturate(1.35) brightness(1.08)",
    WebkitBackdropFilter: "blur(12px) saturate(1.35) brightness(1.08)",
    borderLeft: "1px solid rgba(255,255,255,.55)",
    borderRight: "1px solid rgba(255,255,255,.55)",
    boxShadow: "0 0 50px rgba(255,255,255,.25)",
  },
  toast: {
    position: "fixed",
    bottom: 22,
    left: "50%",
    transform: "translateX(-50%)",
    background: INK,
    color: "#fff",
    padding: "11px 20px",
    borderRadius: 16,
    fontSize: 14,
    fontWeight: 700,
    zIndex: 50,
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    maxWidth: "90vw",
    textAlign: "center",
  },
  header: {
    position: "relative",
    borderRadius: 30,
    padding: "20px 22px 22px",
    marginBottom: 18,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 10,
    background: "linear-gradient(135deg, rgba(94,155,163,.78), rgba(150,128,178,.72))",
    color: "#fff",
    overflow: "hidden",
  },
  // zIndex 5 keeps the button above the floating decor emojis so taps always reach it
  backButton: {
    padding: "9px 16px",
    borderRadius: 16,
    fontSize: 14,
    position: "relative",
    zIndex: 5,
    touchAction: "manipulation",
  },
  title: {
    color: "#fff",
    margin: "4px 0 0",
    fontWeight: 900,
    display: "flex",
    alignItems: "center",
    gap: 10,
    textShadow: "0 3px 0 rgba(43,37,64,.22), 0 8px 14px rgba(43,37,64,.25)",
  },
  subtitle: { color: "rgba(255,255,255,.92)", fontSize: 15, margin: 0, lineHeight: 1.5, fontWeight: 700 },
  greenDot: {
    width: 10, height: 10, borderRadius: "50%", background: "#2EC27E",
    boxShadow: "0 0 0 3px rgba(46,194,126,.25)", marginLeft: 2,
  },
  searchWrap: { position: "relative", marginBottom: 14 },
  searchIcon: { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", zIndex: 2, display: "flex" },
  // fontSize 16 stops iOS Safari from auto-zooming when the input is focused
  search: {
    width: "100%",
    boxSizing: "border-box",
    padding: "15px 18px 15px 56px",
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,.9)",
    background: "linear-gradient(180deg, rgba(255,255,255,.85), rgba(255,255,255,.62))",
    boxShadow: "0 4px 0 rgba(255,255,255,.6), 0 12px 22px rgba(43,37,64,.12), inset 0 2px 4px rgba(43,37,64,.06)",
    color: INK,
    fontSize: 16,
    fontWeight: 700,
    fontFamily: "inherit",
  },
  categoryRow: { display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18, paddingBottom: 6 },
  categoryButton: {
    padding: "7px 16px 7px 8px",
    borderRadius: 999,
    whiteSpace: "nowrap",
    fontSize: 14,
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
  },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 18 },
  statCard: {
    borderRadius: 24,
    padding: "14px 8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    boxSizing: "border-box",
    textAlign: "center",
  },
  statButton: { cursor: "pointer", font: "inherit", width: "100%" },
  statNumber: { color: INK, margin: "4px 0 0", fontSize: 24, fontWeight: 900 },
  statText: { color: SOFT, margin: 0, fontSize: 13, fontWeight: 800 },
  listHeader: {
    borderRadius: 24,
    padding: "14px 18px",
    marginBottom: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  sectionTitle: { color: INK, fontSize: 19, margin: "0 0 2px 0", fontWeight: 900 },
  sectionSubText: { color: SOFT, margin: 0, lineHeight: 1.4, fontSize: 13, fontWeight: 700 },
  foundPill: { padding: "9px 16px", borderRadius: 14, fontSize: 14, cursor: "default" },
  stopAllButton: { padding: "8px 14px", borderRadius: 14, fontSize: 13 },
  videoList: { display: "grid", gap: 16, marginBottom: 20 },
  emptyBox: { textAlign: "center", padding: "26px 14px", borderRadius: 24, display: "grid", justifyItems: "center", gap: 12 },
  emptyText: { color: SOFT, margin: 0, fontWeight: 800, lineHeight: 1.5, maxWidth: 320 },
  videoCard: { borderRadius: 26, cursor: "pointer", transition: "all 0.25s ease", boxSizing: "border-box", minWidth: 0 },
  inlinePlayerHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 8, flexWrap: "wrap" },
  nowPlaying: { display: "flex", alignItems: "center", gap: 8 },
  pulseDot: { width: 10, height: 10, borderRadius: "50%", backgroundColor: "#6B5B95", boxShadow: "0 0 10px #6B5B95", animation: "pulseDot 1.4s infinite" },
  nowPlayingText: { color: "#6B5B95", fontSize: 13, fontWeight: 900 },
  closePlayerBtn: { padding: "6px 12px", borderRadius: 12, fontSize: 12 },
  ytLink: {
    background: "rgba(107,91,149,0.15)",
    color: "#4B3F72",
    padding: "6px 12px",
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 800,
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
  },
  videoPlayerContainer: { borderRadius: 18, overflow: "hidden", background: "#000", boxShadow: "0 12px 30px rgba(0,0,0,0.22)" },
  iframe: { width: "100%", height: "100%", border: "none" },
  playerMsg: {
    position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", background: "#000", color: "#fff", textAlign: "center", padding: 16, gap: 8, fontSize: 14,
  },
  playerMsgBtn: {
    background: "linear-gradient(135deg, #6B5B95, #C47A9B)", color: "#fff", padding: "9px 16px",
    borderRadius: 14, fontWeight: 800, fontSize: 13, textDecoration: "none",
  },
  cardContentRow: { display: "flex", width: "100%", alignItems: "center" },
  playOverlay: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 26,
    height: 26,
    borderRadius: "50%",
    background: "linear-gradient(180deg, #8F7FC0, #6B5B95)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 3px 0 #4B3F72, 0 6px 10px rgba(107,91,149,0.45)",
    zIndex: 3,
  },
  playIcon: { color: "#fff", fontSize: 10, marginLeft: 2 },
  videoInfo: { flex: 1, minWidth: 0 },
  titleRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 4 },
  videoTitle: { color: INK, margin: 0, fontWeight: 900, lineHeight: 1.25 },
  videoDescription: { color: SOFT, margin: "0 0 10px 0", lineHeight: 1.45, fontSize: 13, fontWeight: 600 },
  videoMetaRow: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" },
  favoriteButton: { width: 46, height: 46 },
  rightPanel: { display: "grid", gap: 18, alignContent: "start", minWidth: 0 },
  sideCard: { borderRadius: 28, padding: 22, textAlign: "center", display: "grid", justifyItems: "center", gap: 6, boxSizing: "border-box" },
  sideTitle: { color: INK, margin: "6px 0 2px", fontWeight: 900, fontSize: 18 },
  sideText: { color: SOFT, lineHeight: 1.6, margin: 0, fontSize: 14, fontWeight: 600 },
  breathStage: { height: 130, display: "flex", alignItems: "center", justifyContent: "center", width: "100%" },
  breathCircle: {
    width: 84,
    height: 84,
    borderRadius: "50%",
    background: "radial-gradient(circle at 30% 25%, #fff, #B8C0FF 70%)",
    boxShadow: "inset -6px -8px 14px rgba(43,37,64,0.2), 0 4px 0 #8E98E6, 0 14px 24px rgba(107,91,149,0.35)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: INK,
  },
  breathingSteps: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, width: "100%" },
  stepItem: { padding: "10px 6px", borderRadius: 16, display: "flex", flexDirection: "column", gap: 2, transition: "all .3s ease" },
  stepNum: { color: "#6B5B95", fontSize: 16, fontWeight: 900 },
  stepDesc: { color: SOFT, fontSize: 12, fontWeight: 800 },
  breathBtn: { marginTop: 10, width: "100%", padding: "13px", borderRadius: 18, fontSize: 14 },
};

export default CalmVideos;
