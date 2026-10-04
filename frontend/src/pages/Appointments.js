import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
function Appointments() {
  const navigate = useNavigate();
  const [counselors, setCounselors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loadingCounselors, setLoadingCounselors] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    counselorId: "",
    type: "Online",
    date: "",
    time: "",
    reason: "",
  });
  const [selectedFilter, setSelectedFilter] = useState("All");
  // -----------------------------
  // Load counselors + appointments from backend
  // -----------------------------
  useEffect(() => {
    loadCounselors();
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const loadCounselors = async () => {
    try {
      setLoadingCounselors(true);
      const response = await API.get("/counselors");
      setCounselors(response.data);
      if (response.data.length > 0) {
        setForm((prev) => ({ ...prev, counselorId: response.data[0]._id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCounselors(false);
    }
  };
  const loadAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const response = await API.get("/appointments/my");
      setAppointments(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAppointments(false);
    }
  };
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  // -----------------------------
  // Create appointment -> saves to DB
  // -----------------------------
  const createAppointment = async () => {
    if (
      !form.counselorId ||
      !form.type ||
      !form.date ||
      !form.time ||
      !form.reason.trim()
    ) {
      alert("Please fill all appointment details");
      return;
    }
    try {
      setSubmitting(true);
      await API.post("/appointments", {
        counselorId: form.counselorId,
        type: form.type,
        date: form.date,
        time: form.time,
        reason: form.reason,
      });
      const bookedCounselor =
        counselors.find((c) => c._id === form.counselorId)?.name || "Counselor";
      const bookedDate = form.date;
      const bookedTime = form.time;
      setForm({
        counselorId: counselors[0]?._id || "",
        type: "Online",
        date: "",
        time: "",
        reason: "",
      });
      // Refresh the list so the new appointment shows immediately
      await loadAppointments();
      navigate("/dashboard", {
        state: {
          bookingSuccess: true,
          counselorName: bookedCounselor,
          date: bookedDate,
          time: bookedTime,
        },
      });
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          "Failed to book appointment. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };
  // -----------------------------
  // Cancel appointment -> updates DB
  // -----------------------------
  const cancelAppointment = async (id) => {
    try {
      await API.put(`/appointments/${id}/cancel`);
      setAppointments((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, status: "Cancelled" } : item,
        ),
      );
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to cancel appointment.");
    }
  };
  const filteredAppointments =
    selectedFilter === "All"
      ? appointments
      : appointments.filter((item) => item.status === selectedFilter);
  const totalAppointments = appointments.length;
  const pendingCount = appointments.filter(
    (a) => a.status === "Pending",
  ).length;
  const confirmedCount = appointments.filter(
    (a) => a.status === "Accepted",
  ).length;
  const getStatusStyle = (status) => {
    if (status === "Accepted" || status === "Confirmed") {
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
    <div style={styles.page} className="appt-page">
      {/* Responsive rules (inline styles can't use media queries) */}
      <style>{`
        .appt-stats-grid,
        .appt-bottom-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        }
        .appt-main-grid {
          grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr) !important;
        }
        .appt-info-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        }
        /* Tablet: booking + timeline stack */
        @media (max-width: 900px) {
          .appt-main-grid {
            grid-template-columns: minmax(0, 1fr) !important;
          }
        }
        /* Phone: 3 cards become square tiles that fit the screen */
        @media (max-width: 600px) {
          .appt-page { padding: 16px !important; }
          .appt-stats-grid,
          .appt-bottom-grid {
            gap: 10px !important;
          }
          .appt-stats-grid > div,
          .appt-bottom-grid > div {
            aspect-ratio: 1 / 1;
            padding: 10px !important;
            border-radius: 20px !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            gap: 6px !important;
            text-align: center;
            min-width: 0;
            overflow: hidden;
            box-sizing: border-box;
          }
          /* stat cards */
          .appt-stats-grid > div > div:first-child,
          .appt-bottom-grid > div > div:first-child {
            width: 38px !important;
            height: 38px !important;
            font-size: 20px !important;
            border-radius: 14px !important;
            margin: 0 auto !important;
          }
          .appt-stats-grid h3 { font-size: 20px !important; margin: 0 !important; }
          .appt-stats-grid p { font-size: 10px !important; line-height: 1.2 !important; }
          /* help cards: icon + title + link only */
          .appt-bottom-grid h3 {
            font-size: 12px !important;
            margin: 0 0 2px 0 !important;
            line-height: 1.2 !important;
          }
          .appt-bottom-grid p:not(:last-child) { display: none; }
          .appt-bottom-grid p:last-child {
            font-size: 10px !important;
            margin: 2px 0 0 0 !important;
            line-height: 1.2 !important;
          }
          /* forms + lists */
          .appt-two-col,
          .appt-mode-grid,
          .appt-info-grid {
            grid-template-columns: minmax(0, 1fr) !important;
          }
          .appt-title { font-size: 30px !important; }
        }
      `}</style>
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
            <h1 style={styles.title} className="appt-title">
              Appointments
            </h1>
            <p style={styles.subtitle}>
              Manage your counseling sessions, booking requests, and upcoming
              appointments.
            </p>
          </div>
          <div style={styles.headerBadge}>📅 Session Planner</div>
        </div>
        <div style={styles.statsGrid} className="appt-stats-grid">
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
        <div style={styles.mainGrid} className="appt-main-grid">
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
              name="counselorId"
              value={form.counselorId}
              onChange={handleChange}
              style={styles.input}
              disabled={loadingCounselors}
            >
              {loadingCounselors ? (
                <option>Loading counselors...</option>
              ) : counselors.length === 0 ? (
                <option>No counselors available</option>
              ) : (
                counselors.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))
              )}
            </select>
            <label style={styles.label}>Session Type</label>
            <div style={styles.modeGrid} className="appt-mode-grid">
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
            <div style={styles.twoColumn} className="appt-two-col">
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
            <button
              style={{ ...styles.primaryButton, opacity: submitting ? 0.7 : 1 }}
              onClick={createAppointment}
              disabled={
                submitting || loadingCounselors || counselors.length === 0
              }
            >
              {submitting ? "Booking..." : "Request Appointment"}
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
              {["All", "Accepted", "Pending", "Cancelled"].map((filter) => (
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
              {loadingAppointments ? (
                <div style={styles.emptyBox}>
                  <p style={styles.emptyText}>Loading appointments...</p>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div style={styles.emptyBox}>
                  <div style={styles.emptyIcon}>🗓️</div>
                  <p style={styles.emptyText}>No appointments found</p>
                </div>
              ) : (
                filteredAppointments.map((item) => (
                  <div key={item._id} style={styles.appointmentCard}>
                    <div style={styles.cardTop}>
                      <div>
                        <h3 style={styles.appointmentTitle}>
                          {item.counselorId?.name || "Counselor"}
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
                    <div
                      style={styles.appointmentInfoGrid}
                      className="appt-info-grid"
                    >
                      <div style={styles.infoBox}>
                        <span style={styles.infoLabel}>Session Type</span>
                        <strong style={styles.infoValue}>{item.type || "Not recorded"}</strong>
                      </div>
                      <div style={styles.infoBox}>
                        <span style={styles.infoLabel}>Date</span>
                        <strong style={styles.infoValue}>
                          {new Date(item.date).toLocaleDateString()}
                        </strong>
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
                            `Counselor: ${item.counselorId?.name || "-"}\nDate: ${new Date(
                              item.date,
                            ).toLocaleDateString()}\nTime: ${item.time}\nReason: ${
                              item.reason
                            }\nStatus: ${item.status}`,
                          )
                        }
                      >
                        View Details
                      </button>
                      {["Pending", "Accepted"].includes(item.status) && (
                        <button
                          style={styles.cancelButton}
                          onClick={() => cancelAppointment(item._id)}
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
        <div style={styles.bottomGrid} className="appt-bottom-grid">
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
    boxSizing: "border-box",
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
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
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
    flexShrink: 0,
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
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.25fr)",
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
    minWidth: 0,
  },
  timelinePanel: {
    background: "rgba(255,255,255,0.54)",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.78)",
    borderRadius: "34px",
    padding: "30px",
    boxShadow: "0 25px 60px rgba(49,34,68,0.16)",
    minWidth: 0,
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
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
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
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
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
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
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
    minWidth: 0,
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
