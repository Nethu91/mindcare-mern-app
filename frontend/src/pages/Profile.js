import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();

  const savedUser = JSON.parse(localStorage.getItem("user"));

  const [profile, setProfile] = useState({
    name: savedUser?.name || "Rashmi Athapaththu",
    email: savedUser?.email || "rashmi@example.com",
    phone: "+94 77 123 4567",
    age: "23",
    gender: "Female",
    city: "Colombo",
    role: "MindCare User",
    emergencyName: "Madara",
    emergencyPhone: "+94 77 765 4321",
    goal: "Reduce stress and improve daily emotional balance",
    reminderTime: "20:30",
    preferredSupport: "Counselor + Meditation",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [selectedMood, setSelectedMood] = useState("Calm");

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
      color: "#CDB4DB",
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

  const handleSave = () => {
    const updatedUser = {
      ...savedUser,
      name: profile.name,
      email: profile.email,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    setIsEditing(false);
    alert("Profile updated successfully 💜");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
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

            <h1 style={styles.title}>My Profile</h1>
            <p style={styles.subtitle}>
              Manage your personal details, wellness preferences, support plan,
              and MindCare journey.
            </p>
          </div>

          <div style={styles.headerBadge}>👤 Personal Wellness Space</div>
        </div>

        <div style={styles.mainGrid}>
          <div style={styles.leftPanel}>
            <div style={styles.profileCard}>
              <div style={styles.avatarWrapper}>
                <div style={styles.avatar}>👩‍💻</div>
                <div style={styles.onlineDot}></div>
              </div>

              <h2 style={styles.profileName}>{profile.name}</h2>
              <p style={styles.profileRole}>{profile.role}</p>

              <div style={styles.moodBadge}>Current Mood: {selectedMood}</div>

              <div style={styles.quickInfoGrid}>
                <div style={styles.quickInfoBox}>
                  <span style={styles.quickLabel}>City</span>
                  <strong style={styles.quickValue}>{profile.city}</strong>
                </div>

                <div style={styles.quickInfoBox}>
                  <span style={styles.quickLabel}>Age</span>
                  <strong style={styles.quickValue}>{profile.age}</strong>
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

            <div style={styles.moodCard}>
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
                          ? "linear-gradient(135deg, #9B5DE5, #F15BB5)"
                          : "rgba(255,255,255,0.7)",
                      color: selectedMood === mood ? "#FFFFFF" : "#312244",
                    }}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={styles.rightPanel}>
            <div style={styles.formCard}>
              <div style={styles.cardHeader}>
                <div>
                  <h2 style={styles.sectionTitle}>Personal Information</h2>
                  <p style={styles.sectionSubText}>
                    Keep your profile details updated for better support.
                  </p>
                </div>

                <div style={styles.cardIcon}>🪪</div>
              </div>

              <div style={styles.formGrid}>
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
                    disabled={!isEditing}
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
                <button style={styles.saveButton} onClick={handleSave}>
                  Save Changes
                </button>
              )}
            </div>

            <div style={styles.statsGrid}>
              {wellnessStats.map((stat) => (
                <div key={stat.title} style={styles.statCard}>
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

            <div style={styles.supportGrid}>
              <div style={styles.supportCard}>
                <div style={styles.cardHeader}>
                  <div>
                    <h2 style={styles.sectionTitle}>Emergency Contact</h2>
                    <p style={styles.sectionSubText}>
                      Trusted person for urgent support.
                    </p>
                  </div>
                  <div style={styles.cardIcon}>🚨</div>
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

              <div style={styles.supportCard}>
                <div style={styles.cardHeader}>
                  <div>
                    <h2 style={styles.sectionTitle}>Wellness Preferences</h2>
                    <p style={styles.sectionSubText}>
                      Personalize your MindCare support.
                    </p>
                  </div>
                  <div style={styles.cardIcon}>🌿</div>
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

        <div style={styles.achievementCard}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Wellness Achievements</h2>
              <p style={styles.sectionSubText}>
                Your progress and positive steps in MindCare.
              </p>
            </div>

            <div style={styles.cardIcon}>🏆</div>
          </div>

          <div style={styles.achievementGrid}>
            {achievements.map((item) => (
              <div key={item.id} style={styles.achievementItem}>
                <div style={styles.achievementIcon}>{item.icon}</div>
                <h3 style={styles.achievementTitle}>{item.title}</h3>
                <p style={styles.achievementText}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.bottomGrid}>
          <div style={styles.helpCard} onClick={() => navigate("/mood")}>
            <div style={styles.helpIcon}>😊</div>
            <h3 style={styles.helpTitle}>Mood Tracker</h3>
            <p style={styles.helpText}>
              Record how you feel and understand your emotional patterns.
            </p>
            <p style={styles.helpLink}>Go to Mood Tracker →</p>
          </div>

          <div style={styles.helpCard} onClick={() => navigate("/assessment")}>
            <div style={styles.helpIcon}>📝</div>
            <h3 style={styles.helpTitle}>Assessment</h3>
            <p style={styles.helpText}>
              Complete wellness checks and review your mental health state.
            </p>
            <p style={styles.helpLink}>Go to Assessment →</p>
          </div>

          <div style={styles.helpCard} onClick={() => navigate("/emergency")}>
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

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "0.85fr 1.55fr",
    gap: "25px",
    marginBottom: "25px",
  },

  leftPanel: {
    display: "grid",
    gap: "25px",
  },

  rightPanel: {
    display: "grid",
    gap: "25px",
  },

  profileCard: {
    background: "rgba(255,255,255,0.56)",
    border: "1px solid rgba(255,255,255,0.78)",
    borderRadius: "34px",
    padding: "30px",
    boxShadow: "0 25px 60px rgba(49,34,68,0.16)",
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
    background: "linear-gradient(135deg, #CDB4DB, #FFC8DD)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "62px",
    boxShadow: "0 20px 40px rgba(49,34,68,0.18)",
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
    color: "#312244",
    margin: "0 0 7px 0",
    fontSize: "26px",
    fontWeight: "900",
  },

  profileRole: {
    color: "#6D597A",
    margin: "0 0 14px 0",
    fontWeight: "800",
  },

  moodBadge: {
    display: "inline-block",
    padding: "9px 16px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.75)",
    color: "#9B5DE5",
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
    color: "#8D7D99",
    fontSize: "12px",
    fontWeight: "800",
    marginBottom: "5px",
  },

  quickValue: {
    color: "#312244",
    fontSize: "15px",
  },

  editButton: {
    width: "100%",
    padding: "15px",
    border: "none",
    borderRadius: "23px",
    background: "linear-gradient(135deg, #9B5DE5, #F15BB5)",
    color: "#FFFFFF",
    fontSize: "15px",
    fontWeight: "900",
    cursor: "pointer",
    marginBottom: "12px",
    boxShadow: "0 18px 35px rgba(155,93,229,0.35)",
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
    background: "rgba(255,255,255,0.56)",
    border: "1px solid rgba(255,255,255,0.78)",
    borderRadius: "34px",
    padding: "25px",
    boxShadow: "0 20px 45px rgba(49,34,68,0.13)",
  },

  smallTitle: {
    color: "#312244",
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
    background: "rgba(255,255,255,0.56)",
    border: "1px solid rgba(255,255,255,0.78)",
    borderRadius: "34px",
    padding: "30px",
    boxShadow: "0 25px 60px rgba(49,34,68,0.16)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "22px",
  },

  sectionTitle: {
    color: "#312244",
    margin: "0 0 7px 0",
    fontSize: "24px",
    fontWeight: "900",
  },

  sectionSubText: {
    color: "#6D597A",
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
    background: "linear-gradient(135deg, #CDB4DB, #FFC8DD)",
    boxShadow: "0 15px 30px rgba(49,34,68,0.15)",
    flexShrink: 0,
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },

  label: {
    display: "block",
    color: "#312244",
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
    color: "#312244",
    fontSize: "15px",
    boxShadow: "inset 0 0 16px rgba(49,34,68,0.07)",
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
    color: "#312244",
    fontSize: "15px",
    boxShadow: "inset 0 0 16px rgba(49,34,68,0.07)",
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
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
  },

  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "18px",
    borderRadius: "26px",
    background: "rgba(255,255,255,0.56)",
    border: "1px solid rgba(255,255,255,0.78)",
    boxShadow: "0 18px 38px rgba(49,34,68,0.12)",
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
    color: "#312244",
    margin: "0 0 4px 0",
    fontSize: "24px",
    fontWeight: "900",
  },

  statText: {
    color: "#6D597A",
    margin: 0,
    fontSize: "12px",
    fontWeight: "800",
  },

  supportGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "25px",
  },

  supportCard: {
    background: "rgba(255,255,255,0.56)",
    border: "1px solid rgba(255,255,255,0.78)",
    borderRadius: "34px",
    padding: "30px",
    boxShadow: "0 25px 60px rgba(49,34,68,0.16)",
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
    background: "rgba(255,255,255,0.56)",
    border: "1px solid rgba(255,255,255,0.78)",
    borderRadius: "34px",
    padding: "30px",
    boxShadow: "0 25px 60px rgba(49,34,68,0.16)",
    marginBottom: "25px",
  },

  achievementGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "18px",
  },

  achievementItem: {
    background: "rgba(255,255,255,0.68)",
    borderRadius: "26px",
    padding: "22px",
    textAlign: "center",
    boxShadow: "0 14px 28px rgba(49,34,68,0.09)",
  },

  achievementIcon: {
    fontSize: "42px",
    marginBottom: "12px",
  },

  achievementTitle: {
    color: "#312244",
    margin: "0 0 8px 0",
    fontWeight: "900",
  },

  achievementText: {
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

export default Profile;