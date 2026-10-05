import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import moodBg from "../assets/mood-bg.jpeg";

// ------------------------------------------------------------------
// 3D emoji images (Microsoft Fluent Emoji 3D - MIT licence)
// If an image fails to load, the normal emoji is shown instead.
// ------------------------------------------------------------------
const EMOJI_BASE =
  "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets";

const EMOJI_MAP = {
  wind: { folder: "Wind face", file: "wind_face", fallback: "🌬️" },
  lotus: { folder: "Lotus", file: "lotus", fallback: "🧘‍♀️" },
  moon: { folder: "Crescent moon", file: "crescent_moon", fallback: "🌙" },
  herb: { folder: "Herb", file: "herb", fallback: "🌿" },
  sun: { folder: "Sun", file: "sun", fallback: "☀️" },
  blueheart: { folder: "Blue heart", file: "blue_heart", fallback: "💙" },
  movie: { folder: "Movie camera", file: "movie_camera", fallback: "🎥" },
  clapper: { folder: "Clapper board", file: "clapper_board", fallback: "🎬" },
  purpleheart: { folder: "Purple heart", file: "purple_heart", fallback: "💜" },
  whiteheart: { folder: "White heart", file: "white_heart", fallback: "🤍" },
  bulb: { folder: "Light bulb", file: "light_bulb", fallback: "💡" },
  timer: { folder: "Stopwatch", file: "stopwatch", fallback: "⏱️" },
  sparkles: { folder: "Sparkles", file: "sparkles", fallback: "✨" },
  rainbow: { folder: "Rainbow", file: "rainbow", fallback: "🌈" },
};

function Emoji3D({ name, size = 32, style = {} }) {
  const [failed, setFailed] = useState(false);
  const item = EMOJI_MAP[name];
  if (!item) return null;

  if (failed) {
    return (
      <span
        style={{
          fontSize: `${size * 0.85}px`,
          lineHeight: 1,
          display: "inline-block",
          ...style,
        }}
      >
        {item.fallback}
      </span>
    );
  }

  const url = `${EMOJI_BASE}/${encodeURIComponent(item.folder)}/3D/${item.file}_3d.png`;

  return (
    <img
      src={url}
      alt={item.fallback}
      width={size}
      height={size}
      loading="lazy"
      draggable={false}
      onError={() => setFailed(true)}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: "contain",
        display: "inline-block",
        verticalAlign: "middle",
        filter: "drop-shadow(0 4px 6px rgba(58,53,82,0.22))",
        ...style,
      }}
    />
  );
}

// Theme colors picked from mood-bg.jpeg
const ACTIVE_GRADIENT = "linear-gradient(135deg, #7F9BD6, #B38BC9)";

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
    {
      id: 1,
      title: "5 Minute Calm Breathing",
      category: "Breathing",
      duration: "5 min",
      level: "Beginner",
      mood: "Anxiety Relief",
      emoji: "wind",
      color: "#CFE3EE",
      videoUrl: "https://www.youtube.com/embed/inpok4MKVLM",
      description:
        "A short breathing session to calm your mind and reduce nervous feelings.",
    },
    {
      id: 2,
      title: "Peaceful Mind Meditation",
      category: "Meditation",
      duration: "10 min",
      level: "Easy",
      mood: "Relaxation",
      emoji: "lotus",
      color: "#DCCFEA",
      videoUrl: "https://www.youtube.com/embed/ZToicYcHIOU",
      description:
        "A gentle meditation video to help you feel peaceful and balanced.",
    },
    {
      id: 3,
      title: "Deep Sleep Relaxation",
      category: "Sleep",
      duration: "15 min",
      level: "Calm",
      mood: "Better Sleep",
      emoji: "moon",
      color: "#C9D2F2",
      videoUrl: "https://www.youtube.com/embed/aEqlQvczMJQ",
      description:
        "Relax your body and mind before sleep with soft guided relaxation.",
    },
    {
      id: 4,
      title: "Stress Relief Nature Session",
      category: "Stress Relief",
      duration: "8 min",
      level: "Easy",
      mood: "Stress Free",
      emoji: "herb",
      color: "#CFEBDD",
      videoUrl: "https://www.youtube.com/embed/lFcSrYw-ARY",
      description:
        "A calming nature-inspired session to help release daily stress.",
    },
    {
      id: 5,
      title: "Positive Energy Morning Calm",
      category: "Meditation",
      duration: "7 min",
      level: "Beginner",
      mood: "Positive Start",
      emoji: "sun",
      color: "#F8DDC9",
      videoUrl: "https://www.youtube.com/embed/ssss7V1_eyA",
      description:
        "Start your day with calm thoughts, positive energy, and self-kindness.",
    },
    {
      id: 6,
      title: "Quick Panic Control Exercise",
      category: "Breathing",
      duration: "4 min",
      level: "Quick",
      mood: "Panic Relief",
      emoji: "blueheart",
      color: "#F6D5DC",
      videoUrl: "https://www.youtube.com/embed/odADwWzHR24",
      description:
        "A simple guided exercise to help manage sudden panic or emotional pressure.",
    },
  ];

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedVideo, setSelectedVideo] = useState(videos[0]);

  // ===========================
  // Responsive (mobile) detection
  // Uses ResizeObserver on the actual page container width instead of
  // window.innerWidth, so it works correctly inside the locked-width
  // ".app-screen" phone frame too.
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

      // Expecting something like [{ videoId: 1 }, { videoId: 3 }]
      // or just [1, 3] — handle both shapes.
      const ids = (res.data || []).map((item) =>
        typeof item === "object" ? item.videoId : item
      );

      setFavorites(ids);
    } catch (err) {
      console.log(err);
      // If the endpoint isn't available yet, favorites just
      // won't persist — the rest of the page still works.
    } finally {
      setLoadingFavorites(false);
    }
  };

  const filteredVideos =
    selectedCategory === "All"
      ? videos
      : videos.filter((video) => video.category === selectedCategory);

  const toggleFavorite = async (id) => {
    const isFavorited = favorites.includes(id);

    // Optimistic UI update.
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

      // Roll back if the save failed.
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
      style={{
        ...styles.page,
        padding: isMobile ? "16px" : "35px",
        backgroundImage: `linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.12)), url(${moodBg})`,
      }}
    >
      <div style={styles.container}>
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
              Watch relaxing videos for breathing, meditation, sleep, and stress
              relief.
            </p>
          </div>

          {!isMobile && (
            <div style={styles.headerBadge}>
              <Emoji3D name="movie" size={26} />
              <span>Calm Library</span>
            </div>
          )}
        </div>

        <div
          style={{
            ...styles.statsGrid,
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
            gap: isMobile ? "12px" : "20px",
          }}
        >
          <div style={{ ...styles.statCard, padding: isMobile ? "14px" : "22px" }}>
            <div style={styles.statIcon}>
              <Emoji3D name="clapper" size={isMobile ? 32 : 38} />
            </div>
            <div>
              <h3 style={styles.statNumber}>{videos.length}</h3>
              <p style={styles.statText}>Total Videos</p>
            </div>
          </div>

          <div style={{ ...styles.statCard, padding: isMobile ? "14px" : "22px" }}>
            <div style={styles.statIcon}>
              <Emoji3D name="purpleheart" size={isMobile ? 32 : 38} />
            </div>
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
            <div style={styles.statIcon}>
              <Emoji3D name="lotus" size={isMobile ? 32 : 38} />
            </div>
            <div>
              <h3 style={styles.statNumber}>
                {videos.filter((v) => v.category === "Meditation").length}
              </h3>
              <p style={styles.statText}>Meditations</p>
            </div>
          </div>
        </div>

        <div
          style={{
            ...styles.mainGrid,
            gridTemplateColumns: isMobile ? "1fr" : "1.35fr 0.9fr",
            gap: isMobile ? "18px" : "25px",
          }}
        >
          <div style={{ ...styles.leftPanel, padding: isMobile ? "18px" : "30px" }}>
            <h2 style={styles.sectionTitle}>Video Categories</h2>
            <p style={styles.sectionSubText}>
              Select a category and choose a session.
            </p>

            <div style={styles.categoryRow}>
              {videoCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    ...styles.categoryButton,
                    background:
                      selectedCategory === category
                        ? ACTIVE_GRADIENT
                        : "rgba(255,255,255,0.7)",
                    color:
                      selectedCategory === category ? "#FFFFFF" : "#3A3552",
                  }}
                >
                  {category}
                </button>
              ))}
            </div>

            <div style={styles.videoList}>
              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  style={{
                    ...styles.videoCard,
                    flexDirection: isMobile ? "column" : "row",
                    alignItems: isMobile ? "flex-start" : "center",
                    padding: isMobile ? "16px" : "18px",
                    border:
                      selectedVideo.id === video.id
                        ? "3px solid #7F9BD6"
                        : "1px solid rgba(255,255,255,0.78)",
                    background:
                      selectedVideo.id === video.id
                        ? "linear-gradient(145deg, #FFFFFF, #EEF0FB)"
                        : "rgba(255,255,255,0.66)",
                  }}
                  onClick={() => setSelectedVideo(video)}
                >
                  <div
                    style={{
                      ...styles.videoThumb,
                      width: isMobile ? "64px" : "82px",
                      height: isMobile ? "64px" : "82px",
                      backgroundColor: video.color,
                    }}
                  >
                    <Emoji3D name={video.emoji} size={isMobile ? 40 : 52} />
                  </div>

                  <div style={styles.videoInfo}>
                    <h3 style={styles.videoTitle}>{video.title}</h3>
                    <p style={styles.videoDescription}>{video.description}</p>

                    <div style={styles.videoMetaRow}>
                      <span style={styles.metaBadge}>
                        <Emoji3D name="timer" size={14} />
                        <span>{video.duration}</span>
                      </span>
                      <span style={styles.metaBadge}>
                        <Emoji3D name="sparkles" size={14} />
                        <span>{video.level}</span>
                      </span>
                      <span style={styles.metaBadge}>
                        <Emoji3D name="rainbow" size={14} />
                        <span>{video.mood}</span>
                      </span>
                    </div>
                  </div>

                  <button
                    style={{
                      ...styles.favoriteButton,
                      opacity: savingFavoriteId === video.id ? 0.5 : 1,
                      position: isMobile ? "absolute" : "static",
                      top: isMobile ? "16px" : "auto",
                      right: isMobile ? "16px" : "auto",
                    }}
                    disabled={savingFavoriteId === video.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(video.id);
                    }}
                  >
                    <Emoji3D
                      name={favorites.includes(video.id) ? "purpleheart" : "whiteheart"}
                      size={24}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.rightPanel}>
            <div style={{ ...styles.playerCard, padding: isMobile ? "18px" : "30px" }}>
              <div style={{ ...styles.videoPlayer, height: isMobile ? "200px" : "245px" }}>
                <iframe
                  style={styles.iframe}
                  src={selectedVideo.videoUrl}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>

              <h2 style={{ ...styles.playerTitle, fontSize: isMobile ? "21px" : "26px" }}>
                {selectedVideo.title}
              </h2>
              <p style={styles.playerDescription}>
                {selectedVideo.description}
              </p>

              <div
                style={{
                  ...styles.playerInfoGrid,
                  gridTemplateColumns: isMobile ? "1fr 1fr 1fr" : "repeat(3, 1fr)",
                  gap: isMobile ? "8px" : "10px",
                }}
              >
                <div style={styles.infoBox}>
                  <span style={styles.infoLabel}>Category</span>
                  <strong style={styles.infoValue}>
                    {selectedVideo.category}
                  </strong>
                </div>

                <div style={styles.infoBox}>
                  <span style={styles.infoLabel}>Duration</span>
                  <strong style={styles.infoValue}>
                    {selectedVideo.duration}
                  </strong>
                </div>

                <div style={styles.infoBox}>
                  <span style={styles.infoLabel}>Level</span>
                  <strong style={styles.infoValue}>{selectedVideo.level}</strong>
                </div>
              </div>

              <button
                style={{
                  ...styles.primaryButton,
                  opacity: savingFavoriteId === selectedVideo.id ? 0.7 : 1,
                }}
                disabled={savingFavoriteId === selectedVideo.id}
                onClick={() => toggleFavorite(selectedVideo.id)}
              >
                {favorites.includes(selectedVideo.id)
                  ? "Remove from Favorites"
                  : "Add to Favorites"}
              </button>
            </div>

            <div style={{ ...styles.tipCard, padding: isMobile ? "18px" : "25px" }}>
              <div style={styles.tipIcon}>
                <Emoji3D name="bulb" size={48} />
              </div>
              <h3 style={styles.tipTitle}>Calm Tip</h3>
              <p style={styles.tipText}>
                Find a quiet place, use headphones, breathe slowly, and avoid
                distractions while watching calm videos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    // mood-bg.jpeg is applied inline (backgroundImage) in the component
    backgroundColor: "#B9B4CE",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    fontFamily: "Arial, sans-serif",
    position: "relative",
    overflowX: "hidden",
    boxSizing: "border-box",
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
    background: "rgba(255,255,255,0.72)",
    color: "#5B5A8F",
    fontWeight: "800",
    cursor: "pointer",
    marginBottom: "12px",
    boxShadow: "0 10px 24px rgba(58,53,82,0.14)",
  },

  title: {
    color: "#2F2B45",
    margin: "0 0 7px 0",
    fontWeight: "900",
  },

  subtitle: {
    color: "#474463",
    fontSize: "16px",
    margin: 0,
    lineHeight: "1.5",
  },

  headerBadge: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "11px 22px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.62)",
    boxShadow: "0 12px 25px rgba(58,53,82,0.16)",
    color: "#4A4770",
    fontWeight: "800",
    backdropFilter: "blur(14px)",
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
    background: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(255,255,255,0.8)",
    backdropFilter: "blur(18px)",
    boxShadow: "0 20px 45px rgba(58,53,82,0.16)",
  },

  statIcon: {
    width: "62px",
    height: "62px",
    borderRadius: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #EEF0FB, #FFFFFF)",
    boxShadow: "0 12px 24px rgba(58,53,82,0.14)",
    flexShrink: 0,
  },

  statNumber: {
    color: "#3A3552",
    margin: "0 0 4px 0",
    fontSize: "28px",
    fontWeight: "900",
  },

  statText: {
    color: "#5E5A78",
    margin: 0,
    fontSize: "14px",
    fontWeight: "700",
  },

  mainGrid: {
    display: "grid",
    marginBottom: "25px",
  },

  leftPanel: {
    background: "rgba(255,255,255,0.6)",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.8)",
    borderRadius: "34px",
    boxShadow: "0 25px 60px rgba(58,53,82,0.18)",
  },

  rightPanel: {
    display: "grid",
    gap: "25px",
    alignContent: "start",
  },

  sectionTitle: {
    color: "#3A3552",
    fontSize: "24px",
    margin: "0 0 7px 0",
    fontWeight: "900",
  },

  sectionSubText: {
    color: "#5E5A78",
    margin: "0 0 22px 0",
    lineHeight: "1.5",
    fontSize: "14px",
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
    boxShadow: "0 10px 20px rgba(58,53,82,0.1)",
  },

  videoList: {
    display: "grid",
    gap: "16px",
  },

  videoCard: {
    display: "flex",
    gap: "16px",
    borderRadius: "28px",
    boxShadow: "0 16px 34px rgba(58,53,82,0.12)",
    cursor: "pointer",
    transition: "0.3s ease",
    position: "relative",
    boxSizing: "border-box",
  },

  videoThumb: {
    borderRadius: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 10px 22px rgba(58,53,82,0.14)",
  },

  videoInfo: {
    flex: 1,
    minWidth: 0,
  },

  videoTitle: {
    color: "#3A3552",
    fontSize: "19px",
    margin: "0 0 6px 0",
    fontWeight: "900",
    paddingRight: "36px",
  },

  videoDescription: {
    color: "#5E5A78",
    margin: "0 0 10px 0",
    lineHeight: "1.5",
    fontSize: "14px",
  },

  videoMetaRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  metaBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    background: "rgba(238,236,250,0.85)",
    color: "#5E5A78",
    padding: "6px 10px",
    borderRadius: "14px",
    fontSize: "12px",
    fontWeight: "800",
  },

  favoriteButton: {
    border: "none",
    background: "rgba(255,255,255,0.82)",
    width: "42px",
    height: "42px",
    borderRadius: "16px",
    cursor: "pointer",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    boxShadow: "0 8px 18px rgba(58,53,82,0.12)",
  },

  playerCard: {
    background: "rgba(255,255,255,0.6)",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.8)",
    borderRadius: "34px",
    boxShadow: "0 25px 60px rgba(58,53,82,0.18)",
    textAlign: "center",
  },

  videoPlayer: {
    borderRadius: "32px",
    overflow: "hidden",
    marginBottom: "22px",
    background: "#000",
    boxShadow: "0 18px 35px rgba(58,53,82,0.22)",
  },

  iframe: {
    width: "100%",
    height: "100%",
    border: "none",
  },

  playerTitle: {
    color: "#3A3552",
    margin: "0 0 8px 0",
    fontWeight: "900",
  },

  playerDescription: {
    color: "#5E5A78",
    lineHeight: "1.6",
    margin: "0 0 18px 0",
  },

  playerInfoGrid: {
    display: "grid",
    marginBottom: "18px",
  },

  infoBox: {
    background: "rgba(238,236,250,0.8)",
    borderRadius: "18px",
    padding: "13px",
    minWidth: 0,
  },

  infoLabel: {
    display: "block",
    color: "#7A7694",
    fontSize: "12px",
    marginBottom: "5px",
    fontWeight: "800",
  },

  infoValue: {
    color: "#3A3552",
    fontSize: "14px",
    wordBreak: "break-word",
  },

  primaryButton: {
    width: "100%",
    padding: "16px",
    border: "none",
    borderRadius: "24px",
    background: "linear-gradient(135deg, #7F9BD6, #B38BC9)",
    color: "white",
    fontSize: "16px",
    fontWeight: "900",
    cursor: "pointer",
    boxShadow: "0 18px 35px rgba(127,155,214,0.4)",
  },

  tipCard: {
    borderRadius: "30px",
    background: "rgba(255,255,255,0.6)",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.8)",
    boxShadow: "0 20px 45px rgba(58,53,82,0.16)",
    textAlign: "center",
  },

  tipIcon: {
    marginBottom: "12px",
  },

  tipTitle: {
    color: "#3A3552",
    margin: "0 0 8px 0",
    fontWeight: "900",
  },

  tipText: {
    color: "#5E5A78",
    lineHeight: "1.6",
    margin: 0,
    fontSize: "14px",
  },
};

export default CalmVideos;