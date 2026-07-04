import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

function CalmVideos() {
  const navigate = useNavigate();

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
      thumbnail: "🌬️",
      color: "#A8DADC",
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
      thumbnail: "🧘‍♀️",
      color: "#CDB4DB",
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
      thumbnail: "🌙",
      color: "#B8C0FF",
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
      thumbnail: "🌿",
      color: "#CAFFBF",
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
      thumbnail: "☀️",
      color: "#FFD166",
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
      thumbnail: "💙",
      color: "#FFAFCC",
      videoUrl: "https://www.youtube.com/embed/odADwWzHR24",
      description:
        "A simple guided exercise to help manage sudden panic or emotional pressure.",
    },
  ];

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedVideo, setSelectedVideo] = useState(videos[0]);

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
    <div style={styles.page}>
      <div style={styles.circleOne}></div>
      <div style={styles.circleTwo}></div>
      <div style={styles.circleThree}></div>

      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <button
              style={styles.backButton}
              onClick={() => navigate("/dashboard")}
            >
              ← Back to Dashboard
            </button>

            <h1 style={styles.title}>Calm Videos</h1>
            <p style={styles.subtitle}>
              Watch relaxing videos for breathing, meditation, sleep, and stress
              relief.
            </p>
          </div>

          <div style={styles.headerBadge}>🎥 Calm Library</div>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🎬</div>
            <div>
              <h3 style={styles.statNumber}>{videos.length}</h3>
              <p style={styles.statText}>Total Videos</p>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>💜</div>
            <div>
              <h3 style={styles.statNumber}>
                {loadingFavorites ? "…" : favorites.length}
              </h3>
              <p style={styles.statText}>Favorites</p>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>🧘</div>
            <div>
              <h3 style={styles.statNumber}>
                {videos.filter((v) => v.category === "Meditation").length}
              </h3>
              <p style={styles.statText}>Meditations</p>
            </div>
          </div>
        </div>

        <div style={styles.mainGrid}>
          <div style={styles.leftPanel}>
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

            <div style={styles.videoList}>
              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  style={{
                    ...styles.videoCard,
                    border:
                      selectedVideo.id === video.id
                        ? "3px solid #9B5DE5"
                        : "1px solid rgba(255,255,255,0.75)",
                    background:
                      selectedVideo.id === video.id
                        ? "linear-gradient(145deg, #FFFFFF, #F3E8FF)"
                        : "rgba(255,255,255,0.64)",
                  }}
                  onClick={() => setSelectedVideo(video)}
                >
                  <div
                    style={{
                      ...styles.videoThumb,
                      backgroundColor: video.color,
                    }}
                  >
                    {video.thumbnail}
                  </div>

                  <div style={styles.videoInfo}>
                    <h3 style={styles.videoTitle}>{video.title}</h3>
                    <p style={styles.videoDescription}>{video.description}</p>

                    <div style={styles.videoMetaRow}>
                      <span style={styles.metaBadge}>⏱ {video.duration}</span>
                      <span style={styles.metaBadge}>✨ {video.level}</span>
                      <span style={styles.metaBadge}>🌈 {video.mood}</span>
                    </div>
                  </div>

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
                  >
                    {favorites.includes(video.id) ? "💜" : "🤍"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.rightPanel}>
            <div style={styles.playerCard}>
              <div style={styles.videoPlayer}>
                <iframe
                  style={styles.iframe}
                  src={selectedVideo.videoUrl}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>

              <h2 style={styles.playerTitle}>{selectedVideo.title}</h2>
              <p style={styles.playerDescription}>
                {selectedVideo.description}
              </p>

              <div style={styles.playerInfoGrid}>
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

            <div style={styles.tipCard}>
              <div style={styles.tipIcon}>💡</div>
              <h3 style={styles.tipTitle}>Calm Tip</h3>
              <p style={styles.tipText}>
                Find a quiet place, use headphones, breathe slowly, and avoid
                distractions while watching calm videos.
              </p>
            </div>
          </div>
        </div>

        <div style={styles.bottomGrid}>
          <div style={styles.helpCard} onClick={() => navigate("/mood")}>
            <div style={styles.helpIcon}>😊</div>
            <h3 style={styles.helpTitle}>Track Your Mood</h3>
            <p style={styles.helpText}>
              After watching a calm video, record how you feel.
            </p>
            <p style={styles.helpLink}>Go to Mood Tracker →</p>
          </div>

          <div style={styles.helpCard} onClick={() => navigate("/assessment")}>
            <div style={styles.helpIcon}>📝</div>
            <h3 style={styles.helpTitle}>Self Assessment</h3>
            <p style={styles.helpText}>
              Check your emotional wellness through a short self-assessment.
            </p>
            <p style={styles.helpLink}>Go to Assessment →</p>
          </div>

          <div style={styles.helpCard} onClick={() => navigate("/counselor")}>
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
    padding: "35px",
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
    alignItems: "center",
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
    fontSize: "42px",
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
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    marginBottom: "25px",
  },

  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "22px",
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
    gridTemplateColumns: "1.35fr 0.9fr",
    gap: "25px",
    marginBottom: "25px",
  },

  leftPanel: {
    background: "rgba(255,255,255,0.54)",
    border: "1px solid rgba(255,255,255,0.78)",
    borderRadius: "34px",
    padding: "30px",
    boxShadow: "0 25px 60px rgba(49,34,68,0.16)",
  },

  rightPanel: {
    display: "grid",
    gap: "25px",
  },

  sectionTitle: {
    color: "#312244",
    fontSize: "24px",
    margin: "0 0 7px 0",
    fontWeight: "900",
  },

  sectionSubText: {
    color: "#6D597A",
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
  },

  videoList: {
    display: "grid",
    gap: "16px",
  },

  videoCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "18px",
    borderRadius: "28px",
    boxShadow: "0 16px 34px rgba(49,34,68,0.11)",
    cursor: "pointer",
    transition: "0.3s ease",
    position: "relative",
  },

  videoThumb: {
    width: "82px",
    height: "82px",
    borderRadius: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "42px",
    flexShrink: 0,
  },

  videoInfo: {
    flex: 1,
  },

  videoTitle: {
    color: "#312244",
    fontSize: "19px",
    margin: "0 0 6px 0",
    fontWeight: "900",
  },

  videoDescription: {
    color: "#6D597A",
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
    background: "rgba(255,255,255,0.72)",
    color: "#6D597A",
    padding: "6px 10px",
    borderRadius: "14px",
    fontSize: "12px",
    fontWeight: "800",
  },

  favoriteButton: {
    border: "none",
    background: "rgba(255,255,255,0.76)",
    width: "42px",
    height: "42px",
    borderRadius: "16px",
    cursor: "pointer",
    fontSize: "20px",
  },

  playerCard: {
    background: "rgba(255,255,255,0.54)",
    border: "1px solid rgba(255,255,255,0.78)",
    borderRadius: "34px",
    padding: "30px",
    boxShadow: "0 25px 60px rgba(49,34,68,0.16)",
    textAlign: "center",
  },

  videoPlayer: {
    height: "245px",
    borderRadius: "32px",
    overflow: "hidden",
    marginBottom: "22px",
    background: "#000",
    boxShadow: "0 18px 35px rgba(49,34,68,0.18)",
  },

  iframe: {
    width: "100%",
    height: "100%",
    border: "none",
  },

  playerTitle: {
    color: "#312244",
    margin: "0 0 8px 0",
    fontWeight: "900",
    fontSize: "26px",
  },

  playerDescription: {
    color: "#6D597A",
    lineHeight: "1.6",
    margin: "0 0 18px 0",
  },

  playerInfoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
    marginBottom: "18px",
  },

  infoBox: {
    background: "rgba(255,255,255,0.7)",
    borderRadius: "18px",
    padding: "13px",
  },

  infoLabel: {
    display: "block",
    color: "#8D7D99",
    fontSize: "12px",
    marginBottom: "5px",
    fontWeight: "800",
  },

  infoValue: {
    color: "#312244",
    fontSize: "14px",
  },

  primaryButton: {
    width: "100%",
    padding: "16px",
    border: "none",
    borderRadius: "24px",
    background: "linear-gradient(135deg, #9B5DE5, #F15BB5)",
    color: "white",
    fontSize: "16px",
    fontWeight: "900",
    cursor: "pointer",
    boxShadow: "0 18px 35px rgba(155,93,229,0.35)",
  },

  tipCard: {
    padding: "25px",
    borderRadius: "30px",
    background: "rgba(255,255,255,0.56)",
    border: "1px solid rgba(255,255,255,0.78)",
    boxShadow: "0 20px 45px rgba(49,34,68,0.13)",
    textAlign: "center",
  },

  tipIcon: {
    fontSize: "42px",
    marginBottom: "12px",
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
    fontSize: "14px",
  },

  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
  },

  helpCard: {
    padding: "25px",
    borderRadius: "30px",
    background: "rgba(255,255,255,0.56)",
    border: "1px solid rgba(255,255,255,0.78)",
    boxShadow: "0 20px 45px rgba(49,34,68,0.13)",
    textAlign: "center",
    cursor: "pointer",
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