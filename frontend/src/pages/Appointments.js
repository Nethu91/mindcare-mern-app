import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Appointments() {
  const navigate = useNavigate();

  const counselors = [
    "Dr. Hasini Wijesinghe",
    "Mr. Kavindu Jayawardena",
    "Ms. Nethmi Fernando",
    "Dr. Malith Samarasinghe",
    "Ms. Chamodi Senanayake",
    "Mr. Tharindu Bandara",
  ];

  const [appointments, setAppointments] = useState([
    {
      id: 1,
      counselor: "Dr. Hasini Wijesinghe",
      type: "Online",
      date: "2026-06-02",
      time: "10:30",
      status: "Confirmed",
      reason: "Stress and anxiety support",
    },
    {
      id: 2,
      counselor: "Ms. Nethmi Fernando",
      type: "Phone Call",
      date: "2026-06-05",
      time: "15:00",
      status: "Pending",
      reason: "Academic pressure discussion",
    },
  ]);

  const [form, setForm] = useState({
    counselor: counselors[0],
    type: "Online",
    date: "",
    time: "",
    reason: "",
  });

  const [selectedFilter, setSelectedFilter] = useState("All");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const createAppointment = () => {
    if (
      !form.counselor ||
      !form.type ||
      !form.date ||
      !form.time ||
      !form.reason
    ) {
      alert("Please fill all appointment details");
      return;
    }

    const newAppointment = {
      id: Date.now(),
      counselor: form.counselor,
      type: form.type,
      date: form.date,
      time: form.time,
      status: "Pending",
      reason: form.reason,
    };

    setAppointments([newAppointment, ...appointments]);

    setForm({
      counselor: counselors[0],
      type: "Online",
      date: "",
      time: "",
      reason: "",
    });
  };

  const cancelAppointment = (id) => {
    const updated = appointments.map((item) =>
      item.id === id ? { ...item, status: "Cancelled" } : item
    );

    setAppointments(updated);
  };

  const filteredAppointments =
    selectedFilter === "All"
      ? appointments
      : appointments.filter((item) => item.status === selectedFilter);

  const totalAppointments = appointments.length;
  const pendingCount = appointments.filter(
    (a) => a.status === "Pending"
  ).length;
  const confirmedCount = appointments.filter(
    (a) => a.status === "Confirmed"
  ).length;

  const getStatusStyle = (status) => {
    if (status === "Confirmed") {
      return {
        background: "rgba(112, 214, 164, 0.22)",
        color: "#2F855A",
        border: "1px solid rgba(47, 133, 90, 0.22)",
      };
    }

    if (status === "Pending") {
      return {
        background: "rgba(255, 209, 102, 0.28)",
        color: "#9A6700",
        border: "1px solid rgba(154, 103, 0, 0.22)",
      };
    }

    return {
      background: "rgba(255, 143, 171, 0.22)",
      color: "#B83256",
      border: "1px solid rgba(184, 50, 86, 0.22)",
    };
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
              onClick={() => navigate("/counselor")}
            >
              ← Back to Counselors
            </button>

            <h1 style={styles.title}>Appointments</h1>
            <p style={styles.subtitle}>
              Manage your counseling sessions, booking requests, and upcoming
              appointments.
            </p>
          </div>

          <div style={styles.headerBadge}>📅 Session Planner</div>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📌</div>
            <div>
              <h3 style={styles.statNumber}>{totalAppointments}</h3>
              <p style={styles.statText}>Total Appointments</p>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>⏳</div>
            <div>
              <h3 style={styles.statNumber}>{pendingCount}</h3>
              <p style={styles.statText}>Pending Requests</p>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>✅</div>
            <div>
              <h3 style={styles.statNumber}>{confirmedCount}</h3>
              <p style={styles.statText}>Confirmed Sessions</p>
            </div>
          </div>
        </div>

        <div style={styles.mainGrid}>
          <div style={styles.bookingPanel}>
            <div style={styles.panelHeader}>
              <div>
                <h2 style={styles.sectionTitle}>Book New Appointment</h2>
                <p style={styles.sectionSubText}>
                  Select a counselor and request a comfortable session time.
                </p>
              </div>

              <div style={styles.panelIcon}>🧠</div>
            </div>

            <label style={styles.label}>Select Counselor</label>
            <select
              name="counselor"
              value={form.counselor}
              onChange={handleChange}
              style={styles.input}
            >
              {counselors.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            <label style={styles.label}>Session Type</label>
            <div style={styles.modeGrid}>
              {["Online", "Physical", "Phone Call"].map((type) => (
                <button
                  key={type}
                  onClick={() => setForm({ ...form, type })}
                  style={{
                    ...styles.modeButton,
                    background:
                      form.type === type
                        ? "linear-gradient(135deg, #9B5DE5, #F15BB5)"
                        : "rgba(255,255,255,0.68)",
                    color: form.type === type ? "#FFFFFF" : "#312244",
                  }}
                >
                  {type === "Online"
                    ? "💻 Online"
                    : type === "Physical"
                    ? "🏥 Physical"
                    : "📞 Phone"}
                </button>
              ))}
            </div>

            <div style={styles.twoColumn}>
              <div>
                <label style={styles.label}>Date</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Time</label>
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            <label style={styles.label}>Reason for Appointment</label>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              placeholder="Write a short reason for this session..."
              style={styles.textArea}
            ></textarea>

            <button style={styles.primaryButton} onClick={createAppointment}>
              Request Appointment
            </button>

            <p style={styles.safeNote}>
              🔒 Your appointment information will be handled confidentially.
            </p>
          </div>

          <div style={styles.timelinePanel}>
            <div style={styles.panelHeader}>
              <div>
                <h2 style={styles.sectionTitle}>Appointment Timeline</h2>
                <p style={styles.sectionSubText}>
                  View upcoming, pending, and cancelled sessions.
                </p>
              </div>

              <div style={styles.panelIcon}>📋</div>
            </div>

            <div style={styles.filterRow}>
              {["All", "Confirmed", "Pending", "Cancelled"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  style={{
                    ...styles.filterButton,
                    background:
                      selectedFilter === filter
                        ? "linear-gradient(135deg, #9B5DE5, #F15BB5)"
                        : "rgba(255,255,255,0.65)",
                    color: selectedFilter === filter ? "#FFFFFF" : "#312244",
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div style={styles.appointmentList}>
              {filteredAppointments.length === 0 ? (
                <div style={styles.emptyBox}>
                  <div style={styles.emptyIcon}>🗓️</div>
                  <p style={styles.emptyText}>No appointments found</p>
                </div>
              ) : (
                filteredAppointments.map((item) => (
                  <div key={item.id} style={styles.appointmentCard}>
                    <div style={styles.cardTop}>
                      <div>
                        <h3 style={styles.appointmentTitle}>
                          {item.counselor}
                        </h3>
                        <p style={styles.appointmentReason}>{item.reason}</p>
                      </div>

                      <span
                        style={{
                          ...styles.statusBadge,
                          ...getStatusStyle(item.status),
                        }}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div style={styles.appointmentInfoGrid}>
                      <div style={styles.infoBox}>
                        <span style={styles.infoLabel}>Session Type</span>
                        <strong style={styles.infoValue}>{item.type}</strong>
                      </div>

                      <div style={styles.infoBox}>
                        <span style={styles.infoLabel}>Date</span>
                        <strong style={styles.infoValue}>{item.date}</strong>
                      </div>

                      <div style={styles.infoBox}>
                        <span style={styles.infoLabel}>Time</span>
                        <strong style={styles.infoValue}>{item.time}</strong>
                      </div>
                    </div>

                    <div style={styles.cardActions}>
                      <button
                        style={styles.secondaryButton}
                        onClick={() =>
                          alert(
                            `Counselor: ${item.counselor}\nType: ${item.type}\nDate: ${item.date}\nTime: ${item.time}\nReason: ${item.reason}\nStatus: ${item.status}`
                          )
                        }
                      >
                        View Details
                      </button>

                      {item.status !== "Cancelled" && (
                        <button
                          style={styles.cancelButton}
                          onClick={() => cancelAppointment(item.id)}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div style={styles.bottomGrid}>
          <div
            style={styles.helpCard}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div style={styles.helpIcon}>💬</div>
            <h3 style={styles.helpTitle}>Session Reminder</h3>
            <p style={styles.helpText}>
              Keep track of your counseling appointments and attend on time.
            </p>
            <p style={styles.helpLink}>View appointments ↑</p>
          </div>

          <div style={styles.helpCard} onClick={() => navigate("/counselor")}>
            <div style={styles.helpIcon}>🌿</div>
            <h3 style={styles.helpTitle}>Before the Session</h3>
            <p style={styles.helpText}>
              Prepare your thoughts, feelings, and questions before meeting the
              counselor.
            </p>
            <p style={styles.helpLink}>Go to counselors →</p>
          </div>

          <div style={styles.helpCard} onClick={() => navigate("/emergency")}>
            <div style={styles.helpIcon}>🔐</div>
            <h3 style={styles.helpTitle}>Confidential Support</h3>
            <p style={styles.helpText}>
              Your mental wellness journey is private, safe, and respected.
            </p>
            <p style={styles.helpLink}>Get urgent support →</p>
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
    backdropFilter: "blur(14px)",
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
    backdropFilter: "blur(18px)",
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
    boxShadow: "0 12px 24px rgba(49,34,68,0.12)",
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
    gridTemplateColumns: "1fr 1.25fr",
    gap: "25px",
    marginBottom: "25px",
  },

  bookingPanel: {
    background: "rgba(255,255,255,0.54)",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.78)",
    borderRadius: "34px",
    padding: "30px",
    boxShadow: "0 25px 60px rgba(49,34,68,0.16)",
  },

  timelinePanel: {
    background: "rgba(255,255,255,0.54)",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.78)",
    borderRadius: "34px",
    padding: "30px",
    boxShadow: "0 25px 60px rgba(49,34,68,0.16)",
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

  label: {
    display: "block",
    color: "#312244",
    fontWeight: "800",
    margin: "15px 0 8px 0",
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

  modeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
  },

  modeButton: {
    border: "none",
    padding: "13px 10px",
    borderRadius: "18px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 12px 24px rgba(49,34,68,0.1)",
  },

  twoColumn: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
  },

  textArea: {
    width: "100%",
    minHeight: "115px",
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
  },

  primaryButton: {
    width: "100%",
    marginTop: "20px",
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

  safeNote: {
    color: "#8D7D99",
    fontSize: "13px",
    textAlign: "center",
    margin: "16px 0 0 0",
    lineHeight: "1.5",
  },

  filterRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },

  filterButton: {
    border: "none",
    padding: "10px 15px",
    borderRadius: "18px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(49,34,68,0.09)",
  },

  appointmentList: {
    display: "grid",
    gap: "16px",
  },

  appointmentCard: {
    padding: "20px",
    borderRadius: "28px",
    background: "rgba(255,255,255,0.66)",
    boxShadow: "0 16px 34px rgba(49,34,68,0.11)",
    border: "1px solid rgba(255,255,255,0.75)",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "flex-start",
    marginBottom: "16px",
  },

  appointmentTitle: {
    color: "#312244",
    margin: "0 0 6px 0",
    fontSize: "19px",
    fontWeight: "900",
  },

  appointmentReason: {
    color: "#6D597A",
    margin: 0,
    lineHeight: "1.5",
    fontSize: "14px",
  },

  statusBadge: {
    padding: "8px 13px",
    borderRadius: "16px",
    fontSize: "12px",
    fontWeight: "900",
    whiteSpace: "nowrap",
  },

  appointmentInfoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
    marginBottom: "16px",
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

  cardActions: {
    display: "flex",
    gap: "10px",
  },

  secondaryButton: {
    flex: 1,
    border: "none",
    padding: "12px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.75)",
    color: "#6D597A",
    fontWeight: "900",
    cursor: "pointer",
  },

  cancelButton: {
    flex: 1,
    border: "none",
    padding: "12px",
    borderRadius: "18px",
    background: "rgba(255,143,171,0.28)",
    color: "#B83256",
    fontWeight: "900",
    cursor: "pointer",
  },

  emptyBox: {
    textAlign: "center",
    padding: "40px",
    borderRadius: "26px",
    background: "rgba(255,255,255,0.5)",
  },

  emptyIcon: {
    fontSize: "42px",
    marginBottom: "10px",
  },

  emptyText: {
    color: "#6D597A",
    margin: 0,
    fontWeight: "700",
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
    backdropFilter: "blur(18px)",
    boxShadow: "0 20px 45px rgba(49,34,68,0.13)",
    textAlign: "center",
    cursor: "pointer",
    transition: "0.3s ease",
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
    boxShadow: "0 12px 24px rgba(49,34,68,0.12)",
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

export default Appointments;