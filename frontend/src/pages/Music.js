import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
// Background image (same one used on the Mood page).
// Adjust the path if your Music.jsx is in a different folder.
import moodBg from "../assets/mood-bg.jpeg";

/* =====================================================
   3D EMOJI
   Uses Microsoft Fluent 3D emoji set (real 3D render).
   If an image can't load (offline etc.) it falls back
   to the normal emoji with a soft shadow.
   ===================================================== */
const EMOJI_CDN =
  "https://cdn.jsdelivr.net/npm/@lobehub/fluent-emoji-3d@latest/assets/";

const toCode = (emoji, keepFe0f) =>
  Array.from(emoji)
    .map((c) => c.codePointAt(0).toString(16))
    .filter((h) => keepFe0f || h !== "fe0f")
    .join("-");

function Emoji3D({ e, size = 32, style }) {
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setAttempt(0);
  }, [e]);

  if (attempt > 1) {
    return (
      <span
        style={{
          fontSize: size * 0.85,
          lineHeight: 1,
          display: "inline-block",
          filter: "drop-shadow(0 6px 8px rgba(59,53,82,0.28))",
          ...style,
        }}
      >
        {e}
      </span>
    );
  }

  return (
    <img
      src={`${EMOJI_CDN}${toCode(e, attempt === 1)}.webp`}
      width={size}
      height={size}
      alt={e}
      draggable={false}
      onError={() => setAttempt((a) => a + 1)}
      style={{
        objectFit: "contain",
        display: "block",
        filter: "drop-shadow(0 7px 8px rgba(59,53,82,0.28))",
        ...style,
      }}
    />
  );
}

/* Glossy SVG controls */
const PrevIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="5" width="3" height="14" rx="1.5" />
    <path d="M20 6.2v11.6a1 1 0 0 1-1.6.8l-8-5.8a1 1 0 0 1 0-1.6l8-5.8a1 1 0 0 1 1.6.8z" />
  </svg>
);
const NextIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <rect x="17" y="5" width="3" height="14" rx="1.5" />
    <path d="M4 6.2v11.6a1 1 0 0 0 1.6.8l8-5.8a1 1 0 0 0 0-1.6l-8-5.8A1 1 0 0 0 4 6.2z" />
  </svg>
);
const PlayIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5.5v13a1 1 0 0 0 1.5.9l10.5-6.5a1 1 0 0 0 0-1.8L9.5 4.6A1 1 0 0 0 8 5.5z" />
  </svg>
);

function Music() {
  const navigate = useNavigate();
  const containerRef = useRef(null);

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
    { id: 1, title: "Soft Morning Calm", artist: "Calm Piano", category: "Relax", duration: "10 min", mood: "Peaceful", icon: "🌅", color: "#FFD9A0", videoUrl: "https://www.youtube.com/embed/2OEL4P1Rz04" },
    { id: 2, title: "Deep Sleep Waves", artist: "Sleep Music", category: "Sleep", duration: "1 hr", mood: "Sleep", icon: "🌙", color: "#C9CFFF", videoUrl: "https://www.youtube.com/embed/1ZYbU82GVz4" },
    { id: 3, title: "Forest Breathing", artist: "Nature Sounds", category: "Nature", duration: "30 min", mood: "Fresh", icon: "🌲", color: "#CFF5C8", videoUrl: "https://www.youtube.com/embed/eKFTSSKCzWA" },
    { id: 4, title: "Study Focus Flow", artist: "Focus Music", category: "Focus", duration: "1 hr", mood: "Focus", icon: "📚", color: "#BFE3E6", videoUrl: "https://www.youtube.com/embed/jfKfPfyJRdk" },
    { id: 5, title: "Rainy Window", artist: "Rain Sounds", category: "Nature", duration: "1 hr", mood: "Calm", icon: "🌧️", color: "#D9C6E6", videoUrl: "https://www.youtube.com/embed/mPZkdNFkNps" },
    { id: 6, title: "Meditation Bell", artist: "Zen Music", category: "Meditation", duration: "20 min", mood: "Mindful", icon: "🔔", color: "#FFD3E2", videoUrl: "https://www.youtube.com/embed/inpok4MKVLM" },
    { id: 7, title: "Ocean Peace", artist: "Ocean Waves", category: "Relax", duration: "1 hr", mood: "Relaxed", icon: "🌊", color: "#BFE3E6", videoUrl: "https://www.youtube.com/embed/V1RPi2MYptM" },
    { id: 8, title: "Anxiety Relief Tune", artist: "Calm Lab", category: "Stress Relief", duration: "15 min", mood: "Relief", icon: "💙", color: "#FFC4D8", videoUrl: "https://www.youtube.com/embed/O-6f5wQXSu8" },
    { id: 9, title: "Night Sky Lullaby", artist: "Sleep Therapy", category: "Sleep", duration: "1 hr", mood: "Dreamy", icon: "✨", color: "#C9CFFF", videoUrl: "https://www.youtube.com/embed/aEqlQvczMJQ" },
    { id: 10, title: "Gentle Piano Light", artist: "Soft Piano", category: "Relax", duration: "30 min", mood: "Soft", icon: "🎹", color: "#FFE0BD", videoUrl: "https://www.youtube.com/embed/lFcSrYw-ARY" },
    { id: 11, title: "Mindful Breath", artist: "Breathing Music", category: "Meditation", duration: "10 min", mood: "Balanced", icon: "🧘‍♀️", color: "#D9C6E6", videoUrl: "https://www.youtube.com/embed/ZToicYcHIOU" },
    { id: 12, title: "Calm River Flow", artist: "Nature Calm", category: "Nature", duration: "1 hr", mood: "Flow", icon: "🏞️", color: "#CFF5C8", videoUrl: "https://www.youtube.com/embed/IvjMgVS6kng" },
    { id: 13, title: "Focus White Noise", artist: "Focus Beats", category: "Focus", duration: "1 hr", mood: "Clear", icon: "🎧", color: "#BFE3E6", videoUrl: "https://www.youtube.com/embed/nMfPqeZjc2c" },
    { id: 14, title: "Stress Release Harmony", artist: "Healing Music", category: "Stress Relief", duration: "30 min", mood: "Free", icon: "🌿", color: "#CFF5C8", videoUrl: "https://www.youtube.com/embed/ssss7V1_eyA" },
    { id: 15, title: "Moonlight Sleep", artist: "Deep Sleep", category: "Sleep", duration: "1 hr", mood: "Rest", icon: "🌌", color: "#C9CFFF", videoUrl: "https://www.youtube.com/embed/77ZozI0rw7w" },
    { id: 16, title: "Positive Energy Beat", artist: "Morning Calm", category: "Relax", duration: "20 min", mood: "Happy", icon: "☀️", color: "#FFD9A0", videoUrl: "https://www.youtube.com/embed/hlWiI4xVXKY" },
    { id: 17, title: "Deep Meditation Pad", artist: "Zen Mind", category: "Meditation", duration: "1 hr", mood: "Deep", icon: "🪷", color: "#D9C6E6", videoUrl: "https://www.youtube.com/embed/DbDoBzGY3vo" },
    { id: 18, title: "Birdsong Morning", artist: "Nature Calm", category: "Nature", duration: "30 min", mood: "Fresh", icon: "🐦", color: "#CFF5C8", videoUrl: "https://www.youtube.com/embed/xNN7iTA57jM" },
    { id: 19, title: "Exam Focus Calm", artist: "Study Music", category: "Focus", duration: "1 hr", mood: "Study", icon: "📝", color: "#BFE3E6", videoUrl: "https://www.youtube.com/embed/WPni755-Krg" },
    { id: 20, title: "Heart Relax Melody", artist: "Soft Healing", category: "Stress Relief", duration: "30 min", mood: "Comfort", icon: "🤍", color: "#FFD3E2", videoUrl: "https://www.youtube.com/embed/odADwWzHR24" },
    { id: 21, title: "Quiet Room Ambience", artist: "Ambient Focus", category: "Focus", duration: "1 hr", mood: "Quiet", icon: "🕯️", color: "#FFE0BD", videoUrl: "https://www.youtube.com/embed/5qap5aO4i9A" },
    { id: 22, title: "Peaceful Garden", artist: "Garden Sounds", category: "Nature", duration: "30 min", mood: "Natural", icon: "🌷", color: "#CFF5C8", videoUrl: "https://www.youtube.com/embed/xNN7iTA57jM" },
    { id: 23, title: "Soft Sleep Piano", artist: "Piano Sleep", category: "Sleep", duration: "1 hr", mood: "Relax", icon: "🎼", color: "#C9CFFF", videoUrl: "https://www.youtube.com/embed/1ZYbU82GVz4" },
    { id: 24, title: "Healing Sound Bath", artist: "Healing Frequency", category: "Meditation", duration: "1 hr", mood: "Healing", icon: "🌀", color: "#D9C6E6", videoUrl: "https://www.youtube.com/embed/txQ6t4yPIM0" },
    { id: 25, title: "Calm Guitar Strings", artist: "Guitar Relax", category: "Relax", duration: "30 min", mood: "Warm", icon: "🎸", color: "#FFD9A0", videoUrl: "https://www.youtube.com/embed/5yx6BWlEVcY" },
    { id: 26, title: "Relaxed Rain Sleep", artist: "Rain Sounds", category: "Sleep", duration: "1 hr", mood: "Sleepy", icon: "☔", color: "#C9CFFF", videoUrl: "https://www.youtube.com/embed/mPZkdNFkNps" },
    { id: 27, title: "Stress Away Pulse", artist: "Stress Relief", category: "Stress Relief", duration: "20 min", mood: "Relief", icon: "💆‍♀️", color: "#FFC4D8", videoUrl: "https://www.youtube.com/embed/O-6f5wQXSu8" },
    { id: 28, title: "Minimal Focus Beats", artist: "Lo-Fi Focus", category: "Focus", duration: "1 hr", mood: "Productive", icon: "💻", color: "#BFE3E6", videoUrl: "https://www.youtube.com/embed/jfKfPfyJRdk" },
    { id: 29, title: "Sunset Meditation", artist: "MindCare Studio", category: "Meditation", duration: "30 min", mood: "Peace", icon: "🌇", color: "#D9C6E6", videoUrl: "https://www.youtube.com/embed/ZToicYcHIOU" },
    { id: 30, title: "Nature Mind Reset", artist: "Nature Calm", category: "Nature", duration: "30 min", mood: "Reset", icon: "🍃", color: "#CFF5C8", videoUrl: "https://www.youtube.com/embed/eKFTSSKCzWA" },
  ];

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTrack, setSelectedTrack] = useState(tracks[0]);
  const [playingTrackId, setPlayingTrackId] = useState(null);
  const [playKey, setPlayKey] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const handlePlayTrack = (track) => {
    setSelectedTrack(track);
    setPlayingTrackId(track.id);
    setPlayKey((k) => k + 1);
  };

  const handleStopTrack = (e) => {
    e.stopPropagation();
    setPlayingTrackId(null);
  };

  // Responsive detection based on the real container width
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      setIsMobile(entries[0].contentRect.width <= 768);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
    setSelectedTrack(tracks[(index + 1) % tracks.length]);
  };

  const previousTrack = () => {
    const index = tracks.findIndex((item) => item.id === selectedTrack.id);
    setSelectedTrack(tracks[index === 0 ? tracks.length - 1 : index - 1]);
  };

  return (
    <div
      ref={containerRef}
      style={{
        ...styles.page,
        padding: isMobile ? "16px" : "35px",
        backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02)), url(${moodBg})`,
      }}
    >
      <div style={styles.container}>
        {/* HEADER */}
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
            <h1 style={{ ...styles.title, fontSize: isMobile ? "28px" : "44px" }}>
              Calm Music
            </h1>
            <p style={styles.subtitle}>
              Listen to relaxing music for sleep, focus, meditation, nature
              calm, and stress relief.
            </p>
          </div>

          {!isMobile && (
            <div style={styles.headerBadge}>
              <Emoji3D e="🎧" size={30} />
              <span>Music Library</span>
            </div>
          )}
        </div>

        {/* HERO */}
        <div
          style={{
            ...styles.heroCard,
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "center",
            padding: isMobile ? "22px" : "30px 34px",
          }}
        >
          <div>
            <h2 style={{ ...styles.heroTitle, fontSize: isMobile ? "22px" : "29px" }}>
              Find music that matches your mood
            </h2>
            <p style={styles.heroText}>
              Choose from 30 calm music sessions. Pick a track, press play and
              let your mind settle.
            </p>
          </div>
          {!isMobile && (
            <div style={styles.heroIcon}>
              <Emoji3D e="🎶" size={74} />
            </div>
          )}
        </div>

        {/* STATS */}
        <div
          style={{
            ...styles.statsGrid,
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
            gap: isMobile ? "12px" : "20px",
          }}
        >
          <div style={{ ...styles.statCard, padding: isMobile ? "14px" : "22px" }}>
            <div style={styles.statIcon}>
              <Emoji3D e="🎵" size={42} />
            </div>
            <div>
              <h3 style={styles.statNumber}>{tracks.length}</h3>
              <p style={styles.statText}>Total Tracks</p>
            </div>
          </div>

          <div style={{ ...styles.statCard, padding: isMobile ? "14px" : "22px" }}>
            <div style={styles.statIcon}>
              <Emoji3D e="💜" size={42} />
            </div>
            <div>
              <h3 style={styles.statNumber}>{favorites.length}</h3>
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
              <Emoji3D e="🌙" size={42} />
            </div>
            <div>
              <h3 style={styles.statNumber}>
                {tracks.filter((item) => item.category === "Sleep").length}
              </h3>
              <p style={styles.statText}>Sleep Tracks</p>
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div
          style={{
            ...styles.mainGrid,
            gridTemplateColumns: isMobile ? "1fr" : "1.35fr 0.9fr",
            gap: isMobile ? "18px" : "25px",
          }}
        >
          {/* LIBRARY */}
          <div style={{ ...styles.leftPanel, padding: isMobile ? "18px" : "30px" }}>
            <div
              style={{
                ...styles.panelHeader,
                flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "flex-start" : "center",
                gap: isMobile ? "12px" : "16px",
              }}
            >
              <div>
                <h2 style={styles.sectionTitle}>Music Library</h2>
                <p style={styles.sectionSubText}>
                  Search, filter, and select a calm music session.
                </p>
              </div>
              {!isMobile && (
                <div style={styles.panelIcon}>
                  <Emoji3D e="🎼" size={42} />
                </div>
              )}
            </div>

            <div style={styles.searchBox}>
              <Emoji3D e="🔍" size={24} />
              <input
                style={styles.searchInput}
                type="text"
                placeholder="Search music, artist, mood..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={styles.categoryRow}>
              {categories.map((category) => {
                const active = selectedCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    style={{
                      ...styles.categoryButton,
                      background: active ? styles.accent : "rgba(255,255,255,0.45)",
                      color: active ? "#FFFFFF" : "#3B3552",
                      boxShadow: active
                        ? "0 12px 24px rgba(142,120,190,0.38), inset 0 2px 3px rgba(255,255,255,0.55)"
                        : "0 8px 18px rgba(59,53,82,0.08), inset 0 1px 2px rgba(255,255,255,0.7)",
                    }}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            <div
              style={{
                ...styles.trackList,
                maxHeight: isMobile ? "none" : "760px",
              }}
            >
              {filteredTracks.map((track) => {
                const isPlaying = playingTrackId === track.id;
                const active = selectedTrack.id === track.id;
                return (
                  <div
                    key={track.id}
                    style={{
                      ...styles.trackCard,
                      border: isPlaying
                        ? "2px solid #9B5DE5"
                        : active
                        ? "2px solid rgba(255,255,255,0.95)"
                        : "1px solid rgba(255,255,255,0.55)",
                      background: isPlaying
                        ? "linear-gradient(145deg, rgba(255,255,255,0.9), rgba(243,232,255,0.75))"
                        : active
                        ? "linear-gradient(145deg, rgba(255,255,255,0.78), rgba(233,222,250,0.6))"
                        : "rgba(255,255,255,0.36)",
                      boxShadow: isPlaying
                        ? "0 20px 45px rgba(155,93,229,0.3), inset 0 2px 4px rgba(255,255,255,0.9)"
                        : active
                        ? "0 18px 38px rgba(142,120,190,0.3), inset 0 2px 4px rgba(255,255,255,0.8)"
                        : "0 12px 28px rgba(59,53,82,0.1), inset 0 1px 2px rgba(255,255,255,0.6)",
                      padding: isMobile ? "14px" : "18px",
                    }}
                    onClick={() => {
                      if (!isPlaying) {
                        handlePlayTrack(track);
                      }
                    }}
                  >
                    {/* IN-PLACE INLINE PLAYER */}
                    {isPlaying && (
                      <div style={styles.inlinePlayerBox}>
                        <div style={styles.inlinePlayerHeader}>
                          <div style={styles.nowPlayingIndicator}>
                            <span style={styles.pulseDot}></span>
                            <span style={styles.nowPlayingText}>Playing In-Place</span>
                          </div>
                          <button
                            style={styles.closePlayerBtn}
                            onClick={handleStopTrack}
                            title="Close music"
                          >
                            ✕ Stop & Close
                          </button>
                        </div>

                        <div
                          style={{
                            ...styles.videoPlayerContainer,
                            height: isMobile ? "210px" : "270px",
                          }}
                        >
                          <iframe
                            key={`inline-music-${track.id}-${playKey}`}
                            style={styles.iframe}
                            src={`${track.videoUrl}?autoplay=1&rel=0&modestbranding=1`}
                            title={track.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          ></iframe>
                        </div>
                      </div>
                    )}

                    {/* Track Content Row */}
                    <div
                      style={{
                        ...styles.trackCardContent,
                        flexDirection: isMobile ? "column" : "row",
                        alignItems: isMobile ? "flex-start" : "center",
                      }}
                    >
                      <div
                        style={{
                          ...styles.trackIcon,
                          width: isMobile ? "58px" : "74px",
                          height: isMobile ? "58px" : "74px",
                          background: `radial-gradient(circle at 30% 25%, #FFFFFF 0%, ${track.color} 75%)`,
                        }}
                      >
                        <Emoji3D e={track.icon} size={isMobile ? 38 : 48} />
                      </div>

                      <div style={styles.trackInfo}>
                        <h3
                          style={{
                            ...styles.trackTitle,
                            paddingRight: isMobile ? "36px" : 0,
                          }}
                        >
                          {track.title}
                        </h3>
                        <p style={styles.trackArtist}>{track.artist}</p>
                        <div style={styles.trackMetaRow}>
                          <span style={styles.metaBadge}>
                            <Emoji3D e="⏱️" size={16} style={styles.metaEmoji} />
                            {track.duration}
                          </span>
                          <span style={styles.metaBadge}>
                            <Emoji3D e="🎧" size={16} style={styles.metaEmoji} />
                            {track.category}
                          </span>
                          <span style={styles.metaBadge}>
                            <Emoji3D e="🌈" size={16} style={styles.metaEmoji} />
                            {track.mood}
                          </span>
                          {!isPlaying && (
                            <span style={styles.clickToPlayBadge}>
                              ▶ Click to play here
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        style={{
                          ...styles.favoriteButton,
                          position: isMobile ? "absolute" : "static",
                          top: isMobile ? "16px" : "auto",
                          right: isMobile ? "16px" : "auto",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(track.id);
                        }}
                      >
                        <Emoji3D
                          e={favorites.includes(track.id) ? "💜" : "🤍"}
                          size={26}
                          style={{ filter: "drop-shadow(0 4px 5px rgba(59,53,82,0.25))" }}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PLAYER */}
          <div style={styles.rightPanel}>
            <div style={{ ...styles.playerCard, padding: isMobile ? "18px" : "30px" }}>
              <div style={{ ...styles.youtubeBox, height: isMobile ? "200px" : "270px" }}>
                <iframe
                  style={styles.iframe}
                  src={selectedTrack.videoUrl}
                  title={selectedTrack.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>

              <div style={styles.playerEmoji}>
                <Emoji3D e={selectedTrack.icon} size={58} />
              </div>

              <h2 style={{ ...styles.playerTitle, fontSize: isMobile ? "22px" : "27px" }}>
                {selectedTrack.title}
              </h2>
              <p style={styles.playerArtist}>{selectedTrack.artist}</p>

              <div style={styles.controls}>
                <button style={styles.controlButton} onClick={previousTrack} aria-label="Previous track">
                  <PrevIcon />
                </button>
                <button style={styles.playButton} onClick={nextTrack} aria-label="Next track">
                  <PlayIcon />
                </button>
                <button style={styles.controlButton} onClick={nextTrack} aria-label="Next track">
                  <NextIcon />
                </button>
              </div>

              <div
                style={{
                  ...styles.playerInfoGrid,
                  gap: isMobile ? "8px" : "10px",
                }}
              >
                <div style={styles.infoBox}>
                  <span style={styles.infoLabel}>Category</span>
                  <strong style={styles.infoValue}>{selectedTrack.category}</strong>
                </div>
                <div style={styles.infoBox}>
                  <span style={styles.infoLabel}>Duration</span>
                  <strong style={styles.infoValue}>{selectedTrack.duration}</strong>
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

            <div style={{ ...styles.playlistCard, padding: isMobile ? "18px" : "26px" }}>
              <h3 style={styles.playlistTitle}>Suggested Playlist</h3>

              {[
                { icon: "🌙", title: "Sleep Calm", text: "Deep sleep and night relaxation" },
                { icon: "📚", title: "Study Focus", text: "Soft focus music for learning" },
                { icon: "🌿", title: "Nature Peace", text: "Forest, river, rain and ocean sounds" },
              ].map((item) => (
                <div key={item.title} style={styles.playlistItem}>
                  <div style={styles.playlistIcon}>
                    <Emoji3D e={item.icon} size={34} />
                  </div>
                  <div>
                    <strong style={styles.playlistName}>{item.title}</strong>
                    <p style={styles.playlistText}>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   THEME — taken from mood-bg.jpeg:
   teal-grey top → lavender middle → peach/pink bottom,
   soft glassy cards, no harsh colours.
   ===================================================== */
const glass = {
  background: "rgba(255,255,255,0.34)",
  border: "1px solid rgba(255,255,255,0.6)",
  backdropFilter: "blur(18px) saturate(140%)",
  WebkitBackdropFilter: "blur(18px) saturate(140%)",
  boxShadow:
    "0 24px 55px rgba(59,53,82,0.16), inset 0 2px 4px rgba(255,255,255,0.65)",
};

const styles = {
  accent: "linear-gradient(135deg, #8FA8D8 0%, #B79BE0 50%, #F0A9A0 100%)",

  page: {
    minHeight: "100vh",
    backgroundSize: "cover",
    backgroundPosition: "center top",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
    backgroundColor: "#CFC8DC",
    fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    position: "relative",
    overflowX: "hidden",
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
    border: "1px solid rgba(255,255,255,0.65)",
    padding: "10px 18px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.45)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    color: "#4A4468",
    fontWeight: "700",
    cursor: "pointer",
    marginBottom: "14px",
    boxShadow: "0 10px 24px rgba(59,53,82,0.12), inset 0 1px 2px rgba(255,255,255,0.8)",
  },
  title: {
    color: "#2F2A45",
    margin: "0 0 8px 0",
    fontWeight: "800",
    letterSpacing: "-0.5px",
    textShadow: "0 2px 14px rgba(255,255,255,0.45)",
  },
  subtitle: {
    color: "#4A4468",
    fontSize: "16px",
    margin: 0,
    lineHeight: "1.55",
    maxWidth: "560px",
  },
  headerBadge: {
    ...glass,
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 22px",
    borderRadius: "24px",
    color: "#3B3552",
    fontWeight: "700",
  },
  heroCard: {
    ...glass,
    borderRadius: "34px",
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "25px",
    gap: "20px",
  },
  heroTitle: {
    color: "#2F2A45",
    margin: "0 0 10px 0",
    fontWeight: "800",
  },
  heroText: {
    color: "#4A4468",
    lineHeight: "1.6",
    margin: 0,
    maxWidth: "760px",
  },
  heroIcon: {
    width: "104px",
    height: "104px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle at 30% 25%, #FFFFFF 0%, rgba(214,200,240,0.85) 60%, rgba(247,190,184,0.8) 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow:
      "0 20px 40px rgba(59,53,82,0.2), inset 0 3px 6px rgba(255,255,255,0.9)",
    flexShrink: 0,
  },
  statsGrid: {
    display: "grid",
    marginBottom: "25px",
  },
  statCard: {
    ...glass,
    display: "flex",
    alignItems: "center",
    gap: "16px",
    borderRadius: "30px",
  },
  statIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "radial-gradient(circle at 30% 25%, #FFFFFF 0%, rgba(225,214,245,0.9) 100%)",
    boxShadow:
      "0 12px 24px rgba(59,53,82,0.15), inset 0 2px 4px rgba(255,255,255,0.9)",
    flexShrink: 0,
  },
  statNumber: {
    color: "#2F2A45",
    margin: "0 0 4px 0",
    fontSize: "28px",
    fontWeight: "800",
  },
  statText: {
    color: "#5A5478",
    margin: 0,
    fontSize: "14px",
    fontWeight: "600",
  },
  mainGrid: {
    display: "grid",
  },
  leftPanel: {
    ...glass,
    borderRadius: "36px",
  },
  rightPanel: {
    display: "grid",
    gap: "25px",
    alignContent: "start",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "22px",
  },
  sectionTitle: {
    color: "#2F2A45",
    fontSize: "24px",
    margin: "0 0 7px 0",
    fontWeight: "800",
  },
  sectionSubText: {
    color: "#5A5478",
    margin: 0,
    lineHeight: "1.5",
    fontSize: "14px",
  },
  panelIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "radial-gradient(circle at 30% 25%, #FFFFFF 0%, rgba(225,214,245,0.9) 100%)",
    boxShadow:
      "0 12px 24px rgba(59,53,82,0.15), inset 0 2px 4px rgba(255,255,255,0.9)",
    flexShrink: 0,
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "rgba(255,255,255,0.5)",
    padding: "14px 18px",
    borderRadius: "24px",
    boxShadow:
      "inset 0 2px 8px rgba(59,53,82,0.1), 0 1px 0 rgba(255,255,255,0.7)",
    marginBottom: "20px",
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#2F2A45",
    fontSize: "15px",
    minWidth: 0,
  },
  categoryRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "22px",
  },
  categoryButton: {
    border: "1px solid rgba(255,255,255,0.6)",
    padding: "10px 17px",
    borderRadius: "18px",
    fontWeight: "700",
    cursor: "pointer",
  },
  trackList: {
    display: "grid",
    gap: "16px",
    overflowY: "auto",
    paddingRight: "5px",
  },
  trackCard: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    borderRadius: "28px",
    cursor: "pointer",
    transition: "0.25s ease",
    position: "relative",
    boxSizing: "border-box",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  },
  trackCardContent: {
    display: "flex",
    gap: "16px",
    width: "100%",
  },
  inlinePlayerBox: {
    width: "100%",
    marginBottom: "8px",
  },
  inlinePlayerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
    padding: "0 2px",
  },
  nowPlayingIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(142,120,190,0.18)",
    padding: "5px 12px",
    borderRadius: "12px",
  },
  pulseDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#9B5DE5",
    boxShadow: "0 0 8px #9B5DE5",
  },
  nowPlayingText: {
    color: "#6B46C1",
    fontWeight: "800",
    fontSize: "12px",
  },
  closePlayerBtn: {
    border: "none",
    background: "rgba(47,42,69,0.08)",
    color: "#2F2A45",
    padding: "5px 12px",
    borderRadius: "12px",
    fontWeight: "800",
    fontSize: "12px",
    cursor: "pointer",
  },
  videoPlayerContainer: {
    width: "100%",
    borderRadius: "20px",
    overflow: "hidden",
    background: "#000",
    boxShadow: "0 14px 28px rgba(47,42,69,0.2)",
  },
  clickToPlayBadge: {
    background: "rgba(142,120,190,0.18)",
    color: "#6B46C1",
    padding: "4px 8px",
    borderRadius: "10px",
    fontSize: "11px",
    fontWeight: "800",
  },
  trackIcon: {
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow:
      "0 14px 26px rgba(59,53,82,0.18), inset 0 3px 6px rgba(255,255,255,0.85)",
    flexShrink: 0,
  },
  trackInfo: {
    flex: 1,
    minWidth: 0,
  },
  trackTitle: {
    color: "#2F2A45",
    fontSize: "19px",
    margin: "0 0 5px 0",
    fontWeight: "800",
  },
  trackArtist: {
    color: "#7B64B8",
    margin: "0 0 10px 0",
    fontWeight: "700",
    fontSize: "14px",
  },
  trackMetaRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  metaBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(255,255,255,0.6)",
    color: "#4A4468",
    padding: "5px 10px",
    borderRadius: "14px",
    fontSize: "12px",
    fontWeight: "700",
    boxShadow: "inset 0 1px 2px rgba(255,255,255,0.8)",
  },
  metaEmoji: {
    filter: "drop-shadow(0 2px 2px rgba(59,53,82,0.25))",
  },
  favoriteButton: {
    border: "1px solid rgba(255,255,255,0.7)",
    background: "rgba(255,255,255,0.6)",
    width: "46px",
    height: "46px",
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 20px rgba(59,53,82,0.12), inset 0 2px 3px rgba(255,255,255,0.85)",
    flexShrink: 0,
  },
  playerCard: {
    ...glass,
    borderRadius: "36px",
    textAlign: "center",
  },
  youtubeBox: {
    borderRadius: "28px",
    overflow: "hidden",
    marginBottom: "20px",
    background: "#000",
    boxShadow: "0 18px 38px rgba(59,53,82,0.28)",
  },
  iframe: {
    width: "100%",
    height: "100%",
    border: "none",
  },
  playerEmoji: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "8px",
  },
  playerTitle: {
    color: "#2F2A45",
    margin: "0 0 7px 0",
    fontWeight: "800",
  },
  playerArtist: {
    color: "#5A5478",
    margin: "0 0 20px 0",
    fontWeight: "600",
  },
  controls: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "18px",
    marginBottom: "22px",
  },
  controlButton: {
    width: "54px",
    height: "54px",
    border: "1px solid rgba(255,255,255,0.75)",
    borderRadius: "50%",
    background: "linear-gradient(160deg, rgba(255,255,255,0.85), rgba(225,214,245,0.6))",
    color: "#4A4468",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow:
      "0 12px 24px rgba(59,53,82,0.16), inset 0 2px 4px rgba(255,255,255,0.9)",
  },
  playButton: {
    width: "76px",
    height: "76px",
    border: "1px solid rgba(255,255,255,0.6)",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #8FA8D8 0%, #B79BE0 50%, #F0A9A0 100%)",
    color: "#FFFFFF",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow:
      "0 18px 34px rgba(142,120,190,0.45), inset 0 3px 6px rgba(255,255,255,0.55), inset 0 -4px 8px rgba(120,90,170,0.25)",
  },
  playerInfoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    marginBottom: "18px",
  },
  infoBox: {
    background: "rgba(255,255,255,0.55)",
    borderRadius: "18px",
    padding: "13px",
    minWidth: 0,
    boxShadow: "inset 0 1px 2px rgba(255,255,255,0.8)",
  },
  infoLabel: {
    display: "block",
    color: "#7A7396",
    fontSize: "12px",
    marginBottom: "5px",
    fontWeight: "600",
  },
  infoValue: {
    color: "#2F2A45",
    fontSize: "14px",
    wordBreak: "break-word",
  },
  primaryButton: {
    width: "100%",
    padding: "16px",
    border: "1px solid rgba(255,255,255,0.55)",
    borderRadius: "24px",
    background: "linear-gradient(135deg, #8FA8D8 0%, #B79BE0 50%, #F0A9A0 100%)",
    color: "white",
    fontSize: "16px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow:
      "0 16px 32px rgba(142,120,190,0.4), inset 0 2px 4px rgba(255,255,255,0.5)",
  },
  playlistCard: {
    ...glass,
    borderRadius: "34px",
  },
  playlistTitle: {
    color: "#2F2A45",
    margin: "0 0 18px 0",
    fontSize: "22px",
    fontWeight: "800",
  },
  playlistItem: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "12px 14px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.5)",
    marginBottom: "12px",
    boxShadow: "inset 0 1px 2px rgba(255,255,255,0.8)",
  },
  playlistIcon: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "radial-gradient(circle at 30% 25%, #FFFFFF 0%, rgba(225,214,245,0.9) 100%)",
    boxShadow:
      "0 8px 16px rgba(59,53,82,0.14), inset 0 2px 3px rgba(255,255,255,0.9)",
    flexShrink: 0,
  },
  playlistName: {
    color: "#2F2A45",
    display: "block",
  },
  playlistText: {
    color: "#5A5478",
    margin: "3px 0 0 0",
    fontSize: "13px",
  },
};

export default Music;
