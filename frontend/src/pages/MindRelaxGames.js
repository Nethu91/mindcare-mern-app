import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

function MindRelaxGames() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [activeGame, setActiveGame] = useState("floatbubble");
  const [isMobile, setIsMobile] = useState(false);

  // ResizeObserver for locked phone frame & responsiveness
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      setIsMobile(width <= 768);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Web Audio Synth for natural calm sounds (no external audio files needed)
  const playSound = (type = "pop") => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      if (type === "pop") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        const freq = 400 + Math.random() * 300;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === "chime") {
        const freqs = [523.25, 659.25, 783.99, 1046.5];
        freqs.forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.08);

          gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.6);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.08);
          osc.stop(ctx.currentTime + i * 0.08 + 0.6);
        });
      } else if (type === "breath") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 1.2);

        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
      }
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  };

  // ==========================================
  // GAME 1: Floating Bubble Pop (Canvas, Scored)
  // ==========================================
  const floatBubbleCanvasRef = useRef(null);
  const floatBubbleRef = useRef({ bubbles: [], score: 0, missed: 0, running: false, timer: 60, animId: null });
  const [fbScore, setFbScore] = useState(0);
  const [fbMissed, setFbMissed] = useState(0);
  const [fbTimer, setFbTimer] = useState(60);
  const [fbRunning, setFbRunning] = useState(false);
  const [fbBest, setFbBest] = useState(0);
  const fbTickRef = useRef(null);

  const FB_COLORS = [
    ["#F5D0FE","#C084FC","#9333EA"],
    ["#BAE6FD","#38BDF8","#0284C7"],
    ["#BBF7D0","#34D399","#059669"],
    ["#FDE68A","#FBBF24","#D97706"],
    ["#FECDD3","#FB7185","#E11D48"],
  ];

  useEffect(() => {
    if (activeGame !== "floatbubble") return;
    const canvas = floatBubbleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const g = floatBubbleRef.current;
    canvas.width = canvas.parentElement.clientWidth || 360;
    canvas.height = 340;
    const W = canvas.width; const H = canvas.height;

    let spawnTimer = 0;

    const spawnBubble = () => {
      const ci = Math.floor(Math.random() * FB_COLORS.length);
      const radius = 20 + Math.random() * 28;
      g.bubbles.push({
        id: Math.random(),
        x: radius + Math.random() * (W - radius * 2),
        y: H + radius,
        vy: -(0.8 + Math.random() * 1.2),
        radius,
        colors: FB_COLORS[ci],
        popped: false,
        popAnim: 0,
        points: Math.round(40 / radius * 10), // smaller = more points
      });
    };

    const render = (ts) => {
      ctx.clearRect(0, 0, W, H);

      // Background
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#F5EEF8"); bg.addColorStop(1, "#DFD7EC");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      if (g.running) {
        spawnTimer++;
        if (spawnTimer > 38) { spawnBubble(); spawnTimer = 0; }
      }

      for (let i = g.bubbles.length - 1; i >= 0; i--) {
        const b = g.bubbles[i];
        if (b.popped) {
          b.popAnim += 0.18;
          if (b.popAnim >= 1) { g.bubbles.splice(i, 1); continue; }
          ctx.save();
          ctx.globalAlpha = 1 - b.popAnim;
          for (let p = 0; p < 6; p++) {
            const angle = (p / 6) * Math.PI * 2;
            const dist = b.popAnim * b.radius * 2.2;
            ctx.beginPath();
            ctx.arc(b.x + Math.cos(angle) * dist, b.y + Math.sin(angle) * dist, 5 * (1 - b.popAnim), 0, Math.PI * 2);
            ctx.fillStyle = b.colors[1];
            ctx.fill();
          }
          ctx.restore();
          continue;
        }

        if (g.running) b.y += b.vy + Math.sin(ts * 0.002 + b.id * 10) * 0.3;

        // Miss: escaped top
        if (b.y + b.radius < -10) {
          g.bubbles.splice(i, 1);
          g.missed++;
          setFbMissed(g.missed);
          continue;
        }

        // Draw bubble
        const grad = ctx.createRadialGradient(b.x - b.radius * 0.3, b.y - b.radius * 0.3, 2, b.x, b.y, b.radius);
        grad.addColorStop(0, b.colors[0]);
        grad.addColorStop(0.6, b.colors[1]);
        grad.addColorStop(1, b.colors[2]);
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.shadowColor = b.colors[1];
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Shine
        ctx.beginPath();
        ctx.arc(b.x - b.radius * 0.28, b.y - b.radius * 0.28, b.radius * 0.22, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.fill();

        // Points label
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.font = `bold ${Math.max(9, b.radius * 0.55)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(`+${b.points}`, b.x, b.y + 4);
        ctx.textAlign = "left";
      }

      // Timer bar
      const barW = (g.timer / 60) * W;
      ctx.fillStyle = "rgba(139,92,246,0.18)";
      ctx.fillRect(0, 0, W, 6);
      const barGrad = ctx.createLinearGradient(0, 0, barW, 0);
      barGrad.addColorStop(0, "#8B5CF6"); barGrad.addColorStop(1, "#EC4899");
      ctx.fillStyle = barGrad;
      ctx.fillRect(0, 0, barW, 6);

      // Score overlay
      ctx.fillStyle = "rgba(45,26,71,0.8)";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText(`⭐ ${g.score}   💨 ${g.missed}   ⏱ ${g.timer}s`, 10, 24);

      if (!g.running && g.bubbles.length === 0) {
        if (g.timer === 0) {
          ctx.fillStyle = "rgba(45,26,71,0.7)";
          ctx.fillRect(0, 0, W, H);
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 22px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(`🎉 Time's Up! Score: ${g.score}`, W / 2, H / 2 - 16);
          ctx.font = "16px sans-serif";
          ctx.fillText(g.score >= g.missed ? "💪 Great focus! Tap Start again." : "Keep practicing! You've got this.", W / 2, H / 2 + 18);
          ctx.textAlign = "left";
        } else {
          ctx.fillStyle = "rgba(45,26,71,0.5)";
          ctx.fillRect(0, 0, W, H);
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 18px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("🫧 Tap START — Pop the bubbles!", W / 2, H / 2);
          ctx.textAlign = "left";
        }
      }

      floatBubbleRef.current.animId = requestAnimationFrame(render);
    };
    floatBubbleRef.current.animId = requestAnimationFrame(render);

    // Click/tap to pop
    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const cx = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
      const cy = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const mx = cx * scaleX; const my = cy * scaleY;
      const g = floatBubbleRef.current;
      for (let i = g.bubbles.length - 1; i >= 0; i--) {
        const b = g.bubbles[i];
        if (!b.popped && Math.hypot(mx - b.x, my - b.y) <= b.radius) {
          b.popped = true;
          g.score += b.points;
          setFbScore(g.score);
          playSound("pop");
          if (navigator.vibrate) navigator.vibrate(8);
          break;
        }
      }
    };
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("touchstart", handleClick, { passive: true });
    return () => {
      cancelAnimationFrame(floatBubbleRef.current.animId);
      canvas.removeEventListener("click", handleClick);
      canvas.removeEventListener("touchstart", handleClick);
    };
  }, [activeGame, fbRunning]);

  const startFbGame = () => {
    const g = floatBubbleRef.current;
    g.bubbles = []; g.score = 0; g.missed = 0; g.timer = 60; g.running = true;
    setFbScore(0); setFbMissed(0); setFbTimer(60); setFbRunning(true);
    clearInterval(fbTickRef.current);
    fbTickRef.current = setInterval(() => {
      const g = floatBubbleRef.current;
      if (g.timer <= 1) {
        g.timer = 0; g.running = false;
        setFbTimer(0); setFbRunning(false);
        setFbBest(prev => Math.max(prev, g.score));
        clearInterval(fbTickRef.current);
      } else {
        g.timer--;
        setFbTimer(g.timer);
      }
    }, 1000);
  };
  useEffect(() => () => clearInterval(fbTickRef.current), []);

  // ==========================================
  // GAME 2: Color Tap Rush (scored)
  // ==========================================
  const [ctRunning, setCtRunning] = useState(false);
  const [ctTarget, setCtTarget] = useState(null);
  const [ctTiles, setCtTiles] = useState([]);
  const [ctScore, setCtScore] = useState(0);
  const [ctMissed, setCtMissed] = useState(0);
  const [ctTimer, setCtTimer] = useState(45);
  const [ctBest, setCtBest] = useState(0);
  const ctRef = useRef({ score: 0, missed: 0, timer: 45, running: false, spawnId: null, tickId: null, shrinkId: null });

  const CT_COLORS = [
    { name: "Purple",  hex: "#A78BFA", dark: "#6D28D9" },
    { name: "Pink",    hex: "#F472B6", dark: "#BE185D" },
    { name: "Blue",    hex: "#60A5FA", dark: "#1D4ED8" },
    { name: "Green",   hex: "#34D399", dark: "#065F46" },
    { name: "Yellow",  hex: "#FBBF24", dark: "#92400E" },
    { name: "Orange",  hex: "#FB923C", dark: "#C2410C" },
  ];

  const spawnCtTile = useCallback(() => {
    const ct = ctRef.current;
    if (!ct.running) return;
    const color = CT_COLORS[Math.floor(Math.random() * CT_COLORS.length)];
    const id = Date.now() + Math.random();
    const speed = Math.min(4.5, 1.5 + ct.score * 0.05); // speed up with score
    setCtTiles(prev => [
      ...prev,
      { id, color, x: 5 + Math.random() * 70, y: -12, size: 60 + Math.random() * 24, vy: speed, born: Date.now() }
    ]);
  }, []);

  useEffect(() => {
    if (!ctRunning) return;
    ctRef.current.spawnId = setInterval(spawnCtTile, 900);
    ctRef.current.shrinkId = setInterval(() => {
      setCtTiles(prev => {
        const now = Date.now();
        const escaped = prev.filter(t => t.y > 106); // % units
        if (escaped.length > 0) {
          ctRef.current.missed += escaped.length;
          setCtMissed(ctRef.current.missed);
        }
        return prev
          .filter(t => t.y <= 106)
          .map(t => ({ ...t, y: t.y + t.vy * 0.25 }));
      });
    }, 40);
    ctRef.current.tickId = setInterval(() => {
      const ct = ctRef.current;
      if (ct.timer <= 1) {
        ct.timer = 0; ct.running = false;
        setCtTimer(0); setCtRunning(false);
        setCtBest(prev => Math.max(prev, ct.score));
        clearInterval(ct.spawnId); clearInterval(ct.shrinkId); clearInterval(ct.tickId);
        setCtTiles([]);
      } else { ct.timer--; setCtTimer(ct.timer); }
    }, 1000);
    return () => { clearInterval(ctRef.current.spawnId); clearInterval(ctRef.current.shrinkId); clearInterval(ctRef.current.tickId); };
  }, [ctRunning, spawnCtTile]);

  const tapCtTile = (tile) => {
    const ct = ctRef.current;
    if (!ct.running) return;
    if (tile.color.hex === ctTarget?.hex) {
      ct.score++;
      setCtScore(ct.score);
      setCtTiles(prev => prev.filter(t => t.id !== tile.id));
      playSound("pop");
      if (navigator.vibrate) navigator.vibrate(8);
      // Change target every 4 correct taps
      if (ct.score % 4 === 0) setCtTarget(CT_COLORS[Math.floor(Math.random() * CT_COLORS.length)]);
    } else {
      ct.missed++;
      setCtMissed(ct.missed);
      playSound("breath");
    }
  };

  const startCtGame = () => {
    const newTarget = CT_COLORS[Math.floor(Math.random() * CT_COLORS.length)];
    setCtTarget(newTarget);
    ctRef.current = { score: 0, missed: 0, timer: 45, running: true, spawnId: null, tickId: null, shrinkId: null };
    setCtScore(0); setCtMissed(0); setCtTimer(45); setCtTiles([]); setCtRunning(true);
  };
  useEffect(() => () => { clearInterval(ctRef.current.spawnId); clearInterval(ctRef.current.shrinkId); clearInterval(ctRef.current.tickId); }, []);

  // ==========================================
  // GAME 3: Calm Memory Match
  // ==========================================
  const MEMORY_EMOJIS = ["🧘", "🌸", "🌿", "🌙", "🌊", "☀️"];
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);

  const initMemoryGame = () => {
    const deck = [...MEMORY_EMOJIS, ...MEMORY_EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, idx) => ({ id: idx, emoji }));
    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  };

  useEffect(() => {
    if (activeGame === "memory") {
      initMemoryGame();
    }
  }, [activeGame]);

  const handleCardClick = (id) => {
    if (flipped.length === 2 || flipped.includes(id) || matched.includes(id)) return;

    const nextFlipped = [...flipped, id];
    setFlipped(nextFlipped);
    playSound("pop");

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = nextFlipped;
      if (cards[first].emoji === cards[second].emoji) {
        setMatched((prev) => {
          const newMatched = [...prev, first, second];
          if (newMatched.length === cards.length) {
            setTimeout(() => playSound("chime"), 300);
          }
          return newMatched;
        });
        setFlipped([]);
      } else {
        setTimeout(() => {
          setFlipped([]);
        }, 900);
      }
    }
  };

  // ==========================================
  // GAME 4: Mindful Breathing Lotus
  // ==========================================
  const [breathPhase, setBreathPhase] = useState("Inhale"); // Inhale (4s), Hold (4s), Exhale (4s), Rest (2s)
  const [breathSec, setBreathSec] = useState(4);

  useEffect(() => {
    if (activeGame !== "breathing") return;
    let timer = setInterval(() => {
      setBreathSec((prev) => {
        if (prev > 1) return prev - 1;

        if (breathPhase === "Inhale") {
          setBreathPhase("Hold");
          playSound("pop");
          return 4;
        } else if (breathPhase === "Hold") {
          setBreathPhase("Exhale");
          playSound("breath");
          return 4;
        } else {
          setBreathPhase("Inhale");
          playSound("pop");
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeGame, breathPhase]);

  // ==========================================
  // GAME 5: Zen Stone Stacking
  // ==========================================
  const STONE_COLORS = ["#A78BFA", "#F472B6", "#38BDF8", "#34D399", "#FBBF24"];
  const [stackedStones, setStackedStones] = useState([]);

  const addStone = () => {
    if (stackedStones.length >= 5) {
      playSound("chime");
      return;
    }
    const nextStone = {
      id: Date.now(),
      color: STONE_COLORS[stackedStones.length % STONE_COLORS.length],
      width: 140 - stackedStones.length * 20,
      wobble: (Math.random() - 0.5) * 6,
    };
    setStackedStones([...stackedStones, nextStone]);
    playSound("pop");
  };

  const resetStones = () => {
    setStackedStones([]);
    playSound("pop");
  };

  // ==========================================
  // GAME 6: Color Splash Paint Grid
  // ==========================================
  const SPLASH_COLS = 10;
  const SPLASH_ROWS = 8;
  const SPLASH_TOTAL = SPLASH_COLS * SPLASH_ROWS;
  const SPLASH_PALETTES = [
    ["#F472B6","#A78BFA","#60A5FA","#34D399","#FBBF24","#FB923C"],
    ["#6EE7B7","#67E8F9","#A5F3FC","#BAE6FD","#C7D2FE","#DDD6FE"],
    ["#FDE68A","#FCA5A5","#FDBA74","#F9A8D4","#D9F99D","#A5F3FC"],
  ];
  const [splashPaletteIdx, setSplashPaletteIdx] = useState(0);
  const [splashColors, setSplashColors] = useState(Array(SPLASH_TOTAL).fill(null));
  const [selectedSplashColor, setSelectedSplashColor] = useState("#F472B6");
  const [isPainting, setIsPainting] = useState(false);

  const paintCell = useCallback((idx) => {
    setSplashColors(prev => {
      const next = [...prev];
      next[idx] = selectedSplashColor;
      return next;
    });
  }, [selectedSplashColor]);

  const clearSplash = () => {
    setSplashColors(Array(SPLASH_TOTAL).fill(null));
    playSound("pop");
  };

  // ==========================================
  // GAME 7: Falling Stars Catcher
  // ==========================================
  const starCanvasRef = useRef(null);
  const starGameRef = useRef({ stars: [], score: 0, missed: 0, running: false, basket: 0.5 });
  const [starScore, setStarScore] = useState(0);
  const [starMissed, setStarMissed] = useState(0);
  const [starRunning, setStarRunning] = useState(false);

  const playStarSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ac = new AudioCtx();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(880, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ac.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.2);
      osc.connect(gain); gain.connect(ac.destination);
      osc.start(); osc.stop(ac.currentTime + 0.2);
    } catch(e) {}
  };

  useEffect(() => {
    if (activeGame !== "starcatch") return;
    const canvas = starCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const g = starGameRef.current;
    g.running = starRunning;
    g.basket = 0.5;

    let animId;
    let lastSpawn = 0;

    canvas.width = canvas.parentElement.clientWidth || 360;
    canvas.height = 320;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      g.basket = (e.clientX - rect.left) / canvas.width;
    };
    const handleTouch = (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      g.basket = (e.touches[0].clientX - rect.left) / canvas.width;
    };
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("touchmove", handleTouch, { passive: false });

    const STAR_EMOJIS = ["⭐","🌟","✨","💫"];
    const COLORS = ["#FBBF24","#F472B6","#60A5FA","#34D399"];

    const spawnStar = (now) => {
      if (now - lastSpawn < 800) return;
      lastSpawn = now;
      g.stars.push({
        x: Math.random() * (canvas.width - 20) + 10,
        y: -20,
        vy: 1.4 + Math.random() * 1.4,
        emoji: STAR_EMOJIS[Math.floor(Math.random() * STAR_EMOJIS.length)],
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        caught: false,
      });
    };

    const render = (now) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bg.addColorStop(0, "#1E1B4B");
      bg.addColorStop(1, "#312E81");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (g.running) spawnStar(now);

      // Draw basket
      const bx = g.basket * canvas.width;
      const by = canvas.height - 28;
      const bw = 70;
      ctx.save();
      const basketGrad = ctx.createLinearGradient(bx - bw/2, by, bx + bw/2, by + 20);
      basketGrad.addColorStop(0, "#A78BFA");
      basketGrad.addColorStop(1, "#EC4899");
      ctx.fillStyle = basketGrad;
      ctx.beginPath();
      ctx.roundRect(bx - bw/2, by, bw, 22, 10);
      ctx.fill();
      ctx.restore();

      // Draw & update stars
      for (let i = g.stars.length - 1; i >= 0; i--) {
        const s = g.stars[i];
        if (g.running) s.y += s.vy;

        // Catch check
        if (s.y >= by - 5 && s.y <= by + 20 && Math.abs(s.x - bx) < bw / 2 + 10) {
          g.stars.splice(i, 1);
          g.score++;
          setStarScore(g.score);
          playStarSound();
          continue;
        }

        // Miss check
        if (s.y > canvas.height + 10) {
          g.stars.splice(i, 1);
          g.missed++;
          setStarMissed(g.missed);
          continue;
        }

        ctx.font = "22px serif";
        ctx.fillText(s.emoji, s.x - 11, s.y);
      }

      // Score overlay
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText(`⭐ ${g.score}  💨 ${g.missed}`, 12, 22);

      if (!g.running) {
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 18px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Move mouse / swipe to play!", canvas.width / 2, canvas.height / 2);
        ctx.textAlign = "left";
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("touchmove", handleTouch);
    };
  }, [activeGame, starRunning]);

  const startStarGame = () => {
    const g = starGameRef.current;
    g.stars = []; g.score = 0; g.missed = 0; g.running = true;
    setStarScore(0); setStarMissed(0); setStarRunning(true);
  };
  const stopStarGame = () => {
    starGameRef.current.running = false;
    setStarRunning(false);
  };

  // ==========================================
  // GAME 8: Zen Tap Drums
  // ==========================================
  const DRUM_PADS = [
    { label: "🥁", name: "Bass",    freq: 60,   type: "sine",     dur: 0.35, color: "#7C3AED" },
    { label: "🪘", name: "Snare",   freq: 200,  type: "triangle", dur: 0.18, color: "#DB2777" },
    { label: "🎵", name: "Hi-Hat",  freq: 1200, type: "square",   dur: 0.08, color: "#0891B2" },
    { label: "🌊", name: "Wave",    freq: 440,  type: "sine",     dur: 0.5,  color: "#059669" },
    { label: "🔔", name: "Bell",    freq: 880,  type: "sine",     dur: 0.9,  color: "#D97706" },
    { label: "✨", name: "Shimmer", freq: 1760, type: "sine",     dur: 0.6,  color: "#9333EA" },
  ];
  const [activePad, setActivePad] = useState(null);
  const [drumSequence, setDrumSequence] = useState([]);

  const hitDrum = (pad, idx) => {
    setActivePad(idx);
    setTimeout(() => setActivePad(null), 180);
    setDrumSequence(prev => [...prev.slice(-11), pad.label]);
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ac = new AudioCtx();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = pad.type;
      osc.frequency.setValueAtTime(pad.freq, ac.currentTime);
      if (pad.name === "Snare") {
        osc.frequency.exponentialRampToValueAtTime(pad.freq * 0.5, ac.currentTime + pad.dur);
      }
      gain.gain.setValueAtTime(0.22, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + pad.dur);
      osc.connect(gain); gain.connect(ac.destination);
      osc.start(); osc.stop(ac.currentTime + pad.dur);
      if (navigator.vibrate) navigator.vibrate(20);
    } catch(e) {}
  };

  // ==========================================
  // GAME 9: Symmetry Mandala Draw
  // ==========================================
  const mandalaRef = useRef(null);
  const mandalaStateRef = useRef({ drawing: false, paths: [], currentPath: [], symmetry: 8, color: "#A78BFA", brushSize: 4 });
  const [mandalaSymmetry, setMandalaSymmetry] = useState(8);
  const [mandalaColor, setMandalaColor] = useState("#A78BFA");
  const [mandalaBrush, setMandalaBrush] = useState(4);
  const mandalaAnimRef = useRef(null);

  const redrawMandala = useCallback(() => {
    const canvas = mandalaRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width; const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Background
    const bg = ctx.createRadialGradient(w/2, h/2, 10, w/2, h/2, w/2);
    bg.addColorStop(0, "#1E1B4B");
    bg.addColorStop(1, "#0F172A");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Guide lines
    const ms = mandalaStateRef.current;
    ctx.save();
    ctx.translate(w/2, h/2);
    for (let i = 0; i < ms.symmetry; i++) {
      ctx.rotate((Math.PI * 2) / ms.symmetry);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -h/2);
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();

    // Draw all stored paths
    ms.paths.forEach(path => {
      if (path.points.length < 2) return;
      ctx.save();
      ctx.translate(w/2, h/2);
      for (let s = 0; s < ms.symmetry; s++) {
        ctx.rotate((Math.PI * 2) / ms.symmetry);
        ctx.beginPath();
        ctx.moveTo(path.points[0].x, path.points[0].y);
        for (let j = 1; j < path.points.length; j++) {
          ctx.lineTo(path.points[j].x, path.points[j].y);
        }
        ctx.strokeStyle = path.color;
        ctx.lineWidth = path.brushSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowColor = path.color;
        ctx.shadowBlur = 8;
        ctx.stroke();
        // Mirror
        ctx.save();
        ctx.scale(-1, 1);
        ctx.beginPath();
        ctx.moveTo(path.points[0].x, path.points[0].y);
        for (let j = 1; j < path.points.length; j++) {
          ctx.lineTo(path.points[j].x, path.points[j].y);
        }
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    });

    // Draw current in-progress path
    if (ms.currentPath.length > 1) {
      ctx.save();
      ctx.translate(w/2, h/2);
      for (let s = 0; s < ms.symmetry; s++) {
        ctx.rotate((Math.PI * 2) / ms.symmetry);
        ctx.beginPath();
        ctx.moveTo(ms.currentPath[0].x, ms.currentPath[0].y);
        for (let j = 1; j < ms.currentPath.length; j++) {
          ctx.lineTo(ms.currentPath[j].x, ms.currentPath[j].y);
        }
        ctx.strokeStyle = ms.color;
        ctx.lineWidth = ms.brushSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowColor = ms.color;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.save();
        ctx.scale(-1, 1);
        ctx.beginPath();
        ctx.moveTo(ms.currentPath[0].x, ms.currentPath[0].y);
        for (let j = 1; j < ms.currentPath.length; j++) {
          ctx.lineTo(ms.currentPath[j].x, ms.currentPath[j].y);
        }
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    }
  }, []);

  useEffect(() => {
    if (activeGame !== "mandala") return;
    const canvas = mandalaRef.current;
    if (!canvas) return;
    canvas.width = canvas.parentElement.clientWidth || 360;
    canvas.height = 320;
    redrawMandala();

    const ms = mandalaStateRef.current;

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      if (e.touches) {
        return {
          x: (e.touches[0].clientX - rect.left) * scaleX - canvas.width / 2,
          y: (e.touches[0].clientY - rect.top) * scaleY - canvas.height / 2,
        };
      }
      return {
        x: (e.clientX - rect.left) * scaleX - canvas.width / 2,
        y: (e.clientY - rect.top) * scaleY - canvas.height / 2,
      };
    };

    const onStart = (e) => {
      e.preventDefault();
      ms.drawing = true;
      const pos = getPos(e);
      ms.currentPath = [pos];
    };
    const onMove = (e) => {
      e.preventDefault();
      if (!ms.drawing) return;
      ms.currentPath.push(getPos(e));
      redrawMandala();
    };
    const onEnd = () => {
      if (!ms.drawing) return;
      ms.drawing = false;
      if (ms.currentPath.length > 1) {
        ms.paths.push({ points: [...ms.currentPath], color: ms.color, brushSize: ms.brushSize });
      }
      ms.currentPath = [];
      redrawMandala();
    };

    canvas.addEventListener("mousedown", onStart);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseup", onEnd);
    canvas.addEventListener("mouseleave", onEnd);
    canvas.addEventListener("touchstart", onStart, { passive: false });
    canvas.addEventListener("touchmove", onMove, { passive: false });
    canvas.addEventListener("touchend", onEnd);

    return () => {
      canvas.removeEventListener("mousedown", onStart);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseup", onEnd);
      canvas.removeEventListener("mouseleave", onEnd);
      canvas.removeEventListener("touchstart", onStart);
      canvas.removeEventListener("touchmove", onMove);
      canvas.removeEventListener("touchend", onEnd);
    };
  }, [activeGame, redrawMandala]);

  useEffect(() => {
    const ms = mandalaStateRef.current;
    ms.symmetry = mandalaSymmetry;
    ms.color = mandalaColor;
    ms.brushSize = mandalaBrush;
    if (activeGame === "mandala") redrawMandala();
  }, [mandalaSymmetry, mandalaColor, mandalaBrush, activeGame, redrawMandala]);

  const clearMandala = () => {
    mandalaStateRef.current.paths = [];
    mandalaStateRef.current.currentPath = [];
    redrawMandala();
    playSound("pop");
  };

  // ==========================================
  // GAME 10: Wave Theremin
  // ==========================================
  const thereminCanvasRef = useRef(null);
  const thereminStateRef = useRef({ active: false, mouseX: 0.5, mouseY: 0.5, osc: null, gain: null, ac: null });
  const [thereminActive, setThereminActive] = useState(false);

  useEffect(() => {
    if (activeGame !== "theremin") return;
    const canvas = thereminCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.parentElement.clientWidth || 380;
    canvas.height = 280;
    const W = canvas.width; const H = canvas.height;
    const ts = thereminStateRef.current;
    let animId;
    let t = 0;

    const render = () => {
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, "#0F172A"); bg.addColorStop(1, "#1E1B4B");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      // Grid lines
      ctx.strokeStyle = "rgba(139,92,246,0.12)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      const freq = ts.mouseX; // 0-1 maps to pitch
      const amp = 1 - ts.mouseY; // 0-1 maps to amplitude
      const waves = Math.floor(freq * 8) + 1;
      const color = `hsl(${Math.round(freq * 260 + 200)}, 90%, 65%)`;

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = color;
      ctx.shadowBlur = 14;
      for (let x = 0; x <= W; x++) {
        const y = H / 2 + Math.sin((x / W) * Math.PI * 2 * waves + t) * amp * (H / 2 - 20);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Second harmonic
      ctx.beginPath();
      ctx.strokeStyle = `hsla(${Math.round(freq * 260 + 280)}, 80%, 70%, 0.5)`;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 8;
      for (let x = 0; x <= W; x++) {
        const y = H / 2 + Math.sin((x / W) * Math.PI * 4 * waves + t * 1.3) * amp * (H / 4);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Cursor glow
      if (ts.active) {
        const cx = ts.mouseX * W; const cy = ts.mouseY * H;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
        grad.addColorStop(0, `${color}80`); grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(cx, cy, 30, 0, Math.PI * 2); ctx.fill();
      }

      // Labels
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "11px sans-serif";
      ctx.fillText("← Pitch →", W / 2 - 28, H - 8);
      ctx.fillText("Volume", 6, H / 2);

      if (ts.active) t += 0.04 * (freq * 3 + 0.5);
      else t += 0.008;
      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    const updateMouse = (e) => {
      const rect = canvas.getBoundingClientRect();
      ts.mouseX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      ts.mouseY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
      if (ts.osc && ts.gain && ts.ac) {
        const freq = 100 + ts.mouseX * 900;
        const vol = (1 - ts.mouseY) * 0.3;
        ts.osc.frequency.setTargetAtTime(freq, ts.ac.currentTime, 0.02);
        ts.gain.gain.setTargetAtTime(vol, ts.ac.currentTime, 0.02);
      }
    };
    const updateTouch = (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      ts.mouseX = Math.max(0, Math.min(1, (e.touches[0].clientX - rect.left) / rect.width));
      ts.mouseY = Math.max(0, Math.min(1, (e.touches[0].clientY - rect.top) / rect.height));
      if (ts.osc && ts.gain && ts.ac) {
        const freq = 100 + ts.mouseX * 900;
        const vol = (1 - ts.mouseY) * 0.3;
        ts.osc.frequency.setTargetAtTime(freq, ts.ac.currentTime, 0.02);
        ts.gain.gain.setTargetAtTime(vol, ts.ac.currentTime, 0.02);
      }
    };
    canvas.addEventListener("mousemove", updateMouse);
    canvas.addEventListener("touchmove", updateTouch, { passive: false });
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener("mousemove", updateMouse);
      canvas.removeEventListener("touchmove", updateTouch);
    };
  }, [activeGame]);

  const startTheremin = () => {
    const ts = thereminStateRef.current;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      ts.ac = new AudioCtx();
      ts.osc = ts.ac.createOscillator();
      ts.gain = ts.ac.createGain();
      ts.osc.type = "sine";
      ts.osc.frequency.value = 440;
      ts.gain.gain.value = 0;
      ts.osc.connect(ts.gain); ts.gain.connect(ts.ac.destination);
      ts.osc.start();
    } catch(e) {}
    ts.active = true;
    setThereminActive(true);
  };
  const stopTheremin = () => {
    const ts = thereminStateRef.current;
    if (ts.gain && ts.ac) ts.gain.gain.setTargetAtTime(0, ts.ac.currentTime, 0.05);
    setTimeout(() => { try { ts.osc && ts.osc.stop(); } catch(e) {} ts.osc = null; ts.gain = null; ts.ac = null; }, 200);
    ts.active = false;
    setThereminActive(false);
  };
  useEffect(() => { return () => { if (thereminStateRef.current.active) stopTheremin(); }; }, [activeGame]);

  // ==========================================
  // GAME 11: Calm Slide Puzzle
  // ==========================================
  const PUZZLE_SIZE = 3; // 3x3 = 8 tiles + 1 blank
  const PUZZLE_EMOJIS = ["🌸","🌊","🌿","🌙","☀️","🦋","🌺","🍃"];
  const makePuzzle = () => {
    // Fisher-Yates on solvable permutation
    let tiles = [...Array(PUZZLE_SIZE * PUZZLE_SIZE - 1).keys()].map(i => i + 1);
    tiles.push(0);
    // shuffle ensuring solvable
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
    // count inversions; if odd, swap first two non-zero
    let inv = 0;
    for (let i = 0; i < tiles.length; i++)
      for (let j = i + 1; j < tiles.length; j++)
        if (tiles[i] && tiles[j] && tiles[i] > tiles[j]) inv++;
    if (inv % 2 !== 0) { const a = tiles[0] ? 0 : 1; const b = tiles[1] ? 1 : 2; [tiles[a], tiles[b]] = [tiles[b], tiles[a]]; }
    return tiles;
  };
  const [puzzleTiles, setPuzzleTiles] = useState(() => makePuzzle());
  const [puzzleMoves, setPuzzleMoves] = useState(0);
  const [puzzleSolved, setPuzzleSolved] = useState(false);

  useEffect(() => {
    if (activeGame === "puzzle") { setPuzzleTiles(makePuzzle()); setPuzzleMoves(0); setPuzzleSolved(false); }
  }, [activeGame]);

  const slideTile = (idx) => {
    const blank = puzzleTiles.indexOf(0);
    const row = Math.floor(idx / PUZZLE_SIZE); const col = idx % PUZZLE_SIZE;
    const bRow = Math.floor(blank / PUZZLE_SIZE); const bCol = blank % PUZZLE_SIZE;
    const adjacent = (Math.abs(row - bRow) + Math.abs(col - bCol)) === 1;
    if (!adjacent || puzzleSolved) return;
    const next = [...puzzleTiles];
    [next[idx], next[blank]] = [next[blank], next[idx]];
    setPuzzleTiles(next);
    setPuzzleMoves(m => m + 1);
    playSound("pop");
    const solved = next.slice(0, -1).every((v, i) => v === i + 1) && next[next.length - 1] === 0;
    if (solved) { setPuzzleSolved(true); playSound("chime"); }
  };

  // ==========================================
  // GAME 12: Grow Your Garden
  // ==========================================
  const PLANT_STAGES = [
    { emoji: "🌱", label: "Seedling",   desc: "A tiny seed sprouts with hope." },
    { emoji: "🌿", label: "Sprout",     desc: "Green leaves reach for sunlight." },
    { emoji: "🌺", label: "Budding",    desc: "A beautiful bud begins to form." },
    { emoji: "🌸", label: "Blossoming", desc: "The flower blooms in full glory!" },
    { emoji: "🌳", label: "Thriving",   desc: "A magnificent living tree stands tall." },
  ];
  const GARDEN_SLOTS = 5;
  const [gardenPlants, setGardenPlants] = useState(Array(GARDEN_SLOTS).fill(null)); // null | {stage:0-4, key}
  const [gardenMsg, setGardenMsg] = useState("Tap an empty plot to plant a seed!");

  const plantOrGrow = (slotIdx) => {
    const next = [...gardenPlants];
    if (next[slotIdx] === null) {
      next[slotIdx] = { stage: 0, key: Date.now() };
      setGardenMsg(`${PLANT_STAGES[0].emoji} ${PLANT_STAGES[0].desc}`);
      playSound("pop");
    } else if (next[slotIdx].stage < PLANT_STAGES.length - 1) {
      next[slotIdx] = { ...next[slotIdx], stage: next[slotIdx].stage + 1 };
      const st = PLANT_STAGES[next[slotIdx].stage];
      setGardenMsg(`${st.emoji} ${st.desc}`);
      playSound(next[slotIdx].stage === PLANT_STAGES.length - 1 ? "chime" : "pop");
    } else {
      // Uproot fully grown plant
      next[slotIdx] = null;
      setGardenMsg("Plant removed. A new cycle begins! 🌱");
      playSound("pop");
    }
    setGardenPlants(next);
  };

  // ==========================================
  // GAME 13: Focus Circles
  // ==========================================
  const [focusCircles, setFocusCircles] = useState([]);
  const [focusScore, setFocusScore] = useState(0);
  const [focusMissed, setFocusMissed] = useState(0);
  const [focusRunning, setFocusRunning] = useState(false);
  const focusIntervalRef = useRef(null);
  const focusShrinkRef = useRef(null);

  const spawnFocusCircle = () => {
    const id = Date.now() + Math.random();
    const size = 60 + Math.random() * 60;
    const x = 8 + Math.random() * 84;
    const y = 8 + Math.random() * 80;
    const color = ["#A78BFA","#F472B6","#60A5FA","#34D399","#FBBF24"][Math.floor(Math.random() * 5)];
    setFocusCircles(prev => [...prev, { id, x, y, size, color, born: Date.now(), life: 2400 }]);
  };

  const catchCircle = (id) => {
    setFocusCircles(prev => prev.filter(c => c.id !== id));
    setFocusScore(s => s + 1);
    playSound("pop");
    if (navigator.vibrate) navigator.vibrate(10);
  };

  useEffect(() => {
    if (!focusRunning) return;
    focusIntervalRef.current = setInterval(spawnFocusCircle, 1000);
    focusShrinkRef.current = setInterval(() => {
      const now = Date.now();
      setFocusCircles(prev => {
        const expired = prev.filter(c => now - c.born >= c.life);
        if (expired.length > 0) setFocusMissed(m => m + expired.length);
        return prev.filter(c => now - c.born < c.life);
      });
    }, 150);
    return () => { clearInterval(focusIntervalRef.current); clearInterval(focusShrinkRef.current); };
  }, [focusRunning]);

  const startFocus = () => { setFocusCircles([]); setFocusScore(0); setFocusMissed(0); setFocusRunning(true); };
  const stopFocus = () => { setFocusRunning(false); setFocusCircles([]); };

  return (
    <div
      ref={containerRef}
      className="mrg-page"
      style={{
        padding: isMobile ? "16px 12px 60px" : "30px 24px 60px",
      }}
    >
      <style>{`
        .mrg-page {
          min-height: 100vh;
          background: linear-gradient(160deg, #F5EEF8 0%, #EDE4F3 40%, #DFD7EC 100%);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          position: relative;
          overflow-x: auto;
          box-sizing: border-box;
          color: #2D1A47;
          width: 100%;
        }

        .mrg-container {
          max-width: 1100px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
          width: 100%;
        }

        /* Ambient glow orbs */
        .mrg-orb-1 {
          position: absolute;
          width: 360px; height: 360px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(236,72,153,0.2) 0%, rgba(236,72,153,0) 70%);
          top: -30px; right: -50px;
          pointer-events: none;
          z-index: 1;
        }
        .mrg-orb-2 {
          position: absolute;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(168,85,247,0.2) 0%, rgba(168,85,247,0) 70%);
          bottom: 100px; left: -80px;
          pointer-events: none;
          z-index: 1;
        }

        /* Header */
        .mrg-header {
          background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%);
          border-radius: 28px;
          padding: 28px 30px;
          margin-bottom: 24px;
          color: #ffffff;
          box-shadow: 0 16px 36px rgba(139, 92, 246, 0.28);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        .mrg-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.35);
          color: #ffffff;
          padding: 8px 16px;
          border-radius: 14px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          backdrop-filter: blur(10px);
          margin-bottom: 12px;
          transition: all 0.2s ease;
        }
        .mrg-back-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateX(-2px);
        }
        .mrg-title {
          font-size: 32px;
          font-weight: 900;
          margin: 0 0 6px 0;
          letter-spacing: -0.5px;
        }
        .mrg-subtitle {
          font-size: 14px;
          margin: 0;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.45;
        }

        /* Navigation Game Tabs */
        .mrg-tabs-wrap {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 6px;
          margin-bottom: 22px;
          scrollbar-width: none;
        }
        .mrg-tabs-wrap::-webkit-scrollbar { display: none; }
        .mrg-tab-btn {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1.5px solid #DDD6FE;
          border-radius: 18px;
          padding: 11px 18px;
          font-size: 13.5px;
          font-weight: 800;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.78);
          color: #4C1D95;
          backdrop-filter: blur(14px);
          transition: all 0.2s ease;
        }
        .mrg-tab-btn.active {
          background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
          color: #FFFFFF;
          border-color: transparent;
          box-shadow: 0 8px 20px rgba(139, 92, 246, 0.32);
          transform: translateY(-2px);
        }
        .mrg-tab-btn:not(.active):hover {
          background: #FFFFFF;
          border-color: #C4B5FD;
        }

        /* Game Container Card */
        .mrg-game-card {
          background: rgba(255, 255, 255, 0.82);
          backdrop-filter: blur(24px);
          border: 1.5px solid rgba(255, 255, 255, 0.92);
          border-radius: 28px;
          padding: 28px;
          box-shadow: 0 16px 40px rgba(76, 29, 149, 0.09);
          margin-bottom: 24px;
          text-align: center;
          position: relative;
        }

        /* Bubble Wrap Styles */
        .mrg-bubble-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
          max-width: 380px;
          margin: 0 auto 20px;
        }
        .mrg-bubble {
          aspect-ratio: 1 / 1;
          border-radius: 50%;
          border: none;
          background: radial-gradient(circle at 35% 30%, #F5D0FE 0%, #C084FC 60%, #9333EA 100%);
          box-shadow: inset -2px -4px 6px rgba(0,0,0,0.2), 0 6px 14px rgba(147, 51, 234, 0.3);
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }
        .mrg-bubble:active {
          transform: scale(0.92);
        }
        .mrg-bubble.popped {
          background: radial-gradient(circle at 50% 50%, #E9D5FF 0%, #DDD6FE 100%);
          box-shadow: inset 2px 3px 6px rgba(0,0,0,0.15);
          transform: scale(0.88);
          opacity: 0.6;
          cursor: default;
        }

        /* Memory Game Styles */
        .mrg-memory-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          max-width: 400px;
          margin: 0 auto 20px;
        }
        .mrg-memory-card {
          aspect-ratio: 1 / 1;
          border-radius: 16px;
          border: 1.5px solid #DDD6FE;
          background: linear-gradient(135deg, #F3E8FF, #EDE9FE);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          cursor: pointer;
          transition: all 0.25s ease;
          user-select: none;
        }
        .mrg-memory-card.flipped {
          background: #FFFFFF;
          border-color: #A855F7;
          box-shadow: 0 6px 18px rgba(168, 85, 247, 0.24);
          transform: rotateY(180deg);
        }
        .mrg-memory-card.matched {
          background: #D1FAE5;
          border-color: #34D399;
          opacity: 0.85;
          cursor: default;
        }

        /* Breathing Lotus Styles */
        .mrg-lotus-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px 0;
        }
        .mrg-lotus-circle {
          width: 170px; height: 170px;
          border-radius: 50%;
          background: radial-gradient(circle, #F472B6 0%, #A855F7 60%, #6366F1 100%);
          box-shadow: 0 0 35px rgba(236, 72, 153, 0.4);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          transition: transform 3.8s ease-in-out;
        }
        .mrg-lotus-circle.Inhale {
          transform: scale(1.35);
          box-shadow: 0 0 50px rgba(236, 72, 153, 0.6);
        }
        .mrg-lotus-circle.Hold {
          transform: scale(1.35);
        }
        .mrg-lotus-circle.Exhale {
          transform: scale(0.9);
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
        }

        /* Stones Stacking */
        .mrg-stones-pile {
          min-height: 220px;
          display: flex;
          flex-direction: column-reverse;
          align-items: center;
          justify-content: flex-start;
          padding: 20px 0;
        }
        .mrg-stone {
          height: 34px;
          border-radius: 30px;
          box-shadow: 0 6px 14px rgba(0,0,0,0.18);
          margin-bottom: -6px;
          transition: all 0.3s ease;
        }

        /* Color Splash Paint Grid */
        .mrg-splash-grid {
          display: grid;
          grid-template-columns: repeat(10, 1fr);
          gap: 4px;
          max-width: 480px;
          margin: 0 auto 18px;
          border-radius: 16px;
          overflow: hidden;
          border: 2px solid rgba(167,139,250,0.3);
          user-select: none;
        }
        .mrg-splash-cell {
          aspect-ratio: 1;
          border-radius: 4px;
          transition: background 0.12s ease, transform 0.1s ease;
          cursor: crosshair;
        }
        .mrg-splash-cell:hover {
          transform: scale(1.18);
          z-index: 2;
          position: relative;
        }
        .mrg-color-picker-row {
          display: flex;
          gap: 8px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }
        .mrg-color-swatch {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          border: 3px solid transparent;
          transition: transform 0.15s, border-color 0.15s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.18);
        }
        .mrg-color-swatch.selected {
          border-color: #FFFFFF;
          transform: scale(1.28);
          box-shadow: 0 0 0 2px #7C3AED, 0 2px 8px rgba(0,0,0,0.28);
        }

        /* Drum Pads */
        .mrg-drum-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          max-width: 400px;
          margin: 0 auto 18px;
        }
        .mrg-drum-pad {
          aspect-ratio: 1;
          border-radius: 22px;
          border: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.1s ease, box-shadow 0.1s ease;
          font-size: 32px;
          box-shadow: 0 8px 22px rgba(0,0,0,0.18);
          position: relative;
          overflow: hidden;
          user-select: none;
        }
        .mrg-drum-pad:active, .mrg-drum-pad.hit {
          transform: scale(0.91);
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .mrg-drum-pad-label {
          font-size: 11px;
          font-weight: 800;
          color: rgba(255,255,255,0.85);
          margin-top: 4px;
          letter-spacing: 0.5px;
        }
        .mrg-drum-sequence {
          display: flex;
          gap: 6px;
          justify-content: center;
          flex-wrap: wrap;
          min-height: 36px;
          padding: 6px 12px;
          background: rgba(255,255,255,0.5);
          border-radius: 12px;
          margin-bottom: 10px;
          font-size: 18px;
        }

        /* Mandala canvas area */
        .mrg-mandala-controls {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          margin-bottom: 14px;
          align-items: center;
        }
        .mrg-mandala-chip {
          padding: 6px 14px;
          border-radius: 12px;
          border: 1.5px solid #DDD6FE;
          background: #FFFFFF;
          color: #4C1D95;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.15s;
        }
        .mrg-mandala-chip.active {
          background: #8B5CF6;
          color: #FFFFFF;
          border-color: transparent;
        }
        .mrg-mandala-color {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          cursor: pointer;
          border: 3px solid transparent;
          transition: transform 0.15s, border-color 0.15s;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        .mrg-mandala-color.active {
          border-color: #FFFFFF;
          transform: scale(1.3);
          box-shadow: 0 0 0 2px #7C3AED;
        }

        /* Control Buttons */
        .mrg-btn-primary {
          background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
          border: none;
          color: white;
          padding: 10px 22px;
          border-radius: 14px;
          font-weight: 800;
          font-size: 13.5px;
          cursor: pointer;
          box-shadow: 0 6px 16px rgba(139, 92, 246, 0.3);
          transition: all 0.2s ease;
        }
        .mrg-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4);
        }

        /* Theremin canvas */
        .mrg-theremin-wrap {
          border-radius: 20px;
          overflow: hidden;
          border: 2px solid #4338CA;
          cursor: crosshair;
          user-select: none;
          position: relative;
        }

        /* Slide Puzzle */
        .mrg-puzzle-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          max-width: 300px;
          margin: 0 auto 18px;
        }
        .mrg-puzzle-tile {
          aspect-ratio: 1;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          cursor: pointer;
          transition: all 0.18s ease;
          border: none;
          box-shadow: 0 4px 14px rgba(139,92,246,0.18);
          background: linear-gradient(135deg, #F3E8FF, #EDE9FE);
          user-select: none;
        }
        .mrg-puzzle-tile:hover { transform: scale(1.06); }
        .mrg-puzzle-tile.blank { background: rgba(221,214,254,0.18); box-shadow: none; cursor: default; }
        .mrg-puzzle-tile.solved { background: linear-gradient(135deg, #D1FAE5, #A7F3D0); }

        /* Garden */
        .mrg-garden-row {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin: 10px 0 18px;
          flex-wrap: wrap;
        }
        .mrg-garden-slot {
          width: 80px;
          min-height: 110px;
          border-radius: 18px;
          border: 2px dashed #C4B5FD;
          background: rgba(243,232,255,0.5);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          padding: 8px 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }
        .mrg-garden-slot:hover { border-color: #8B5CF6; background: rgba(243,232,255,0.85); transform: translateY(-3px); }
        .mrg-garden-slot.planted { border-style: solid; border-color: #A78BFA; }
        .mrg-plant-emoji {
          font-size: 36px;
          animation: plantGrow 0.35s cubic-bezier(0.34,1.56,0.64,1);
          display: block;
        }
        @keyframes plantGrow {
          0% { transform: scale(0.2); opacity: 0.3; }
          100% { transform: scale(1); opacity: 1; }
        }
        .mrg-plant-stage {
          font-size: 10px;
          font-weight: 800;
          color: #7C3AED;
          margin-top: 4px;
          text-align: center;
        }
        .mrg-garden-add {
          font-size: 26px;
          color: #C4B5FD;
        }

        /* Focus Circles */
        .mrg-focus-arena {
          position: relative;
          width: 100%;
          padding-bottom: 60%;
          border-radius: 20px;
          overflow: hidden;
          background: linear-gradient(160deg, #0F172A 0%, #1E1B4B 100%);
          border: 2px solid #4338CA;
          margin-bottom: 14px;
          cursor: pointer;
          user-select: none;
        }
        .mrg-focus-circle {
          position: absolute;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 900;
          color: white;
          cursor: pointer;
          transition: transform 0.1s ease;
          box-shadow: 0 0 20px currentColor;
          animation: focusPop 0.2s ease;
        }
        @keyframes focusPop {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .mrg-focus-circle:active { transform: scale(0.85); }
        .mrg-focus-idle {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 8px;
          color: rgba(255,255,255,0.7);
        }

        /* Bottom Grid */
        .mrg-bottom-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .mrg-bottom-card {
          background: rgba(255, 255, 255, 0.72);
          backdrop-filter: blur(20px);
          border: 1.5px solid rgba(255, 255, 255, 0.85);
          border-radius: 20px;
          padding: 20px 16px;
          text-align: center;
          cursor: pointer;
          box-shadow: 0 10px 26px rgba(76, 29, 149, 0.07);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .mrg-bottom-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 34px rgba(76, 29, 149, 0.14);
        }
      `}</style>

      {/* Decorative background orbs */}
      <div className="mrg-orb-1"></div>
      <div className="mrg-orb-2"></div>

      <div className="mrg-container">
        {/* Header */}
        <div className="mrg-header">
          <div>
            <button
              className="mrg-back-btn"
              onClick={() => navigate("/dashboard")}
            >
              ← Back to Dashboard
            </button>
            <h1 className="mrg-title">Mind Relax Games</h1>
            <p className="mrg-subtitle">
              Interactive anti-stress games, tactile bubbles, color ripples, and mindful focus activities.
            </p>
          </div>
          <div>
            <span
              style={{
                background: "rgba(255,255,255,0.2)",
                padding: "8px 16px",
                borderRadius: 16,
                fontWeight: 800,
                fontSize: 13,
              }}
            >
              🎮 Instant Stress Relief
            </span>
          </div>
        </div>

        {/* Game Navigation Tabs */}
        <div className="mrg-tabs-wrap">
          {[
            { id: "floatbubble", label: "🫧 Bubble Float" },
            { id: "colortap",    label: "🌈 Color Tap Rush" },
            { id: "memory",      label: "🎴 Mind Match" },
            { id: "breathing",   label: "🧘 Breath Lotus" },
            { id: "stones",      label: "🪨 Stone Balance" },
            { id: "colorsplash", label: "🎨 Color Splash" },
            { id: "starcatch",   label: "⭐ Star Catch" },
            { id: "drums",       label: "🥁 Zen Drums" },
            { id: "mandala",     label: "🌀 Mandala Draw" },
            { id: "theremin",    label: "🌊 Wave Theremin" },
            { id: "puzzle",      label: "🧩 Slide Puzzle" },
            { id: "garden",      label: "🌱 Grow Garden" },
            { id: "focus",       label: "🎯 Focus Circles" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveGame(tab.id)}
              className={`mrg-tab-btn ${activeGame === tab.id ? "active" : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ACTIVE GAME 1: Floating Bubble Pop */}
        {activeGame === "floatbubble" && (
          <div className="mrg-game-card">
            <h2 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 6px 0", color: "#2D1A47" }}>
              Bubble Float Pop 🫧
            </h2>
            <p style={{ color: "#6D597A", fontSize: 13.5, margin: "0 0 12px 0" }}>
              Bubbles rise from below. Tap to pop them before they escape! Smaller bubbles = more points. 60 second timer.
            </p>

            {/* Score bar */}
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 12 }}>
              <span style={{ background: "linear-gradient(135deg,#8B5CF6,#EC4899)", color: "#fff", padding: "6px 14px", borderRadius: 12, fontWeight: 800, fontSize: 14 }}>
                ⭐ Score: {fbScore}
              </span>
              <span style={{ background: "rgba(248,113,113,0.15)", border: "1.5px solid #FCA5A5", color: "#B91C1C", padding: "6px 14px", borderRadius: 12, fontWeight: 800, fontSize: 14 }}>
                💨 Missed: {fbMissed}
              </span>
              <span style={{ background: "rgba(139,92,246,0.12)", border: "1.5px solid #C4B5FD", color: "#6D28D9", padding: "6px 14px", borderRadius: 12, fontWeight: 800, fontSize: 14 }}>
                ⏱ {fbTimer}s
              </span>
              {fbBest > 0 && (
                <span style={{ background: "rgba(251,191,36,0.15)", border: "1.5px solid #FDE68A", color: "#92400E", padding: "6px 14px", borderRadius: 12, fontWeight: 800, fontSize: 13 }}>
                  🏆 Best: {fbBest}
                </span>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
              <button
                className="mrg-btn-primary"
                onClick={startFbGame}
                disabled={fbRunning}
                style={{ opacity: fbRunning ? 0.6 : 1 }}
              >
                {fbRunning ? "⏳ Playing..." : "▶ Start Game"}
              </button>
            </div>

            <div style={{ borderRadius: 20, overflow: "hidden", border: "2px solid #C4B5FD", cursor: "crosshair" }}>
              <canvas ref={floatBubbleCanvasRef} style={{ width: "100%", height: 340, display: "block" }} />
            </div>
          </div>
        )}

        {/* ACTIVE GAME 2: Color Tap Rush */}
        {activeGame === "colortap" && (
          <div className="mrg-game-card">
            <h2 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 6px 0", color: "#2D1A47" }}>
              Color Tap Rush 🌈
            </h2>
            <p style={{ color: "#6D597A", fontSize: 13.5, margin: "0 0 12px 0" }}>
              Tap ONLY the tiles matching the target color. Wrong tap = miss! Gets faster as your score rises.
            </p>

            {/* Target color indicator */}
            {ctTarget && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 14 }}>
                <span style={{ fontWeight: 800, fontSize: 13, color: "#6D28D9" }}>TAP →</span>
                <div style={{
                  width: 60, height: 60,
                  borderRadius: 18,
                  background: ctTarget.hex,
                  boxShadow: `0 0 0 4px white, 0 0 0 6px ${ctTarget.hex}, 0 8px 24px ${ctTarget.hex}88`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 900, fontSize: 12, color: ctTarget.dark,
                  animation: "targetPulse 1s ease-in-out infinite",
                }}>
                  {ctTarget.name}
                </div>
              </div>
            )}

            {/* Score row */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 12 }}>
              <span style={{ background: "linear-gradient(135deg,#8B5CF6,#EC4899)", color: "#fff", padding: "6px 14px", borderRadius: 12, fontWeight: 800, fontSize: 14 }}>
                ⭐ {ctScore}
              </span>
              <span style={{ background: "rgba(248,113,113,0.12)", border: "1.5px solid #FCA5A5", color: "#B91C1C", padding: "6px 12px", borderRadius: 12, fontWeight: 800, fontSize: 14 }}>
                ❌ {ctMissed}
              </span>
              <span style={{ background: "rgba(139,92,246,0.12)", border: "1.5px solid #C4B5FD", color: "#6D28D9", padding: "6px 12px", borderRadius: 12, fontWeight: 800, fontSize: 14 }}>
                ⏱ {ctTimer}s
              </span>
              {ctBest > 0 && (
                <span style={{ background: "rgba(251,191,36,0.12)", border: "1.5px solid #FDE68A", color: "#92400E", padding: "6px 12px", borderRadius: 12, fontWeight: 800, fontSize: 13 }}>
                  🏆 Best: {ctBest}
                </span>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <button className="mrg-btn-primary" onClick={startCtGame} disabled={ctRunning} style={{ opacity: ctRunning ? 0.6 : 1 }}>
                {ctRunning ? "⏳ Playing..." : "▶ Start Game"}
              </button>
            </div>

            {/* Falling tiles arena */}
            <div style={{
              position: "relative",
              width: "100%",
              height: 320,
              borderRadius: 20,
              overflow: "hidden",
              background: "linear-gradient(160deg, #1E1B4B 0%, #312E81 100%)",
              border: "2px solid #4338CA",
              cursor: ctRunning ? "pointer" : "default",
            }}>
              {/* Catch zone at bottom */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: 44,
                background: ctTarget ? `${ctTarget.hex}28` : "rgba(255,255,255,0.06)",
                border: `2px solid ${ctTarget ? ctTarget.hex : "rgba(255,255,255,0.2)"}`,
                borderRadius: "0 0 18px 18px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontWeight: 800, fontSize: 12, color: ctTarget ? ctTarget.hex : "rgba(255,255,255,0.5)" }}>
                  {ctTarget ? `Tap ${ctTarget.name} tiles!` : ""}
                </span>
              </div>

              {!ctRunning && ctTiles.length === 0 && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <span style={{ fontSize: 36 }}>🌈</span>
                  <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 700, fontSize: 14 }}>
                    {ctTimer === 0 ? `Game Over! Score: ${ctScore}` : "Tap Start to play!"}
                  </span>
                  {ctTimer === 0 && <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>Tap only the target color</span>}
                </div>
              )}

              {/* Falling tiles */}
              {ctTiles.map(tile => (
                <div
                  key={tile.id}
                  onClick={() => tapCtTile(tile)}
                  style={{
                    position: "absolute",
                    left: `${tile.x}%`,
                    top: `${tile.y}%`,
                    width: tile.size,
                    height: tile.size,
                    borderRadius: 16,
                    background: `radial-gradient(circle at 35% 35%, ${tile.color.hex}EE, ${tile.color.dark})`,
                    boxShadow: `0 0 18px ${tile.color.hex}88`,
                    border: `2px solid ${tile.color.hex}`,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: 11,
                    color: "rgba(255,255,255,0.9)",
                    transform: "translateX(-50%)",
                    transition: "top 0.04s linear",
                    userSelect: "none",
                  }}
                >
                  {tile.color.name}
                </div>
              ))}
            </div>

            <style>{`
              @keyframes targetPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.08); }
              }
            `}</style>
          </div>
        )}

        {/* ACTIVE GAME 3: Mind Memory Match */}
        {activeGame === "memory" && (
          <div className="mrg-game-card">
            <h2 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 6px 0", color: "#2D1A47" }}>
              Mindful Memory Match 🎴
            </h2>
            <p style={{ color: "#6D597A", fontSize: 13.5, margin: "0 0 16px 0" }}>
              Flip cards to pair identical calm symbols. Boosts focus and presence.
            </p>

            <div className="mrg-memory-grid">
              {cards.map((card) => {
                const isFlipped = flipped.includes(card.id) || matched.includes(card.id);
                const isMatched = matched.includes(card.id);

                return (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    className={`mrg-memory-card ${isFlipped ? "flipped" : ""} ${
                      isMatched ? "matched" : ""
                    }`}
                  >
                    {isFlipped ? card.emoji : "🔮"}
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16 }}>
              <span style={{ fontWeight: 800, color: "#8B5CF6", fontSize: 14 }}>
                Moves: {moves} | Matched: {matched.length / 2} / {MEMORY_EMOJIS.length}
              </span>
              <button className="mrg-btn-primary" onClick={initMemoryGame}>
                🔄 New Game
              </button>
            </div>
          </div>
        )}

        {/* ACTIVE GAME 4: Breath Lotus */}
        {activeGame === "breathing" && (
          <div className="mrg-game-card">
            <h2 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 6px 0", color: "#2D1A47" }}>
              Lotus Breathing Rhythm 🧘
            </h2>
            <p style={{ color: "#6D597A", fontSize: 13.5, margin: "0 0 16px 0" }}>
              Follow the expanding lotus circle to pace your breath and ease nervous tension.
            </p>

            <div className="mrg-lotus-wrap">
              <div className={`mrg-lotus-circle ${breathPhase}`}>
                <span style={{ fontSize: 32, marginBottom: 4 }}>🌸</span>
                <strong style={{ fontSize: 20, fontWeight: 900 }}>{breathPhase}</strong>
                <span style={{ fontSize: 15, opacity: 0.9 }}>{breathSec}s</span>
              </div>
            </div>

            <p style={{ color: "#7C3AED", fontWeight: 800, fontSize: 13.5, marginTop: 16 }}>
              {breathPhase === "Inhale"
                ? "Breathe in deeply through your nose..."
                : breathPhase === "Hold"
                ? "Hold your breath calmly..."
                : "Exhale slowly through your mouth..."}
            </p>
          </div>
        )}

        {/* ACTIVE GAME 5: Zen Stone Stacking */}
        {activeGame === "stones" && (
          <div className="mrg-game-card">
            <h2 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 6px 0", color: "#2D1A47" }}>
              Zen Stone Balancing 🪨
            </h2>
            <p style={{ color: "#6D597A", fontSize: 13.5, margin: "0 0 16px 0" }}>
              Stack smooth river stones to cultivate patience and inner equilibrium.
            </p>

            <div className="mrg-stones-pile">
              {stackedStones.length === 0 ? (
                <p style={{ color: "#A78BFA", fontSize: 14, fontWeight: 700 }}>
                  Tap 'Stack Stone' below to begin your tower 🏔️
                </p>
              ) : (
                stackedStones.map((stone, idx) => (
                  <div
                    key={stone.id}
                    className="mrg-stone"
                    style={{
                      width: stone.width,
                      backgroundColor: stone.color,
                      transform: `rotate(${stone.wobble}deg)`,
                      zIndex: idx + 1,
                    }}
                  />
                ))
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 14, marginTop: 16 }}>
              <button
                className="mrg-btn-primary"
                onClick={addStone}
                disabled={stackedStones.length >= 5}
              >
                {stackedStones.length >= 5 ? "✨ Cairn Completed!" : "🪨 Stack Stone"}
              </button>
              <button
                onClick={resetStones}
                style={{
                  border: "1px solid #DDD6FE",
                  background: "#FFFFFF",
                  color: "#6D28D9",
                  padding: "9px 16px",
                  borderRadius: 14,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                🔄 Reset Tower
              </button>
            </div>
          </div>
        )}

        {/* ACTIVE GAME 6: Color Splash Paint */}
        {activeGame === "colorsplash" && (
          <div className="mrg-game-card">
            <h2 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 6px 0", color: "#2D1A47" }}>
              Color Splash Paint 🎨
            </h2>
            <p style={{ color: "#6D597A", fontSize: 13.5, margin: "0 0 14px 0" }}>
              Pick a color and paint the grid — drag or tap to splash! Mix and blend your own calm art.
            </p>

            {/* Palette tabs */}
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 12 }}>
              {SPLASH_PALETTES.map((pal, pidx) => (
                <button
                  key={pidx}
                  onClick={() => { setSplashPaletteIdx(pidx); setSelectedSplashColor(pal[0]); }}
                  style={{
                    border: "1.5px solid #DDD6FE",
                    borderRadius: 10,
                    padding: "4px 10px",
                    fontWeight: 800,
                    fontSize: 11,
                    cursor: "pointer",
                    background: splashPaletteIdx === pidx ? "#8B5CF6" : "#FFFFFF",
                    color: splashPaletteIdx === pidx ? "#FFFFFF" : "#4C1D95",
                  }}
                >
                  {["🌈 Vivid","🧊 Pastel","🍬 Candy"][pidx]}
                </button>
              ))}
            </div>

            {/* Color swatches */}
            <div className="mrg-color-picker-row">
              {SPLASH_PALETTES[splashPaletteIdx].map((c) => (
                <div
                  key={c}
                  className={`mrg-color-swatch ${selectedSplashColor === c ? "selected" : ""}`}
                  style={{ background: c }}
                  onClick={() => setSelectedSplashColor(c)}
                />
              ))}
              {/* Eraser */}
              <div
                className={`mrg-color-swatch ${selectedSplashColor === "#F3E8FF" ? "selected" : ""}`}
                style={{ background: "#FFFFFF", border: "2px dashed #A78BFA", fontSize: 14, display:"flex", alignItems:"center", justifyContent:"center" }}
                onClick={() => setSelectedSplashColor("#F3E8FF")}
              >🧹</div>
            </div>

            {/* Paint grid */}
            <div
              className="mrg-splash-grid"
              onMouseLeave={() => setIsPainting(false)}
              onMouseUp={() => setIsPainting(false)}
            >
              {splashColors.map((color, idx) => (
                <div
                  key={idx}
                  className="mrg-splash-cell"
                  style={{ background: color || "rgba(221,214,254,0.3)" }}
                  onMouseDown={() => { setIsPainting(true); paintCell(idx); }}
                  onMouseEnter={() => { if (isPainting) paintCell(idx); }}
                  onTouchStart={(e) => { e.preventDefault(); paintCell(idx); }}
                />
              ))}
            </div>

            <button className="mrg-btn-primary" onClick={clearSplash}>🧹 Clear Canvas</button>
          </div>
        )}

        {/* ACTIVE GAME 7: Falling Stars Catcher */}
        {activeGame === "starcatch" && (
          <div className="mrg-game-card">
            <h2 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 6px 0", color: "#2D1A47" }}>
              Star Catcher ⭐
            </h2>
            <p style={{ color: "#6D597A", fontSize: 13.5, margin: "0 0 14px 0" }}>
              Move your mouse or swipe to guide the basket and catch falling stars. Don't let them escape!
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 12 }}>
              {!starRunning ? (
                <button className="mrg-btn-primary" onClick={startStarGame}>▶ Start Game</button>
              ) : (
                <button
                  onClick={stopStarGame}
                  style={{ border: "1px solid #DDD6FE", background: "#FFFFFF", color: "#6D28D9", padding: "9px 18px", borderRadius: 14, fontWeight: 800, cursor: "pointer" }}
                >⏸ Pause</button>
              )}
              <span style={{ fontWeight: 800, color: "#8B5CF6", fontSize: 14, alignSelf: "center" }}>
                ⭐ {starScore} caught &nbsp; 💨 {starMissed} missed
              </span>
            </div>

            <div style={{ borderRadius: 20, overflow: "hidden", border: "2px solid #4338CA", cursor: "none" }}>
              <canvas ref={starCanvasRef} style={{ width: "100%", height: 320, display: "block" }} />
            </div>
          </div>
        )}

        {/* ACTIVE GAME 8: Zen Tap Drums */}
        {activeGame === "drums" && (
          <div className="mrg-game-card">
            <h2 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 6px 0", color: "#2D1A47" }}>
              Zen Tap Drums 🥁
            </h2>
            <p style={{ color: "#6D597A", fontSize: 13.5, margin: "0 0 16px 0" }}>
              Tap the pads to feel the rhythm. Create your own calming beat — no wrong notes!
            </p>

            {/* Sequence visualizer */}
            <div className="mrg-drum-sequence">
              {drumSequence.length === 0 ? (
                <span style={{ color: "#A78BFA", fontSize: 13, fontWeight: 700 }}>Tap a pad to start your rhythm...</span>
              ) : (
                drumSequence.map((emoji, i) => <span key={i}>{emoji}</span>)
              )}
            </div>

            <div className="mrg-drum-grid">
              {DRUM_PADS.map((pad, idx) => (
                <button
                  key={idx}
                  className={`mrg-drum-pad ${activePad === idx ? "hit" : ""}`}
                  style={{
                    background: `linear-gradient(135deg, ${pad.color}CC, ${pad.color})`,
                    boxShadow: activePad === idx
                      ? `0 2px 8px ${pad.color}88`
                      : `0 8px 22px ${pad.color}55, inset 0 1px 0 rgba(255,255,255,0.2)`,
                  }}
                  onMouseDown={() => hitDrum(pad, idx)}
                  onTouchStart={(e) => { e.preventDefault(); hitDrum(pad, idx); }}
                >
                  <span>{pad.label}</span>
                  <span className="mrg-drum-pad-label">{pad.name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => { setDrumSequence([]); playSound("pop"); }}
              style={{ border: "1px solid #DDD6FE", background: "#FFFFFF", color: "#6D28D9", padding: "9px 18px", borderRadius: 14, fontWeight: 800, cursor: "pointer" }}
            >🗑 Clear Sequence</button>
          </div>
        )}

        {/* ACTIVE GAME 9: Symmetry Mandala Draw */}
        {activeGame === "mandala" && (
          <div className="mrg-game-card">
            <h2 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 6px 0", color: "#2D1A47" }}>
              Mandala Draw 🌀
            </h2>
            <p style={{ color: "#6D597A", fontSize: 13.5, margin: "0 0 14px 0" }}>
              Draw freely — your strokes are mirrored in radial symmetry to form a living mandala. Deeply meditative.
            </p>

            <div className="mrg-mandala-controls">
              {/* Symmetry selector */}
              <span style={{ fontSize: 12, fontWeight: 700, color: "#6D28D9" }}>Symmetry:</span>
              {[4, 6, 8, 12, 16].map(s => (
                <button
                  key={s}
                  className={`mrg-mandala-chip ${mandalaSymmetry === s ? "active" : ""}`}
                  onClick={() => setMandalaSymmetry(s)}
                >{s}x</button>
              ))}
            </div>

            <div className="mrg-mandala-controls">
              {/* Color swatches */}
              <span style={{ fontSize: 12, fontWeight: 700, color: "#6D28D9" }}>Color:</span>
              {["#A78BFA","#F472B6","#60A5FA","#34D399","#FBBF24","#FB923C","#FFFFFF"].map(c => (
                <div
                  key={c}
                  className={`mrg-mandala-color ${mandalaColor === c ? "active" : ""}`}
                  style={{ background: c, border: c === "#FFFFFF" ? "2px dashed #A78BFA" : "none" }}
                  onClick={() => setMandalaColor(c)}
                />
              ))}
              {/* Brush size */}
              <span style={{ fontSize: 12, fontWeight: 700, color: "#6D28D9", marginLeft: 8 }}>Size:</span>
              {[2, 4, 7, 12].map(b => (
                <button
                  key={b}
                  className={`mrg-mandala-chip ${mandalaBrush === b ? "active" : ""}`}
                  onClick={() => setMandalaBrush(b)}
                  style={{ padding: "4px 10px" }}
                >{b}</button>
              ))}
            </div>

            <div style={{ borderRadius: 20, overflow: "hidden", border: "2px solid #4338CA", cursor: "crosshair", touchAction: "none" }}>
              <canvas ref={mandalaRef} style={{ width: "100%", height: 320, display: "block" }} />
            </div>

            <div style={{ marginTop: 14, display: "flex", justifyContent: "center", gap: 10 }}>
              <button className="mrg-btn-primary" onClick={clearMandala}>🗑 Clear Mandala</button>
            </div>
          </div>
        )}

        {/* ACTIVE GAME 10: Wave Theremin */}
        {activeGame === "theremin" && (
          <div className="mrg-game-card">
            <h2 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 6px 0", color: "#2D1A47" }}>
              Wave Theremin 🌊
            </h2>
            <p style={{ color: "#6D597A", fontSize: 13.5, margin: "0 0 14px 0" }}>
              Move your mouse/finger across the canvas — left/right controls pitch, up/down controls volume. Play the air!
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 12 }}>
              {!thereminActive ? (
                <button className="mrg-btn-primary" onClick={startTheremin}>🎵 Activate Sound</button>
              ) : (
                <button
                  onClick={stopTheremin}
                  style={{ border: "1px solid #DDD6FE", background: "#FFFFFF", color: "#6D28D9", padding: "9px 18px", borderRadius: 14, fontWeight: 800, cursor: "pointer" }}
                >🔇 Mute</button>
              )}
              <span style={{ fontWeight: 700, fontSize: 12, color: "#A78BFA", alignSelf: "center" }}>
                {thereminActive ? "🔊 Sound On — Move to play" : "Tap Activate, then move!"}
              </span>
            </div>
            <div className="mrg-theremin-wrap">
              <canvas ref={thereminCanvasRef} style={{ width: "100%", height: 280, display: "block" }} />
            </div>
          </div>
        )}

        {/* ACTIVE GAME 11: Slide Puzzle */}
        {activeGame === "puzzle" && (
          <div className="mrg-game-card">
            <h2 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 6px 0", color: "#2D1A47" }}>
              Calm Slide Puzzle 🧩
            </h2>
            <p style={{ color: "#6D597A", fontSize: 13.5, margin: "0 0 16px 0" }}>
              Slide the nature tiles into order (1–8 then blank). A meditative game of patience and focus.
            </p>

            {puzzleSolved && (
              <div style={{ background: "linear-gradient(135deg,#D1FAE5,#A7F3D0)", borderRadius: 16, padding: "12px 20px", marginBottom: 14, fontWeight: 800, color: "#065F46", fontSize: 15 }}>
                🎉 Solved in {puzzleMoves} moves! Beautiful work.
              </div>
            )}

            <div className="mrg-puzzle-grid">
              {puzzleTiles.map((tile, idx) => (
                <button
                  key={idx}
                  onClick={() => slideTile(idx)}
                  className={`mrg-puzzle-tile ${tile === 0 ? "blank" : ""} ${puzzleSolved ? "solved" : ""}`}
                >
                  {tile === 0 ? "" : PUZZLE_EMOJIS[tile - 1]}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 14, justifyContent: "center", alignItems: "center" }}>
              <span style={{ fontWeight: 800, color: "#8B5CF6", fontSize: 14 }}>Moves: {puzzleMoves}</span>
              <button className="mrg-btn-primary" onClick={() => { setPuzzleTiles(makePuzzle()); setPuzzleMoves(0); setPuzzleSolved(false); }}>🔀 New Puzzle</button>
            </div>
          </div>
        )}

        {/* ACTIVE GAME 12: Grow Your Garden */}
        {activeGame === "garden" && (
          <div className="mrg-game-card">
            <h2 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 6px 0", color: "#2D1A47" }}>
              Grow Your Garden 🌱
            </h2>
            <p style={{ color: "#6D597A", fontSize: 13.5, margin: "0 0 10px 0" }}>
              Tap an empty plot to plant a seed. Tap again to nurture it through each stage. Fully grown? Tap to release.
            </p>

            <div
              style={{ background: "rgba(209,250,229,0.35)", borderRadius: 16, padding: "10px 16px", marginBottom: 14, fontWeight: 700, fontSize: 14, color: "#065F46", minHeight: 38 }}
            >
              {gardenMsg}
            </div>

            <div className="mrg-garden-row">
              {gardenPlants.map((plant, idx) => (
                <div
                  key={idx}
                  className={`mrg-garden-slot ${plant ? "planted" : ""}`}
                  onClick={() => plantOrGrow(idx)}
                >
                  {plant ? (
                    <>
                      <span className="mrg-plant-emoji" key={plant.stage}>{PLANT_STAGES[plant.stage].emoji}</span>
                      <span className="mrg-plant-stage">{PLANT_STAGES[plant.stage].label}</span>
                    </>
                  ) : (
                    <span className="mrg-garden-add">＋</span>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => { setGardenPlants(Array(GARDEN_SLOTS).fill(null)); setGardenMsg("Garden cleared. Start fresh! 🌱"); }}
              style={{ border: "1px solid #DDD6FE", background: "#FFFFFF", color: "#6D28D9", padding: "9px 18px", borderRadius: 14, fontWeight: 800, cursor: "pointer" }}
            >🗑 Clear Garden</button>
          </div>
        )}

        {/* ACTIVE GAME 13: Focus Circles */}
        {activeGame === "focus" && (
          <div className="mrg-game-card">
            <h2 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 6px 0", color: "#2D1A47" }}>
              Focus Circles 🎯
            </h2>
            <p style={{ color: "#6D597A", fontSize: 13.5, margin: "0 0 14px 0" }}>
              Tap the glowing circles before they vanish! Trains calm focus and presence. Circles shrink — be quick!
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 12 }}>
              {!focusRunning ? (
                <button className="mrg-btn-primary" onClick={startFocus}>▶ Start</button>
              ) : (
                <button onClick={stopFocus} style={{ border: "1px solid #DDD6FE", background: "#FFFFFF", color: "#6D28D9", padding: "9px 18px", borderRadius: 14, fontWeight: 800, cursor: "pointer" }}>⏹ Stop</button>
              )}
              <span style={{ fontWeight: 800, color: "#8B5CF6", fontSize: 14, alignSelf: "center" }}>
                🎯 {focusScore} &nbsp; 💨 {focusMissed}
              </span>
            </div>

            <div className="mrg-focus-arena">
              {!focusRunning && focusCircles.length === 0 && (
                <div className="mrg-focus-idle">
                  <span style={{ fontSize: 38 }}>🎯</span>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>Tap Start to begin</span>
                  <span style={{ fontSize: 12, opacity: 0.7 }}>Circles appear randomly — tap them!</span>
                </div>
              )}
              {focusCircles.map(c => {
                const elapsed = Date.now() - c.born;
                const ratio = Math.max(0, 1 - elapsed / c.life);
                const curSize = c.size * (0.35 + ratio * 0.65);
                return (
                  <div
                    key={c.id}
                    className="mrg-focus-circle"
                    onClick={() => catchCircle(c.id)}
                    style={{
                      left: `${c.x}%`,
                      top: `${c.y}%`,
                      width: curSize,
                      height: curSize,
                      marginLeft: -curSize / 2,
                      marginTop: -curSize / 2,
                      background: `radial-gradient(circle at 35% 35%, ${c.color}CC, ${c.color}88)`,
                      boxShadow: `0 0 ${Math.round(ratio * 24)}px ${c.color}`,
                      opacity: 0.3 + ratio * 0.7,
                      border: `2px solid ${c.color}`,
                    }}
                  >
                    {curSize > 44 ? "✦" : ""}
                  </div>
                );
              })}
            </div>
          </div>
        )}


      </div>
    </div>
  );
}

export default MindRelaxGames;
