import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Counselor() {
  const navigate = useNavigate();

  const counselors = [
    {
      id: 1,
      name: "Dr. Hasini Wijesinghe",
      role: "Clinical Psychologist",
      specialty: "Stress, Anxiety & Depression",
      experience: "9 Years",
      rating: 4.9,
      location: "Colombo",
      available: "Available Today",
      image: "👩‍⚕️",
      color: "#FFAFCC",
      about:
        "Supports students and young adults with stress, anxiety, depression, and emotional wellness.",
    },
    {
      id: 2,
      name: "Mr. Kavindu Jayawardena",
      role: "Mental Health Counselor",
      specialty: "Student Counseling & Academic Stress",
      experience: "6 Years",
      rating: 4.7,
      location: "Kandy",
      available: "Tomorrow",
      image: "👨‍⚕️",
      color: "#A8DADC",
      about:
        "Provides counseling for university stress, study pressure, confidence issues, and personal problems.",
    },
    {
      id: 3,
      name: "Ms. Nethmi Fernando",
      role: "Wellness Therapist",
      specialty: "Mindfulness & Emotional Wellness",
      experience: "5 Years",
      rating: 4.8,
      location: "Galle",
      available: "Available Now",
      image: "👩‍💼",
      color: "#CDB4DB",
      about:
        "Focuses on mindfulness, emotional balance, self-care, and daily mental wellness support.",
    },
    {
      id: 4,
      name: "Dr. Malith Samarasinghe",
      role: "Psychiatrist",
      specialty: "Mental Health Consultation",
      experience: "10 Years",
      rating: 4.9,
      location: "Colombo",
      available: "This Week",
      image: "👨‍💼",
      color: "#FFD166",
      about:
        "Offers professional consultation for mental health concerns and emotional difficulties.",
    },
    {
      id: 5,
      name: "Ms. Chamodi Senanayake",
      role: "Counseling Psychologist",
      specialty: "Relationship Issues & Family Support",
      experience: "7 Years",
      rating: 4.6,
      location: "Matara",
      available: "Available Today",
      image: "👩‍🏫",
      color: "#B8C0FF",
      about:
        "Helps with relationship concerns, family pressure, communication issues, and personal growth.",
    },
    {
      id: 6,
      name: "Mr. Tharindu Bandara",
      role: "Student Counselor",
      specialty: "University Stress & Self Confidence",
      experience: "4 Years",
      rating: 4.5,
      location: "Online",
      available: "Available Now",
      image: "👨‍🏫",
      color: "#FFC8DD",
      about:
        "Specialized in supporting students with confidence, exam stress, and academic pressure.",
    },
  ];

  const [selectedCounselor, setSelectedCounselor] = useState(counselors[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMode, setSelectedMode] = useState("Online");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");

  const filteredCounselors = counselors.filter((counselor) => {
    const search = searchTerm.toLowerCase();

    return (
      counselor.name.toLowerCase().includes(search) ||
      counselor.role.toLowerCase().includes(search) ||
      counselor.specialty.toLowerCase().includes(search) ||
      counselor.location.toLowerCase().includes(search)
    );
  });

  const handleBooking = () => {
    if (!appointmentDate || !appointmentTime) {
      alert("Please select appointment date and time");
      return;
    }

    alert(
      `Appointment request sent successfully!\n\nCounselor: ${selectedCounselor.name}\nMode: ${selectedMode}\nDate: ${appointmentDate}\nTime: ${appointmentTime}`
    );

    setAppointmentDate("");
    setAppointmentTime("");
  };

  return (
    <div style={styles.page}>
      <div style={styles.circleOne}></div>
      <div style={styles.circleTwo}></div>
      <div style={styles.circleThree}></div>

      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Counselor Support</h1>
            <p style={styles.subtitle}>
              Connect with Sri Lankan counselors and get emotional support.
            </p>
          </div>

          <div style={styles.headerBadge}>💬 Private & Safe</div>
        </div>

        <div style={styles.heroCard}>
          <div>
            <h2 style={styles.heroTitle}>Need someone to talk to?</h2>
            <p style={styles.heroText}>
              Choose a counselor, select your session type, and request an
              appointment at a comfortable time.
            </p>
          </div>

          <div style={styles.heroIcon}>🧠</div>
        </div>

        <div style={styles.mainGrid}>
          <div style={styles.leftPanel}>
            <div style={styles.searchBox}>
              <span style={styles.searchIcon}>🔍</span>
              <input
                style={styles.searchInput}
                type="text"
                placeholder="Search counselor, specialty or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <h2 style={styles.sectionTitle}>Available Counselors</h2>

            <div style={styles.counselorList}>
              {filteredCounselors.length === 0 ? (
                <div style={styles.emptyBox}>
                  <h3 style={styles.emptyIcon}>😕</h3>
                  <p style={styles.emptyText}>No counselors found</p>
                </div>
              ) : (
                filteredCounselors.map((counselor) => (
                  <button
                    key={counselor.id}
                    onClick={() => setSelectedCounselor(counselor)}
                    style={{
                      ...styles.counselorCard,
                      border:
                        selectedCounselor.id === counselor.id
                          ? "3px solid #9B5DE5"
                          : "1px solid rgba(255,255,255,0.75)",
                      background:
                        selectedCounselor.id === counselor.id
                          ? "linear-gradient(145deg, #FFFFFF, #F3E8FF)"
                          : "rgba(255,255,255,0.64)",
                      transform:
                        selectedCounselor.id === counselor.id
                          ? "translateY(-5px) scale(1.01)"
                          : "translateY(0)",
                    }}
                  >
                    <div
                      style={{
                        ...styles.avatarBox,
                        backgroundColor: counselor.color,
                      }}
                    >
                      {counselor.image}
                    </div>

                    <div style={styles.counselorInfo}>
                      <h3 style={styles.counselorName}>{counselor.name}</h3>
                      <p style={styles.counselorRole}>{counselor.role}</p>
                      <p style={styles.specialty}>{counselor.specialty}</p>

                      <div style={styles.miniInfoRow}>
                        <span style={styles.miniBadge}>
                          ⭐ {counselor.rating}
                        </span>
                        <span style={styles.miniBadge}>
                          📍 {counselor.location}
                        </span>
                        <span style={styles.miniBadge}>
                          ⏳ {counselor.experience}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div style={styles.rightPanel}>
            <div style={styles.profileCard}>
              <div
                style={{
                  ...styles.profileAvatar,
                  backgroundColor: selectedCounselor.color,
                }}
              >
                {selectedCounselor.image}
              </div>

              <h2 style={styles.profileName}>{selectedCounselor.name}</h2>
              <p style={styles.profileRole}>{selectedCounselor.role}</p>

              <div style={styles.statusBadge}>
                🟢 {selectedCounselor.available}
              </div>

              <div style={styles.profileStats}>
                <div style={styles.statCard}>
                  <h3 style={styles.statValue}>{selectedCounselor.rating}</h3>
                  <p style={styles.statLabel}>Rating</p>
                </div>

                <div style={styles.statCard}>
                  <h3 style={styles.statValue}>
                    {selectedCounselor.experience}
                  </h3>
                  <p style={styles.statLabel}>Experience</p>
                </div>
              </div>

              <div style={styles.detailBox}>
                <h3 style={styles.detailTitle}>Specialized In</h3>
                <p style={styles.detailText}>{selectedCounselor.specialty}</p>
              </div>

              <div style={styles.detailBox}>
                <h3 style={styles.detailTitle}>About Counselor</h3>
                <p style={styles.detailText}>{selectedCounselor.about}</p>
              </div>

              <div style={styles.detailBox}>
                <h3 style={styles.detailTitle}>Session Location</h3>
                <p style={styles.detailText}>{selectedCounselor.location}</p>
              </div>
            </div>

            <div style={styles.bookingCard}>
              <h2 style={styles.sectionTitle}>Book Session</h2>

              <div style={styles.modeGrid}>
                {["Online", "Physical", "Phone Call"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSelectedMode(mode)}
                    style={{
                      ...styles.modeButton,
                      background:
                        selectedMode === mode
                          ? "linear-gradient(135deg, #9B5DE5, #F15BB5)"
                          : "rgba(255,255,255,0.68)",
                      color: selectedMode === mode ? "#FFFFFF" : "#312244",
                    }}
                  >
                    {mode === "Online"
                      ? "💻 Online"
                      : mode === "Physical"
                      ? "🏥 Physical"
                      : "📞 Phone"}
                  </button>
                ))}
              </div>

              <label style={styles.label}>Appointment Date</label>
              <input
                style={styles.input}
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
              />

              <label style={styles.label}>Appointment Time</label>
              <input
                style={styles.input}
                type="time"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
              />

              <button style={styles.bookButton} onClick={handleBooking}>
                Request Appointment
              </button>

              <p style={styles.safeNote}>
                🔒 Your session details are private and confidential.
              </p>
            </div>
          </div>
        </div>

        <div style={styles.bottomGrid}>
          <div style={styles.supportCard} onClick={() => navigate("/mood")}>
            <div style={styles.supportTopRow}>
              <div style={styles.supportIcon}>🌿</div>
              <span style={styles.supportBadge}>Wellness</span>
            </div>

            <h3 style={styles.supportTitle}>Calm Support</h3>

            <p style={styles.supportText}>
              Get emotional support for stress, anxiety, sadness, study
              pressure, and personal problems in a safe space.
            </p>

            <div style={styles.supportLine}></div>

            <p style={styles.supportMiniText}>Go to Mood Tracker →</p>
          </div>

          <div
            style={styles.supportCard}
            onClick={() => navigate("/appointments")}
          >
            <div style={styles.supportTopRow}>
              <div style={styles.supportIcon}>📅</div>
              <span style={styles.supportBadge}>Booking</span>
            </div>

            <h3 style={styles.supportTitle}>Easy Booking</h3>

            <p style={styles.supportText}>
              Select online, physical, or phone counseling and choose a date and
              time that is comfortable for you.
            </p>

            <div style={styles.supportLine}></div>

            <p style={styles.supportMiniText}>Go to Appointments →</p>
          </div>

          <div
            style={styles.supportCard}
            onClick={() => navigate("/assessment")}
          >
            <div style={styles.supportTopRow}>
              <div style={styles.supportIcon}>🤝</div>
              <span style={styles.supportBadge}>Guidance</span>
            </div>

            <h3 style={styles.supportTitle}>Trusted Guidance</h3>

            <p style={styles.supportText}>
              Connect with experienced counselors for mental wellness advice,
              self-confidence support, and personal growth.
            </p>

            <div style={styles.supportLine}></div>

            <p style={styles.supportMiniText}>Go to Assessment →</p>
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
    maxWidth: "1200px",
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

  title: {
    fontSize: "40px",
    color: "#312244",
    margin: "0 0 7px 0",
    fontWeight: "800",
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
    backdropFilter: "blur(14px)",
  },

  heroCard: {
    background: "rgba(255,255,255,0.55)",
    backdropFilter: "blur(18px)",
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
    fontWeight: "800",
  },

  heroText: {
    color: "#6D597A",
    lineHeight: "1.6",
    margin: 0,
    maxWidth: "720px",
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

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1.45fr 1fr",
    gap: "25px",
    marginBottom: "25px",
  },

  leftPanel: {
    background: "rgba(255,255,255,0.52)",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.75)",
    borderRadius: "32px",
    padding: "28px",
    boxShadow: "0 25px 60px rgba(49,34,68,0.16)",
  },

  rightPanel: {
    display: "grid",
    gap: "25px",
  },

  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "rgba(255,255,255,0.7)",
    padding: "15px 18px",
    borderRadius: "24px",
    boxShadow: "inset 0 0 18px rgba(49,34,68,0.07)",
    marginBottom: "24px",
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

  sectionTitle: {
    color: "#312244",
    fontSize: "24px",
    margin: "0 0 20px 0",
    fontWeight: "800",
  },

  counselorList: {
    display: "grid",
    gap: "17px",
  },

  counselorCard: {
    width: "100%",
    borderRadius: "26px",
    padding: "18px",
    display: "flex",
    gap: "16px",
    alignItems: "center",
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 14px 28px rgba(49,34,68,0.11)",
    transition: "0.3s ease",
  },

  avatarBox: {
    width: "78px",
    height: "78px",
    borderRadius: "26px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "38px",
    boxShadow: "0 14px 24px rgba(49,34,68,0.13)",
    flexShrink: 0,
  },

  counselorInfo: {
    flex: 1,
  },

  counselorName: {
    color: "#312244",
    fontSize: "19px",
    margin: "0 0 5px 0",
    fontWeight: "800",
  },

  counselorRole: {
    color: "#9B5DE5",
    margin: "0 0 5px 0",
    fontWeight: "700",
    fontSize: "14px",
  },

  specialty: {
    color: "#6D597A",
    margin: "0 0 10px 0",
    fontSize: "14px",
    lineHeight: "1.4",
  },

  miniInfoRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  miniBadge: {
    background: "rgba(255,255,255,0.7)",
    color: "#6D597A",
    padding: "6px 10px",
    borderRadius: "14px",
    fontSize: "12px",
    fontWeight: "700",
  },

  emptyBox: {
    padding: "32px",
    textAlign: "center",
    background: "rgba(255,255,255,0.45)",
    borderRadius: "24px",
  },

  emptyIcon: {
    fontSize: "35px",
    margin: "0 0 8px 0",
  },

  emptyText: {
    color: "#6D597A",
    margin: 0,
  },

  profileCard: {
    background: "rgba(255,255,255,0.52)",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.75)",
    borderRadius: "32px",
    padding: "28px",
    boxShadow: "0 25px 60px rgba(49,34,68,0.16)",
    textAlign: "center",
  },

  profileAvatar: {
    width: "115px",
    height: "115px",
    borderRadius: "36px",
    margin: "0 auto 18px auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "58px",
    boxShadow: "0 18px 35px rgba(49,34,68,0.18)",
  },

  profileName: {
    color: "#312244",
    fontSize: "25px",
    margin: "0 0 6px 0",
    fontWeight: "800",
  },

  profileRole: {
    color: "#6D597A",
    margin: "0 0 14px 0",
    fontWeight: "700",
  },

  statusBadge: {
    display: "inline-block",
    padding: "9px 15px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.72)",
    color: "#4A4E69",
    fontWeight: "800",
    marginBottom: "18px",
  },

  profileStats: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "16px",
  },

  statCard: {
    background: "rgba(255,255,255,0.65)",
    borderRadius: "22px",
    padding: "16px",
    boxShadow: "0 12px 24px rgba(49,34,68,0.09)",
  },

  statValue: {
    color: "#312244",
    margin: "0 0 5px 0",
    fontSize: "22px",
    fontWeight: "800",
  },

  statLabel: {
    color: "#6D597A",
    margin: 0,
    fontSize: "13px",
  },

  detailBox: {
    background: "rgba(255,255,255,0.62)",
    borderRadius: "22px",
    padding: "16px",
    textAlign: "left",
    marginBottom: "12px",
  },

  detailTitle: {
    color: "#312244",
    margin: "0 0 6px 0",
    fontSize: "15px",
  },

  detailText: {
    color: "#6D597A",
    margin: 0,
    lineHeight: "1.5",
  },

  bookingCard: {
    background: "rgba(255,255,255,0.52)",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.75)",
    borderRadius: "32px",
    padding: "28px",
    boxShadow: "0 25px 60px rgba(49,34,68,0.16)",
  },

  modeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
    marginBottom: "18px",
  },

  modeButton: {
    border: "none",
    padding: "13px 10px",
    borderRadius: "18px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 12px 24px rgba(49,34,68,0.1)",
  },

  label: {
    display: "block",
    color: "#312244",
    fontWeight: "800",
    margin: "14px 0 8px 0",
  },

  input: {
    width: "100%",
    padding: "15px",
    border: "none",
    outline: "none",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.7)",
    color: "#312244",
    fontSize: "15px",
    boxShadow: "inset 0 0 16px rgba(49,34,68,0.07)",
    boxSizing: "border-box",
  },

  bookButton: {
    width: "100%",
    marginTop: "20px",
    padding: "16px",
    border: "none",
    borderRadius: "24px",
    background: "linear-gradient(135deg, #9B5DE5, #F15BB5)",
    color: "white",
    fontSize: "16px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 18px 35px rgba(155,93,229,0.35)",
  },

  safeNote: {
    color: "#8D7D99",
    fontSize: "13px",
    textAlign: "center",
    margin: "16px 0 0 0",
    lineHeight: "1.5",
  },

  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    marginTop: "5px",
  },

  supportCard: {
    background: "rgba(255,255,255,0.58)",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.82)",
    borderRadius: "30px",
    padding: "26px",
    boxShadow: "0 20px 45px rgba(49,34,68,0.14)",
    textAlign: "left",
    transition: "0.3s ease",
    position: "relative",
    overflow: "hidden",
    cursor: "pointer",
  },

  supportTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },

  supportIcon: {
    width: "58px",
    height: "58px",
    borderRadius: "20px",
    background: "linear-gradient(135deg, #F3E8FF, #FFFFFF)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    boxShadow: "0 12px 24px rgba(49,34,68,0.12)",
  },

  supportBadge: {
    padding: "7px 13px",
    borderRadius: "18px",
    background: "linear-gradient(135deg, #9B5DE5, #F15BB5)",
    color: "white",
    fontSize: "12px",
    fontWeight: "800",
  },

  supportTitle: {
    color: "#312244",
    fontSize: "21px",
    margin: "0 0 10px 0",
    fontWeight: "800",
  },

  supportText: {
    color: "#6D597A",
    lineHeight: "1.6",
    margin: 0,
    fontSize: "14px",
  },

  supportLine: {
    width: "100%",
    height: "1px",
    background: "rgba(109,89,122,0.18)",
    margin: "18px 0 12px 0",
  },

  supportMiniText: {
    color: "#9B5DE5",
    fontSize: "13px",
    fontWeight: "800",
    margin: 0,
  },
};

export default Counselor;