import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

function CalmVideos() {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const videoCategories = [
    "All",
    "Meditation",
    "Breathing",
    "Sleep",
    "Stress Relief",
  ];

  const videos = [
    // ==========================================
    // MEDITATION (15 Videos)
    // ==========================================
    {
      id: 1,
      title: "Peaceful Mind Meditation",
      category: "Meditation",
      duration: "10 min",
      level: "Easy",
      mood: "Relaxation",
      thumbnail: "🧘‍♀️",
      color: "#CDB4DB",
      videoUrl: "https://www.youtube.com/embed/ZToicYcHIOU",
      description: "A gentle meditation video to help you feel peaceful, centered, and balanced.",
    },
    {
      id: 2,
      title: "Positive Energy Morning Calm",
      category: "Meditation",
      duration: "7 min",
      level: "Beginner",
      mood: "Positive Start",
      thumbnail: "☀️",
      color: "#FFD166",
      videoUrl: "https://www.youtube.com/embed/ssss7V1_eyA",
      description: "Start your morning with calm thoughts, positive energy, and self-kindness.",
    },
    {
      id: 3,
      title: "5-Minute Daily Mindfulness",
      category: "Meditation",
      duration: "5 min",
      level: "Quick",
      mood: "Mindful Focus",
      thumbnail: "🌸",
      color: "#F8BBD0",
      videoUrl: "https://www.youtube.com/embed/dEZkS2A4Jqg",
      description: "A quick reset to anchor your awareness to the present moment wherever you are.",
    },
    {
      id: 4,
      title: "Letting Go of Anxiety & Overthinking",
      category: "Meditation",
      duration: "15 min",
      level: "Medium",
      mood: "Anxiety Relief",
      thumbnail: "🕊️",
      color: "#B3E5FC",
      videoUrl: "https://www.youtube.com/embed/O-6f5wQXSu8",
      description: "Release persistent racing thoughts and bring deep serenity to an overwhelmed mind.",
    },
    {
      id: 5,
      title: "Loving-Kindness (Metta) Practice",
      category: "Meditation",
      duration: "12 min",
      level: "Gentle",
      mood: "Self-Compassion",
      thumbnail: "💖",
      color: "#FFCDD2",
      videoUrl: "https://www.youtube.com/embed/sz7cpV7ERsM",
      description: "Cultivate feelings of warmth, goodwill, and unconditional kindness toward yourself.",
    },
    {
      id: 6,
      title: "Full Body Scan for Relaxation",
      category: "Meditation",
      duration: "15 min",
      level: "Gentle",
      mood: "Body Awareness",
      thumbnail: "🌿",
      color: "#C8E6C9",
      videoUrl: "https://www.youtube.com/embed/15q-N-_kkrU",
      description: "Systematically release physical tightness and connect with sensations in your body.",
    },
    {
      id: 7,
      title: "Inner Peace & Clarity Meditation",
      category: "Meditation",
      duration: "10 min",
      level: "Easy",
      mood: "Mental Clarity",
      thumbnail: "💎",
      color: "#E1BEE7",
      videoUrl: "https://www.youtube.com/embed/QHkXvPq2pQE",
      description: "Clear mental fog and reconnect with your inner stillness and calm confidence.",
    },
    {
      id: 8,
      title: "Grounding for Emotional Balance",
      category: "Meditation",
      duration: "8 min",
      level: "Beginner",
      mood: "Grounding",
      thumbnail: "🏔️",
      color: "#D7CCC8",
      videoUrl: "https://www.youtube.com/embed/6p_yaNFSYao",
      description: "Root your energy deeply into the earth to feel stable, safe, and emotionally secure.",
    },
    {
      id: 9,
      title: "Stress Release & Healing Light",
      category: "Meditation",
      duration: "14 min",
      level: "Calm",
      mood: "Deep Healing",
      thumbnail: "✨",
      color: "#FFF9C4",
      videoUrl: "https://www.youtube.com/embed/syx3a1CYY00",
      description: "Visualize radiant soothing light melting away layers of tension and emotional exhaustion.",
    },
    {
      id: 10,
      title: "Quiet The Chattering Mind",
      category: "Meditation",
      duration: "10 min",
      level: "Easy",
      mood: "Quiet Mind",
      thumbnail: "🍃",
      color: "#DCEDC8",
      videoUrl: "https://www.youtube.com/embed/vj0JDwQLof4",
      description: "Simple guidance to soothe an overstimulated brain and return to quiet stillness.",
    },
    {
      id: 11,
      title: "Mindful Awareness & Focus",
      category: "Meditation",
      duration: "8 min",
      level: "Beginner",
      mood: "Daily Focus",
      thumbnail: "🚶",
      color: "#B2DFDB",
      videoUrl: "https://www.youtube.com/embed/2FGR-OspxsU",
      description: "Train your mind to remain attentive and non-judgmental during daily routines.",
    },
    {
      id: 12,
      title: "Self-Love & Confidence Boost",
      category: "Meditation",
      duration: "12 min",
      level: "Intermediate",
      mood: "Confidence",
      thumbnail: "🌺",
      color: "#F48FB1",
      videoUrl: "https://www.youtube.com/embed/itZMM5gCboo",
      description: "Rebuild inner strength, self-respect, and trust in your personal growth journey.",
    },
    {
      id: 13,
      title: "Serenity Ocean Guided Meditation",
      category: "Meditation",
      duration: "10 min",
      level: "Calm",
      mood: "Serenity",
      thumbnail: "🌊",
      color: "#80DEEA",
      videoUrl: "https://www.youtube.com/embed/W19PdslWCaY",
      description: "Let gentle ocean waves wash away feelings of fatigue, leaving you revitalized.",
    },
    {
      id: 14,
      title: "Zen Garden Tranquility Meditation",
      category: "Meditation",
      duration: "15 min",
      level: "Easy",
      mood: "Peace",
      thumbnail: "🎋",
      color: "#C5E1A5",
      videoUrl: "https://www.youtube.com/embed/2OEL4P1Rz04",
      description: "Immerse yourself in a serene Japanese zen garden soundscape and mindful breath.",
    },
    {
      id: 15,
      title: "Gratitude Practice for Joy",
      category: "Meditation",
      duration: "6 min",
      level: "Beginner",
      mood: "Gratitude",
      thumbnail: "🌻",
      color: "#FFE082",
      videoUrl: "https://www.youtube.com/embed/sTANio_2E0Q",
      description: "Shift your mental state into appreciation and notice the simple wonders around you.",
    },

    // ==========================================
    // BREATHING (15 Videos)
    // ==========================================
    {
      id: 16,
      title: "5 Minute Calm Breathing Exercise",
      category: "Breathing",
      duration: "5 min",
      level: "Beginner",
      mood: "Anxiety Relief",
      thumbnail: "🌬️",
      color: "#A8DADC",
      videoUrl: "https://www.youtube.com/embed/inpok4MKVLM",
      description: "A short, steady breathing session to slow your heart rate and ease nervous tension.",
    },
    {
      id: 17,
      title: "Box Breathing (4-4-4-4) Technique",
      category: "Breathing",
      duration: "4 min",
      level: "Beginner",
      mood: "Focus & Calm",
      thumbnail: "⏹️",
      color: "#B2EBF2",
      videoUrl: "https://www.youtube.com/embed/bF_1ZiFta-E",
      description: "Navy SEAL technique: Inhale 4s, hold 4s, exhale 4s, hold 4s for peak composure.",
    },
    {
      id: 18,
      title: "Quick Panic Control Exercise",
      category: "Breathing",
      duration: "4 min",
      level: "Quick",
      mood: "Panic Relief",
      thumbnail: "💙",
      color: "#FFAFCC",
      videoUrl: "https://www.youtube.com/embed/odADwWzHR24",
      description: "A guided exercise to halt acute panic symptoms and ground your nervous system.",
    },
    {
      id: 19,
      title: "4-7-8 Relaxing Breath for Calm",
      category: "Breathing",
      duration: "6 min",
      level: "Easy",
      mood: "Deep Relax",
      thumbnail: "🍃",
      color: "#C8E6C9",
      videoUrl: "https://www.youtube.com/embed/1Dv-ldGLnIY",
      description: "Natural tranquilizer for the nervous system: 4s inhale, 7s hold, 8s slow exhale.",
    },
    {
      id: 20,
      title: "Diaphragmatic Belly Breathing",
      category: "Breathing",
      duration: "5 min",
      level: "Beginner",
      mood: "Lung Health",
      thumbnail: "🎈",
      color: "#FFE0B2",
      videoUrl: "https://www.youtube.com/embed/g2Wo6bupnEQ",
      description: "Learn proper deep abdominal breathing to maximize oxygen intake and relieve stress.",
    },
    {
      id: 21,
      title: "Resonant Coherent Breathing (5.5s)",
      category: "Breathing",
      duration: "8 min",
      level: "Medium",
      mood: "Heart Rhythm",
      thumbnail: "💓",
      color: "#F8BBD0",
      videoUrl: "https://www.youtube.com/embed/ub3P8v1gJ5c",
      description: "Breathe at optimal 5.5 breaths per minute to synchronize heart rate variability.",
    },
    {
      id: 22,
      title: "Alternate Nostril Breathing (Nadi Shodhana)",
      category: "Breathing",
      duration: "7 min",
      level: "Intermediate",
      mood: "Balance",
      thumbnail: "🧘",
      color: "#D1C4E9",
      videoUrl: "https://www.youtube.com/embed/8VwufJrUhic",
      description: "Ancient yogic breath practice to harmonize the left and right hemispheres of the brain.",
    },
    {
      id: 23,
      title: "Wim Hof Style Energizing Breath",
      category: "Breathing",
      duration: "10 min",
      level: "Advanced",
      mood: "Energy Boost",
      thumbnail: "⚡",
      color: "#FFF176",
      videoUrl: "https://www.youtube.com/embed/tybOi4hjZFQ",
      description: "Powerful rhythmic breathing cycles to reset cellular energy and enhance immunity.",
    },
    {
      id: 24,
      title: "Soothing Ocean Breath (Ujjayi)",
      category: "Breathing",
      duration: "6 min",
      level: "Easy",
      mood: "Inner Warmth",
      thumbnail: "🌊",
      color: "#80CBC4",
      videoUrl: "https://www.youtube.com/embed/G2159iH_9eA",
      description: "Create gentle ocean-like throat sounds to quiet internal chatter and foster peace.",
    },
    {
      id: 25,
      title: "Slow Pace 6 Breaths Per Minute",
      category: "Breathing",
      duration: "10 min",
      level: "Gentle",
      mood: "Heart Rate Drop",
      thumbnail: "⏱️",
      color: "#B0BEC5",
      videoUrl: "https://www.youtube.com/embed/aNXKjGFUlMs",
      description: "Gentle paced breathing with visual cues to trigger deep parasympathetic relaxation.",
    },
    {
      id: 26,
      title: "Physiological Sigh Instant Reset",
      category: "Breathing",
      duration: "3 min",
      level: "Quick",
      mood: "Instant Reset",
      thumbnail: "😮‍💨",
      color: "#E0F2F1",
      videoUrl: "https://www.youtube.com/embed/m8rRzTtP7Tc",
      description: "Two quick inhales followed by one long exhale for the fastest autonomic reset known.",
    },
    {
      id: 27,
      title: "Square Breathing Visual Pacer",
      category: "Breathing",
      duration: "5 min",
      level: "Beginner",
      mood: "Stress Drop",
      thumbnail: "🫧",
      color: "#E1F5FE",
      videoUrl: "https://www.youtube.com/embed/tEmt1Znux58",
      description: "Follow an expanding calming circle to bring immediate order and calmness to breathing.",
    },
    {
      id: 28,
      title: "Evening Unwind Breathwork",
      category: "Breathing",
      duration: "8 min",
      level: "Calm",
      mood: "Wind Down",
      thumbnail: "🌇",
      color: "#FFCCBC",
      videoUrl: "https://www.youtube.com/embed/nmFUDkj1Aq0",
      description: "Smooth evening breath cycles designed to ease away the fatigue of a long workday.",
    },
    {
      id: 29,
      title: "Breathwork for Emotional Balance",
      category: "Breathing",
      duration: "7 min",
      level: "Easy",
      mood: "Balance",
      thumbnail: "⚖️",
      color: "#D7CCC8",
      videoUrl: "https://www.youtube.com/embed/4bIr4_XF6_4",
      description: "Gentle rhythm helping you step back from acute emotional spikes into inner stability.",
    },
    {
      id: 30,
      title: "Morning Oxygen Boost Breathing",
      category: "Breathing",
      duration: "5 min",
      level: "Beginner",
      mood: "Fresh Start",
      thumbnail: "🌅",
      color: "#FFE082",
      videoUrl: "https://www.youtube.com/embed/7Ep5mKuRmAA",
      description: "Fill your lungs with morning freshness, boost natural alertness, and awaken your body.",
    },

    // ==========================================
    // SLEEP (15 Videos)
    // ==========================================
    {
      id: 31,
      title: "Deep Sleep Relaxation & Body Scan",
      category: "Sleep",
      duration: "15 min",
      level: "Calm",
      mood: "Better Sleep",
      thumbnail: "🌙",
      color: "#B8C0FF",
      videoUrl: "https://www.youtube.com/embed/aEqlQvczMJQ",
      description: "Relax your body and mind before sleep with soft, comforting guided relaxation.",
    },
    {
      id: 32,
      title: "Fall Asleep Fast Guided Meditation",
      category: "Sleep",
      duration: "20 min",
      level: "Gentle",
      mood: "Sleep Induction",
      thumbnail: "🛌",
      color: "#D1C4E9",
      videoUrl: "https://www.youtube.com/embed/ft_DXg58iYk",
      description: "Soothing spoken guidance designed to transition your consciousness into deep slumber.",
    },
    {
      id: 33,
      title: "Delta Wave Sleep Frequency & Guidance",
      category: "Sleep",
      duration: "30 min",
      level: "Deep",
      mood: "Heavy Sleep",
      thumbnail: "🌌",
      color: "#9FA8DA",
      videoUrl: "https://www.youtube.com/embed/1ZYbU82GVz4",
      description: "Delta waves harmonize neural activity to support rejuvenating Stage 3 & 4 restorative sleep.",
    },
    {
      id: 34,
      title: "Rain Sounds & Whispering Meditation",
      category: "Sleep",
      duration: "25 min",
      level: "Easy",
      mood: "Cozy Sleep",
      thumbnail: "🌧️",
      color: "#B0BEC5",
      videoUrl: "https://www.youtube.com/embed/mPZkdNFkNps",
      description: "Gentle rainfall against a window pane coupled with calming nighttime relaxation cues.",
    },
    {
      id: 35,
      title: "Sleep Talk-Down for Racing Thoughts",
      category: "Sleep",
      duration: "20 min",
      level: "Gentle",
      mood: "Calm Thoughts",
      thumbnail: "💤",
      color: "#CE93D8",
      videoUrl: "https://www.youtube.com/embed/6vO1wPAmiMQ",
      description: "Turn off repetitive bedtime worries and let your nervous system sink into safe comfort.",
    },
    {
      id: 36,
      title: "Dream Induction Guided Hypnosis",
      category: "Sleep",
      duration: "25 min",
      level: "Medium",
      mood: "Dream Calm",
      thumbnail: "🪐",
      color: "#B39DDB",
      videoUrl: "https://www.youtube.com/embed/86HUcY864b4",
      description: "Hypnotic relaxation deepening techniques that effortlessly unlock pleasant dreamscapes.",
    },
    {
      id: 37,
      title: "Yoga Nidra for Deep Restful Sleep",
      category: "Sleep",
      duration: "20 min",
      level: "Gentle",
      mood: "Pure Rest",
      thumbnail: "🕯️",
      color: "#FFE082",
      videoUrl: "https://www.youtube.com/embed/7H0FKzeuWEY",
      description: "Yogic sleep practice proven to restore cognitive reserves equal to several hours of rest.",
    },
    {
      id: 38,
      title: "Floating in Space Sleep Journey",
      category: "Sleep",
      duration: "18 min",
      level: "Calm",
      mood: "Weightless",
      thumbnail: "🚀",
      color: "#90CAF9",
      videoUrl: "https://www.youtube.com/embed/n_0mZ1Qv3oY",
      description: "A weightless visualization through quiet starlit galaxies toward gentle dreams.",
    },
    {
      id: 39,
      title: "Warm Cabin Fireplace Sleep Story",
      category: "Sleep",
      duration: "22 min",
      level: "Cozy",
      mood: "Comfort",
      thumbnail: "🪵",
      color: "#FFAB91",
      videoUrl: "https://www.youtube.com/embed/1v0E51bCq-0",
      description: "Crackling firewood in a cozy mountain lodge while snow falls peacefully outside.",
    },
    {
      id: 40,
      title: "Slow Ocean Tide Sleep Melody",
      category: "Sleep",
      duration: "30 min",
      level: "Deep",
      mood: "Drift Away",
      thumbnail: "🌊",
      color: "#80DEEA",
      videoUrl: "https://www.youtube.com/embed/bn9F19Hi1Lk",
      description: "Endless gentle shorelines rhythmic breathing that lulls you into peaceful slumber.",
    },
    {
      id: 41,
      title: "Peaceful Forest Night Sleep",
      category: "Sleep",
      duration: "15 min",
      level: "Easy",
      mood: "Nature Calm",
      thumbnail: "🌲",
      color: "#A5D6A7",
      videoUrl: "https://www.youtube.com/embed/lE6RYpe9IT0",
      description: "Night breeze through tall pine trees and gentle crickets creating nature's lullaby.",
    },
    {
      id: 42,
      title: "Nighttime Gratitude Sleep Reflection",
      category: "Sleep",
      duration: "12 min",
      level: "Beginner",
      mood: "Thankful Heart",
      thumbnail: "⭐",
      color: "#FFF59D",
      videoUrl: "https://www.youtube.com/embed/2K8TgzH2x6g",
      description: "Close out the day with thankfulness, releasing regrets and preparing for deep rest.",
    },
    {
      id: 43,
      title: "Releasing Muscle Tension for Sleep",
      category: "Sleep",
      duration: "15 min",
      level: "Gentle",
      mood: "Tension Release",
      thumbnail: "🛌",
      color: "#C5CAE9",
      videoUrl: "https://www.youtube.com/embed/5Hl6s8-mR3I",
      description: "Progressive muscle relaxation from head to toe to eliminate sleep-blocking aches.",
    },
    {
      id: 44,
      title: "Starry Night Sky Sleep Journey",
      category: "Sleep",
      duration: "20 min",
      level: "Deep",
      mood: "Deep Trance",
      thumbnail: "🌠",
      color: "#B388FF",
      videoUrl: "https://www.youtube.com/embed/2O58k8m_t8E",
      description: "Lying under a pristine dome of shooting stars while your eyelids grow deliciously heavy.",
    },
    {
      id: 45,
      title: "Gentle Lullaby Piano Sleep Melody",
      category: "Sleep",
      duration: "25 min",
      level: "Calm",
      mood: "Peaceful Slumber",
      thumbnail: "🎹",
      color: "#F48FB1",
      videoUrl: "https://www.youtube.com/embed/5qap5aO4i9A",
      description: "Soft, minimalist piano chords that quiet racing thoughts until you drift off to sleep.",
    },

    // ==========================================
    // STRESS RELIEF (5 Videos)
    // ==========================================
    {
      id: 46,
      title: "Stress Relief Nature Session",
      category: "Stress Relief",
      duration: "8 min",
      level: "Easy",
      mood: "Stress Free",
      thumbnail: "🌿",
      color: "#CAFFBF",
      videoUrl: "https://www.youtube.com/embed/lFcSrYw-ARY",
      description: "A calming nature-inspired session to help release daily stress.",
    },
    {
      id: 47,
      title: "Letting Go of Tension Quick Session",
      category: "Stress Relief",
      duration: "10 min",
      level: "Easy",
      mood: "Tension Free",
      thumbnail: "🎈",
      color: "#FFCCBC",
      videoUrl: "https://www.youtube.com/embed/z6X5oEIg6Ak",
      description: "Release tight shoulders and neck stiffness through gentle guided awareness.",
    },
    {
      id: 48,
      title: "Release Work Anxiety & Pressure",
      category: "Stress Relief",
      duration: "12 min",
      level: "Medium",
      mood: "Calm Mind",
      thumbnail: "💼",
      color: "#B2DFDB",
      videoUrl: "https://www.youtube.com/embed/MIr3RsUWrdo",
      description: "Step away from work deadlines and high-stress situations with grounding audio.",
    },
    {
      id: 49,
      title: "Healing Forest Sounds & Music",
      category: "Stress Relief",
      duration: "15 min",
      level: "Gentle",
      mood: "Nature Therapy",
      thumbnail: "🍃",
      color: "#C8E6C9",
      videoUrl: "https://www.youtube.com/embed/eKFTSSKCzWA",
      description: "Japanese Shinrin-yoku (forest bathing) sounds to reduce cortisol and blood pressure.",
    },
    {
      id: 50,
      title: "De-Stress in 5 Minutes",
      category: "Stress Relief",
      duration: "5 min",
      level: "Quick",
      mood: "Fast Relief",
      thumbnail: "🧘‍♂️",
      color: "#FFD166",
      videoUrl: "https://www.youtube.com/embed/inpok4MKVLM",
      description: "Fast-acting guided intervention when you need immediate calm under pressure.",
    },
  ];

  const [selectedCategory, setSelectedCategory] = useState("All");
  // ID of the video currently playing inline inside its card
  const [playingVideoId, setPlayingVideoId] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(videos[0]);
  // Incremented each time a video is played to force re-mount of the iframe
  const [playKey, setPlayKey] = useState(0);

  // ===========================
  // Responsive (mobile) detection
  // ===========================
  const [isMobile, setIsMobile] = useState(false);

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

  // ===========================
  // Favorites (persisted to backend)
  // ===========================
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [savingFavoriteId, setSavingFavoriteId] = useState(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoadingFavorites(true);
      const res = await API.get("/favorites");
      const ids = (res.data || []).map((item) =>
        typeof item === "object" ? item.videoId : item
      );
      setFavorites(ids);
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const filteredVideos =
    selectedCategory === "All"
      ? videos
      : videos.filter((video) => video.category === selectedCategory);

  const handlePlayVideo = (video) => {
    setSelectedVideo(video);
    setPlayingVideoId(video.id);
    setPlayKey((k) => k + 1);
  };

  const handleStopVideo = (e) => {
    e.stopPropagation();
    setPlayingVideoId(null);
  };

  const toggleFavorite = async (id) => {
    const isFavorited = favorites.includes(id);

    if (isFavorited) {
      setFavorites(favorites.filter((item) => item !== id));
    } else {
      setFavorites([...favorites, id]);
    }

    setSavingFavoriteId(id);

    try {
      if (isFavorited) {
        await API.delete(`/favorites/${id}`);
      } else {
        await API.post("/favorites", { videoId: id });
      }
    } catch (err) {
      console.log(err);
      if (isFavorited) {
        setFavorites((prev) => [...prev, id]);
      } else {
        setFavorites((prev) => prev.filter((item) => item !== id));
      }
      alert("Couldn't save that favorite. Please try again.");
    } finally {
      setSavingFavoriteId(null);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{ ...styles.page, padding: isMobile ? "16px" : "35px" }}
    >
      <div style={styles.circleOne}></div>
      <div style={styles.circleTwo}></div>
      <div style={styles.circleThree}></div>

      <div style={styles.container}>
        {/* Header */}
        <div
          style={{
            ...styles.header,
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "center",
          }}
        >
          <div>
            <button
              style={styles.backButton}
              onClick={() => navigate("/dashboard")}
            >
              ← Back to Dashboard
            </button>

            <h1 style={{ ...styles.title, fontSize: isMobile ? "26px" : "42px" }}>
              Calm Videos
            </h1>
            <p style={styles.subtitle}>
              Watch relaxing videos directly in place for breathing, meditation, sleep, and stress relief.
            </p>
          </div>

          {!isMobile && <div style={styles.headerBadge}>🎥 In-Place Player</div>}
        </div>

        {/* Stats Grid */}
        <div
          style={{
            ...styles.statsGrid,
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
            gap: isMobile ? "12px" : "20px",
          }}
        >
          <div style={{ ...styles.statCard, padding: isMobile ? "14px" : "22px" }}>
            <div style={styles.statIcon}>🎬</div>
            <div>
              <h3 style={styles.statNumber}>{videos.length}</h3>
              <p style={styles.statText}>Total Videos</p>
            </div>
          </div>

          <div style={{ ...styles.statCard, padding: isMobile ? "14px" : "22px" }}>
            <div style={styles.statIcon}>💜</div>
            <div>
              <h3 style={styles.statNumber}>
                {loadingFavorites ? "…" : favorites.length}
              </h3>
              <p style={styles.statText}>Favorites</p>
            </div>
          </div>

          <div
            style={{
              ...styles.statCard,
              padding: isMobile ? "14px" : "22px",
              gridColumn: isMobile ? "span 2" : "auto",
            }}
          >
            <div style={styles.statIcon}>🧘</div>
            <div>
              <h3 style={styles.statNumber}>
                {videos.filter((v) => v.category === "Meditation").length}
              </h3>
              <p style={styles.statText}>Meditations</p>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div
          style={{
            ...styles.mainGrid,
            gridTemplateColumns: isMobile ? "1fr" : "1.45fr 0.85fr",
            gap: isMobile ? "18px" : "25px",
          }}
        >
          {/* Left / Main Panel: Video Feed with In-Place Playback */}
          <div style={{ ...styles.leftPanel, padding: isMobile ? "18px" : "30px" }}>
            <div style={styles.sectionHeaderRow}>
              <div>
                <h2 style={styles.sectionTitle}>Video Sessions</h2>
                <p style={styles.sectionSubText}>
                  Click any video to play it directly in place.
                </p>
              </div>
              {playingVideoId && (
                <button
                  style={styles.stopAllButton}
                  onClick={() => setPlayingVideoId(null)}
                >
                  ⏹ Close Player
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div style={styles.categoryRow}>
              {videoCategories.map((category) => (
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

            {/* Video Cards with In-line Player */}
            <div style={styles.videoList}>
              {filteredVideos.map((video) => {
                const isPlaying = playingVideoId === video.id;

                return (
                  <div
                    key={video.id}
                    style={{
                      ...styles.videoCard,
                      border: isPlaying
                        ? "3px solid #9B5DE5"
                        : "1px solid rgba(255,255,255,0.78)",
                      background: isPlaying
                        ? "linear-gradient(145deg, #FFFFFF, #FAF5FF)"
                        : "rgba(255,255,255,0.66)",
                      boxShadow: isPlaying
                        ? "0 20px 48px rgba(155,93,229,0.25)"
                        : "0 14px 30px rgba(49,34,68,0.08)",
                      padding: isMobile ? "14px" : "20px",
                    }}
                    onClick={() => {
                      if (!isPlaying) {
                        handlePlayVideo(video);
                      }
                    }}
                  >
                    {/* If this video is currently playing -> show inline player right here! */}
                    {isPlaying ? (
                      <div style={styles.inlinePlayerBox}>
                        <div style={styles.inlinePlayerHeader}>
                          <div style={styles.nowPlayingIndicator}>
                            <span style={styles.pulseDot}></span>
                            <span style={styles.nowPlayingText}>
                              Playing In-Place
                            </span>
                          </div>
                          <button
                            style={styles.closePlayerBtn}
                            onClick={handleStopVideo}
                            title="Close video"
                          >
                            ✕ Stop & Close
                          </button>
                        </div>

                        <div
                          style={{
                            ...styles.videoPlayerContainer,
                            height: isMobile ? "210px" : "320px",
                          }}
                        >
                          <iframe
                            key={`inline-${video.id}-${playKey}`}
                            style={styles.iframe}
                            src={`${video.videoUrl}?autoplay=1&rel=0&modestbranding=1`}
                            title={video.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          ></iframe>
                        </div>
                      </div>
                    ) : null}

                    {/* Card Content Row */}
                    <div
                      style={{
                        ...styles.cardContentRow,
                        flexDirection: isMobile ? "column" : "row",
                        alignItems: isMobile ? "flex-start" : "center",
                      }}
                    >
                      {/* Thumbnail / Play trigger */}
                      {!isPlaying && (
                        <div
                          style={{
                            ...styles.videoThumb,
                            width: isMobile ? "68px" : "80px",
                            height: isMobile ? "68px" : "80px",
                            fontSize: isMobile ? "32px" : "38px",
                            backgroundColor: video.color,
                          }}
                        >
                          {video.thumbnail}
                          <div style={styles.playOverlay}>
                            <span style={styles.playIcon}>▶</span>
                          </div>
                        </div>
                      )}

                      <div style={styles.videoInfo}>
                        <div style={styles.titleRow}>
                          <h3 style={styles.videoTitle}>{video.title}</h3>
                          <button
                            style={{
                              ...styles.favoriteButton,
                              opacity: savingFavoriteId === video.id ? 0.5 : 1,
                            }}
                            disabled={savingFavoriteId === video.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(video.id);
                            }}
                            title={
                              favorites.includes(video.id)
                                ? "Remove from favorites"
                                : "Add to favorites"
                            }
                          >
                            {favorites.includes(video.id) ? "💜" : "🤍"}
                          </button>
                        </div>

                        <p style={styles.videoDescription}>
                          {video.description}
                        </p>

                        <div style={styles.videoMetaRow}>
                          <span style={styles.metaBadge}>
                            ⏱ {video.duration}
                          </span>
                          <span style={styles.metaBadge}>✨ {video.level}</span>
                          <span style={styles.metaBadge}>🌈 {video.mood}</span>
                          {!isPlaying && (
                            <span style={styles.clickToPlayBadge}>
                              ▶ Click to play here
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Calm Companion & Quick Guides */}
          <div style={styles.rightPanel}>

            {/* Mindful Calm Tip */}
            <div
              style={{
                ...styles.tipCard,
                padding: isMobile ? "18px" : "25px",
              }}
            >
              <div style={styles.tipIcon}>💡</div>
              <h3 style={styles.tipTitle}>Calm Tip</h3>
              <p style={styles.tipText}>
                Find a quiet spot, put on headphones, breathe slowly, and let
                the soothing audio guide your mind to stillness.
              </p>
            </div>

            {/* 4-7-8 Breathing Card */}
            <div
              style={{
                ...styles.breathingCard,
                padding: isMobile ? "18px" : "24px",
              }}
            >
              <div style={styles.breathingIcon}>🌬️</div>
              <h3 style={styles.breathingTitle}>4-7-8 Breathing</h3>
              <div style={styles.breathingSteps}>
                <div style={styles.stepItem}>
                  <strong style={styles.stepNum}>4s</strong>
                  <span style={styles.stepDesc}>Inhale quietly</span>
                </div>
                <div style={styles.stepItem}>
                  <strong style={styles.stepNum}>7s</strong>
                  <span style={styles.stepDesc}>Hold gently</span>
                </div>
                <div style={styles.stepItem}>
                  <strong style={styles.stepNum}>8s</strong>
                  <span style={styles.stepDesc}>Exhale slowly</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Quick Links */}
        <div
          style={{
            ...styles.bottomGrid,
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: isMobile ? "14px" : "20px",
          }}
        >
          <div
            style={{ ...styles.helpCard, padding: isMobile ? "18px" : "25px" }}
            onClick={() => navigate("/mood")}
          >
            <div style={styles.helpIcon}>😊</div>
            <h3 style={styles.helpTitle}>Track Your Mood</h3>
            <p style={styles.helpText}>
              After watching a calm video, record how you feel.
            </p>
            <p style={styles.helpLink}>Go to Mood Tracker →</p>
          </div>

          <div
            style={{ ...styles.helpCard, padding: isMobile ? "18px" : "25px" }}
            onClick={() => navigate("/assessment")}
          >
            <div style={styles.helpIcon}>📝</div>
            <h3 style={styles.helpTitle}>Self Assessment</h3>
            <p style={styles.helpText}>
              Check your emotional wellness through a short self-assessment.
            </p>
            <p style={styles.helpLink}>Go to Assessment →</p>
          </div>

          <div
            style={{ ...styles.helpCard, padding: isMobile ? "18px" : "25px" }}
            onClick={() => navigate("/counselor")}
          >
            <div style={styles.helpIcon}>👩‍⚕️</div>
            <h3 style={styles.helpTitle}>Need Support?</h3>
            <p style={styles.helpText}>
              Connect with a counselor if you need someone to talk to.
            </p>
            <p style={styles.helpLink}>Go to Counselors →</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(160deg, #F1E8E9 0%, #EFE6EE 45%, #D2CFE1 100%)",
    fontFamily: "Arial, sans-serif",
    position: "relative",
    overflowX: "hidden",
  },

  circleOne: {
    position: "absolute",
    width: "270px",
    height: "270px",
    borderRadius: "50%",
    background: "#FFAFCC",
    top: "70px",
    right: "80px",
    opacity: "0.34",
    filter: "blur(5px)",
  },

  circleTwo: {
    position: "absolute",
    width: "310px",
    height: "310px",
    borderRadius: "50%",
    background: "#B8C0FF",
    bottom: "90px",
    left: "60px",
    opacity: "0.33",
    filter: "blur(5px)",
  },

  circleThree: {
    position: "absolute",
    width: "190px",
    height: "190px",
    borderRadius: "50%",
    background: "#A8DADC",
    top: "360px",
    left: "45%",
    opacity: "0.24",
    filter: "blur(6px)",
  },

  container: {
    maxWidth: "1240px",
    margin: "0 auto",
    position: "relative",
    zIndex: 2,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "26px",
    flexWrap: "wrap",
    gap: "16px",
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
    color: "#312244",
    margin: "0 0 7px 0",
    fontWeight: "900",
  },

  subtitle: {
    color: "#6D597A",
    fontSize: "16px",
    margin: 0,
    lineHeight: "1.5",
  },

  headerBadge: {
    padding: "13px 22px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.55)",
    boxShadow: "0 12px 25px rgba(49,34,68,0.12)",
    color: "#4A4E69",
    fontWeight: "800",
  },

  statsGrid: {
    display: "grid",
    marginBottom: "25px",
  },

  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    borderRadius: "30px",
    background: "rgba(255,255,255,0.56)",
    border: "1px solid rgba(255,255,255,0.78)",
    boxShadow: "0 20px 45px rgba(49,34,68,0.13)",
  },

  statIcon: {
    width: "60px",
    height: "60px",
    borderRadius: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #F3E8FF, #FFFFFF)",
    fontSize: "30px",
    flexShrink: 0,
  },

  statNumber: {
    color: "#312244",
    margin: "0 0 4px 0",
    fontSize: "28px",
    fontWeight: "900",
  },

  statText: {
    color: "#6D597A",
    margin: 0,
    fontSize: "14px",
    fontWeight: "700",
  },

  mainGrid: {
    display: "grid",
    marginBottom: "25px",
  },

  leftPanel: {
    background: "rgba(255,255,255,0.54)",
    border: "1px solid rgba(255,255,255,0.78)",
    borderRadius: "34px",
    boxShadow: "0 25px 60px rgba(49,34,68,0.16)",
  },

  sectionHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "12px",
  },

  sectionTitle: {
    color: "#312244",
    fontSize: "24px",
    margin: "0 0 7px 0",
    fontWeight: "900",
  },

  sectionSubText: {
    color: "#6D597A",
    margin: "0 0 20px 0",
    lineHeight: "1.5",
    fontSize: "14px",
  },

  stopAllButton: {
    border: "none",
    padding: "8px 14px",
    borderRadius: "14px",
    background: "rgba(241,91,181,0.15)",
    color: "#D81159",
    fontWeight: "800",
    fontSize: "13px",
    cursor: "pointer",
  },

  categoryRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "22px",
  },

  categoryButton: {
    border: "none",
    padding: "11px 16px",
    borderRadius: "18px",
    fontWeight: "900",
    cursor: "pointer",
  },

  videoList: {
    display: "grid",
    gap: "18px",
  },

  videoCard: {
    borderRadius: "26px",
    cursor: "pointer",
    transition: "all 0.25s ease",
    boxSizing: "border-box",
  },

  inlinePlayerBox: {
    marginBottom: "16px",
  },

  inlinePlayerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },

  nowPlayingIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  pulseDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: "#9B5DE5",
    boxShadow: "0 0 10px #9B5DE5",
  },

  nowPlayingText: {
    color: "#9B5DE5",
    fontSize: "13px",
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  closePlayerBtn: {
    border: "none",
    background: "rgba(49,34,68,0.08)",
    color: "#312244",
    padding: "6px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "800",
    cursor: "pointer",
  },

  videoPlayerContainer: {
    borderRadius: "20px",
    overflow: "hidden",
    background: "#000",
    boxShadow: "0 12px 30px rgba(0,0,0,0.22)",
  },

  iframe: {
    width: "100%",
    height: "100%",
    border: "none",
  },

  cardContentRow: {
    display: "flex",
    gap: "16px",
    width: "100%",
  },

  videoThumb: {
    borderRadius: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    position: "relative",
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
  },

  playOverlay: {
    position: "absolute",
    bottom: "-4px",
    right: "-4px",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #9B5DE5, #F15BB5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 10px rgba(155,93,229,0.4)",
  },

  playIcon: {
    color: "#FFFFFF",
    fontSize: "12px",
    marginLeft: "2px",
  },

  videoInfo: {
    flex: 1,
    minWidth: 0,
    width: "100%",
  },

  titleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "10px",
    marginBottom: "4px",
  },

  videoTitle: {
    color: "#312244",
    fontSize: "18px",
    margin: 0,
    fontWeight: "900",
  },

  videoDescription: {
    color: "#6D597A",
    margin: "0 0 10px 0",
    lineHeight: "1.45",
    fontSize: "13.5px",
  },

  videoMetaRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    alignItems: "center",
  },

  metaBadge: {
    background: "rgba(255,255,255,0.78)",
    color: "#6D597A",
    padding: "5px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "800",
  },

  clickToPlayBadge: {
    background: "rgba(155,93,229,0.12)",
    color: "#9B5DE5",
    padding: "5px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "900",
  },

  favoriteButton: {
    border: "none",
    background: "rgba(255,255,255,0.85)",
    width: "36px",
    height: "36px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "17px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(49,34,68,0.06)",
  },

  rightPanel: {
    display: "grid",
    gap: "20px",
    alignContent: "start",
  },

  activeSessionCard: {
    borderRadius: "30px",
    background: "linear-gradient(145deg, #FFFFFF, #F3E8FF)",
    border: "2px solid #9B5DE5",
    boxShadow: "0 20px 45px rgba(155,93,229,0.18)",
  },

  activeCardBadge: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "12px",
    background: "rgba(155,93,229,0.15)",
    color: "#9B5DE5",
    fontSize: "12px",
    fontWeight: "900",
    marginBottom: "12px",
  },

  activeCardTitle: {
    color: "#312244",
    fontSize: "18px",
    fontWeight: "900",
    margin: "0 0 6px 0",
  },

  activeCardDesc: {
    color: "#6D597A",
    fontSize: "13px",
    lineHeight: "1.5",
    margin: "0 0 14px 0",
  },

  activeMetaTags: {
    display: "flex",
    gap: "8px",
    marginBottom: "14px",
  },

  activeMetaPill: {
    background: "rgba(255,255,255,0.8)",
    color: "#6D597A",
    padding: "4px 8px",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: "800",
  },

  stopActiveBtn: {
    width: "100%",
    padding: "10px",
    border: "none",
    borderRadius: "14px",
    background: "rgba(49,34,68,0.08)",
    color: "#312244",
    fontWeight: "800",
    fontSize: "13px",
    cursor: "pointer",
  },

  companionCard: {
    borderRadius: "30px",
    background: "rgba(255,255,255,0.56)",
    border: "1px solid rgba(255,255,255,0.78)",
    boxShadow: "0 20px 45px rgba(49,34,68,0.13)",
    textAlign: "center",
  },

  companionIcon: {
    fontSize: "36px",
    marginBottom: "8px",
  },

  companionTitle: {
    color: "#312244",
    margin: "0 0 6px 0",
    fontWeight: "900",
    fontSize: "18px",
  },

  companionText: {
    color: "#6D597A",
    lineHeight: "1.5",
    margin: 0,
    fontSize: "13.5px",
  },

  tipCard: {
    borderRadius: "30px",
    background: "rgba(255,255,255,0.56)",
    border: "1px solid rgba(255,255,255,0.78)",
    boxShadow: "0 20px 45px rgba(49,34,68,0.13)",
    textAlign: "center",
  },

  tipIcon: {
    fontSize: "38px",
    marginBottom: "10px",
  },

  tipTitle: {
    color: "#312244",
    margin: "0 0 8px 0",
    fontWeight: "900",
  },

  tipText: {
    color: "#6D597A",
    lineHeight: "1.6",
    margin: 0,
    fontSize: "13.5px",
  },

  breathingCard: {
    borderRadius: "30px",
    background: "linear-gradient(135deg, rgba(255,255,255,0.75), rgba(243,232,255,0.65))",
    border: "1px solid rgba(255,255,255,0.85)",
    boxShadow: "0 20px 45px rgba(49,34,68,0.13)",
    textAlign: "center",
  },

  breathingIcon: {
    fontSize: "34px",
    marginBottom: "6px",
  },

  breathingTitle: {
    color: "#312244",
    margin: "0 0 14px 0",
    fontWeight: "900",
    fontSize: "17px",
  },

  breathingSteps: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "8px",
  },

  stepItem: {
    background: "rgba(255,255,255,0.8)",
    padding: "10px 6px",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },

  stepNum: {
    color: "#9B5DE5",
    fontSize: "16px",
    fontWeight: "900",
  },

  stepDesc: {
    color: "#6D597A",
    fontSize: "11px",
    fontWeight: "700",
  },

  bottomGrid: {
    display: "grid",
  },

  helpCard: {
    borderRadius: "30px",
    background: "rgba(255,255,255,0.56)",
    border: "1px solid rgba(255,255,255,0.78)",
    boxShadow: "0 20px 45px rgba(49,34,68,0.13)",
    textAlign: "center",
    cursor: "pointer",
    boxSizing: "border-box",
  },

  helpIcon: {
    width: "58px",
    height: "58px",
    margin: "0 auto 14px auto",
    borderRadius: "20px",
    background: "linear-gradient(135deg, #F3E8FF, #FFFFFF)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
  },

  helpTitle: {
    color: "#312244",
    margin: "0 0 8px 0",
    fontWeight: "900",
  },

  helpText: {
    color: "#6D597A",
    lineHeight: "1.6",
    margin: 0,
    fontSize: "14px",
  },

  helpLink: {
    margin: "14px 0 0 0",
    color: "#9B5DE5",
    fontSize: "13px",
    fontWeight: "900",
  },
};

export default CalmVideos;
