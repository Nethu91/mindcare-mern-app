import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import bgImage from "../assets/profile-bg.jpeg";

// Same wallpaper approach as the Assessment / Mood Tracker pages
function Background() {
  return (
    <>
      {/* blurred wallpaper (desktop sides) */}
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

      {/* sharp wallpaper, phone-width column */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "100vh",
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
            backgroundImage: `linear-gradient(rgba(255,255,255,0.05), rgba(255,255,255,0.18)), url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
            backgroundRepeat: "no-repeat",
            boxShadow: "0 0 40px rgba(38,48,90,0.18)",
          }}
        />
      </div>
    </>
  );
}

function Profile() {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const savedUser = JSON.parse(localStorage.getItem("user"));

  const [profile, setProfile] = useState({
    name: savedUser?.name || "",
    email: savedUser?.email || "",
    phone: "",
    age: "",
    gender: "",
    city: "",
    role: "MindCare User",
    emergencyName: "",
    emergencyPhone: "",
    goal: "",
    reminderTime: "",
    preferredSupport: "",
  });

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedMood, setSelectedMood] = useState("Calm");

  // ===========================
  // Responsive (mobile) detection
  // Uses ResizeObserver on the actual
  // page container width instead of
  // window.innerWidth, so it works
  // correctly inside the locked-width
  // ".app-screen" phone frame too
  // (window stays wide on desktop even
  // though the visible frame is narrow).
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
  // Load real profile from backend
  // ===========================

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoadingProfile(true);

      const res = await API.get("/auth/profile"); // ⚠️ adjust path if your authRoutes are mounted elsewhere

      if (res?.data) {
        setProfile((prev) => ({
          ...prev,
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          age: res.data.age ?? "",
          gender: res.data.gender || "",
          city: res.data.city || "",
          emergencyName: res.data.emergencyName || "",
          emergencyPhone: res.data.emergencyPhone || "",
          goal: res.data.goal || "",
          reminderTime: res.data.reminderTime || "",
          preferredSupport: res.data.preferredSupport || "",
        }));
      }
    } catch (err) {
      console.log(err);
      alert("Couldn't load your profile. Showing saved local data instead.");
    } finally {
      setLoadingProfile(false);
    }
  };

  const wellnessStats = [
    {
      title: "Mood Entries",
      value: "18",
      icon: "😊",
      color: "#FFD166",
    },
    {
      title: "Assessments",
      value: "06",
      icon: "📝",
      color: "#B7DED6",
    },
    {
      title: "Meditations",
      value: "12",
      icon: "🧘‍♀️",
      color: "#A8DADC",
    },
    {
      title: "Appointments",
      value: "03",
      icon: "📅",
      color: "#FFAFCC",
    },
  ];

  const achievements = [
    {
      id: 1,
      title: "First Mood Check",
      text: "You started tracking your emotions.",
      icon: "🌱",
    },
    {
      id: 2,
      title: "Calm Listener",
      text: "You explored calm music sessions.",
      icon: "🎧",
    },
    {
      id: 3,
      title: "Mindful Moment",
      text: "You completed meditation practice.",
      icon: "🪷",
    },
  ];

  const moods = ["Happy", "Calm", "Tired", "Anxious", "Focused"];

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  // ===========================
  // Save profile to backend
  // ===========================

  const handleSave = async () => {
    try {
      setSaving(true);

      const res = await API.put("/auth/profile", {
        name: profile.name,
        phone: profile.phone,
        city: profile.city,
        age: profile.age,
        gender: profile.gender,
        emergencyName: profile.emergencyName,
        emergencyPhone: profile.emergencyPhone,
        goal: profile.goal,
        reminderTime: profile.reminderTime,
        preferredSupport: profile.preferredSupport,
      });

      // Keep the locally-stored user (used for the dashboard greeting
      // etc.) in sync with the name that was just saved.
      const updatedUser = {
        ...savedUser,
        name: res?.data?.name || profile.name,
        email: res?.data?.email || profile.email,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setIsEditing(false);
      alert("Profile updated successfully 💜");
    } catch (err) {
      console.log(err);
      alert("Failed to save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div
      ref={containerRef}
      style={{ ...styles.page, padding: isMobile ? "16px" : "35px" }}
    >
      <Background />

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
              My Profile
            </h1>
            <p style={styles.subtitle}>
              Manage your personal details, wellness preferences, support plan,
              and MindCare journey.
            </p>
          </div>

          {!isMobile && (
            <div style={styles.headerBadge}>👤 Personal Wellness Space</div>
          )}
        </div>

        {loadingProfile && (
          <div style={styles.loadingPill}>⏳ Loading your profile...</div>
        )}

        <div
          style={{
            ...styles.mainGrid,
            gridTemplateColumns: isMobile ? "1fr" : "0.85fr 1.55fr",
            gap: isMobile ? "18px" : "25px",
          }}
        >
          <div style={{ ...styles.leftPanel, gap: isMobile ? "18px" : "25px" }}>
            <div style={{ ...styles.profileCard, padding: isMobile ? "20px" : "30px" }}>
              <div style={styles.avatarWrapper}>
                <div style={styles.avatar}>👩‍💻</div>
                <div style={styles.onlineDot}></div>
              </div>

              <h2 style={styles.profileName}>{profile.name || "User"}</h2>
              <p style={styles.profileRole}>{profile.role}</p>

              <div style={styles.moodBadge}>Current Mood: {selectedMood}</div>

              <div style={styles.quickInfoGrid}>
                <div style={styles.quickInfoBox}>
                  <span style={styles.quickLabel}>City</span>
                  <strong style={styles.quickValue}>
                    {profile.city || "-"}
                  </strong>
                </div>

                <div style={styles.quickInfoBox}>
                  <span style={styles.quickLabel}>Age</span>
                  <strong style={styles.quickValue}>
                    {profile.age || "-"}
                  </strong>
                </div>
              </div>

              <button
                style={styles.editButton}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Cancel Edit" : "Edit Profile"}
              </button>

              <button style={styles.logoutButton} onClick={handleLogout}>
                Logout
              </button>
            </div>

            <div style={{ ...styles.moodCard, padding: isMobile ? "18px" : "25px" }}>
              <h3 style={styles.smallTitle}>How do you feel now?</h3>

              <div style={styles.moodGrid}>
                {moods.map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                    style={{
                      ...styles.moodButton,
                      background:
                        selectedMood === mood
                          ? "linear-gradient(135deg, #3B4A8C, #4DB6AC)"
                          : "rgba(255,255,255,0.7)",
                      color: selectedMood === mood ? "#FFFFFF" : "#26305A",
                    }}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ ...styles.rightPanel, gap: isMobile ? "18px" : "25px" }}>
            <div style={{ ...styles.formCard, padding: isMobile ? "18px" : "30px" }}>
              <div
                style={{
                  ...styles.cardHeader,
                  flexDirection: isMobile ? "column" : "row",
                  alignItems: isMobile ? "flex-start" : "center",
                  gap: isMobile ? "12px" : "16px",
                }}
              >
                <div>
                  <h2 style={styles.sectionTitle}>Personal Information</h2>
                  <p style={styles.sectionSubText}>
                    Keep your profile details updated for better support.
                  </p>
                </div>

                {!isMobile && <div style={styles.cardIcon}>🪪</div>}
              </div>

              <div
                style={{
                  ...styles.formGrid,
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                }}
              >
                <div>
                  <label style={styles.label}>Full Name</label>
                  <input
                    style={styles.input}
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label style={styles.label}>Email</label>
                  <input
                    style={styles.input}
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    disabled
                    title="Email can't be changed here"
                  />
                </div>

                <div>
                  <label style={styles.label}>Phone</label>
                  <input
                    style={styles.input}
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label style={styles.label}>City</label>
                  <input
                    style={styles.input}
                    name="city"
                    value={profile.city}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label style={styles.label}>Age</label>
                  <input
                    style={styles.input}
                    name="age"
                    value={profile.age}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label style={styles.label}>Gender</label>
                  <input
                    style={styles.input}
                    name="gender"
                    value={profile.gender}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {isEditing && (
                <button
                  style={{ ...styles.saveButton, opacity: saving ? 0.7 : 1 }}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              )}
            </div>

            <div
              style={{
                ...styles.statsGrid,
                gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
                gap: isMobile ? "12px" : "16px",
              }}
            >
              {wellnessStats.map((stat) => (
                <div
                  key={stat.title}
                  style={{ ...styles.statCard, padding: isMobile ? "14px" : "18px" }}
                >
                  <div
                    style={{
                      ...styles.statIcon,
                      backgroundColor: stat.color,
                    }}
                  >
                    {stat.icon}
                  </div>

                  <div>
                    <h3 style={styles.statValue}>{stat.value}</h3>
                    <p style={styles.statText}>{stat.title}</p>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                ...styles.supportGrid,
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: isMobile ? "18px" : "25px",
              }}
            >
              <div style={{ ...styles.supportCard, padding: isMobile ? "18px" : "30px" }}>
                <div
                  style={{
                    ...styles.cardHeader,
                    flexDirection: isMobile ? "column" : "row",
                    alignItems: isMobile ? "flex-start" : "center",
                    gap: isMobile ? "12px" : "16px",
                  }}
                >
                  <div>
                    <h2 style={styles.sectionTitle}>Emergency Contact</h2>
                    <p style={styles.sectionSubText}>
                      Trusted person for urgent support.
                    </p>
                  </div>
                  {!isMobile && <div style={styles.cardIcon}>🚨</div>}
                </div>

                <label style={styles.label}>Contact Name</label>
                <input
                  style={styles.input}
                  name="emergencyName"
                  value={profile.emergencyName}
                  onChange={handleChange}
                  disabled={!isEditing}
                />

                <label style={styles.label}>Contact Phone</label>
                <input
                  style={styles.input}
                  name="emergencyPhone"
                  value={profile.emergencyPhone}
                  onChange={handleChange}
                  disabled={!isEditing}
                />

                <button
                  style={styles.callButton}
                  onClick={() =>
                    (window.location.href = `tel:${profile.emergencyPhone}`)
                  }
                >
                  Call Emergency Contact
                </button>
              </div>

              <div style={{ ...styles.supportCard, padding: isMobile ? "18px" : "30px" }}>
                <div
                  style={{
                    ...styles.cardHeader,
                    flexDirection: isMobile ? "column" : "row",
                    alignItems: isMobile ? "flex-start" : "center",
                    gap: isMobile ? "12px" : "16px",
                  }}
                >
                  <div>
                    <h2 style={styles.sectionTitle}>Wellness Preferences</h2>
                    <p style={styles.sectionSubText}>
                      Personalize your MindCare support.
                    </p>
                  </div>
                  {!isMobile && <div style={styles.cardIcon}>🌿</div>}
                </div>

                <label style={styles.label}>Wellness Goal</label>
                <textarea
                  style={styles.textArea}
                  name="goal"
                  value={profile.goal}
                  onChange={handleChange}
                  disabled={!isEditing}
                ></textarea>

                <label style={styles.label}>Daily Reminder Time</label>
                <input
                  style={styles.input}
                  name="reminderTime"
                  type="time"
                  value={profile.reminderTime}
                  onChange={handleChange}
                  disabled={!isEditing}
                />

                <label style={styles.label}>Preferred Support</label>
                <input
                  style={styles.input}
                  name="preferredSupport"
                  value={profile.preferredSupport}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>
        </div>

        <div style={{ ...styles.achievementCard, padding: isMobile ? "18px" : "30px" }}>
          <div
            style={{
              ...styles.cardHeader,
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "flex-start" : "center",
              gap: isMobile ? "12px" : "16px",
            }}
          >
            <div>
              <h2 style={styles.sectionTitle}>Wellness Achievements</h2>
              <p style={styles.sectionSubText}>
                Your progress and positive steps in MindCare.
              </p>
            </div>

            {!isMobile && <div style={styles.cardIcon}>🏆</div>}
          </div>

          <div
            style={{
              ...styles.achievementGrid,
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              gap: isMobile ? "14px" : "18px",
            }}
          >
            {achievements.map((item) => (
              <div key={item.id} style={styles.achievementItem}>
                <div style={styles.achievementIcon}>{item.icon}</div>
                <h3 style={styles.achievementTitle}>{item.title}</h3>
                <p style={styles.achievementText}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>

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
            <h3 style={styles.helpTitle}>Mood Tracker</h3>
            <p style={styles.helpText}>
              Record how you feel and understand your emotional patterns.
            </p>
            <p style={styles.helpLink}>Go to Mood Tracker →</p>
          </div>

          <div
            style={{ ...styles.helpCard, padding: isMobile ? "18px" : "25px" }}
            onClick={() => navigate("/assessment")}
          >
            <div style={styles.helpIcon}>📝</div>
            <h3 style={styles.helpTitle}>Assessment</h3>
            <p style={styles.helpText}>
              Complete wellness checks and review your mental health state.
            </p>
            <p style={styles.helpLink}>Go to Assessment →</p>
          </div>

          <div
            style={{ ...styles.helpCard, padding: isMobile ? "18px" : "25px" }}
            onClick={() => navigate("/emergency")}
          >
            <div style={styles.helpIcon}>🚨</div>
            <h3 style={styles.helpTitle}>Emergency Support</h3>
            <p style={styles.helpText}>
              Access urgent support contacts and safety actions quickly.
            </p>
            <p style={styles.helpLink}>Go to Emergency →</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Shared glass effect for all cards
const glass = {
  background: "rgba(255,255,255,0.62)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: "1px solid rgba(255,255,255,0.78)",
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#EFEBDD",
    fontFamily: "Arial, sans-serif",
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
    border: "none",
    padding: "10px 16px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.65)",
    color: "#4F6272",
    fontWeight: "800",
    cursor: "pointer",
    marginBottom: "12px",
    boxShadow: "0 10px 24px rgba(38,48,90,0.1)",
  },

  title: {
    color: "#26305A",
    margin: "0 0 7px 0",
    fontWeight: "900",
  },

  subtitle: {
    color: "#4F6272",
    fontSize: "16px",
    margin: 0,
    lineHeight: "1.5",
  },

  headerBadge: {
    padding: "13px 22px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.55)",
    boxShadow: "0 12px 25px rgba(38,48,90,0.12)",
    color: "#4A4E69",
    fontWeight: "800",
  },

  loadingPill: {
    background: "#F1F6F5",
    borderRadius: "18px",
    padding: "14px",
    textAlign: "center",
    marginBottom: "20px",
    color: "#3B4A8C",
    fontWeight: "700",
  },

  mainGrid: {
    display: "grid",
    marginBottom: "25px",
  },

  leftPanel: {
    display: "grid",
  },

  rightPanel: {
    display: "grid",
  },

  profileCard: {
    ...glass,
    borderRadius: "34px",
    boxShadow: "0 25px 60px rgba(38,48,90,0.16)",
    textAlign: "center",
  },

  avatarWrapper: {
    width: "130px",
    height: "130px",
    margin: "0 auto 18px auto",
    position: "relative",
  },

  avatar: {
    width: "130px",
    height: "130px",
    borderRadius: "42px",
    background: "linear-gradient(135deg, #B7DED6, #EAD7F0)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "62px",
    boxShadow: "0 20px 40px rgba(38,48,90,0.18)",
  },

  onlineDot: {
    position: "absolute",
    right: "7px",
    bottom: "7px",
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    background: "#70D6A4",
    border: "4px solid #FFFFFF",
  },

  profileName: {
    color: "#26305A",
    margin: "0 0 7px 0",
    fontSize: "26px",
    fontWeight: "900",
  },

  profileRole: {
    color: "#4F6272",
    margin: "0 0 14px 0",
    fontWeight: "800",
  },

  moodBadge: {
    display: "inline-block",
    padding: "9px 16px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.75)",
    color: "#3B4A8C",
    fontWeight: "900",
    marginBottom: "18px",
  },

  quickInfoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "18px",
  },

  quickInfoBox: {
    background: "rgba(255,255,255,0.7)",
    borderRadius: "20px",
    padding: "14px",
  },

  quickLabel: {
    display: "block",
    color: "#7A8794",
    fontSize: "12px",
    fontWeight: "800",
    marginBottom: "5px",
  },

  quickValue: {
    color: "#26305A",
    fontSize: "15px",
  },

  editButton: {
    width: "100%",
    padding: "15px",
    border: "none",
    borderRadius: "23px",
    background: "linear-gradient(135deg, #3B4A8C, #4DB6AC)",
    color: "#FFFFFF",
    fontSize: "15px",
    fontWeight: "900",
    cursor: "pointer",
    marginBottom: "12px",
    boxShadow: "0 18px 35px rgba(59,74,140,0.3)",
  },

  logoutButton: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "22px",
    background: "rgba(255,143,171,0.25)",
    color: "#B83256",
    fontSize: "15px",
    fontWeight: "900",
    cursor: "pointer",
  },

  moodCard: {
    ...glass,
    borderRadius: "34px",
    boxShadow: "0 20px 45px rgba(38,48,90,0.13)",
  },

  smallTitle: {
    color: "#26305A",
    margin: "0 0 16px 0",
    fontSize: "21px",
    fontWeight: "900",
  },

  moodGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },

  moodButton: {
    border: "none",
    padding: "11px 15px",
    borderRadius: "18px",
    fontWeight: "900",
    cursor: "pointer",
  },

  formCard: {
    ...glass,
    borderRadius: "34px",
    boxShadow: "0 25px 60px rgba(38,48,90,0.16)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "22px",
  },

  sectionTitle: {
    color: "#26305A",
    margin: "0 0 7px 0",
    fontSize: "24px",
    fontWeight: "900",
  },

  sectionSubText: {
    color: "#4F6272",
    margin: 0,
    lineHeight: "1.5",
    fontSize: "14px",
  },

  cardIcon: {
    width: "62px",
    height: "62px",
    borderRadius: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    background: "linear-gradient(135deg, #B7DED6, #EAD7F0)",
    boxShadow: "0 15px 30px rgba(38,48,90,0.15)",
    flexShrink: 0,
  },

  formGrid: {
    display: "grid",
    gap: "16px",
  },

  label: {
    display: "block",
    color: "#26305A",
    fontWeight: "800",
    margin: "0 0 8px 0",
  },

  input: {
    width: "100%",
    padding: "15px",
    border: "none",
    outline: "none",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.72)",
    color: "#26305A",
    fontSize: "15px",
    boxShadow: "inset 0 0 16px rgba(38,48,90,0.07)",
    boxSizing: "border-box",
  },

  textArea: {
    width: "100%",
    minHeight: "90px",
    resize: "none",
    padding: "16px",
    border: "none",
    outline: "none",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.72)",
    color: "#26305A",
    fontSize: "15px",
    boxShadow: "inset 0 0 16px rgba(38,48,90,0.07)",
    boxSizing: "border-box",
    marginBottom: "14px",
  },

  saveButton: {
    width: "100%",
    marginTop: "20px",
    padding: "16px",
    border: "none",
    borderRadius: "24px",
    background: "linear-gradient(135deg, #70D6A4, #A8E6CF)",
    color: "#1B5E40",
    fontSize: "16px",
    fontWeight: "900",
    cursor: "pointer",
  },

  statsGrid: {
    display: "grid",
  },

  statCard: {
    ...glass,
    display: "flex",
    alignItems: "center",
    gap: "12px",
    borderRadius: "26px",
    boxShadow: "0 18px 38px rgba(38,48,90,0.12)",
  },

  statIcon: {
    width: "54px",
    height: "54px",
    borderRadius: "19px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    flexShrink: 0,
  },

  statValue: {
    color: "#26305A",
    margin: "0 0 4px 0",
    fontSize: "24px",
    fontWeight: "900",
  },

  statText: {
    color: "#4F6272",
    margin: 0,
    fontSize: "12px",
    fontWeight: "800",
  },

  supportGrid: {
    display: "grid",
  },

  supportCard: {
    ...glass,
    borderRadius: "34px",
    boxShadow: "0 25px 60px rgba(38,48,90,0.16)",
  },

  callButton: {
    width: "100%",
    marginTop: "16px",
    padding: "15px",
    border: "none",
    borderRadius: "23px",
    background: "linear-gradient(135deg, #E63946, #FF758F)",
    color: "#FFFFFF",
    fontSize: "15px",
    fontWeight: "900",
    cursor: "pointer",
  },

  achievementCard: {
    ...glass,
    borderRadius: "34px",
    marginBottom: "25px",
    boxShadow: "0 25px 60px rgba(38,48,90,0.16)",
  },

  achievementGrid: {
    display: "grid",
  },

  achievementItem: {
    background: "rgba(255,255,255,0.68)",
    borderRadius: "26px",
    padding: "22px",
    textAlign: "center",
    boxShadow: "0 14px 28px rgba(38,48,90,0.09)",
  },

  achievementIcon: {
    fontSize: "42px",
    marginBottom: "12px",
  },

  achievementTitle: {
    color: "#26305A",
    margin: "0 0 8px 0",
    fontWeight: "900",
  },

  achievementText: {
    color: "#4F6272",
    margin: 0,
    lineHeight: "1.5",
    fontSize: "14px",
  },

  bottomGrid: {
    display: "grid",
  },

  helpCard: {
    ...glass,
    borderRadius: "30px",
    boxShadow: "0 20px 45px rgba(38,48,90,0.13)",
    textAlign: "center",
    cursor: "pointer",
    boxSizing: "border-box",
  },

  helpIcon: {
    width: "58px",
    height: "58px",
    margin: "0 auto 14px auto",
    borderRadius: "20px",
    background: "linear-gradient(135deg, #E6F4F1, #FFFFFF)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
  },

  helpTitle: {
    color: "#26305A",
    margin: "0 0 8px 0",
    fontWeight: "900",
  },

  helpText: {
    color: "#4F6272",
    lineHeight: "1.6",
    margin: 0,
    fontSize: "14px",
  },

  helpLink: {
    margin: "14px 0 0 0",
    color: "#3B4A8C",
    fontSize: "13px",
    fontWeight: "900",
  },
};

export default Profile;