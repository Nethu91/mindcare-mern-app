import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

function MindRelaxGames() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("puzzle"); // "puzzle" or "mandala"

  // =========================================================================
  // AUDIO SYNTH & VOICE ANNOUNCEMENT
  // =========================================================================
  const playSound = useCallback((type = "click") => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

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
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
          gain.gain.setValueAtTime(0.16, ctx.currentTime + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.45);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.1);
          osc.stop(ctx.currentTime + idx * 0.1 + 0.45);
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
  }, []);

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
  // GAME 1: MIND UNWIND – SIMPLE PUZZLE GAME (DRAG & DROP PUZZLE)
  // =========================================================================
  const [activeDay, setActiveDay] = useState(7);
  const [isDayCompleted, setIsDayCompleted] = useState(false);
  const [showOutcomes, setShowOutcomes] = useState(false);
  const [countdown, setCountdown] = useState({ hours: 6, mins: 36, secs: 16 });
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [puzzleMoves, setPuzzleMoves] = useState(0);

  // 9 Tiles (1..9): Solved state is [1, 2, 3, 4, 5, 6, 7, 8, 9]
  // Initial scrambled state:
  const [tiles, setTiles] = useState([2, 1, 3, 5, 4, 6, 8, 7, 9]);

  // Drag and Drop state
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [selectedTileIndex, setSelectedTileIndex] = useState(null); // Click to swap fallback

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

  // Check if puzzle is solved: [1, 2, 3, 4, 5, 6, 7, 8, 9]
  const checkSolved = (currentTiles) => {
    for (let i = 0; i < 9; i++) {
      if (currentTiles[i] !== i + 1) return false;
    }
    return true;
  };

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
          playVoiceCompleted(); // Speaks: "Completed Task!"
        }

        return next;
      });
    },
    [playSound, playVoiceCompleted]
  );

  // Scramble / Shuffle puzzle
  const shufflePuzzle = useCallback(() => {
    let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    // Random shuffle ensuring not solved initially
    do {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    } while (checkSolved(arr));

    setTiles(arr);
    setPuzzleMoves(0);
    setIsSolved(false);
    setSelectedTileIndex(null);
  }, []);

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

  // Click-to-swap fallback (tap piece A, then tap piece B)
  const handleTileClick = (index) => {
    if (selectedTileIndex === null) {
      setSelectedTileIndex(index);
      playSound("click");
    } else {
      swapTiles(selectedTileIndex, index);
      setSelectedTileIndex(null);
    }
  };

  // Helper to slice dragon picture across 9 tiles
  const renderDragonPiece = (tileNum) => {
    const origIndex = tileNum - 1;
    const origRow = Math.floor(origIndex / 3);
    const origCol = origIndex % 3;

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
          <DragonSVG />
        </div>
      </div>
    );
  };

  // Cute Dragon Vector Art matching Screenshot 1
  const DragonSVG = () => (
    <svg
      viewBox="0 0 360 360"
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <circle cx="180" cy="180" r="160" fill="#F8FAFC" />

      {/* Tail & fins */}
      <path
        d="M 170 290 Q 230 330 250 280 Q 260 250 240 240 Q 220 260 180 275 Z"
        fill="#0F172A"
      />
      <path
        d="M 235 255 Q 265 245 255 275 Z"
        fill="#06B6D4"
        opacity="0.95"
      />

      {/* Left Wing */}
      <g>
        <path
          d="M 120 180 Q 40 160 20 220 Q 50 245 80 230 Q 100 245 130 225 Z"
          fill="#0EA5E9"
        />
        <path
          d="M 120 180 Q 40 160 20 220 Q 35 190 70 180 Z"
          fill="#0F172A"
        />
        <path
          d="M 20 220 Q 50 200 80 230"
          stroke="#0284C7"
          strokeWidth="2.5"
          fill="none"
        />
      </g>

      {/* Right Wing */}
      <g>
        <path
          d="M 240 180 Q 320 160 340 220 Q 310 245 280 230 Q 260 245 230 225 Z"
          fill="#0EA5E9"
        />
        <path
          d="M 240 180 Q 320 160 340 220 Q 325 190 290 180 Z"
          fill="#0F172A"
        />
        <path
          d="M 340 220 Q 310 200 280 230"
          stroke="#0284C7"
          strokeWidth="2.5"
          fill="none"
        />
      </g>

      {/* Body & Belly */}
      <ellipse cx="180" cy="245" rx="60" ry="70" fill="#0F172A" />
      <ellipse cx="180" cy="255" rx="38" ry="48" fill="#1E293B" />

      {/* Paws */}
      <ellipse cx="125" cy="305" rx="26" ry="16" fill="#0B1120" />
      <ellipse cx="235" cy="305" rx="26" ry="16" fill="#0B1120" />
      <ellipse cx="155" cy="308" rx="18" ry="16" fill="#0F172A" />
      <ellipse cx="205" cy="308" rx="18" ry="16" fill="#0F172A" />
      <circle cx="145" cy="315" r="3" fill="#E2E8F0" />
      <circle cx="155" cy="317" r="3" fill="#E2E8F0" />
      <circle cx="165" cy="315" r="3" fill="#E2E8F0" />
      <circle cx="195" cy="315" r="3" fill="#E2E8F0" />
      <circle cx="205" cy="317" r="3" fill="#E2E8F0" />
      <circle cx="215" cy="315" r="3" fill="#E2E8F0" />

      {/* Hornlets & Ears */}
      <path d="M 125 110 Q 95 30 145 60 Z" fill="#0F172A" />
      <path d="M 235 110 Q 265 30 215 60 Z" fill="#0F172A" />
      <path d="M 105 130 Q 75 90 115 110 Z" fill="#0F172A" />
      <path d="M 255 130 Q 285 90 245 110 Z" fill="#0F172A" />

      {/* Head */}
      <ellipse cx="180" cy="140" rx="76" ry="62" fill="#0F172A" />
      <path d="M 174 88 Q 180 82 186 88 Q 180 94 174 88 Z" fill="#1E293B" />
      <path d="M 172 100 Q 180 94 188 100 Q 180 106 172 100 Z" fill="#1E293B" />

      {/* Big Cute Green Eyes */}
      <ellipse
        cx="140"
        cy="142"
        rx="26"
        ry="30"
        fill="#22C55E"
        transform="rotate(-6 140 142)"
      />
      <ellipse
        cx="140"
        cy="142"
        rx="22"
        ry="26"
        fill="#4ADE80"
        transform="rotate(-6 140 142)"
      />
      <ellipse cx="144" cy="143" rx="10" ry="22" fill="#0B1120" />
      <circle cx="134" cy="130" r="7" fill="#FFFFFF" />
      <circle cx="148" cy="154" r="3" fill="#FFFFFF" />

      <ellipse
        cx="220"
        cy="142"
        rx="26"
        ry="30"
        fill="#22C55E"
        transform="rotate(6 220 142)"
      />
      <ellipse
        cx="220"
        cy="142"
        rx="22"
        ry="26"
        fill="#4ADE80"
        transform="rotate(6 220 142)"
      />
      <ellipse cx="216" cy="143" rx="10" ry="22" fill="#0B1120" />
      <circle cx="212" cy="130" r="7" fill="#FFFFFF" />
      <circle cx="224" cy="154" r="3" fill="#FFFFFF" />

      {/* Snout & Smile */}
      <ellipse cx="172" cy="170" rx="3" ry="2" fill="#0B1120" />
      <ellipse cx="188" cy="170" rx="3" ry="2" fill="#0B1120" />
      <path
        d="M 166 180 Q 180 188 194 180"
        stroke="#1E293B"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="118" cy="168" rx="10" ry="5" fill="#F43F5E" opacity="0.25" />
      <ellipse cx="242" cy="168" rx="10" ry="5" fill="#F43F5E" opacity="0.25" />
    </svg>
  );

  // Zen Meditating Background Art
  const MeditatingPersonArt = () => (
    <svg
      viewBox="0 0 450 550"
      style={{ width: "100%", height: "100%", opacity: 0.9, pointerEvents: "none" }}
    >
      <circle cx="240" cy="200" r="160" fill="rgba(255, 237, 213, 0.45)" />
      <g>
        <circle cx="360" cy="190" r="18" fill="#FBBF24" />
        <circle cx="360" cy="190" r="8" fill="#FEF3C7" />
        <path
          d="M 360 166 L 360 214 M 336 190 L 384 190 M 343 173 L 377 207 M 343 207 L 377 173"
          stroke="#F59E0B"
          strokeWidth="6"
        />
        <path
          d="M 330 250 h 20 a 7 7 0 0 1 14 0 h 20 v 20 a 7 7 0 0 1 0 14 v 20 h -20 a 7 7 0 0 0 -14 0 h -20 v -20 a 7 7 0 0 1 0 -14 Z"
          fill="#FDBA74"
          opacity="0.85"
        />
        <circle cx="290" cy="140" r="22" fill="#FFFFFF" opacity="0.9" />
        <circle cx="282" cy="140" r="4" fill="#CBD5E1" />
        <circle cx="290" cy="140" r="4" fill="#CBD5E1" />
        <circle cx="298" cy="140" r="4" fill="#CBD5E1" />
        <circle cx="240" cy="45" r="26" fill="#FBBF24" />
        <path
          d="M 226 40 Q 232 45 238 40 M 242 40 Q 248 45 254 40 M 235 52 Q 240 57 245 52"
          stroke="#78350F"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      </g>
      <circle cx="220" cy="160" r="55" fill="#1E293B" />
      <path
        d="M 210 160 Q 260 170 250 230 Q 245 270 205 280 L 205 315 L 180 315 L 180 260 Z"
        fill="#FB923C"
      />
      <path d="M 235 220 Q 242 228 250 220" stroke="#7C2D12" strokeWidth="3" fill="none" />
      <path d="M 205 190 Q 235 200 248 210" stroke="#F59E0B" strokeWidth="7" fill="none" />
      <path d="M 180 300 L 220 300 L 260 410 L 140 410 Z" fill="#FFFFFF" />
      <ellipse cx="200" cy="460" rx="140" ry="40" fill="#EA580C" />
    </svg>
  );

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
    "ring2_0": "#FACC15",
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
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX || (e.touches && e.touches[0].clientX)) - rect.left) * (canvas.width / rect.width);
    const y = ((e.clientY || (e.touches && e.touches[0].clientY)) - rect.top) * (canvas.height / rect.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const distFromCenter = Math.hypot(x - cx, y - cy);

    if (distFromCenter <= 36) {
      playSound("color");
      setMandalaFills((prev) => ({ ...prev, center: selectedColor }));
      return;
    }

    const rOuter = 145;
    const count = mandalaPatternIndex === 1 ? 12 : 16;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const targetX = cx + Math.cos(angle) * rOuter;
      const targetY = cy + Math.sin(angle) * rOuter;
      if (Math.hypot(x - targetX, y - targetY) <= 30) {
        playSound("color");
        setMandalaFills((prev) => ({ ...prev, [`ring2_${i}`]: selectedColor }));
        return;
      }
    }

    const rMiddle = 82;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
      const targetX = cx + Math.cos(angle) * rMiddle;
      const targetY = cy + Math.sin(angle) * rMiddle;
      if (Math.hypot(x - targetX, y - targetY) <= 20) {
        playSound("color");
        setMandalaFills((prev) => ({ ...prev, [`ring1_${i}`]: selectedColor }));
        return;
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

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F7E6D8",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        padding: "16px 12px 60px 12px",
        position: "relative",
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      {/* Background Zen Decoration */}
      <div
        style={{
          position: "fixed",
          right: "-60px",
          top: "100px",
          width: "480px",
          height: "600px",
          opacity: 0.16,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <MeditatingPersonArt />
      </div>

      {/* Top Navbar */}
      <div
        style={{
          maxWidth: "680px",
          margin: "0 auto 16px auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            border: "none",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            color: "#334155",
            padding: "9px 18px",
            borderRadius: "14px",
            fontWeight: 800,
            fontSize: "13px",
            cursor: "pointer",
            boxShadow: "0 3px 10px rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          ← Back to Dashboard
        </button>

        {/* Tab Switcher */}
        <div
          style={{
            display: "flex",
            gap: "6px",
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            padding: "5px",
            borderRadius: "18px",
            boxShadow: "0 3px 10px rgba(0,0,0,0.06)",
          }}
        >
          <button
            onClick={() => setActiveTab("puzzle")}
            style={{
              border: "none",
              padding: "8px 18px",
              borderRadius: "14px",
              fontWeight: 800,
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              backgroundColor: activeTab === "puzzle" ? "#EA6A61" : "transparent",
              color: activeTab === "puzzle" ? "#FFFFFF" : "#475569",
              boxShadow: activeTab === "puzzle" ? "0 4px 10px rgba(234, 106, 97, 0.3)" : "none",
            }}
          >
            🧩 Daily Puzzle
          </button>
          <button
            onClick={() => setActiveTab("mandala")}
            style={{
              border: "none",
              padding: "8px 18px",
              borderRadius: "14px",
              fontWeight: 800,
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              backgroundColor: activeTab === "mandala" ? "#EA6A61" : "transparent",
              color: activeTab === "mandala" ? "#FFFFFF" : "#475569",
              boxShadow: activeTab === "mandala" ? "0 4px 10px rgba(234, 106, 97, 0.3)" : "none",
            }}
          >
            🌸 Mandala Therapy
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* VIEW 1: DAILY TASK PUZZLE (SCREENSHOT 1) */}
      {/* =================================================================== */}
      {activeTab === "puzzle" && (
        <div
          style={{
            maxWidth: "580px",
            margin: "0 auto",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "32px",
              padding: "32px 24px 28px 24px",
              boxShadow: "0 20px 50px rgba(74, 55, 43, 0.12)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {/* Header: "Your Daily Task" */}
            <h1
              style={{
                fontSize: "23px",
                fontWeight: 900,
                color: "#1E293B",
                margin: "0 0 14px 0",
              }}
            >
              Your Daily Task
            </h1>

            {/* Divider */}
            <div
              style={{
                width: "88%",
                height: "1px",
                backgroundColor: "#E2E8F0",
                marginBottom: "18px",
              }}
            />

            {/* Subtitle in Coral */}
            <h2
              style={{
                fontSize: "17.5px",
                fontWeight: 900,
                color: "#EA6A61",
                margin: "0 0 8px 0",
              }}
            >
              Mind Unwind – Simple Puzzle Game
            </h2>

            {/* Instructions */}
            <p
              style={{
                fontSize: "13px",
                color: "#475569",
                margin: "0 0 6px 0",
                maxWidth: "460px",
                lineHeight: "1.45",
              }}
            >
              Challenge your mind gently with this relaxing puzzle. Rearrange the pieces to
              complete the picture or pattern.
            </p>
            <p
              style={{
                fontSize: "12.5px",
                color: "#64748B",
                margin: "0 0 18px 0",
                maxWidth: "460px",
                lineHeight: "1.45",
              }}
            >
              Take your time—there's no timer, no pressure. Just drag & drop pieces to swap and solve.
            </p>

            {/* 3x3 Dragon Puzzle Grid with DRAG & DROP support */}
            <div
              style={{
                width: "290px",
                height: "290px",
                maxWidth: "100%",
                aspectRatio: "1 / 1",
                backgroundColor: "#FFFFFF",
                borderRadius: "22px",
                padding: "8px",
                boxShadow: "0 8px 22px rgba(0, 0, 0, 0.06)",
                border: "1.5px solid #F1F5F9",
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gridTemplateRows: "repeat(3, 1fr)",
                gap: "7px",
                marginBottom: "16px",
                position: "relative",
                boxSizing: "border-box",
                userSelect: "none",
                touchAction: "none",
              }}
            >
              {showFullPreview ? (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    gridRow: "1 / -1",
                    borderRadius: "14px",
                    overflow: "hidden",
                  }}
                >
                  <DragonSVG />
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
                        outline: isDragTarget
                          ? "2px dashed #EA6A61"
                          : isSelected
                          ? "2px solid #38BDF8"
                          : "none",
                        outlineOffset: "2px",
                        borderRadius: "14px",
                        transition: "transform 0.15s ease, opacity 0.15s ease",
                      }}
                    >
                      {renderDragonPiece(tileNum)}
                    </div>
                  );
                })
              )}
            </div>

            {/* Puzzle Controls */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "18px",
                alignItems: "center",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <button
                onClick={shufflePuzzle}
                style={{
                  border: "none",
                  backgroundColor: "#F1F5F9",
                  color: "#475569",
                  padding: "7px 15px",
                  borderRadius: "12px",
                  fontWeight: 800,
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                🔀 Mix Pieces
              </button>
              <button
                onClick={() => setShowFullPreview((p) => !p)}
                style={{
                  border: "none",
                  backgroundColor: showFullPreview ? "#EA6A61" : "#F1F5F9",
                  color: showFullPreview ? "#FFFFFF" : "#475569",
                  padding: "7px 15px",
                  borderRadius: "12px",
                  fontWeight: 800,
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                👁️ {showFullPreview ? "Hide Full Image" : "Peek Original"}
              </button>
              {puzzleMoves > 0 && (
                <span style={{ fontSize: "12px", color: "#94A3B8", fontWeight: 700 }}>
                  Moves: {puzzleMoves}
                </span>
              )}
            </div>

            {/* Solved celebration badge */}
            {isSolved && (
              <div
                style={{
                  backgroundColor: "#DCFCE7",
                  color: "#166534",
                  padding: "10px 20px",
                  borderRadius: "14px",
                  fontWeight: 900,
                  fontSize: "13.5px",
                  marginBottom: "16px",
                  boxShadow: "0 4px 12px rgba(22, 101, 52, 0.15)",
                }}
              >
                🎉 Completed Task! Well done!
              </div>
            )}

            {/* ============================================================= */}
            {/* BUTTONS UNDER THE PUZZLE (COMPLETED BUTTONS REMOVED) */}
            {/* Only Day 7 & Outcomes are shown. */}
            {/* Day 7 turns GREEN only AFTER the task is completed! */}
            {/* ============================================================= */}
            <div
              style={{
                display: "flex",
                gap: "14px",
                width: "100%",
                maxWidth: "340px",
                marginBottom: "20px",
                justifyContent: "center",
              }}
            >
              {/* Day 7 Button: Green ONLY after task completion! */}
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
                  backgroundColor: isDayCompleted ? "#168038" : "#EA6A61",
                  color: "#FFFFFF",
                  padding: "13px 20px",
                  borderRadius: "22px",
                  fontWeight: 900,
                  fontSize: "15px",
                  cursor: "pointer",
                  boxShadow: isDayCompleted
                    ? "0 6px 16px rgba(22, 128, 56, 0.35)"
                    : "0 6px 16px rgba(234, 106, 97, 0.35)",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              >
                {isDayCompleted ? "✓ Day 7 Completed" : "Day 7"}
              </button>

              {/* Outcomes Button */}
              <button
                onClick={() => setShowOutcomes(true)}
                style={{
                  flex: 1,
                  border: "none",
                  backgroundColor: "#EA6A61",
                  color: "#FFFFFF",
                  padding: "13px 20px",
                  borderRadius: "22px",
                  fontWeight: 900,
                  fontSize: "15px",
                  cursor: "pointer",
                  boxShadow: "0 6px 16px rgba(234, 106, 97, 0.35)",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              >
                Outcomes
              </button>
            </div>

            {/* Countdown Notice matching Screenshot 1 */}
            <div
              style={{
                color: "#EA6A61",
                fontSize: "13.5px",
                fontWeight: 700,
                letterSpacing: "0.2px",
                marginTop: "4px",
              }}
            >
              Do the task and come back in{" "}
              <span style={{ fontWeight: 900 }}>
                {String(countdown.hours).padStart(2, "0")}h:
                {String(countdown.mins).padStart(2, "0")}m:
                {String(countdown.secs).padStart(2, "0")}s
              </span>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* VIEW 2: MANDALA COLORING THERAPY (SCREENSHOT 2) */}
      {/* =================================================================== */}
      {activeTab === "mandala" && (
        <div
          style={{
            maxWidth: "580px",
            margin: "0 auto",
            backgroundColor: "#FFFFFF",
            borderRadius: "32px",
            padding: "32px 20px",
            boxShadow: "0 20px 50px rgba(74, 55, 43, 0.12)",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
            zIndex: 1,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginBottom: "2px",
            }}
          >
            <span style={{ fontSize: "22px" }}>🌸</span>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: 900,
                background: "linear-gradient(135deg, #E06D53, #C88D78)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                margin: 0,
              }}
            >
              Mandala Coloring Therapy
            </h1>
          </div>

          <div style={{ fontSize: "20px", marginBottom: "6px" }}>🌸</div>

          <p
            style={{
              fontSize: "13px",
              color: "#64748B",
              margin: "0 0 20px 0",
              maxWidth: "460px",
              lineHeight: "1.45",
            }}
          >
            Relax, breathe, and let your creativity flow through beautiful mandala patterns
          </p>

          {/* Palette */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
              {PALETTE_ROW_1.map((color) => {
                const isSelected = selectedColor === color;
                return (
                  <button
                    key={color}
                    onClick={() => {
                      playSound("click");
                      setSelectedColor(color);
                    }}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: color,
                      border: isSelected ? "3px solid #FFFFFF" : "none",
                      boxShadow: isSelected
                        ? `0 0 0 3px ${color}, 0 5px 12px rgba(0,0,0,0.2)`
                        : "0 2px 6px rgba(0,0,0,0.1)",
                      cursor: "pointer",
                      transform: isSelected ? "scale(1.15)" : "scale(1)",
                      transition: "transform 0.15s ease",
                    }}
                  />
                );
              })}
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              {PALETTE_ROW_2.map((color) => {
                const isSelected = selectedColor === color;
                return (
                  <button
                    key={color}
                    onClick={() => {
                      playSound("click");
                      setSelectedColor(color);
                    }}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: color,
                      border: isSelected ? "3px solid #FFFFFF" : "none",
                      boxShadow: isSelected
                        ? `0 0 0 3px ${color}, 0 5px 12px rgba(0,0,0,0.2)`
                        : "0 2px 6px rgba(0,0,0,0.1)",
                      cursor: "pointer",
                      transform: isSelected ? "scale(1.15)" : "scale(1)",
                      transition: "transform 0.15s ease",
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Controls: Brush Size & Tool mode */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "18px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#334155" }}>
                Brush Size:
              </span>
              <input
                type="range"
                min="2"
                max="24"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                style={{ accentColor: "#38BDF8", cursor: "pointer", width: "90px" }}
              />
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#334155" }}>
                {brushSize}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                gap: "3px",
                backgroundColor: "#F1F5F9",
                padding: "3px",
                borderRadius: "12px",
              }}
            >
              <button
                onClick={() => setColorMode("fill")}
                style={{
                  border: "none",
                  backgroundColor: colorMode === "fill" ? "#FFFFFF" : "transparent",
                  color: colorMode === "fill" ? "#EA6A61" : "#64748B",
                  padding: "5px 12px",
                  borderRadius: "10px",
                  fontWeight: 800,
                  fontSize: "11.5px",
                  cursor: "pointer",
                  boxShadow: colorMode === "fill" ? "0 2px 5px rgba(0,0,0,0.06)" : "none",
                }}
              >
                🪣 Tap to Fill
              </button>
              <button
                onClick={() => setColorMode("brush")}
                style={{
                  border: "none",
                  backgroundColor: colorMode === "brush" ? "#FFFFFF" : "transparent",
                  color: colorMode === "brush" ? "#EA6A61" : "#64748B",
                  padding: "5px 12px",
                  borderRadius: "10px",
                  fontWeight: 800,
                  fontSize: "11.5px",
                  cursor: "pointer",
                  boxShadow: colorMode === "brush" ? "0 2px 5px rgba(0,0,0,0.06)" : "none",
                }}
              >
                🖌️ Free Brush
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "20px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <button
              onClick={handleClearAll}
              style={{
                border: "none",
                background: "linear-gradient(135deg, #FF6A55, #F857A6)",
                color: "#FFFFFF",
                padding: "8px 20px",
                borderRadius: "18px",
                fontWeight: 800,
                fontSize: "13px",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(255, 106, 85, 0.25)",
              }}
            >
              Clear All
            </button>
            <button
              onClick={handleNewMandala}
              style={{
                border: "none",
                background: "linear-gradient(135deg, #FF6A55, #F857A6)",
                color: "#FFFFFF",
                padding: "8px 20px",
                borderRadius: "18px",
                fontWeight: 800,
                fontSize: "13px",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(255, 106, 85, 0.25)",
              }}
            >
              New Mandala
            </button>
            <button
              onClick={handleSaveArt}
              style={{
                border: "none",
                background: "linear-gradient(135deg, #FF6A55, #F857A6)",
                color: "#FFFFFF",
                padding: "8px 20px",
                borderRadius: "18px",
                fontWeight: 800,
                fontSize: "13px",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(255, 106, 85, 0.25)",
              }}
            >
              Save Art
            </button>
          </div>

          {/* Canvas */}
          <div
            style={{
              width: "360px",
              maxWidth: "100%",
              aspectRatio: "1 / 1",
              backgroundColor: "#FFFFFF",
              borderRadius: "22px",
              border: "1.5px solid #E2E8F0",
              boxShadow: "0 6px 24px rgba(0, 0, 0, 0.04)",
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
              style={{
                width: "100%",
                height: "100%",
                display: "block",
                touchAction: "none",
              }}
            />
          </div>
        </div>
      )}

      {/* Outcomes Modal */}
      {showOutcomes && (
        <div
          onClick={() => setShowOutcomes(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(15, 23, 42, 0.55)",
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
              backgroundColor: "#FFFFFF",
              borderRadius: "28px",
              padding: "32px 24px",
              maxWidth: "420px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.2)",
            }}
          >
            <span style={{ fontSize: "40px" }}>🏆</span>
            <h2 style={{ fontSize: "20px", fontWeight: 900, color: "#1E293B", margin: "10px 0 6px 0" }}>
              7-Day Mindful Outcomes
            </h2>
            <p style={{ color: "#64748B", fontSize: "13px", lineHeight: "1.45", margin: "0 0 18px 0" }}>
              You've demonstrated consistent dedication to your mental tranquility and focus.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#F8FAFC",
                  padding: "14px",
                  borderRadius: "16px",
                  border: "1px solid #E2E8F0",
                }}
              >
                <div style={{ fontSize: "18px", fontWeight: 900, color: "#168038" }}>
                  {isDayCompleted ? "7 / 7" : "6 / 7"}
                </div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", marginTop: "3px" }}>
                  Days Solved
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "#F8FAFC",
                  padding: "14px",
                  borderRadius: "16px",
                  border: "1px solid #E2E8F0",
                }}
              >
                <div style={{ fontSize: "18px", fontWeight: 900, color: "#EA6A61" }}>
                  {isDayCompleted ? "100%" : "94%"}
                </div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", marginTop: "3px" }}>
                  Mindful Score
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowOutcomes(false)}
              style={{
                width: "100%",
                border: "none",
                backgroundColor: "#EA6A61",
                color: "#FFFFFF",
                padding: "12px",
                borderRadius: "16px",
                fontWeight: 900,
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: "0 5px 14px rgba(234, 106, 97, 0.35)",
              }}
            >
              Continue My Journey ✨
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MindRelaxGames;
