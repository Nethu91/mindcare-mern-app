import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/mood-bg.jpeg";
import { Icon3D, THEME, glass } from "../components/GameIcons";

// Check if puzzle is solved: [1, 2, 3, 4, 5, 6, 7, 8, 9]
const checkSolved = (currentTiles) => {
  for (let i = 0; i < 9; i++) {
    if (currentTiles[i] !== i + 1) return false;
  }
  return true;
};

// Random shuffled (never already solved) tile order
const makeShuffledTiles = () => {
  let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  do {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  } while (checkSolved(arr));
  return arr;
};

function MindRelaxGames() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("puzzle"); // "puzzle" or "mandala"

  // =========================================================================
  // AUDIO SYNTH & VOICE ANNOUNCEMENT
  // =========================================================================
  const audioCtxRef = useRef(null);

  const getAudioCtx = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
      return audioCtxRef.current;
    } catch {
      return null;
    }
  }, []);

  const playSound = useCallback(
    (type = "click") => {
      try {
        const ctx = getAudioCtx();
        if (!ctx) return;

        if (type === "click") {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(480, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(240, ctx.currentTime + 0.06);
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.06);
        } else if (type === "win") {
          // Celebration fanfare: ascending chord + sparkle
          const fanfare = [
            { freq: 523.25, start: 0, dur: 0.5, vol: 0.22, type: "sine" },
            { freq: 659.25, start: 0.1, dur: 0.5, vol: 0.2, type: "sine" },
            { freq: 783.99, start: 0.2, dur: 0.5, vol: 0.18, type: "sine" },
            { freq: 1046.5, start: 0.3, dur: 0.7, vol: 0.2, type: "sine" },
            { freq: 1318.5, start: 0.5, dur: 0.7, vol: 0.18, type: "triangle" },
            { freq: 1567.98, start: 0.7, dur: 0.8, vol: 0.14, type: "triangle" },
          ];
          fanfare.forEach(({ freq, start, dur, vol, type: waveType }) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = waveType;
            osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
            gain.gain.setValueAtTime(vol, ctx.currentTime + start);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + start);
            osc.stop(ctx.currentTime + start + dur + 0.05);
          });
        } else if (type === "color") {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(360 + Math.random() * 200, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.12);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.12);
        }
      } catch {
        // Audio context may be restricted
      }
    },
    [getAudioCtx]
  );

  // Voice announcement: "Completed Task!"
  const playVoiceCompleted = useCallback(() => {
    try {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance("Completed Task!");
        utterance.rate = 0.95;
        utterance.pitch = 1.1;
        utterance.volume = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // Speech synthesis fallback
    }
  }, []);

  // =========================================================================
  // GAME 1: MIND UNWIND – 15 RELAXING PUZZLE GAMES (DRAG & DROP)
  // =========================================================================
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [activeDay, setActiveDay] = useState(7);
  const [isDayCompleted, setIsDayCompleted] = useState(false);
  const [showOutcomes, setShowOutcomes] = useState(false);
  const [countdown, setCountdown] = useState({ hours: 6, mins: 36, secs: 16 });
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [puzzleMoves, setPuzzleMoves] = useState(0);

  // 9 Tiles (1..9): Solved state is [1, 2, 3, 4, 5, 6, 7, 8, 9]
  const [tiles, setTiles] = useState([2, 1, 3, 5, 4, 6, 8, 7, 9]);

  // Drag and Drop state
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [selectedTileIndex, setSelectedTileIndex] = useState(null);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        let { hours, mins, secs } = prev;
        if (secs > 0) {
          secs--;
        } else {
          secs = 59;
          if (mins > 0) {
            mins--;
          } else {
            mins = 59;
            if (hours > 0) hours--;
          }
        }
        return { hours, mins, secs };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Swap two tiles
  const swapTiles = useCallback(
    (index1, index2) => {
      if (index1 === index2) return;
      playSound("click");

      setTiles((prev) => {
        const next = [...prev];
        const temp = next[index1];
        next[index1] = next[index2];
        next[index2] = temp;

        setPuzzleMoves((m) => m + 1);

        if (checkSolved(next)) {
          setIsSolved(true);
          setIsDayCompleted(true);
          playSound("win");
          playVoiceCompleted();
        }

        return next;
      });
    },
    [playSound, playVoiceCompleted]
  );

  // Scramble / Shuffle puzzle
  const shufflePuzzle = useCallback(() => {
    setTiles(makeShuffledTiles());
    setPuzzleMoves(0);
    setIsSolved(false);
    setSelectedTileIndex(null);
  }, []);

  // Switch to Next Puzzle
  const goToNextPuzzle = useCallback(() => {
    playSound("click");
    setCurrentPuzzleIndex((prev) => (prev + 1) % 15);
    setTiles(makeShuffledTiles());
    setPuzzleMoves(0);
    setIsSolved(false);
    setShowFullPreview(false);
    setSelectedTileIndex(null);
  }, [playSound]);

  // Switch to Previous Puzzle
  const goToPrevPuzzle = useCallback(() => {
    playSound("click");
    setCurrentPuzzleIndex((prev) => (prev === 0 ? 14 : prev - 1));
    setTiles(makeShuffledTiles());
    setPuzzleMoves(0);
    setIsSolved(false);
    setShowFullPreview(false);
    setSelectedTileIndex(null);
  }, [playSound]);

  // HTML5 Mouse Drag & Drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.setData("text/plain", index.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e, index) => {
    if (dragOverIndex === index) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex =
      draggedIndex !== null ? draggedIndex : Number(e.dataTransfer.getData("text/plain"));
    if (sourceIndex !== null && !isNaN(sourceIndex)) {
      swapTiles(sourceIndex, targetIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Mobile Touch Drag & Drop handlers
  const handleTouchStart = (index) => {
    setDraggedIndex(index);
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    const slot = elem?.closest("[data-tile-index]");
    if (slot) {
      const targetIdx = Number(slot.getAttribute("data-tile-index"));
      if (!isNaN(targetIdx) && dragOverIndex !== targetIdx) {
        setDragOverIndex(targetIdx);
      }
    }
  };

  const handleTouchEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      swapTiles(draggedIndex, dragOverIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Click-to-swap fallback
  const handleTileClick = (index) => {
    if (selectedTileIndex === null) {
      setSelectedTileIndex(index);
      playSound("click");
    } else {
      swapTiles(selectedTileIndex, index);
      setSelectedTileIndex(null);
    }
  };

  // =========================================================================
  // 15 BEAUTIFUL VECTOR ARTWORKS FOR PUZZLES (viewBox 0 0 360 360)
  // =========================================================================
  const svgStyle = { width: "100%", height: "100%", display: "block" };

  // Puzzle 1: Cute Baby Dragon
  const DragonArt = () => (
    <svg viewBox="0 0 360 360" style={svgStyle}>
      <circle cx="180" cy="180" r="160" fill="#F8FAFC" />
      <path d="M 170 290 Q 230 330 250 280 Q 260 250 240 240 Q 220 260 180 275 Z" fill="#0F172A" />
      <path d="M 235 255 Q 265 245 255 275 Z" fill="#06B6D4" opacity="0.95" />
      <path d="M 120 180 Q 40 160 20 220 Q 50 245 80 230 Q 100 245 130 225 Z" fill="#0EA5E9" />
      <path d="M 120 180 Q 40 160 20 220 Q 35 190 70 180 Z" fill="#0F172A" />
      <path d="M 240 180 Q 320 160 340 220 Q 310 245 280 230 Q 260 245 230 225 Z" fill="#0EA5E9" />
      <path d="M 240 180 Q 320 160 340 220 Q 325 190 290 180 Z" fill="#0F172A" />
      <ellipse cx="180" cy="245" rx="60" ry="70" fill="#0F172A" />
      <ellipse cx="180" cy="255" rx="38" ry="48" fill="#1E293B" />
      <ellipse cx="125" cy="305" rx="26" ry="16" fill="#0B1120" />
      <ellipse cx="235" cy="305" rx="26" ry="16" fill="#0B1120" />
      <path d="M 125 110 Q 95 30 145 60 Z" fill="#0F172A" />
      <path d="M 235 110 Q 265 30 215 60 Z" fill="#0F172A" />
      <ellipse cx="180" cy="140" rx="76" ry="62" fill="#0F172A" />
      <ellipse cx="140" cy="142" rx="26" ry="30" fill="#22C55E" transform="rotate(-6 140 142)" />
      <ellipse cx="144" cy="143" rx="10" ry="22" fill="#0B1120" />
      <circle cx="134" cy="130" r="7" fill="#FFFFFF" />
      <ellipse cx="220" cy="142" rx="26" ry="30" fill="#22C55E" transform="rotate(6 220 142)" />
      <ellipse cx="216" cy="143" rx="10" ry="22" fill="#0B1120" />
      <circle cx="212" cy="130" r="7" fill="#FFFFFF" />
      <path d="M 166 180 Q 180 188 194 180" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <ellipse cx="118" cy="168" rx="10" ry="5" fill="#F43F5E" opacity="0.25" />
      <ellipse cx="242" cy="168" rx="10" ry="5" fill="#F43F5E" opacity="0.25" />
    </svg>
  );

  // Puzzle 2: Serene Lotus Bloom
  const LotusArt = () => (
    <svg viewBox="0 0 360 360" style={svgStyle}>
      <circle cx="180" cy="180" r="160" fill="#ECFDF5" />
      <ellipse cx="180" cy="270" rx="130" ry="40" fill="#059669" opacity="0.8" />
      <ellipse cx="180" cy="270" rx="110" ry="32" fill="#10B981" />
      <path d="M 180 270 L 290 270" stroke="#047857" strokeWidth="3" strokeLinecap="round" />
      <path d="M 90 220 Q 180 300 270 220 Q 230 150 180 220 Q 130 150 90 220 Z" fill="#F472B6" />
      <path d="M 110 200 Q 180 280 250 200 Q 220 130 180 190 Q 140 130 110 200 Z" fill="#FB7185" />
      <path d="M 140 170 Q 180 250 220 170 Q 200 90 180 140 Q 160 90 140 170 Z" fill="#FDA4AF" />
      <path d="M 160 140 Q 180 210 200 140 Q 190 70 180 100 Q 170 70 160 140 Z" fill="#FFF1F2" />
      <circle cx="180" cy="190" r="14" fill="#FDE047" />
      <circle cx="180" cy="190" r="8" fill="#F59E0B" />
      <circle cx="120" cy="275" r="4" fill="#FFFFFF" opacity="0.8" />
      <circle cx="235" cy="265" r="5" fill="#FFFFFF" opacity="0.8" />
    </svg>
  );

  // Puzzle 3: Mountain Sunrise
  const MountainArt = () => (
    <svg viewBox="0 0 360 360" style={svgStyle}>
      <circle cx="180" cy="180" r="160" fill="#FEF3C7" />
      <circle cx="180" cy="170" r="75" fill="#F59E0B" opacity="0.85" />
      <path d="M 40 280 L 140 140 L 230 280 Z" fill="#6366F1" />
      <path d="M 140 140 L 115 175 L 135 185 L 145 170 L 165 175 Z" fill="#EEF2FF" />
      <path d="M 160 280 L 245 155 L 325 280 Z" fill="#4F46E5" />
      <path d="M 245 155 L 225 185 L 240 195 L 255 180 L 270 190 Z" fill="#EEF2FF" />
      <path d="M 90 280 L 180 180 L 270 280 Z" fill="#4338CA" />
      <path d="M 180 180 L 160 205 L 175 215 L 185 200 L 200 210 Z" fill="#EEF2FF" />
      <ellipse cx="180" cy="305" rx="150" ry="35" fill="#065F46" />
      <polygon points="100,290 85,250 115,250" fill="#047857" />
      <polygon points="260,290 245,245 275,245" fill="#047857" />
      <path d="M 80 80 Q 95 65 110 80 Q 125 65 140 80" stroke="#78350F" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 230 90 Q 240 75 250 90 Q 260 75 270 90" stroke="#78350F" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );

  // Puzzle 4: Zen Panda & Bamboo
  const PandaArt = () => (
    <svg viewBox="0 0 360 360" style={svgStyle}>
      <circle cx="180" cy="180" r="160" fill="#ECFDF5" />
      <rect x="45" y="40" width="16" height="280" rx="8" fill="#10B981" />
      <rect x="295" y="40" width="16" height="280" rx="8" fill="#10B981" />
      <path d="M 55 90 Q 100 70 110 110" stroke="#059669" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M 295 130 Q 250 110 240 150" stroke="#059669" strokeWidth="6" fill="none" strokeLinecap="round" />
      <ellipse cx="180" cy="240" rx="75" ry="65" fill="#FFFFFF" stroke="#0F172A" strokeWidth="4" />
      <ellipse cx="180" cy="270" rx="50" ry="35" fill="#0F172A" />
      <circle cx="110" cy="120" r="28" fill="#0F172A" />
      <circle cx="250" cy="120" r="28" fill="#0F172A" />
      <ellipse cx="180" cy="165" rx="70" ry="60" fill="#FFFFFF" stroke="#0F172A" strokeWidth="4" />
      <ellipse cx="145" cy="160" rx="18" ry="24" fill="#0F172A" transform="rotate(-15 145 160)" />
      <circle cx="148" cy="155" r="6" fill="#FFFFFF" />
      <ellipse cx="215" cy="160" rx="18" ry="24" fill="#0F172A" transform="rotate(15 215 160)" />
      <circle cx="212" cy="155" r="6" fill="#FFFFFF" />
      <ellipse cx="180" cy="185" rx="12" ry="8" fill="#0F172A" />
      <path d="M 172 195 Q 180 202 188 195" stroke="#0F172A" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="120" cy="185" rx="12" ry="6" fill="#FDA4AF" opacity="0.8" />
      <ellipse cx="240" cy="185" rx="12" ry="6" fill="#FDA4AF" opacity="0.8" />
    </svg>
  );

  // Puzzle 5: Cosmic Crescent Moon & Stars
  const CosmicMoonArt = () => (
    <svg viewBox="0 0 360 360" style={svgStyle}>
      <circle cx="180" cy="180" r="160" fill="#0F172A" />
      <circle cx="180" cy="180" r="130" fill="#1E1B4B" opacity="0.7" />
      <circle cx="180" cy="180" r="100" fill="#312E81" opacity="0.5" />
      <path d="M 160 70 A 110 110 0 1 0 270 220 A 90 90 0 1 1 160 70 Z" fill="#FDE047" />
      <circle cx="130" cy="150" r="10" fill="#EAB308" opacity="0.5" />
      <circle cx="170" cy="230" r="14" fill="#EAB308" opacity="0.5" />
      <circle cx="120" cy="200" r="8" fill="#EAB308" opacity="0.5" />
      <path d="M 250 80 L 255 95 L 270 100 L 255 105 L 250 120 L 245 105 L 230 100 L 245 95 Z" fill="#FFFFFF" />
      <path d="M 90 100 L 93 110 L 105 113 L 93 117 L 90 128 L 87 117 L 75 113 L 87 110 Z" fill="#38BDF8" />
      <path d="M 280 180 L 283 188 L 292 190 L 283 193 L 280 202 L 277 193 L 268 190 L 277 188 Z" fill="#F472B6" />
      <ellipse cx="260" cy="270" rx="30" ry="10" fill="#6366F1" transform="rotate(-20 260 270)" />
      <circle cx="260" cy="270" r="14" fill="#A855F7" />
    </svg>
  );

  // Puzzle 6: Ocean Sunset & Leaping Dolphin
  const DolphinArt = () => (
    <svg viewBox="0 0 360 360" style={svgStyle}>
      <circle cx="180" cy="180" r="160" fill="#FFEDD5" />
      <circle cx="180" cy="160" r="70" fill="#FB923C" />
      <path d="M 20 220 Q 100 190 180 220 Q 260 250 340 220 L 340 340 L 20 340 Z" fill="#0284C7" />
      <path d="M 20 250 Q 100 220 180 250 Q 260 280 340 250 L 340 340 L 20 340 Z" fill="#0369A1" />
      <path d="M 100 210 Q 140 100 240 120 Q 280 130 260 160 Q 210 160 160 220 Z" fill="#0284C7" stroke="#38BDF8" strokeWidth="3" />
      <path d="M 240 120 Q 270 125 285 140 Q 260 145 245 135 Z" fill="#38BDF8" />
      <path d="M 185 135 L 195 105 L 210 130 Z" fill="#0369A1" />
      <path d="M 90 205 L 75 190 L 105 200 L 95 220 Z" fill="#0369A1" />
      <circle cx="245" cy="132" r="3" fill="#FFFFFF" />
      <circle cx="120" cy="235" r="4" fill="#FFFFFF" opacity="0.9" />
      <circle cx="135" cy="225" r="3" fill="#FFFFFF" opacity="0.9" />
      <circle cx="150" cy="240" r="5" fill="#FFFFFF" opacity="0.9" />
    </svg>
  );

  // Puzzle 7: Zen Bonsai Tree
  const BonsaiArt = () => (
    <svg viewBox="0 0 360 360" style={svgStyle}>
      <circle cx="180" cy="180" r="160" fill="#FFFBEB" />
      <circle cx="180" cy="130" r="90" fill="#FEF08A" opacity="0.6" />
      <ellipse cx="180" cy="290" rx="90" ry="18" fill="#78350F" />
      <ellipse cx="180" cy="285" rx="80" ry="14" fill="#B45309" />
      <path d="M 170 280 Q 150 220 200 180 Q 220 160 210 130" stroke="#78350F" strokeWidth="20" fill="none" strokeLinecap="round" />
      <path d="M 175 200 Q 130 180 110 150" stroke="#78350F" strokeWidth="12" fill="none" strokeLinecap="round" />
      <path d="M 195 160 Q 250 150 260 120" stroke="#78350F" strokeWidth="10" fill="none" strokeLinecap="round" />
      <ellipse cx="205" cy="115" rx="55" ry="32" fill="#15803D" />
      <ellipse cx="205" cy="105" rx="45" ry="24" fill="#22C55E" />
      <ellipse cx="105" cy="140" rx="45" ry="26" fill="#15803D" />
      <ellipse cx="105" cy="132" rx="35" ry="20" fill="#22C55E" />
      <ellipse cx="265" cy="115" rx="42" ry="24" fill="#15803D" />
      <ellipse cx="265" cy="108" rx="32" ry="18" fill="#22C55E" />
      <ellipse cx="90" cy="290" rx="22" ry="10" fill="#64748B" />
      <ellipse cx="105" cy="282" rx="16" ry="8" fill="#94A3B8" />
    </svg>
  );

  // Puzzle 8: Sleeping Cozy Red Fox
  const FoxArt = () => (
    <svg viewBox="0 0 360 360" style={svgStyle}>
      <circle cx="180" cy="180" r="160" fill="#FEF2F2" />
      <ellipse cx="180" cy="200" rx="110" ry="90" fill="#EA580C" />
      <path d="M 90 190 Q 70 290 180 290 Q 280 290 280 200 Q 270 250 180 250 Q 120 250 100 190 Z" fill="#C2410C" />
      <path d="M 230 250 Q 275 270 270 210 Q 260 240 230 250 Z" fill="#FFFFFF" />
      <ellipse cx="160" cy="165" rx="55" ry="45" fill="#EA580C" transform="rotate(-15 160 165)" />
      <polygon points="125,120 115,75 155,105" fill="#9A3412" />
      <polygon points="180,110 215,70 205,120" fill="#9A3412" />
      <path d="M 120 185 Q 160 215 195 175 Q 185 145 155 145 Q 125 145 120 185 Z" fill="#FFFFFF" />
      <circle cx="160" cy="195" r="7" fill="#0F172A" />
      <path d="M 135 165 Q 145 175 155 165" stroke="#0F172A" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 170 160 Q 180 170 190 160" stroke="#0F172A" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="70" cy="110" r="8" fill="#F59E0B" />
      <circle cx="280" cy="120" r="6" fill="#DC2626" />
    </svg>
  );

  // Puzzle 9: Sunset Hot Air Balloon
  const BalloonArt = () => (
    <svg viewBox="0 0 360 360" style={svgStyle}>
      <circle cx="180" cy="180" r="160" fill="#E0F2FE" />
      <path d="M 20 290 Q 100 240 180 280 Q 260 320 340 270 L 340 340 L 20 340 Z" fill="#C084FC" />
      <path d="M 20 310 Q 120 270 220 310 Q 290 330 340 300 L 340 340 L 20 340 Z" fill="#7E22CE" />
      <ellipse cx="180" cy="140" rx="75" ry="90" fill="#F43F5E" />
      <path d="M 140 70 Q 160 140 140 210 Q 180 230 180 50 Q 140 50 140 70 Z" fill="#FBBF24" />
      <path d="M 180 50 Q 180 230 220 210 Q 200 140 220 70 Q 180 50 180 50 Z" fill="#06B6D4" />
      <path d="M 160 230 L 165 260 M 200 230 L 195 260" stroke="#78350F" strokeWidth="2.5" />
      <rect x="162" y="260" width="36" height="26" rx="6" fill="#B45309" stroke="#78350F" strokeWidth="2" />
      <ellipse cx="80" cy="90" rx="35" ry="16" fill="#FFFFFF" opacity="0.9" />
      <ellipse cx="280" cy="110" rx="30" ry="14" fill="#FFFFFF" opacity="0.9" />
    </svg>
  );

  // Puzzle 10: Golden Monarch Butterfly
  const ButterflyArt = () => (
    <svg viewBox="0 0 360 360" style={svgStyle}>
      <circle cx="180" cy="180" r="160" fill="#FAF5FF" />
      <path d="M 180 180 Q 80 50 40 120 Q 20 180 140 195 Z" fill="#F59E0B" stroke="#0F172A" strokeWidth="3" />
      <path d="M 180 180 Q 280 50 320 120 Q 340 180 220 195 Z" fill="#F59E0B" stroke="#0F172A" strokeWidth="3" />
      <path d="M 180 185 Q 90 190 70 260 Q 110 300 170 215 Z" fill="#EC4899" stroke="#0F172A" strokeWidth="3" />
      <path d="M 180 185 Q 270 190 290 260 Q 250 300 190 215 Z" fill="#EC4899" stroke="#0F172A" strokeWidth="3" />
      <ellipse cx="90" cy="135" rx="20" ry="15" fill="#FDE047" />
      <ellipse cx="270" cy="135" rx="20" ry="15" fill="#FDE047" />
      <circle cx="115" cy="245" r="12" fill="#FBCFE8" />
      <circle cx="245" cy="245" r="12" fill="#FBCFE8" />
      <ellipse cx="180" cy="185" rx="8" ry="55" fill="#0F172A" />
      <circle cx="180" cy="125" r="10" fill="#0F172A" />
      <path d="M 175 118 Q 155 85 140 90" stroke="#0F172A" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 185 118 Q 205 85 220 90" stroke="#0F172A" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );

  // Puzzle 11: Wise Midnight Owl
  const OwlArt = () => (
    <svg viewBox="0 0 360 360" style={svgStyle}>
      <circle cx="180" cy="180" r="160" fill="#0B132B" />
      <circle cx="180" cy="160" r="110" fill="#FEF08A" />
      <path d="M 30 300 Q 180 260 330 300" stroke="#78350F" strokeWidth="18" strokeLinecap="round" fill="none" />
      <ellipse cx="180" cy="200" rx="65" ry="75" fill="#3B82F6" />
      <ellipse cx="180" cy="220" rx="42" ry="48" fill="#DBEAFE" />
      <polygon points="130,135 115,90 150,115" fill="#1D4ED8" />
      <polygon points="230,135 245,90 210,115" fill="#1D4ED8" />
      <circle cx="150" cy="160" r="24" fill="#FFFFFF" stroke="#1E293B" strokeWidth="3" />
      <circle cx="150" cy="160" r="14" fill="#F59E0B" />
      <circle cx="150" cy="160" r="7" fill="#0F172A" />
      <circle cx="146" cy="156" r="3" fill="#FFFFFF" />
      <circle cx="210" cy="160" r="24" fill="#FFFFFF" stroke="#1E293B" strokeWidth="3" />
      <circle cx="210" cy="160" r="14" fill="#F59E0B" />
      <circle cx="210" cy="160" r="7" fill="#0F172A" />
      <circle cx="206" cy="156" r="3" fill="#FFFFFF" />
      <polygon points="175,175 185,175 180,192" fill="#F97316" />
      <ellipse cx="160" cy="275" rx="10" ry="5" fill="#F97316" />
      <ellipse cx="200" cy="275" rx="10" ry="5" fill="#F97316" />
    </svg>
  );

  // Puzzle 12: Tropical Flamingo Lagoon
  const FlamingoArt = () => (
    <svg viewBox="0 0 360 360" style={svgStyle}>
      <circle cx="180" cy="180" r="160" fill="#FCE7F3" />
      <circle cx="240" cy="130" r="55" fill="#FDE047" opacity="0.8" />
      <path d="M 20 270 Q 180 240 340 270 L 340 340 L 20 340 Z" fill="#06B6D4" />
      <path d="M 180 200 Q 150 140 180 100 Q 195 80 185 60 Q 165 60 155 75 Q 160 110 140 170 Z" fill="#F43F5E" />
      <ellipse cx="180" cy="205" rx="50" ry="38" fill="#FB7185" />
      <ellipse cx="195" cy="210" rx="35" ry="25" fill="#F43F5E" />
      <circle cx="182" cy="68" r="14" fill="#F43F5E" />
      <path d="M 175 68 L 145 76 L 155 90 Z" fill="#0F172A" />
      <circle cx="182" cy="65" r="3" fill="#FFFFFF" />
      <line x1="175" y1="240" x2="175" y2="310" stroke="#F43F5E" strokeWidth="5" strokeLinecap="round" />
      <path d="M 185 240 L 205 275 L 185 275" stroke="#F43F5E" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M 280 280 Q 320 210 340 250 Q 320 280 280 280 Z" fill="#047857" />
    </svg>
  );

  // Puzzle 13: Floating Sky Castle
  const CastleArt = () => (
    <svg viewBox="0 0 360 360" style={svgStyle}>
      <circle cx="180" cy="180" r="160" fill="#E0F2FE" />
      <path d="M 100 220 Q 180 210 260 220 L 230 280 Q 180 300 130 280 Z" fill="#78350F" />
      <ellipse cx="180" cy="220" rx="80" ry="18" fill="#22C55E" />
      <rect x="150" y="140" width="60" height="70" fill="#E2E8F0" />
      <rect x="125" y="155" width="25" height="55" fill="#CBD5E1" />
      <rect x="210" y="155" width="25" height="55" fill="#CBD5E1" />
      <polygon points="150,140 180,90 210,140" fill="#3B82F6" />
      <polygon points="125,155 137,115 150,155" fill="#2563EB" />
      <polygon points="210,155 222,115 235,155" fill="#2563EB" />
      <rect x="170" y="180" width="20" height="30" rx="10" fill="#0F172A" />
      <path d="M 175 230 Q 180 280 178 320" stroke="#38BDF8" strokeWidth="8" strokeLinecap="round" fill="none" />
      <ellipse cx="180" cy="325" rx="70" ry="20" fill="#FFFFFF" opacity="0.9" />
    </svg>
  );

  // Puzzle 14: Aurora Borealis Lights
  const AuroraArt = () => (
    <svg viewBox="0 0 360 360" style={svgStyle}>
      <circle cx="180" cy="180" r="160" fill="#030712" />
      <path d="M 40 160 Q 100 70 180 130 Q 260 190 320 100 L 320 200 Q 250 250 170 180 Q 90 120 40 200 Z" fill="#4ADE80" opacity="0.75" />
      <path d="M 40 130 Q 120 50 200 110 Q 280 170 320 80 L 320 150 Q 250 210 180 150 Q 100 90 40 160 Z" fill="#C084FC" opacity="0.65" />
      <path d="M 30 300 L 110 210 L 190 300 Z" fill="#1E293B" />
      <path d="M 110 210 L 95 235 L 110 245 L 125 235 Z" fill="#F8FAFC" />
      <path d="M 160 300 L 240 190 L 330 300 Z" fill="#0F172A" />
      <path d="M 240 190 L 220 220 L 240 230 L 260 220 Z" fill="#F8FAFC" />
      <polygon points="70,300 60,260 80,260" fill="#064E3B" />
      <polygon points="290,300 280,250 300,250" fill="#064E3B" />
      <circle cx="90" cy="65" r="2" fill="#FFFFFF" />
      <circle cx="270" cy="50" r="2.5" fill="#FFFFFF" />
      <circle cx="180" cy="40" r="3" fill="#FEF08A" />
    </svg>
  );

  // Puzzle 15: Rainbow Paradise Waterfall
  const WaterfallArt = () => (
    <svg viewBox="0 0 360 360" style={svgStyle}>
      <circle cx="180" cy="180" r="160" fill="#E0F2FE" />
      <path d="M 60 240 A 130 130 0 0 1 300 240" stroke="#EF4444" strokeWidth="6" fill="none" opacity="0.85" />
      <path d="M 66 240 A 124 124 0 0 1 294 240" stroke="#F59E0B" strokeWidth="6" fill="none" opacity="0.85" />
      <path d="M 72 240 A 118 118 0 0 1 288 240" stroke="#10B981" strokeWidth="6" fill="none" opacity="0.85" />
      <path d="M 78 240 A 112 112 0 0 1 282 240" stroke="#0EA5E9" strokeWidth="6" fill="none" opacity="0.85" />
      <path d="M 84 240 A 106 106 0 0 1 276 240" stroke="#8B5CF6" strokeWidth="6" fill="none" opacity="0.85" />
      <path d="M 20 200 L 140 180 L 130 340 L 20 340 Z" fill="#15803D" />
      <path d="M 340 200 L 220 180 L 230 340 L 340 340 Z" fill="#15803D" />
      <rect x="140" y="180" width="80" height="120" fill="#38BDF8" />
      <path d="M 155 180 L 155 300 M 180 180 L 180 300 M 205 180 L 205 300" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="10,6" />
      <ellipse cx="180" cy="300" rx="60" ry="18" fill="#E0F2FE" opacity="0.95" />
      <circle cx="100" cy="270" r="8" fill="#F43F5E" />
      <circle cx="260" cy="270" r="8" fill="#FBBF24" />
    </svg>
  );

  // 15 Puzzle Registry
  const PUZZLES = [
    { id: 1, name: "Baby Dragon", Component: DragonArt },
    { id: 2, name: "Lotus Bloom", Component: LotusArt },
    { id: 3, name: "Mountain Sunrise", Component: MountainArt },
    { id: 4, name: "Zen Panda", Component: PandaArt },
    { id: 5, name: "Cosmic Moon", Component: CosmicMoonArt },
    { id: 6, name: "Sunset Dolphin", Component: DolphinArt },
    { id: 7, name: "Zen Bonsai Tree", Component: BonsaiArt },
    { id: 8, name: "Sleeping Fox", Component: FoxArt },
    { id: 9, name: "Hot Air Balloon", Component: BalloonArt },
    { id: 10, name: "Golden Butterfly", Component: ButterflyArt },
    { id: 11, name: "Midnight Owl", Component: OwlArt },
    { id: 12, name: "Tropical Flamingo", Component: FlamingoArt },
    { id: 13, name: "Floating Castle", Component: CastleArt },
    { id: 14, name: "Aurora Borealis", Component: AuroraArt },
    { id: 15, name: "Rainbow Paradise", Component: WaterfallArt },
  ];

  // Helper to slice active puzzle picture across 9 tiles
  const renderPuzzlePiece = (tileNum) => {
    const origIndex = tileNum - 1;
    const origRow = Math.floor(origIndex / 3);
    const origCol = origIndex % 3;
    const CurrentArtwork = PUZZLES[currentPuzzleIndex].Component;

    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          borderRadius: "14px",
          position: "relative",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 3px 8px rgba(0, 0, 0, 0.06)",
          border: "1px solid #F1F5F9",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "300%",
            height: "300%",
            left: `-${origCol * 100}%`,
            top: `-${origRow * 100}%`,
            pointerEvents: "none",
          }}
        >
          <CurrentArtwork />
        </div>
      </div>
    );
  };

  // =========================================================================
  // GAME 2: MANDALA COLORING THERAPY (Interactive Coloring & Free Draw)
  // =========================================================================
  const mandalaCanvasRef = useRef(null);
  const [selectedColor, setSelectedColor] = useState("#EF4444");
  const [brushSize, setBrushSize] = useState(8);
  const [mandalaPatternIndex, setMandalaPatternIndex] = useState(0);
  const [colorMode, setColorMode] = useState("fill");
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const [mandalaFills, setMandalaFills] = useState({
    center: "#EF4444",
    ring2_0: "#FACC15",
  });

  const PALETTE_ROW_1 = [
    "#FF6B6B", "#4ECDC4", "#38BDF8", "#FACC15", "#FB923C",
    "#EF4444", "#6366F1", "#A5B4FC", "#F472B6", "#10B981",
  ];
  const PALETTE_ROW_2 = ["#E06D53", "#334155"];

  const drawMandala = useCallback(() => {
    const canvas = mandalaCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = "#CBD5E1";

    if (mandalaPatternIndex === 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, 185, 0, Math.PI * 2);
      ctx.stroke();

      const rOuter = 145;
      const rOuterCircle = 23;
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * rOuter;
        const y = cy + Math.sin(angle) * rOuter;
        const key = `ring2_${i}`;
        ctx.beginPath();
        ctx.arc(x, y, rOuterCircle, 0, Math.PI * 2);
        if (mandalaFills[key]) {
          ctx.fillStyle = mandalaFills[key];
          ctx.fill();
        }
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(cx, cy, 110, 0, Math.PI * 2);
      ctx.stroke();

      const rMiddle = 82;
      const rMiddleCircle = 14;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * rMiddle;
        const y = cy + Math.sin(angle) * rMiddle;
        const key = `ring1_${i}`;
        ctx.beginPath();
        ctx.arc(x, y, rMiddleCircle, 0, Math.PI * 2);
        if (mandalaFills[key]) {
          ctx.fillStyle = mandalaFills[key];
          ctx.fill();
        }
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(cx, cy, 48, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, 25, 0, Math.PI * 2);
      if (mandalaFills.center) {
        ctx.fillStyle = mandalaFills.center;
        ctx.fill();
      }
      ctx.stroke();
    } else if (mandalaPatternIndex === 1) {
      ctx.beginPath();
      ctx.arc(cx, cy, 185, 0, Math.PI * 2);
      ctx.stroke();

      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const x = cx + Math.cos(angle) * 115;
        const y = cy + Math.sin(angle) * 115;
        const key = `ring2_${i}`;
        ctx.beginPath();
        ctx.ellipse(x, y, 38, 20, angle, 0, Math.PI * 2);
        if (mandalaFills[key]) {
          ctx.fillStyle = mandalaFills[key];
          ctx.fill();
        }
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(cx, cy, 30, 0, Math.PI * 2);
      if (mandalaFills.center) {
        ctx.fillStyle = mandalaFills.center;
        ctx.fill();
      }
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(cx, cy, 185, 0, Math.PI * 2);
      ctx.stroke();

      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        const key = `ring2_${i}`;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle - 0.1) * 85, cy + Math.sin(angle - 0.1) * 85);
        ctx.lineTo(cx + Math.cos(angle) * 170, cy + Math.sin(angle) * 170);
        ctx.lineTo(cx + Math.cos(angle + 0.1) * 85, cy + Math.sin(angle + 0.1) * 85);
        ctx.closePath();
        if (mandalaFills[key]) {
          ctx.fillStyle = mandalaFills[key];
          ctx.fill();
        }
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(cx, cy, 28, 0, Math.PI * 2);
      if (mandalaFills.center) {
        ctx.fillStyle = mandalaFills.center;
        ctx.fill();
      }
      ctx.stroke();
    }

    ctx.restore();
  }, [mandalaFills, mandalaPatternIndex]);

  useEffect(() => {
    drawMandala();
  }, [drawMandala]);

  const handleCanvasClick = (e) => {
    if (colorMode === "brush") return;
    const canvas = mandalaCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX !== undefined ? e.clientX : e.touches && e.touches[0] ? e.touches[0].clientX : 0;
    const clientY = e.clientY !== undefined ? e.clientY : e.touches && e.touches[0] ? e.touches[0].clientY : 0;
    const x = (clientX - rect.left) * (canvas.width / (rect.width || 1));
    const y = (clientY - rect.top) * (canvas.height / (rect.height || 1));
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    if (mandalaPatternIndex === 0) {
      // 1. Center circle
      ctx.beginPath();
      ctx.arc(cx, cy, 28, 0, Math.PI * 2);
      if (ctx.isPointInPath(x, y)) {
        playSound("color");
        setMandalaFills((prev) => ({ ...prev, center: selectedColor }));
        return;
      }

      // 2. Middle ring (8 circles)
      const rMiddle = 82;
      const rMiddleCircle = 18;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
        const px = cx + Math.cos(angle) * rMiddle;
        const py = cy + Math.sin(angle) * rMiddle;
        ctx.beginPath();
        ctx.arc(px, py, rMiddleCircle, 0, Math.PI * 2);
        if (ctx.isPointInPath(x, y)) {
          playSound("color");
          setMandalaFills((prev) => ({ ...prev, [`ring1_${i}`]: selectedColor }));
          return;
        }
      }

      // 3. Outer ring (16 circles)
      const rOuter = 145;
      const rOuterCircle = 28;
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2 - Math.PI / 2;
        const px = cx + Math.cos(angle) * rOuter;
        const py = cy + Math.sin(angle) * rOuter;
        ctx.beginPath();
        ctx.arc(px, py, rOuterCircle, 0, Math.PI * 2);
        if (ctx.isPointInPath(x, y)) {
          playSound("color");
          setMandalaFills((prev) => ({ ...prev, [`ring2_${i}`]: selectedColor }));
          return;
        }
      }
    } else if (mandalaPatternIndex === 1) {
      // 1. Center circle
      ctx.beginPath();
      ctx.arc(cx, cy, 34, 0, Math.PI * 2);
      if (ctx.isPointInPath(x, y)) {
        playSound("color");
        setMandalaFills((prev) => ({ ...prev, center: selectedColor }));
        return;
      }

      // 2. 12 Petals (ellipses)
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const px = cx + Math.cos(angle) * 115;
        const py = cy + Math.sin(angle) * 115;
        ctx.beginPath();
        ctx.ellipse(px, py, 42, 24, angle, 0, Math.PI * 2);
        if (ctx.isPointInPath(x, y)) {
          playSound("color");
          setMandalaFills((prev) => ({ ...prev, [`ring2_${i}`]: selectedColor }));
          return;
        }
      }
    } else {
      // Pattern 2
      // 1. Center circle
      ctx.beginPath();
      ctx.arc(cx, cy, 32, 0, Math.PI * 2);
      if (ctx.isPointInPath(x, y)) {
        playSound("color");
        setMandalaFills((prev) => ({ ...prev, center: selectedColor }));
        return;
      }

      // 2. 16 Triangular Rays / Petals
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle - 0.12) * 80, cy + Math.sin(angle - 0.12) * 80);
        ctx.lineTo(cx + Math.cos(angle) * 175, cy + Math.sin(angle) * 175);
        ctx.lineTo(cx + Math.cos(angle + 0.12) * 80, cy + Math.sin(angle + 0.12) * 80);
        ctx.closePath();
        if (ctx.isPointInPath(x, y)) {
          playSound("color");
          setMandalaFills((prev) => ({ ...prev, [`ring2_${i}`]: selectedColor }));
          return;
        }
      }
    }
  };

  const startDrawing = (e) => {
    if (colorMode !== "brush") return;
    const canvas = mandalaCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = ((e.clientX || (e.touches && e.touches[0].clientX)) - rect.left) * (canvas.width / rect.width);
    const cy = ((e.clientY || (e.touches && e.touches[0].clientY)) - rect.top) * (canvas.height / rect.height);
    lastPosRef.current = { x: cx, y: cy };
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || colorMode !== "brush") return;
    const canvas = mandalaCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const cx = ((e.clientX || (e.touches && e.touches[0].clientX)) - rect.left) * (canvas.width / rect.width);
    const cy = ((e.clientY || (e.touches && e.touches[0].clientY)) - rect.top) * (canvas.height / rect.height);

    ctx.save();
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(cx, cy);
    ctx.stroke();
    ctx.restore();

    lastPosRef.current = { x: cx, y: cy };
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClearAll = () => {
    playSound("click");
    setMandalaFills({});
    const canvas = mandalaCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setTimeout(drawMandala, 10);
  };

  const handleNewMandala = () => {
    playSound("click");
    setMandalaPatternIndex((prev) => (prev + 1) % 3);
    setMandalaFills({});
  };

  const handleSaveArt = () => {
    playSound("win");
    const canvas = mandalaCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `mandala-therapy-art-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // =========================================================================
  // UI  (mood-bg background, cute 3D icons, mobile-first layout)
  // =========================================================================

  const pillBtn = (active) => ({
    border: "none",
    padding: "10px 8px",
    borderRadius: "16px",
    fontWeight: 800,
    fontSize: "13px",
    fontFamily: "inherit",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    background: active ? THEME.gradient : "transparent",
    color: active ? "#FFFFFF" : THEME.text,
    boxShadow: active ? "0 6px 14px rgba(95,109,166,0.32)" : "none",
    WebkitTapHighlightColor: "transparent",
  });

  const smallBtn = (active) => ({
    border: "none",
    background: active ? THEME.gradient : "rgba(255,255,255,0.85)",
    color: active ? "#FFFFFF" : THEME.text,
    padding: "9px 14px",
    borderRadius: "14px",
    fontWeight: 800,
    fontSize: "12.5px",
    fontFamily: "inherit",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    boxShadow: "0 4px 10px rgba(46,52,82,0.1)",
    WebkitTapHighlightColor: "transparent",
  });

  const gradBtn = {
    border: "none",
    background: THEME.gradient,
    color: "#FFFFFF",
    padding: "10px 20px",
    borderRadius: "18px",
    fontWeight: 800,
    fontSize: "13px",
    fontFamily: "inherit",
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(95,109,166,0.32)",
    WebkitTapHighlightColor: "transparent",
  };

  const roundNav = {
    border: "none",
    backgroundColor: "#FFFFFF",
    color: THEME.text,
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    fontSize: "13px",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(46,52,82,0.14)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };

  const swatch = (color) => {
    const isSelected = selectedColor === color;
    return (
      <button
        key={color}
        onClick={() => {
          playSound("click");
          setSelectedColor(color);
        }}
        style={{
          width: "30px",
          height: "30px",
          borderRadius: "50%",
          backgroundColor: color,
          border: isSelected ? "3px solid #FFFFFF" : "none",
          boxShadow: isSelected ? `0 0 0 3px ${color}, 0 5px 12px rgba(0,0,0,0.2)` : "0 2px 6px rgba(0,0,0,0.12)",
          cursor: "pointer",
          transform: isSelected ? "scale(1.15)" : "scale(1)",
          transition: "transform 0.15s ease",
          padding: 0,
        }}
      />
    );
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: THEME.soft,
        fontFamily: "'Poppins', Arial, sans-serif",
        padding: "max(16px, env(safe-area-inset-top)) 12px max(48px, env(safe-area-inset-bottom))",
        position: "relative",
        boxSizing: "border-box",
        overflowX: "hidden",
        WebkitTextSizeAdjust: "100%",
      }}
    >
      {/* Background photo – blurred full-screen copy + sharp phone-width copy */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(28px)",
          transform: "scale(1.15)",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "100dvh",
          zIndex: 1,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "480px",
            height: "100%",
            backgroundImage: `linear-gradient(rgba(255,255,255,0.06), rgba(255,255,255,0.16)), url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            boxShadow: "0 0 40px rgba(0,0,0,0.15)",
          }}
        />
      </div>

      <div style={{ position: "relative", zIndex: 2, maxWidth: "480px", margin: "0 auto", display: "grid", gap: "14px" }}>
        {/* Top bar */}
        <div style={{ display: "grid", gap: "10px" }}>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              ...glass,
              justifySelf: "start",
              color: THEME.ink,
              padding: "9px 18px",
              borderRadius: "16px",
              fontWeight: 800,
              fontSize: "13px",
              fontFamily: "inherit",
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            ← Back to Dashboard
          </button>

          <div
            style={{
              ...glass,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "6px",
              padding: "5px",
              borderRadius: "20px",
            }}
          >
            <button onClick={() => setActiveTab("puzzle")} style={pillBtn(activeTab === "puzzle")}>
              <Icon3D name="puzzle" size={22} /> Daily Puzzle
            </button>
            <button onClick={() => setActiveTab("mandala")} style={pillBtn(activeTab === "mandala")}>
              <Icon3D name="flower" size={22} /> Mandala
            </button>
          </div>
        </div>

        {/* ============================ PUZZLE ============================ */}
        {activeTab === "puzzle" && (
          <div
            style={{
              ...glass,
              borderRadius: "28px",
              padding: "22px 16px 24px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              boxSizing: "border-box",
            }}
          >
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: THEME.ink, margin: "0 0 12px 0" }}>Your Daily Task</h1>
            <div style={{ width: "88%", height: "1px", backgroundColor: THEME.line, marginBottom: "14px" }} />

            <h2 style={{ fontSize: "16.5px", fontWeight: 800, color: THEME.accentDark, margin: "0 0 8px 0" }}>
              Mind Unwind – Simple Puzzle Game
            </h2>
            <p style={{ fontSize: "13px", color: THEME.text, margin: "0 0 6px 0", lineHeight: 1.5 }}>
              Challenge your mind gently with this relaxing puzzle. Rearrange the pieces to complete the picture or pattern.
            </p>
            <p style={{ fontSize: "12.5px", color: THEME.text, opacity: 0.85, margin: "0 0 14px 0", lineHeight: 1.5 }}>
              Take your time—there's no timer, no pressure. Just drag &amp; drop pieces to swap and solve.
            </p>

            {/* Puzzle selector */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                maxWidth: "320px",
                margin: "0 auto 14px auto",
                padding: "6px 10px",
                background: "rgba(255,255,255,0.75)",
                borderRadius: "20px",
                border: `1.5px solid ${THEME.line}`,
                boxSizing: "border-box",
              }}
            >
              <button onClick={goToPrevPuzzle} style={roundNav} title="Previous Puzzle">
                ◀
              </button>
              <div style={{ textAlign: "center", minWidth: 0 }}>
                <div style={{ fontSize: "13px", fontWeight: 800, color: THEME.ink }}>
                  Puzzle {currentPuzzleIndex + 1} of {PUZZLES.length}
                </div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: THEME.accentDark }}>{PUZZLES[currentPuzzleIndex].name}</div>
              </div>
              <button onClick={goToNextPuzzle} style={roundNav} title="Next Puzzle">
                ▶
              </button>
            </div>

            {/* 3x3 grid (drag & drop + touch) */}
            <div
              style={{
                width: "min(300px, 100%)",
                aspectRatio: "1 / 1",
                backgroundColor: "rgba(255,255,255,0.9)",
                borderRadius: "24px",
                padding: "8px",
                boxShadow: "0 8px 22px rgba(46,52,82,0.12)",
                border: `1.5px solid ${THEME.line}`,
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gridTemplateRows: "repeat(3, 1fr)",
                gap: "7px",
                marginBottom: "14px",
                position: "relative",
                boxSizing: "border-box",
                userSelect: "none",
                touchAction: "none",
              }}
            >
              {showFullPreview ? (
                <div style={{ gridColumn: "1 / -1", gridRow: "1 / -1", borderRadius: "14px", overflow: "hidden" }}>
                  {React.createElement(PUZZLES[currentPuzzleIndex].Component)}
                </div>
              ) : (
                tiles.map((tileNum, idx) => {
                  const isBeingDragged = draggedIndex === idx;
                  const isDragTarget = dragOverIndex === idx && draggedIndex !== idx;
                  const isSelected = selectedTileIndex === idx;

                  return (
                    <div
                      key={idx}
                      data-tile-index={idx}
                      draggable={!isSolved}
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragLeave={(e) => handleDragLeave(e, idx)}
                      onDrop={(e) => handleDrop(e, idx)}
                      onDragEnd={handleDragEnd}
                      onTouchStart={() => handleTouchStart(idx)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      onClick={() => handleTileClick(idx)}
                      style={{
                        cursor: isSolved ? "default" : isBeingDragged ? "grabbing" : "grab",
                        opacity: isBeingDragged ? 0.45 : 1,
                        transform: isDragTarget ? "scale(1.06)" : isSelected ? "scale(1.04)" : "scale(1)",
                        outline: isDragTarget ? `2px dashed ${THEME.accent}` : isSelected ? `2px solid ${THEME.teal}` : "none",
                        outlineOffset: "2px",
                        borderRadius: "14px",
                        transition: "transform 0.15s ease, opacity 0.15s ease",
                      }}
                    >
                      {renderPuzzlePiece(tileNum)}
                    </div>
                  );
                })
              )}
            </div>

            {/* Controls */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "14px", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
              <button onClick={shufflePuzzle} style={smallBtn(false)}>
                <Icon3D name="shuffle" size={20} /> Mix Pieces
              </button>
              <button onClick={() => setShowFullPreview((p) => !p)} style={smallBtn(showFullPreview)}>
                <Icon3D name="eye" size={20} /> {showFullPreview ? "Hide Full Image" : "Peek Original"}
              </button>
              {puzzleMoves > 0 && (
                <span style={{ fontSize: "12px", color: THEME.text, fontWeight: 700 }}>Moves: {puzzleMoves}</span>
              )}
            </div>

            {/* Target reference */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginBottom: "16px",
                background: "rgba(255,255,255,0.7)",
                padding: "10px 14px",
                borderRadius: "20px",
                border: `1.5px dashed ${THEME.accent}`,
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 800, color: THEME.text, marginBottom: "6px" }}>
                <Icon3D name="target" size={18} /> Target Reference Image
              </span>
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "16px",
                  overflow: "hidden",
                  backgroundColor: "#FFFFFF",
                  border: `1.5px solid ${THEME.line}`,
                  boxShadow: "0 3px 10px rgba(46,52,82,0.12)",
                }}
              >
                {React.createElement(PUZZLES[currentPuzzleIndex].Component)}
              </div>
            </div>

            {/* Solved */}
            {isSolved && (
              <div
                style={{
                  backgroundColor: "rgba(220,252,231,0.95)",
                  border: "1.5px solid #86EFAC",
                  color: "#166534",
                  padding: "14px 18px",
                  borderRadius: "20px",
                  marginBottom: "16px",
                  boxShadow: "0 6px 18px rgba(22,101,52,0.15)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                  width: "100%",
                  maxWidth: "340px",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ fontWeight: 800, fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Icon3D name="party" size={26} /> Puzzle {currentPuzzleIndex + 1} Completed! Well done!
                </div>
                <button onClick={goToNextPuzzle} style={{ ...gradBtn, display: "inline-flex", alignItems: "center", gap: "8px" }}>
                  <Icon3D name="gamepad" size={22} /> Play New Game
                </button>
              </div>
            )}

            {/* Day / Outcomes */}
            <div style={{ display: "flex", gap: "12px", width: "100%", maxWidth: "340px", marginBottom: "16px", justifyContent: "center" }}>
              <button
                onClick={() => {
                  setActiveDay(7);
                  if (isSolved) {
                    playSound("win");
                    playVoiceCompleted();
                  }
                }}
                style={{
                  flex: 1,
                  border: "none",
                  background: isDayCompleted ? "linear-gradient(135deg, #22A04F, #168038)" : THEME.gradient,
                  color: "#FFFFFF",
                  padding: "13px 10px",
                  borderRadius: "20px",
                  fontWeight: 800,
                  fontSize: "14.5px",
                  fontFamily: "inherit",
                  cursor: "pointer",
                  boxShadow: isDayCompleted ? "0 8px 18px rgba(22,128,56,0.35)" : "0 8px 18px rgba(95,109,166,0.35)",
                  transition: "all 0.2s ease",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {isDayCompleted ? `✓ Day ${activeDay} Completed` : `Day ${activeDay}`}
              </button>

              <button
                onClick={() => setShowOutcomes(true)}
                style={{
                  flex: 1,
                  border: "none",
                  background: THEME.gradientWarm,
                  color: "#FFFFFF",
                  padding: "13px 10px",
                  borderRadius: "20px",
                  fontWeight: 800,
                  fontSize: "14.5px",
                  fontFamily: "inherit",
                  cursor: "pointer",
                  boxShadow: "0 8px 18px rgba(183,147,196,0.4)",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                Outcomes
              </button>
            </div>

            {/* Countdown */}
            <div style={{ color: THEME.accentDark, fontSize: "13px", fontWeight: 700 }}>
              Do the task and come back in{" "}
              <span style={{ fontWeight: 900 }}>
                {String(countdown.hours).padStart(2, "0")}h:{String(countdown.mins).padStart(2, "0")}m:
                {String(countdown.secs).padStart(2, "0")}s
              </span>
            </div>
          </div>
        )}

        {/* ============================ MANDALA ============================ */}
        {activeTab === "mandala" && (
          <div
            style={{
              ...glass,
              borderRadius: "28px",
              padding: "22px 14px 24px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              boxSizing: "border-box",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "6px" }}>
              <Icon3D name="flower" size={34} />
              <h1 style={{ fontSize: "21px", fontWeight: 800, color: THEME.ink, margin: 0, lineHeight: 1.2 }}>
                Mandala Coloring Therapy
              </h1>
            </div>

            <p style={{ fontSize: "13px", color: THEME.text, margin: "0 0 16px 0", lineHeight: 1.5 }}>
              Relax, breathe, and let your creativity flow through beautiful mandala patterns
            </p>

            {/* Palette */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>{PALETTE_ROW_1.map(swatch)}</div>
              <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>{PALETTE_ROW_2.map(swatch)}</div>
            </div>

            {/* Brush size + mode */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap", justifyContent: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: THEME.ink }}>Brush Size:</span>
                <input
                  type="range"
                  min="2"
                  max="24"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  style={{ accentColor: THEME.accent, cursor: "pointer", width: "90px" }}
                />
                <span style={{ fontSize: "13px", fontWeight: 700, color: THEME.ink }}>{brushSize}</span>
              </div>

              <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,0.75)", padding: "4px", borderRadius: "16px" }}>
                <button
                  onClick={() => setColorMode("fill")}
                  style={{
                    border: "none",
                    background: colorMode === "fill" ? THEME.gradient : "transparent",
                    color: colorMode === "fill" ? "#fff" : THEME.text,
                    padding: "6px 12px",
                    borderRadius: "12px",
                    fontWeight: 800,
                    fontSize: "12px",
                    fontFamily: "inherit",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <Icon3D name="bucket" size={18} /> Tap to Fill
                </button>
                <button
                  onClick={() => setColorMode("brush")}
                  style={{
                    border: "none",
                    background: colorMode === "brush" ? THEME.gradient : "transparent",
                    color: colorMode === "brush" ? "#fff" : THEME.text,
                    padding: "6px 12px",
                    borderRadius: "12px",
                    fontWeight: 800,
                    fontSize: "12px",
                    fontFamily: "inherit",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <Icon3D name="brush" size={18} /> Free Brush
                </button>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap", justifyContent: "center" }}>
              <button onClick={handleClearAll} style={gradBtn}>
                Clear All
              </button>
              <button onClick={handleNewMandala} style={gradBtn}>
                New Mandala
              </button>
              <button onClick={handleSaveArt} style={{ ...gradBtn, background: THEME.gradientWarm, boxShadow: "0 8px 18px rgba(183,147,196,0.4)" }}>
                Save Art
              </button>
            </div>

            {/* Canvas */}
            <div
              style={{
                width: "min(360px, 100%)",
                aspectRatio: "1 / 1",
                backgroundColor: "#FFFFFF",
                borderRadius: "24px",
                border: `1.5px solid ${THEME.line}`,
                boxShadow: "0 8px 24px rgba(46,52,82,0.1)",
                overflow: "hidden",
                position: "relative",
                cursor: colorMode === "fill" ? "pointer" : "crosshair",
                boxSizing: "border-box",
              }}
            >
              <canvas
                ref={mandalaCanvasRef}
                width={420}
                height={420}
                onClick={handleCanvasClick}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                style={{ width: "100%", height: "100%", display: "block", touchAction: "none" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Outcomes modal */}
      {showOutcomes && (
        <div
          onClick={() => setShowOutcomes(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(46,52,82,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              ...glass,
              background: "rgba(255,255,255,0.92)",
              borderRadius: "28px",
              padding: "26px 20px",
              maxWidth: "400px",
              width: "100%",
              textAlign: "center",
              boxSizing: "border-box",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Icon3D name="trophy" size={64} />
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: THEME.ink, margin: "10px 0 6px 0" }}>7-Day Mindful Outcomes</h2>
            <p style={{ color: THEME.text, fontSize: "13px", lineHeight: 1.5, margin: "0 0 16px 0" }}>
              You've demonstrated consistent dedication to your mental tranquility and focus.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "18px" }}>
              <div style={{ background: THEME.soft, padding: "14px 8px", borderRadius: "18px", border: `1px solid ${THEME.line}` }}>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "#168038" }}>{isDayCompleted ? "7 / 7" : "6 / 7"}</div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: THEME.text, marginTop: "3px" }}>Days Solved</div>
              </div>
              <div style={{ background: THEME.soft, padding: "14px 8px", borderRadius: "18px", border: `1px solid ${THEME.line}` }}>
                <div style={{ fontSize: "18px", fontWeight: 800, color: THEME.accentDark }}>{isDayCompleted ? "100%" : "94%"}</div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: THEME.text, marginTop: "3px" }}>Mindful Score</div>
              </div>
            </div>

            <button
              onClick={() => setShowOutcomes(false)}
              style={{ ...gradBtn, width: "100%", padding: "13px", fontSize: "14.5px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              Continue My Journey <Icon3D name="sparkle" size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MindRelaxGames;
