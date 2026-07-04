import React, { useState } from "react";

function MoodTracker() {
  const moods = [
    {
      emoji: "😊",
      name: "Happy",
      color: "#FFD166",
      message: "You are glowing today!",
    },
    {
      emoji: "😌",
      name: "Calm",
      color: "#A8DADC",
      message: "Peaceful and relaxed mind.",
    },
    {
      emoji: "😔",
      name: "Sad",
      color: "#B8C0FF",
      message: "It is okay to feel sad sometimes.",
    },
    {
      emoji: "😡",
      name: "Angry",
      color: "#FF8FAB",
      message: "Take a deep breath and relax.",
    },
    {
      emoji: "😰",
      name: "Anxious",
      color: "#CDB4DB",
      message: "You are stronger than your worries.",
    },
    {
      emoji: "🤩",
      name: "Excited",
      color: "#FFAFCC",
      message: "Amazing energy today!",
    },
  ];

  const ratingLevels = [
    { value: 1, title: "Very Mild", description: "A gentle feeling, barely noticeable." },
    { value: 2, title: "Mild", description: "You feel it, but it's manageable." },
    { value: 3, title: "Moderate", description: "A noticeable feeling affecting your mood." },
    { value: 4, title: "Strong", description: "A powerful feeling that's hard to ignore." },
    { value: 5, title: "Very Strong", description: "An intense feeling taking over your mind." },
  ];

  const [selectedMood, setSelectedMood] = useState(null);
  const [rating, setRating] = useState(3);
  const [note, setNote] = useState("");
  const [history, setHistory] = useState([]);

  const getRatingColor = () => {
    switch (rating) {
      case 1:
        return "#4ADE80";
      case 2:
        return "#84CC16";
      case 3:
        return "#FACC15";
      case 4:
        return "#FB923C";
      case 5:
        return "#EF4444";
      default:
        return "#8B5CF6";
    }
  };

  const getColorForValue = (value) => {
    switch (value) {
      case 1:
        return "#4ADE80";
      case 2:
        return "#84CC16";
      case 3:
        return "#FACC15";
      case 4:
        return "#FB923C";
      case 5:
        return "#EF4444";
      default:
        return "#8B5CF6";
    }
  };

  const saveMood = () => {
    if (!selectedMood) {
      alert("Please select your mood first");
      return;
    }

    const ratingInfo = ratingLevels.find((r) => r.value === rating);

    const newMood = {
      id: Date.now(),
      mood: selectedMood,
      rating: rating,
      ratingText: ratingInfo?.title,
      note: note,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setHistory([newMood, ...history]);

    alert(
      `${selectedMood.emoji} ${selectedMood.name} mood saved successfully!`
    );

    setSelectedMood(null);
    setNote("");
    setRating(3);
  };

  return (
    <div style={styles.page}>
      <div style={styles.circleOne}></div>
      <div style={styles.circleTwo}></div>
      <div style={styles.circleThree}></div>

      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Mood Tracker</h1>
            <p style={styles.subtitle}>How are you feeling today?</p>
          </div>

          <div style={styles.dateBox}>
            <span style={styles.dateText}>{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        <div style={styles.topGrid}>
          <div style={styles.mainCard}>
            <h2 style={styles.sectionTitle}>Select Your Mood</h2>

            <div style={styles.moodGrid}>
              {moods.map((mood) => (
                <button
                  key={mood.name}
                  onClick={() => setSelectedMood(mood)}
                  style={{
                    ...styles.moodCard,
                    border:
                      selectedMood?.name === mood.name
                        ? `3px solid ${mood.color}`
                        : "1px solid rgba(255,255,255,0.7)",
                    background:
                      selectedMood?.name === mood.name
                        ? `linear-gradient(145deg, white, ${mood.color})`
                        : "rgba(255,255,255,0.65)",
                    transform:
                      selectedMood?.name === mood.name
                        ? "translateY(-10px) scale(1.05)"
                        : "translateY(0)",
                  }}
                >
                  <div
                    style={{
                      ...styles.topLine,
                      backgroundColor: mood.color,
                    }}
                  ></div>
                  <span style={styles.emoji}>{mood.emoji}</span>
                  <span style={styles.moodName}>{mood.name}</span>
                </button>
              ))}
            </div>

            <div style={styles.selectedBox}>
              {selectedMood ? (
                <>
                  <div
                    style={{
                      ...styles.selectedEmojiBox,
                      backgroundColor: selectedMood.color,
                    }}
                  >
                    {selectedMood.emoji}
                  </div>

                  <div>
                    <h3 style={styles.selectedTitle}>
                      You feel {selectedMood.name}
                    </h3>
                    <p style={styles.selectedText}>{selectedMood.message}</p>
                  </div>
                </>
              ) : (
                <p style={styles.selectedText}>Select a mood to continue</p>
              )}
            </div>

            {selectedMood && (
              <div style={styles.ratingSection}>
                <h4 style={styles.ratingSectionTitle}>Rate the Intensity</h4>

                <div style={styles.ratingButtons}>
                  {ratingLevels.map((lvl) => (
                    <button
                      key={lvl.value}
                      onClick={() => setRating(lvl.value)}
                      style={{
                        ...styles.ratingButton,
                        background:
                          rating === lvl.value
                            ? getColorForValue(lvl.value)
                            : "rgba(255,255,255,0.65)",
                        color: rating === lvl.value ? "#fff" : "#312244",
                      }}
                    >
                      ⭐ {lvl.value}
                    </button>
                  ))}
                </div>

                <p style={styles.ratingSectionCaption}>
                  {ratingLevels.find((r) => r.value === rating)?.title}
                </p>
              </div>
            )}

            <textarea
              style={styles.textArea}
              placeholder="Write your thoughts here..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            ></textarea>

            <button
              style={{
                ...styles.saveButton,
                background: "linear-gradient(135deg,#7C3AED,#A855F7,#EC4899)",
              }}
              onClick={saveMood}
            >
              Save Mood
            </button>
          </div>

          <div style={styles.sideCard}>
            <h2 style={styles.sectionTitle}>Today's Mood</h2>

            <div style={styles.summaryMood}>
              {selectedMood ? selectedMood.emoji : "🌸"}
            </div>

            <h3 style={styles.summaryTitle}>
              {selectedMood
                ? `${selectedMood.name} (${
                    ratingLevels.find((r) => r.value === rating)?.title
                  })`
                : "No Mood Selected"}
            </h3>

            <p style={styles.summaryText}>
              {selectedMood
                ? selectedMood.message
                : "Choose your mood and rate how intense it feels."}
            </p>

            <div
              style={{
                background: "#F7F3FF",
                borderRadius: "18px",
                padding: "18px",
                marginBottom: "18px",
                textAlign: "left",
              }}
            >
              <h4
                style={{
                  margin: "0 0 8px",
                  color: getRatingColor(),
                }}
              >
                ⭐ Intensity
              </h4>

              <p style={{ margin: 0, color: "#555" }}>
                {ratingLevels.find((r) => r.value === rating)?.description}
              </p>
            </div>

            <div style={styles.statsBox}>
              <div style={styles.statItem}>
                <h3 style={styles.statNumber}>{history.length}</h3>
                <p style={styles.statLabel}>Total Records</p>
              </div>

              <div style={styles.statItem}>
                <h3 style={styles.statNumber}>
                  {history.length > 0 ? `${history[0].mood.name}` : "-"}
                </h3>

                <p style={styles.statLabel}>Last Mood</p>
              </div>
            </div>

            <div
              style={{
                marginTop: "20px",
                background: "#FFF7E8",
                borderRadius: "18px",
                padding: "18px",
                border: "1px solid #FFE5A8",
              }}
            >
              <h4
                style={{
                  margin: "0 0 8px",
                  color: "#B7791F",
                }}
              >
                💡 Daily Reminder
              </h4>

              <p
                style={{
                  margin: 0,
                  color: "#666",
                  lineHeight: "24px",
                }}
              >
                Every feeling is temporary. Recording your emotions helps you
                understand yourself better.
              </p>
            </div>

            <div
              style={{
                marginTop: "20px",
                background: "linear-gradient(135deg,#EEF2FF,#F9F5FF)",
                borderRadius: "20px",
                padding: "18px",
                border: "1px solid #DDD6FE",
              }}
            >
              <h3
                style={{
                  color: "#6D28D9",
                  marginBottom: "12px",
                }}
              >
                📊 Mood Guide
              </h3>

              <div style={{ lineHeight: "30px", color: "#555" }}>
                <div>😊 Happy → Positive energy</div>
                <div>😌 Calm → Relaxed mind</div>
                <div>😔 Sad → Needs support</div>
                <div>😡 Angry → Take a break</div>
                <div>😰 Anxious → Breathe slowly</div>
                <div>🤩 Excited → High motivation</div>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.historyCard}>
          <div style={styles.historyHeader}>
            <h2 style={styles.sectionTitle}>Mood History</h2>
            <span style={styles.recordBadge}>{history.length} records</span>
          </div>

          {history.length === 0 ? (
            <div style={styles.emptyBox}>
              <h3 style={styles.emptyIcon}>📝</h3>
              <p style={styles.emptyText}>No mood records yet</p>
            </div>
          ) : (
            <div style={styles.historyList}>
              {history.map((item) => (
                <div key={item.id} style={styles.historyItem}>
                  <div
                    style={{
                      ...styles.historyIcon,
                      backgroundColor: item.mood.color,
                    }}
                  >
                    {item.mood.emoji}
                  </div>

                  <div style={styles.historyContent}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <h3 style={styles.historyMood}>{item.mood.name}</h3>

                      <span
                        style={{
                          background:
                            item.rating === 5
                              ? "#FEE2E2"
                              : item.rating === 4
                              ? "#FED7AA"
                              : item.rating === 3
                              ? "#FEF3C7"
                              : item.rating === 2
                              ? "#DCFCE7"
                              : "#BBF7D0",
                          color: "#6D28D9",
                          padding: "6px 12px",
                          borderRadius: "14px",
                          fontSize: "12px",
                          fontWeight: "700",
                        }}
                      >
                        ⭐ {item.ratingText}
                      </span>
                    </div>

                    <p
                      style={{
                        color: "#666",
                        marginTop: "8px",
                        lineHeight: "24px",
                      }}
                    >
                      {item.note || "No notes were added for this mood."}
                    </p>

                    <span style={styles.historyDate}>
                      {item.date} • {item.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "35px",
    background: "linear-gradient(160deg, #F1E8E9 0%, #EFE6EE 45%, #D2CFE1 100%)",
    fontFamily: "Arial, sans-serif",
    position: "relative",
    overflow: "hidden",
  },

  circleOne: {
    position: "absolute",
    width: "260px",
    height: "260px",
    borderRadius: "50%",
    background: "#FFAFCC",
    top: "60px",
    right: "80px",
    opacity: "0.35",
    filter: "blur(4px)",
  },

  circleTwo: {
    position: "absolute",
    width: "280px",
    height: "280px",
    borderRadius: "50%",
    background: "#B8C0FF",
    bottom: "80px",
    left: "60px",
    opacity: "0.35",
    filter: "blur(4px)",
  },

  circleThree: {
    position: "absolute",
    width: "180px",
    height: "180px",
    borderRadius: "50%",
    background: "#A8DADC",
    top: "300px",
    left: "45%",
    opacity: "0.25",
    filter: "blur(6px)",
  },

  container: {
    maxWidth: "1180px",
    margin: "0 auto",
    position: "relative",
    zIndex: 2,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
    flexWrap: "wrap",
    gap: "15px",
  },

  title: {
    fontSize: "40px",
    color: "#312244",
    margin: "0 0 6px 0",
    fontWeight: "800",
  },

  subtitle: {
    fontSize: "16px",
    color: "#6D597A",
    margin: 0,
  },

  dateBox: {
    padding: "13px 22px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.5)",
    boxShadow: "0 12px 25px rgba(49,34,68,0.12)",
    backdropFilter: "blur(15px)",
  },

  dateText: {
    color: "#4A4E69",
    fontWeight: "700",
  },

  topGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "25px",
    marginBottom: "25px",
  },

  mainCard: {
    background: "rgba(255,255,255,0.52)",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.75)",
    borderRadius: "32px",
    padding: "28px",
    boxShadow: "0 25px 60px rgba(49,34,68,0.16)",
  },

  sideCard: {
    background: "rgba(255,255,255,0.52)",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.75)",
    borderRadius: "32px",
    padding: "28px",
    boxShadow: "0 25px 60px rgba(49,34,68,0.16)",
    textAlign: "center",
  },

  sectionTitle: {
    color: "#312244",
    fontSize: "24px",
    margin: "0 0 22px 0",
    fontWeight: "800",
  },

  moodGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "17px",
    marginBottom: "25px",
  },

  moodCard: {
    minHeight: "135px",
    borderRadius: "28px",
    cursor: "pointer",
    boxShadow: "0 14px 25px rgba(49,34,68,0.12)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    transition: "0.35s ease",
  },

  topLine: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "8px",
  },

  emoji: {
    fontSize: "42px",
    marginBottom: "12px",
  },

  moodName: {
    fontSize: "15px",
    fontWeight: "800",
    color: "#312244",
  },

  selectedBox: {
    minHeight: "90px",
    borderRadius: "26px",
    padding: "18px",
    background: "rgba(255,255,255,0.58)",
    display: "flex",
    alignItems: "center",
    gap: "18px",
    marginBottom: "18px",
    boxShadow: "inset 0 0 18px rgba(255,255,255,0.7)",
  },

  selectedEmojiBox: {
    width: "64px",
    height: "64px",
    borderRadius: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "36px",
    boxShadow: "0 12px 22px rgba(49,34,68,0.14)",
  },

  selectedTitle: {
    color: "#312244",
    margin: "0 0 5px 0",
    fontSize: "20px",
  },

  selectedText: {
    color: "#6D597A",
    margin: 0,
    lineHeight: "1.5",
  },

  ratingSection: {
    marginBottom: "20px",
    padding: "18px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.5)",
    boxShadow: "inset 0 0 14px rgba(255,255,255,0.6)",
  },

  ratingSectionTitle: {
    margin: "0 0 12px",
    color: "#312244",
    fontSize: "15px",
  },

  ratingButtons: {
    display: "flex",
    gap: "10px",
    marginBottom: "10px",
  },

  ratingButton: {
    flex: 1,
    padding: "10px 0",
    border: "none",
    borderRadius: "14px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "0.25s ease",
  },

  ratingSectionCaption: {
    margin: 0,
    fontSize: "13px",
    color: "#6D597A",
    fontWeight: "700",
  },

  textArea: {
    width: "100%",
    height: "130px",
    resize: "none",
    border: "none",
    outline: "none",
    borderRadius: "26px",
    padding: "18px",
    fontSize: "15px",
    color: "#312244",
    background: "rgba(255,255,255,0.7)",
    boxShadow: "inset 0 0 18px rgba(49,34,68,0.08)",
    marginBottom: "20px",
    boxSizing: "border-box",
  },

  saveButton: {
    width: "100%",
    padding: "16px",
    border: "none",
    borderRadius: "24px",
    background: "linear-gradient(135deg, #9B5DE5, #F15BB5)",
    color: "white",
    fontSize: "17px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 18px 35px rgba(155,93,229,0.35)",
  },

  summaryMood: {
    fontSize: "75px",
    margin: "20px 0",
  },

  summaryTitle: {
    color: "#312244",
    fontSize: "22px",
    margin: "0 0 10px 0",
  },

  summaryText: {
    color: "#6D597A",
    lineHeight: "1.6",
    marginBottom: "25px",
  },

  statsBox: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "15px",
  },

  statItem: {
    background: "rgba(255,255,255,0.65)",
    borderRadius: "22px",
    padding: "18px",
    boxShadow: "0 12px 24px rgba(49,34,68,0.1)",
  },

  statNumber: {
    color: "#312244",
    fontSize: "24px",
    margin: "0 0 5px 0",
  },

  statLabel: {
    color: "#6D597A",
    margin: 0,
    fontSize: "14px",
  },

  historyCard: {
    background: "rgba(255,255,255,0.52)",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.75)",
    borderRadius: "32px",
    padding: "28px",
    boxShadow: "0 25px 60px rgba(49,34,68,0.16)",
  },

  historyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
  },

  recordBadge: {
    background: "rgba(255,255,255,0.65)",
    padding: "8px 16px",
    borderRadius: "20px",
    color: "#6D597A",
    fontWeight: "700",
  },

  emptyBox: {
    textAlign: "center",
    padding: "35px",
    background: "rgba(255,255,255,0.45)",
    borderRadius: "24px",
  },

  emptyIcon: {
    fontSize: "42px",
    margin: "0 0 10px 0",
  },

  emptyText: {
    color: "#6D597A",
    margin: 0,
  },

  historyList: {
    display: "grid",
    gap: "16px",
  },

  historyItem: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.62)",
    boxShadow: "0 12px 26px rgba(49,34,68,0.1)",
  },

  historyIcon: {
    width: "60px",
    height: "60px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    boxShadow: "0 12px 22px rgba(49,34,68,0.14)",
    flexShrink: 0,
  },

  historyContent: {
    flex: 1,
  },

  historyMood: {
    color: "#312244",
    margin: "0 0 5px 0",
    fontSize: "18px",
  },

  historyNote: {
    color: "#6D597A",
    margin: "0 0 5px 0",
    lineHeight: "1.5",
  },

  historyDate: {
    color: "#8D7D99",
    fontSize: "13px",
  },
};

export default MoodTracker;