import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Music() {
  const navigate = useNavigate();

  const categories = [
    "All",
    "Relax",
    "Sleep",
    "Focus",
    "Nature",
    "Meditation",
    "Stress Relief",
  ];

  const tracks = [
    {
      id: 1,
      title: "Soft Morning Calm",
      artist: "Calm Piano",
      category: "Relax",
      duration: "10 min",
      mood: "Peaceful",
      icon: "🌅",
      color: "#FFD166",
      videoUrl: "https://www.youtube.com/embed/2OEL4P1Rz04",
    },
    {
      id: 2,
      title: "Deep Sleep Waves",
      artist: "Sleep Music",
      category: "Sleep",
      duration: "1 hr",
      mood: "Sleep",
      icon: "🌙",
      color: "#B8C0FF",
      videoUrl: "https://www.youtube.com/embed/1ZYbU82GVz4",
    },
    {
      id: 3,
      title: "Forest Breathing",
      artist: "Nature Sounds",
      category: "Nature",
      duration: "30 min",
      mood: "Fresh",
      icon: "🌲",
      color: "#CAFFBF",
      videoUrl: "https://www.youtube.com/embed/eKFTSSKCzWA",
    },
    {
      id: 4,
      title: "Study Focus Flow",
      artist: "Focus Music",
      category: "Focus",
      duration: "1 hr",
      mood: "Focus",
      icon: "📚",
      color: "#A8DADC",
      videoUrl: "https://www.youtube.com/embed/jfKfPfyJRdk",
    },
    {
      id: 5,
      title: "Rainy Window",
      artist: "Rain Sounds",
      category: "Nature",
      duration: "1 hr",
      mood: "Calm",
      icon: "🌧️",
      color: "#CDB4DB",
      videoUrl: "https://www.youtube.com/embed/mPZkdNFkNps",
    },
    {
      id: 6,
      title: "Meditation Bell",
      artist: "Zen Music",
      category: "Meditation",
      duration: "20 min",
      mood: "Mindful",
      icon: "🔔",
      color: "#FFC8DD",
      videoUrl: "https://www.youtube.com/embed/inpok4MKVLM",
    },
    {
      id: 7,
      title: "Ocean Peace",
      artist: "Ocean Waves",
      category: "Relax",
      duration: "1 hr",
      mood: "Relaxed",
      icon: "🌊",
      color: "#A8DADC",
      videoUrl: "https://www.youtube.com/embed/V1RPi2MYptM",
    },
    {
      id: 8,
      title: "Anxiety Relief Tune",
      artist: "Calm Lab",
      category: "Stress Relief",
      duration: "15 min",
      mood: "Relief",
      icon: "💙",
      color: "#FFAFCC",
      videoUrl: "https://www.youtube.com/embed/O-6f5wQXSu8",
    },
    {
      id: 9,
      title: "Night Sky Lullaby",
      artist: "Sleep Therapy",
      category: "Sleep",
      duration: "1 hr",
      mood: "Dreamy",
      icon: "✨",
      color: "#B8C0FF",
      videoUrl: "https://www.youtube.com/embed/aEqlQvczMJQ",
    },
    {
      id: 10,
      title: "Gentle Piano Light",
      artist: "Soft Piano",
      category: "Relax",
      duration: "30 min",
      mood: "Soft",
      icon: "🎹",
      color: "#FFD6A5",
      videoUrl: "https://www.youtube.com/embed/lFcSrYw-ARY",
    },
    {
      id: 11,
      title: "Mindful Breath",
      artist: "Breathing Music",
      category: "Meditation",
      duration: "10 min",
      mood: "Balanced",
      icon: "🧘‍♀️",
      color: "#CDB4DB",
      videoUrl: "https://www.youtube.com/embed/ZToicYcHIOU",
    },
    {
      id: 12,
      title: "Calm River Flow",
      artist: "Nature Calm",
      category: "Nature",
      duration: "1 hr",
      mood: "Flow",
      icon: "🏞️",
      color: "#CAFFBF",
      videoUrl: "https://www.youtube.com/embed/IvjMgVS6kng",
    },
    {
      id: 13,
      title: "Focus White Noise",
      artist: "Focus Beats",
      category: "Focus",
      duration: "1 hr",
      mood: "Clear",
      icon: "🎧",
      color: "#A8DADC",
      videoUrl: "https://www.youtube.com/embed/nMfPqeZjc2c",
    },
    {
      id: 14,
      title: "Stress Release Harmony",
      artist: "Healing Music",
      category: "Stress Relief",
      duration: "30 min",
      mood: "Free",
      icon: "🌿",
      color: "#CAFFBF",
      videoUrl: "https://www.youtube.com/embed/ssss7V1_eyA",
    },
    {
      id: 15,
      title: "Moonlight Sleep",
      artist: "Deep Sleep",
      category: "Sleep",
      duration: "1 hr",
      mood: "Rest",
      icon: "🌌",
      color: "#B8C0FF",
      videoUrl: "https://www.youtube.com/embed/77ZozI0rw7w",
    },
    {
      id: 16,
      title: "Positive Energy Beat",
      artist: "Morning Calm",
      category: "Relax",
      duration: "20 min",
      mood: "Happy",
      icon: "☀️",
      color: "#FFD166",
      videoUrl: "https://www.youtube.com/embed/hlWiI4xVXKY",
    },
    {
      id: 17,
      title: "Deep Meditation Pad",
      artist: "Zen Mind",
      category: "Meditation",
      duration: "1 hr",
      mood: "Deep",
      icon: "🪷",
      color: "#CDB4DB",
      videoUrl: "https://www.youtube.com/embed/DbDoBzGY3vo",
    },
    {
      id: 18,
      title: "Birdsong Morning",
      artist: "Nature Calm",
      category: "Nature",
      duration: "30 min",
      mood: "Fresh",
      icon: "🐦",
      color: "#CAFFBF",
      videoUrl: "https://www.youtube.com/embed/xNN7iTA57jM",
    },
    {
      id: 19,
      title: "Exam Focus Calm",
      artist: "Study Music",
      category: "Focus",
      duration: "1 hr",
      mood: "Study",
      icon: "📝",
      color: "#A8DADC",
      videoUrl: "https://www.youtube.com/embed/WPni755-Krg",
    },
    {
      id: 20,
      title: "Heart Relax Melody",
      artist: "Soft Healing",
      category: "Stress Relief",
      duration: "30 min",
      mood: "Comfort",
      icon: "🤍",
      color: "#FFC8DD",
      videoUrl: "https://www.youtube.com/embed/odADwWzHR24",
    },
    {
      id: 21,
      title: "Quiet Room Ambience",
      artist: "Ambient Focus",
      category: "Focus",
      duration: "1 hr",
      mood: "Quiet",
      icon: "🕯️",
      color: "#FFD6A5",
      videoUrl: "https://www.youtube.com/embed/5qap5aO4i9A",
    },
    {
      id: 22,
      title: "Peaceful Garden",
      artist: "Garden Sounds",
      category: "Nature",
      duration: "30 min",
      mood: "Natural",
      icon: "🌷",
      color: "#CAFFBF",
      videoUrl: "https://www.youtube.com/embed/xNN7iTA57jM",
    },
    {
      id: 23,
      title: "Soft Sleep Piano",
      artist: "Piano Sleep",
      category: "Sleep",
      duration: "1 hr",
      mood: "Relax",
      icon: "🎼",
      color: "#B8C0FF",
      videoUrl: "https://www.youtube.com/embed/1ZYbU82GVz4",
    },
    {
      id: 24,
      title: "Healing Sound Bath",
      artist: "Healing Frequency",
      category: "Meditation",
      duration: "1 hr",
      mood: "Healing",
      icon: "🌀",
      color: "#CDB4DB",
      videoUrl: "https://www.youtube.com/embed/txQ6t4yPIM0",
    },
    {
      id: 25,
      title: "Calm Guitar Strings",
      artist: "Guitar Relax",
      category: "Relax",
      duration: "30 min",
      mood: "Warm",
      icon: "🎸",
      color: "#FFD166",
      videoUrl: "https://www.youtube.com/embed/5yx6BWlEVcY",
    },
    {
      id: 26,
      title: "Relaxed Rain Sleep",
      artist: "Rain Sounds",
      category: "Sleep",
      duration: "1 hr",
      mood: "Sleepy",
      icon: "☔",
      color: "#B8C0FF",
      videoUrl: "https://www.youtube.com/embed/mPZkdNFkNps",
    },
    {
      id: 27,
      title: "Stress Away Pulse",
      artist: "Stress Relief",
      category: "Stress Relief",
      duration: "20 min",
      mood: "Relief",
      icon: "💆‍♀️",
      color: "#FFAFCC",
      videoUrl: "https://www.youtube.com/embed/O-6f5wQXSu8",
    },
    {
      id: 28,
      title: "Minimal Focus Beats",
      artist: "Lo-Fi Focus",
      category: "Focus",
      duration: "1 hr",
      mood: "Productive",
      icon: "💻",
      color: "#A8DADC",
      videoUrl: "https://www.youtube.com/embed/jfKfPfyJRdk",
    },
    {
      id: 29,
      title: "Sunset Meditation",
      artist: "MindCare Studio",
      category: "Meditation",
      duration: "30 min",
      mood: "Peace",
      icon: "🌇",
      color: "#CDB4DB",
      videoUrl: "https://www.youtube.com/embed/ZToicYcHIOU",
    },
    {
      id: 30,
      title: "Nature Mind Reset",
      artist: "Nature Calm",
      category: "Nature",
      duration: "30 min",
      mood: "Reset",
      icon: "🍃",
      color: "#CAFFBF",
      videoUrl: "https://www.youtube.com/embed/eKFTSSKCzWA",
    },
  ];

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTrack, setSelectedTrack] = useState(tracks[0]);
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTracks = tracks.filter((track) => {
    const categoryMatch =
      selectedCategory === "All" || track.category === selectedCategory;

    const search = searchTerm.toLowerCase();
    const searchMatch =
      track.title.toLowerCase().includes(search) ||
      track.artist.toLowerCase().includes(search) ||
      track.category.toLowerCase().includes(search) ||
      track.mood.toLowerCase().includes(search);

    return categoryMatch && searchMatch;
  });

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const nextTrack = () => {
    const index = tracks.findIndex((item) => item.id === selectedTrack.id);
    const nextIndex = (index + 1) % tracks.length;
    setSelectedTrack(tracks[nextIndex]);
  };

  const previousTrack = () => {
    const index = tracks.findIndex((item) => item.id === selectedTrack.id);
    const previousIndex = index === 0 ? tracks.length - 1 : index - 1;
    setSelectedTrack(tracks[previousIndex]);
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
            <h1 style={styles.title}>Calm Music</h1>
            <p style={styles.subtitle}>
              Listen to relaxing YouTube music for sleep, focus, meditation,
              nature calm, and stress relief.
            </p>
          </div>

          <div style={styles.headerBadge}>🎧 YouTube Music Library</div>
        </div>

        <div style={styles.heroCard}>
          <div>
            <h2 style={styles.heroTitle}>Find music that matches your mood</h2>
            <p style={styles.heroText}>
              Choose from 30 calm music sessions. No MP3 files needed. Music
              plays through embedded YouTube player.
            </p>
          </div>
          <div style={styles.heroIcon}>🎶</div>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🎵</div>
            <div>
              <h3 style={styles.statNumber}>{tracks.length}</h3>
              <p style={styles.statText}>Total Tracks</p>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>💜</div>
            <div>
              <h3 style={styles.statNumber}>{favorites.length}</h3>
              <p style={styles.statText}>Favorites</p>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>🌙</div>
            <div>
              <h3 style={styles.statNumber}>
                {tracks.filter((item) => item.category === "Sleep").length}
              </h3>
              <p style={styles.statText}>Sleep Tracks</p>
            </div>
          </div>
        </div>

        <div style={styles.mainGrid}>
          <div style={styles.leftPanel}>
            <div style={styles.panelHeader}>
              <div>
                <h2 style={styles.sectionTitle}>Music Library</h2>
                <p style={styles.sectionSubText}>
                  Search, filter, and select a calm YouTube music session.
                </p>
              </div>
              <div style={styles.panelIcon}>🎼</div>
            </div>

            <div style={styles.searchBox}>
              <span style={styles.searchIcon}>🔍</span>
              <input
                style={styles.searchInput}
                type="text"
                placeholder="Search music, artist, mood..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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

            <div style={styles.trackList}>
              {filteredTracks.map((track) => (
                <div
                  key={track.id}
                  style={{
                    ...styles.trackCard,
                    border:
                      selectedTrack.id === track.id
                        ? "3px solid #9B5DE5"
                        : "1px solid rgba(255,255,255,0.75)",
                    background:
                      selectedTrack.id === track.id
                        ? "linear-gradient(145deg, #FFFFFF, #F3E8FF)"
                        : "rgba(255,255,255,0.64)",
                  }}
                  onClick={() => setSelectedTrack(track)}
                >
                  <div
                    style={{
                      ...styles.trackIcon,
                      backgroundColor: track.color,
                    }}
                  >
                    {track.icon}
                  </div>

                  <div style={styles.trackInfo}>
                    <h3 style={styles.trackTitle}>{track.title}</h3>
                    <p style={styles.trackArtist}>{track.artist}</p>
                    <div style={styles.trackMetaRow}>
                      <span style={styles.metaBadge}>⏱ {track.duration}</span>
                      <span style={styles.metaBadge}>🎧 {track.category}</span>
                      <span style={styles.metaBadge}>🌈 {track.mood}</span>
                    </div>
                  </div>

                  <button
                    style={styles.favoriteButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(track.id);
                    }}
                  >
                    {favorites.includes(track.id) ? "💜" : "🤍"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.rightPanel}>
            <div style={styles.playerCard}>
              <div style={styles.youtubeBox}>
                <iframe
                  style={styles.iframe}
                  src={selectedTrack.videoUrl}
                  title={selectedTrack.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>

              <h2 style={styles.playerTitle}>{selectedTrack.title}</h2>
              <p style={styles.playerArtist}>{selectedTrack.artist}</p>

              <div style={styles.nowPlayingBadge}>YouTube Music Player</div>

              <div style={styles.controls}>
                <button style={styles.controlButton} onClick={previousTrack}>
                  ⏮
                </button>
                <button style={styles.playButton}>▶</button>
                <button style={styles.controlButton} onClick={nextTrack}>
                  ⏭
                </button>
              </div>

              <div style={styles.playerInfoGrid}>
                <div style={styles.infoBox}>
                  <span style={styles.infoLabel}>Category</span>
                  <strong style={styles.infoValue}>
                    {selectedTrack.category}
                  </strong>
                </div>
                <div style={styles.infoBox}>
                  <span style={styles.infoLabel}>Duration</span>
                  <strong style={styles.infoValue}>
                    {selectedTrack.duration}
                  </strong>
                </div>
                <div style={styles.infoBox}>
                  <span style={styles.infoLabel}>Mood</span>
                  <strong style={styles.infoValue}>{selectedTrack.mood}</strong>
                </div>
              </div>

              <button
                style={styles.primaryButton}
                onClick={() => toggleFavorite(selectedTrack.id)}
              >
                {favorites.includes(selectedTrack.id)
                  ? "Remove from Favorites"
                  : "Add to Favorites"}
              </button>
            </div>

            <div style={styles.playlistCard}>
              <h3 style={styles.playlistTitle}>Suggested Playlist</h3>

              <div style={styles.playlistItem}>
                <span>🌙</span>
                <div>
                  <strong>Sleep Calm</strong>
                  <p>Deep sleep and night relaxation</p>
                </div>
              </div>

              <div style={styles.playlistItem}>
                <span>📚</span>
                <div>
                  <strong>Study Focus</strong>
                  <p>Soft focus music for learning</p>
                </div>
              </div>

              <div style={styles.playlistItem}>
                <span>🌿</span>
                <div>
                  <strong>Nature Peace</strong>
                  <p>Forest, river, rain and ocean sounds</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.bottomGrid}>
          <div style={styles.helpCard} onClick={() => navigate("/videos")}>
            <div style={styles.helpIcon}>🎥</div>
            <h3 style={styles.helpTitle}>Calm Videos</h3>
            <p style={styles.helpText}>
              Watch guided calm videos together with relaxing music.
            </p>
            <p style={styles.helpLink}>Go to Calm Videos →</p>
          </div>

          <div style={styles.helpCard} onClick={() => navigate("/mood")}>
            <div style={styles.helpIcon}>😊</div>
            <h3 style={styles.helpTitle}>Track Mood</h3>
            <p style={styles.helpText}>
              After listening, record your current feeling in the mood tracker.
            </p>
            <p style={styles.helpLink}>Go to Mood Tracker →</p>
          </div>

          <div style={styles.helpCard} onClick={() => navigate("/assessment")}>
            <div style={styles.helpIcon}>📝</div>
            <h3 style={styles.helpTitle}>Self Check</h3>
            <p style={styles.helpText}>
              Complete a short wellness assessment and understand your state.
            </p>
            <p style={styles.helpLink}>Go to Assessment →</p>
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
  heroCard: {
    background: "rgba(255,255,255,0.55)",
    border: "1px solid rgba(255,255,255,0.75)",
    borderRadius: "32px",
    padding: "28px",
    boxShadow: "0 25px 60px rgba(49,34,68,0.15)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    gap: "20px",
  },
  heroTitle: {
    color: "#312244",
    fontSize: "28px",
    margin: "0 0 10px 0",
    fontWeight: "900",
  },
  heroText: {
    color: "#6D597A",
    lineHeight: "1.6",
    margin: 0,
    maxWidth: "760px",
  },
  heroIcon: {
    width: "95px",
    height: "95px",
    borderRadius: "30px",
    background: "linear-gradient(135deg, #CDB4DB, #FFC8DD)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "48px",
    boxShadow: "0 18px 35px rgba(49,34,68,0.16)",
    flexShrink: 0,
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
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "center",
    marginBottom: "22px",
  },
  sectionTitle: {
    color: "#312244",
    fontSize: "24px",
    margin: "0 0 7px 0",
    fontWeight: "900",
  },
  sectionSubText: {
    color: "#6D597A",
    margin: 0,
    lineHeight: "1.5",
    fontSize: "14px",
  },
  panelIcon: {
    width: "62px",
    height: "62px",
    borderRadius: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    background: "linear-gradient(135deg, #CDB4DB, #FFC8DD)",
    boxShadow: "0 15px 30px rgba(49,34,68,0.15)",
    flexShrink: 0,
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "rgba(255,255,255,0.72)",
    padding: "15px 18px",
    borderRadius: "24px",
    boxShadow: "inset 0 0 18px rgba(49,34,68,0.07)",
    marginBottom: "20px",
  },
  searchIcon: {
    fontSize: "20px",
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#312244",
    fontSize: "15px",
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
    boxShadow: "0 10px 20px rgba(49,34,68,0.09)",
  },
  trackList: {
    display: "grid",
    gap: "16px",
    maxHeight: "760px",
    overflowY: "auto",
    paddingRight: "5px",
  },
  trackCard: {
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
  trackIcon: {
    width: "78px",
    height: "78px",
    borderRadius: "27px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "40px",
    boxShadow: "0 14px 24px rgba(49,34,68,0.13)",
    flexShrink: 0,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    color: "#312244",
    fontSize: "19px",
    margin: "0 0 5px 0",
    fontWeight: "900",
  },
  trackArtist: {
    color: "#9B5DE5",
    margin: "0 0 10px 0",
    fontWeight: "800",
    fontSize: "14px",
  },
  trackMetaRow: {
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
    boxShadow: "0 10px 20px rgba(49,34,68,0.1)",
  },
  playerCard: {
    background: "rgba(255,255,255,0.54)",
    border: "1px solid rgba(255,255,255,0.78)",
    borderRadius: "34px",
    padding: "30px",
    boxShadow: "0 25px 60px rgba(49,34,68,0.16)",
    textAlign: "center",
  },
  youtubeBox: {
    height: "270px",
    borderRadius: "30px",
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
    margin: "0 0 7px 0",
    fontWeight: "900",
    fontSize: "26px",
  },
  playerArtist: {
    color: "#6D597A",
    margin: "0 0 12px 0",
    fontWeight: "800",
  },
  nowPlayingBadge: {
    display: "inline-block",
    padding: "9px 16px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.72)",
    color: "#9B5DE5",
    fontWeight: "900",
    marginBottom: "18px",
  },
  controls: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "16px",
    marginBottom: "22px",
  },
  controlButton: {
    width: "54px",
    height: "54px",
    border: "none",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.75)",
    color: "#312244",
    fontSize: "22px",
    cursor: "pointer",
    boxShadow: "0 12px 24px rgba(49,34,68,0.1)",
  },
  playButton: {
    width: "72px",
    height: "72px",
    border: "none",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #9B5DE5, #F15BB5)",
    color: "#FFFFFF",
    fontSize: "30px",
    cursor: "pointer",
    boxShadow: "0 18px 35px rgba(155,93,229,0.35)",
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
  playlistCard: {
    padding: "26px",
    borderRadius: "32px",
    background: "rgba(255,255,255,0.56)",
    border: "1px solid rgba(255,255,255,0.78)",
    boxShadow: "0 20px 45px rgba(49,34,68,0.13)",
  },
  playlistTitle: {
    color: "#312244",
    margin: "0 0 18px 0",
    fontSize: "22px",
    fontWeight: "900",
  },
  playlistItem: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.65)",
    marginBottom: "12px",
    color: "#312244",
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

export default Music;