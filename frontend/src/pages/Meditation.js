import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
      icon: "🌬️",
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
      icon: "🧘‍♀️",
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
      icon: "🌙",
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
      icon: "💙",
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
      icon: "📚",
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
      icon: "🌸",
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
      icon: "🪷",
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
      icon: "☀️",
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

  const startMeditation = () => setTimerRunning(true);
  const stopMeditation = () => {
    setTimerRunning(false);
    setBreathPhase("Breathe In");
  };

  const completeSession = () => {
    if (!completedSessions.includes(selectedSession.id)) {
      setCompletedSessions([...completedSessions, selectedSession.id]);
    }
    setTimerRunning(false);
    alert("Meditation session completed successfully 🌿");
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

            <h1 style={styles.title}>{breathing ? "Breathing Practice" : "Meditation"}</h1>
            <p style={styles.subtitle}>
              Practice guided meditation, breathing, mindfulness, sleep calm,
              and stress relief.
            </p>
          </div>

          <div style={styles.headerBadge}>🧘 Mindfulness Space</div>
        </div>

        <div style={styles.heroCard}>
          <div>
            <h2 style={styles.heroTitle}>Create a peaceful moment for yourself</h2>
            <p style={styles.heroText}>
              Choose a meditation session, follow the breathing guide, and
              complete short mindfulness practices to support your mental
              wellbeing.
            </p>
          </div>

          <div style={styles.heroIcon}>🪷</div>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🧘‍♀️</div>
            <div>
              <h3 style={styles.statNumber}>{sessions.length}</h3>
              <p style={styles.statText}>Meditations</p>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>✅</div>
            <div>
              <h3 style={styles.statNumber}>{completedSessions.length}</h3>
              <p style={styles.statText}>Completed</p>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>💜</div>
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
              <div style={styles.panelIcon}>🌿</div>
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
                    setBreathPhase("Breathe In");
                  }}
                >
                  <div
                    style={{
                      ...styles.sessionIcon,
                      backgroundColor: session.color,
                    }}
                  >
                    {session.icon}
                  </div>

                  <div style={styles.sessionInfo}>
                    <h3 style={styles.sessionTitle}>{session.title}</h3>
                    <p style={styles.sessionDesc}>{session.description}</p>

                    <div style={styles.metaRow}>
                      <span style={styles.metaBadge}>⏱ {session.duration}</span>
                      <span style={styles.metaBadge}>✨ {session.level}</span>
                      <span style={styles.metaBadge}>🌈 {session.mood}</span>
                    </div>
                  </div>

                  <button
                    style={styles.favoriteButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(session.id);
                    }}
                  >
                    {favorites.includes(session.id) ? "💜" : "🤍"}
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
                  <span style={styles.breathIcon}>{selectedSession.icon}</span>
                </div>
              </div>

              <h2 style={styles.practiceTitle}>{selectedSession.title}</h2>
              <p style={styles.practiceText}>{selectedSession.description}</p>

              <div style={styles.breathBadge}>
                {timerRunning ? breathPhase : "Ready to Begin"}
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

        <div style={styles.bottomGrid}>
          <div style={styles.helpCard} onClick={() => navigate("/music")}>
            <div style={styles.helpIcon}>🎧</div>
            <h3 style={styles.helpTitle}>Calm Music</h3>
            <p style={styles.helpText}>
              Listen to relaxing music while practicing meditation.
            </p>
            <p style={styles.helpLink}>Go to Music →</p>
          </div>

          <div style={styles.helpCard} onClick={() => navigate("/calm-videos")}>
            <div style={styles.helpIcon}>🎥</div>
            <h3 style={styles.helpTitle}>Guided Videos</h3>
            <p style={styles.helpText}>
              Watch calm videos for breathing, mindfulness, and stress relief.
            </p>
            <p style={styles.helpLink}>Go to Calm Videos →</p>
          </div>

          <div style={styles.helpCard} onClick={() => navigate("/mood")}>
            <div style={styles.helpIcon}>😊</div>
            <h3 style={styles.helpTitle}>Track Mood</h3>
            <p style={styles.helpText}>
              After meditating, record your current feeling in the mood tracker.
            </p>
            <p style={styles.helpLink}>Go to Mood Tracker →</p>
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
    gridTemplateColumns: "1.3fr 0.95fr",
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

  sessionList: {
    display: "grid",
    gap: "16px",
  },

  sessionCard: {
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

  sessionIcon: {
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

  sessionInfo: {
    flex: 1,
  },

  sessionTitle: {
    color: "#312244",
    fontSize: "19px",
    margin: "0 0 5px 0",
    fontWeight: "900",
  },

  sessionDesc: {
    color: "#6D597A",
    margin: "0 0 10px 0",
    lineHeight: "1.5",
    fontSize: "14px",
  },

  metaRow: {
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

  practiceCard: {
    background: "rgba(255,255,255,0.54)",
    border: "1px solid rgba(255,255,255,0.78)",
    borderRadius: "34px",
    padding: "30px",
    boxShadow: "0 25px 60px rgba(49,34,68,0.16)",
    textAlign: "center",
  },

  meditationVisual: {
    height: "270px",
    borderRadius: "34px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "22px",
    overflow: "hidden",
  },

  breathCircle: {
    width: "150px",
    height: "150px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 20px 45px rgba(49,34,68,0.18)",
    transition: "1.2s ease",
  },

  breathIcon: {
    fontSize: "70px",
  },

  practiceTitle: {
    color: "#312244",
    margin: "0 0 8px 0",
    fontWeight: "900",
    fontSize: "26px",
  },

  practiceText: {
    color: "#6D597A",
    lineHeight: "1.6",
    margin: "0 0 16px 0",
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

  practiceInfoGrid: {
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

  buttonRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },

  primaryButton: {
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

  secondaryButton: {
    padding: "16px",
    border: "none",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.75)",
    color: "#6D597A",
    fontSize: "16px",
    fontWeight: "900",
    cursor: "pointer",
  },

  completeButton: {
    padding: "16px",
    border: "none",
    borderRadius: "24px",
    background: "rgba(112,214,164,0.35)",
    color: "#2F855A",
    fontSize: "16px",
    fontWeight: "900",
    cursor: "pointer",
  },

  stepsCard: {
    padding: "26px",
    borderRadius: "32px",
    background: "rgba(255,255,255,0.56)",
    border: "1px solid rgba(255,255,255,0.78)",
    boxShadow: "0 20px 45px rgba(49,34,68,0.13)",
  },

  stepsTitle: {
    color: "#312244",
    margin: "0 0 18px 0",
    fontSize: "22px",
    fontWeight: "900",
  },

  stepItem: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.65)",
    marginBottom: "12px",
  },

  stepNumber: {
    width: "38px",
    height: "38px",
    borderRadius: "14px",
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

export default Meditation;