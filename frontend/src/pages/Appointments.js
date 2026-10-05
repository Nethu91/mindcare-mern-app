import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import moodBg from "../assets/mood-bg.jpeg";

// ------------------------------------------------------------------
// 3D emoji images (Microsoft Fluent Emoji 3D - MIT licence)
// If you want them offline: download the PNGs into /public/emojis/
// and change EMOJI_BASE to "/emojis" (and adjust the url builder).
// If an image fails to load, the normal emoji is shown instead.
// ------------------------------------------------------------------
const EMOJI_BASE =
  "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets";

const EMOJI_MAP = {
  calendar: { folder: "Calendar", file: "calendar", fallback: "📅" },
  pushpin: { folder: "Pushpin", file: "pushpin", fallback: "📌" },
  hourglass: {
    folder: "Hourglass not done",
    file: "hourglass_not_done",
    fallback: "⏳",
  },
  check: {
    folder: "Check mark button",
    file: "check_mark_button",
    fallback: "✅",
  },
  brain: { folder: "Brain", file: "brain", fallback: "🧠" },
  clipboard: { folder: "Clipboard", file: "clipboard", fallback: "📋" },
  spiral: {
    folder: "Spiral calendar",
    file: "spiral_calendar",
    fallback: "🗓️",
  },
  speech: { folder: "Speech balloon", file: "speech_balloon", fallback: "💬" },
  herb: { folder: "Herb", file: "herb", fallback: "🌿" },
  lockkey: {
    folder: "Locked with key",
    file: "locked_with_key",
    fallback: "🔐",
  },
  laptop: { folder: "Laptop", file: "laptop", fallback: "💻" },
  hospital: { folder: "Hospital", file: "hospital", fallback: "🏥" },
  phone: {
    folder: "Telephone receiver",
    file: "telephone_receiver",
    fallback: "📞",
  },
  lock: { folder: "Locked", file: "locked", fallback: "🔒" },
};

function Emoji3D({ name, size = 32, style = {} }) {
  const [failed, setFailed] = useState(false);
  const item = EMOJI_MAP[name];
  if (!item) return null;

  if (failed) {
    return (
      <span
        style={{
          fontSize: `${size * 0.85}px`,
          lineHeight: 1,
          display: "inline-block",
          ...style,
        }}
      >
        {item.fallback}
      </span>
    );
  }

  const url = `${EMOJI_BASE}/${encodeURIComponent(item.folder)}/3D/${item.file}_3d.png`;

  return (
    <img
      src={url}
      alt={item.fallback}
      width={size}
      height={size}
      loading="lazy"
      draggable={false}
      onError={() => setFailed(true)}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: "contain",
        display: "inline-block",
        verticalAlign: "middle",
        filter: "drop-shadow(0 4px 6px rgba(58,53,82,0.22))",
        ...style,
      }}
    />
  );
}

// Theme colors picked from mood-bg.jpeg
// (teal-grey -> dusty purple -> pink/peach, with periwinkle + mint glow)
const ACTIVE_GRADIENT = "linear-gradient(135deg, #7F9BD6, #B38BC9)";
const INACTIVE_BG = "rgba(255,255,255,0.7)";

function Appointments() {
  const navigate = useNavigate();
  const pageRef = useRef(null);

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
  // Responsive detection
  // Uses the real width of the page container (ResizeObserver) instead of
  // window width / CSS media queries, so it also works inside the
  // locked-width phone frame on desktop.
  // -----------------------------
  const [isMobile, setIsMobile] = useState(false); // <= 600px
  const [isStacked, setIsStacked] = useState(false); // <= 900px

  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;

    const update = () => {
      const width = el.getBoundingClientRect().width;
      setIsMobile(width <= 600);
      setIsStacked(width <= 900);
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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

  // Small helper: pick a value depending on mobile / desktop
  const m = (mobileValue, desktopValue) => (isMobile ? mobileValue : desktopValue);

  // ---- responsive style overrides ----
  const panelPad = { padding: m("18px", "30px"), borderRadius: m("26px", "34px") };
  const inputMobile = isMobile ? { fontSize: "16px", padding: "13px" } : {};

  const statCardMobile = isMobile
    ? {
        flexDirection: "column",
        textAlign: "center",
        padding: "12px 6px",
        gap: "6px",
        borderRadius: "22px",
        minWidth: 0,
      }
    : {};

  const helpCardMobile = isMobile
    ? { padding: "14px 6px", borderRadius: "22px" }
    : {};

  const statIconMobile = isMobile
    ? { width: "38px", height: "38px", borderRadius: "14px" }
    : {};

  const helpIconMobile = isMobile
    ? { width: "38px", height: "38px", borderRadius: "14px", marginBottom: "8px" }
    : {};

  const modeOptions = [
    { type: "Online", icon: "laptop", label: "Online" },
    { type: "Physical", icon: "hospital", label: "Physical" },
    { type: "Phone Call", icon: "phone", label: "Phone" },
  ];

  return (
    <div
      ref={pageRef}
      style={{
        ...styles.page,
        padding: m("14px", "35px"),
        backgroundImage: `linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.12)), url(${moodBg})`,
      }}
    >
      <div style={styles.container}>
        {/* ---------- header ---------- */}
        <div
          style={{
            ...styles.header,
            flexDirection: m("column", "row"),
            alignItems: m("flex-start", "center"),
            marginBottom: m("18px", "26px"),
          }}
        >
          <div style={{ minWidth: 0 }}>
            <button
              style={styles.backButton}
              onClick={() => navigate("/counselor")}
            >
              ← Back to Counselors
            </button>

            <h1 style={{ ...styles.title, fontSize: m("28px", "42px") }}>
              Appointments
            </h1>
            <p style={{ ...styles.subtitle, fontSize: m("14px", "16px") }}>
              Manage your counseling sessions, booking requests, and upcoming
              appointments.
            </p>
          </div>

          {!isMobile && (
            <div style={styles.headerBadge}>
              <Emoji3D name="calendar" size={26} />
              <span>Session Planner</span>
            </div>
          )}
        </div>

        {/* ---------- stats ---------- */}
        <div
          style={{
            ...styles.statsGrid,
            gap: m("10px", "20px"),
            marginBottom: m("18px", "25px"),
          }}
        >
          <div style={{ ...styles.statCard, ...statCardMobile }}>
            <div style={{ ...styles.statIcon, ...statIconMobile }}>
              <Emoji3D name="pushpin" size={m(26, 38)} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ ...styles.statNumber, fontSize: m("20px", "28px") }}>
                {totalAppointments}
              </h3>
              <p style={{ ...styles.statText, fontSize: m("10px", "14px"), lineHeight: "1.2" }}>
                {m("Total", "Total Appointments")}
              </p>
            </div>
          </div>

          <div style={{ ...styles.statCard, ...statCardMobile }}>
            <div style={{ ...styles.statIcon, ...statIconMobile }}>
              <Emoji3D name="hourglass" size={m(26, 38)} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ ...styles.statNumber, fontSize: m("20px", "28px") }}>
                {pendingCount}
              </h3>
              <p style={{ ...styles.statText, fontSize: m("10px", "14px"), lineHeight: "1.2" }}>
                {m("Pending", "Pending Requests")}
              </p>
            </div>
          </div>

          <div style={{ ...styles.statCard, ...statCardMobile }}>
            <div style={{ ...styles.statIcon, ...statIconMobile }}>
              <Emoji3D name="check" size={m(26, 38)} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ ...styles.statNumber, fontSize: m("20px", "28px") }}>
                {confirmedCount}
              </h3>
              <p style={{ ...styles.statText, fontSize: m("10px", "14px"), lineHeight: "1.2" }}>
                {m("Confirmed", "Confirmed Sessions")}
              </p>
            </div>
          </div>
        </div>

        {/* ---------- booking + timeline ---------- */}
        <div
          style={{
            ...styles.mainGrid,
            gridTemplateColumns: isStacked
              ? "minmax(0, 1fr)"
              : "minmax(0, 1fr) minmax(0, 1.25fr)",
            gap: m("18px", "25px"),
            marginBottom: m("18px", "25px"),
          }}
        >
          <div style={{ ...styles.bookingPanel, ...panelPad }}>
            <div
              style={{
                ...styles.panelHeader,
                marginBottom: m("14px", "22px"),
              }}
            >
              <div style={{ minWidth: 0 }}>
                <h2 style={{ ...styles.sectionTitle, fontSize: m("20px", "24px") }}>
                  Book New Appointment
                </h2>
                <p style={styles.sectionSubText}>
                  Select a counselor and request a comfortable session time.
                </p>
              </div>
              {!isMobile && (
                <div style={styles.panelIcon}>
                  <Emoji3D name="brain" size={44} />
                </div>
              )}
            </div>

            <label style={styles.label}>Select Counselor</label>
            <select
              name="counselorId"
              value={form.counselorId}
              onChange={handleChange}
              style={{ ...styles.input, ...inputMobile }}
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
            <div style={{ ...styles.modeGrid, gap: m("8px", "10px") }}>
              {modeOptions.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => setForm({ ...form, type: opt.type })}
                  style={{
                    ...styles.modeButton,
                    padding: m("12px 4px", "13px 10px"),
                    fontSize: m("12px", "14px"),
                    minWidth: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    background:
                      form.type === opt.type ? ACTIVE_GRADIENT : INACTIVE_BG,
                    color: form.type === opt.type ? "#FFFFFF" : "#3A3552",
                  }}
                >
                  <Emoji3D name={opt.icon} size={m(18, 22)} />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>

            <div
              style={{
                ...styles.twoColumn,
                gridTemplateColumns: m("minmax(0, 1fr)", "1fr 1fr"),
              }}
            >
              <div style={{ minWidth: 0 }}>
                <label style={styles.label}>Date</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  style={{ ...styles.input, ...inputMobile, minHeight: "48px" }}
                />
              </div>

              <div style={{ minWidth: 0 }}>
                <label style={styles.label}>Time</label>
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  style={{ ...styles.input, ...inputMobile, minHeight: "48px" }}
                />
              </div>
            </div>

            <label style={styles.label}>Reason for Appointment</label>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              placeholder="Write a short reason for this session..."
              style={{
                ...styles.textArea,
                minHeight: m("95px", "115px"),
                fontSize: m("16px", "15px"),
              }}
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
              <Emoji3D name="lock" size={16} style={{ marginRight: "6px" }} />
              Your appointment information will be handled confidentially.
            </p>
          </div>

          <div style={{ ...styles.timelinePanel, ...panelPad }}>
            <div
              style={{
                ...styles.panelHeader,
                marginBottom: m("14px", "22px"),
              }}
            >
              <div style={{ minWidth: 0 }}>
                <h2 style={{ ...styles.sectionTitle, fontSize: m("20px", "24px") }}>
                  Appointment Timeline
                </h2>
                <p style={styles.sectionSubText}>
                  View upcoming, pending, and cancelled sessions.
                </p>
              </div>
              {!isMobile && (
                <div style={styles.panelIcon}>
                  <Emoji3D name="clipboard" size={44} />
                </div>
              )}
            </div>

            <div style={{ ...styles.filterRow, gap: m("8px", "10px") }}>
              {["All", "Accepted", "Pending", "Cancelled"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  style={{
                    ...styles.filterButton,
                    padding: m("9px 12px", "10px 15px"),
                    fontSize: m("13px", "14px"),
                    background:
                      selectedFilter === filter
                        ? ACTIVE_GRADIENT
                        : "rgba(255,255,255,0.68)",
                    color: selectedFilter === filter ? "#FFFFFF" : "#3A3552",
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
                  <div style={styles.emptyIcon}>
                    <Emoji3D name="spiral" size={58} />
                  </div>
                  <p style={styles.emptyText}>No appointments found</p>
                </div>
              ) : (
                filteredAppointments.map((item) => (
                  <div
                    key={item._id}
                    style={{
                      ...styles.appointmentCard,
                      padding: m("14px", "20px"),
                      borderRadius: m("22px", "28px"),
                    }}
                  >
                    <div
                      style={{
                        ...styles.cardTop,
                        flexDirection: m("column", "row"),
                        alignItems: "flex-start",
                      }}
                    >
                      <div style={{ minWidth: 0, maxWidth: "100%" }}>
                        <h3 style={{ ...styles.appointmentTitle, fontSize: m("17px", "19px") }}>
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
                      style={{
                        ...styles.appointmentInfoGrid,
                        gap: m("6px", "10px"),
                      }}
                    >
                      <div style={{ ...styles.infoBox, padding: m("9px 8px", "13px") }}>
                        <span style={styles.infoLabel}>{m("Type", "Session Type")}</span>
                        <strong style={{ ...styles.infoValue, fontSize: m("12px", "14px") }}>
                          {item.type || "Not recorded"}
                        </strong>
                      </div>

                      <div style={{ ...styles.infoBox, padding: m("9px 8px", "13px") }}>
                        <span style={styles.infoLabel}>Date</span>
                        <strong style={{ ...styles.infoValue, fontSize: m("12px", "14px") }}>
                          {new Date(item.date).toLocaleDateString()}
                        </strong>
                      </div>

                      <div style={{ ...styles.infoBox, padding: m("9px 8px", "13px") }}>
                        <span style={styles.infoLabel}>Time</span>
                        <strong style={{ ...styles.infoValue, fontSize: m("12px", "14px") }}>
                          {item.time}
                        </strong>
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

        {/* ---------- help cards ---------- */}
        <div
          style={{
            ...styles.bottomGrid,
            gap: m("10px", "20px"),
            marginBottom: m("10px", "0"),
          }}
        >
          <div
            style={{ ...styles.helpCard, ...helpCardMobile }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div style={{ ...styles.helpIcon, ...helpIconMobile }}>
              <Emoji3D name="speech" size={m(26, 38)} />
            </div>
            <h3 style={{ ...styles.helpTitle, fontSize: m("12px", "17px"), margin: m("0 0 2px 0", "0 0 8px 0") }}>
              {m("Reminder", "Session Reminder")}
            </h3>
            {!isMobile && (
              <p style={styles.helpText}>
                Keep track of your counseling appointments and attend on time.
              </p>
            )}
            <p style={{ ...styles.helpLink, fontSize: m("10px", "13px"), margin: m("2px 0 0 0", "14px 0 0 0") }}>
              {m("View ↑", "View appointments ↑")}
            </p>
          </div>

          <div
            style={{ ...styles.helpCard, ...helpCardMobile }}
            onClick={() => navigate("/counselor")}
          >
            <div style={{ ...styles.helpIcon, ...helpIconMobile }}>
              <Emoji3D name="herb" size={m(26, 38)} />
            </div>
            <h3 style={{ ...styles.helpTitle, fontSize: m("12px", "17px"), margin: m("0 0 2px 0", "0 0 8px 0") }}>
              {m("Prepare", "Before the Session")}
            </h3>
            {!isMobile && (
              <p style={styles.helpText}>
                Prepare your thoughts, feelings, and questions before meeting
                the counselor.
              </p>
            )}
            <p style={{ ...styles.helpLink, fontSize: m("10px", "13px"), margin: m("2px 0 0 0", "14px 0 0 0") }}>
              {m("Counselors →", "Go to counselors →")}
            </p>
          </div>

          <div
            style={{ ...styles.helpCard, ...helpCardMobile }}
            onClick={() => navigate("/emergency")}
          >
            <div style={{ ...styles.helpIcon, ...helpIconMobile }}>
              <Emoji3D name="lockkey" size={m(26, 38)} />
            </div>
            <h3 style={{ ...styles.helpTitle, fontSize: m("12px", "17px"), margin: m("0 0 2px 0", "0 0 8px 0") }}>
              {m("Private", "Confidential Support")}
            </h3>
            {!isMobile && (
              <p style={styles.helpText}>
                Your mental wellness journey is private, safe, and respected.
              </p>
            )}
            <p style={{ ...styles.helpLink, fontSize: m("10px", "13px"), margin: m("2px 0 0 0", "14px 0 0 0") }}>
              {m("Urgent help →", "Get urgent support →")}
            </p>
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
    // mood-bg.jpeg is applied inline (backgroundImage) in the component
    backgroundColor: "#B9B4CE",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    fontFamily: "Arial, sans-serif",
    position: "relative",
    overflowX: "hidden",
    boxSizing: "border-box",
    width: "100%",
  },

  container: {
    maxWidth: "1240px",
    margin: "0 auto",
    position: "relative",
    zIndex: 2,
    width: "100%",
    boxSizing: "border-box",
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
    background: "rgba(255,255,255,0.72)",
    color: "#5B5A8F",
    fontWeight: "800",
    cursor: "pointer",
    marginBottom: "12px",
    boxShadow: "0 10px 24px rgba(58,53,82,0.14)",
  },

  title: {
    fontSize: "42px",
    color: "#2F2B45",
    margin: "0 0 7px 0",
    fontWeight: "900",
  },

  subtitle: {
    color: "#474463",
    fontSize: "16px",
    margin: 0,
    lineHeight: "1.5",
  },

  headerBadge: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "11px 22px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.62)",
    boxShadow: "0 12px 25px rgba(58,53,82,0.16)",
    color: "#4A4770",
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
    background: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(255,255,255,0.8)",
    backdropFilter: "blur(18px)",
    boxShadow: "0 20px 45px rgba(58,53,82,0.16)",
    boxSizing: "border-box",
  },

  statIcon: {
    width: "62px",
    height: "62px",
    borderRadius: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #EEF0FB, #FFFFFF)",
    boxShadow: "0 12px 24px rgba(58,53,82,0.14)",
    flexShrink: 0,
  },

  statNumber: {
    color: "#3A3552",
    margin: "0 0 4px 0",
    fontSize: "28px",
    fontWeight: "900",
  },

  statText: {
    color: "#5E5A78",
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
    background: "rgba(255,255,255,0.6)",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.8)",
    borderRadius: "34px",
    padding: "30px",
    boxShadow: "0 25px 60px rgba(58,53,82,0.18)",
    minWidth: 0,
    boxSizing: "border-box",
  },

  timelinePanel: {
    background: "rgba(255,255,255,0.6)",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.8)",
    borderRadius: "34px",
    padding: "30px",
    boxShadow: "0 25px 60px rgba(58,53,82,0.18)",
    minWidth: 0,
    boxSizing: "border-box",
  },

  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "center",
    marginBottom: "22px",
  },

  sectionTitle: {
    color: "#3A3552",
    fontSize: "24px",
    margin: "0 0 7px 0",
    fontWeight: "900",
  },

  sectionSubText: {
    color: "#5E5A78",
    margin: 0,
    lineHeight: "1.5",
    fontSize: "14px",
  },

  panelIcon: {
    width: "66px",
    height: "66px",
    borderRadius: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #CFD8F3, #F6D5DC)",
    boxShadow: "0 15px 30px rgba(58,53,82,0.16)",
    flexShrink: 0,
  },

  label: {
    display: "block",
    color: "#3A3552",
    fontWeight: "800",
    margin: "15px 0 8px 0",
  },

  input: {
    width: "100%",
    maxWidth: "100%",
    padding: "15px",
    border: "none",
    outline: "none",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.78)",
    color: "#3A3552",
    fontSize: "15px",
    boxShadow: "inset 0 0 16px rgba(58,53,82,0.08)",
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
    boxShadow: "0 12px 24px rgba(58,53,82,0.12)",
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
    background: "rgba(255,255,255,0.78)",
    color: "#3A3552",
    fontSize: "15px",
    boxShadow: "inset 0 0 16px rgba(58,53,82,0.08)",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },

  primaryButton: {
    width: "100%",
    marginTop: "20px",
    padding: "16px",
    border: "none",
    borderRadius: "24px",
    background: "linear-gradient(135deg, #7F9BD6, #B38BC9)",
    color: "white",
    fontSize: "16px",
    fontWeight: "900",
    cursor: "pointer",
    boxShadow: "0 18px 35px rgba(127,155,214,0.4)",
  },

  safeNote: {
    color: "#7A7694",
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
    boxShadow: "0 10px 20px rgba(58,53,82,0.1)",
  },

  appointmentList: {
    display: "grid",
    gap: "16px",
  },

  appointmentCard: {
    padding: "20px",
    borderRadius: "28px",
    background: "rgba(255,255,255,0.7)",
    boxShadow: "0 16px 34px rgba(58,53,82,0.12)",
    border: "1px solid rgba(255,255,255,0.78)",
    minWidth: 0,
    boxSizing: "border-box",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "flex-start",
    marginBottom: "16px",
  },

  appointmentTitle: {
    color: "#3A3552",
    margin: "0 0 6px 0",
    fontSize: "19px",
    fontWeight: "900",
    wordBreak: "break-word",
  },

  appointmentReason: {
    color: "#5E5A78",
    margin: 0,
    lineHeight: "1.5",
    fontSize: "14px",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
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
    background: "rgba(238,236,250,0.8)",
    borderRadius: "18px",
    padding: "13px",
    minWidth: 0,
  },

  infoLabel: {
    display: "block",
    color: "#7A7694",
    fontSize: "12px",
    marginBottom: "5px",
    fontWeight: "800",
  },

  infoValue: {
    color: "#3A3552",
    fontSize: "14px",
    wordBreak: "break-word",
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
    background: "rgba(255,255,255,0.82)",
    color: "#5B5A8F",
    fontWeight: "900",
    cursor: "pointer",
  },

  cancelButton: {
    flex: 1,
    border: "none",
    padding: "12px",
    borderRadius: "18px",
    background: "rgba(233,150,160,0.28)",
    color: "#B83256",
    fontWeight: "900",
    cursor: "pointer",
  },

  emptyBox: {
    textAlign: "center",
    padding: "40px 16px",
    borderRadius: "26px",
    background: "rgba(255,255,255,0.5)",
  },

  emptyIcon: {
    marginBottom: "10px",
  },

  emptyText: {
    color: "#5E5A78",
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
    background: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(255,255,255,0.8)",
    backdropFilter: "blur(18px)",
    boxShadow: "0 20px 45px rgba(58,53,82,0.16)",
    textAlign: "center",
    cursor: "pointer",
    transition: "0.3s ease",
    minWidth: 0,
    boxSizing: "border-box",
  },

  helpIcon: {
    width: "62px",
    height: "62px",
    margin: "0 auto 14px auto",
    borderRadius: "20px",
    background: "linear-gradient(135deg, #EEF0FB, #FFFFFF)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 12px 24px rgba(58,53,82,0.14)",
  },

  helpTitle: {
    color: "#3A3552",
    margin: "0 0 8px 0",
    fontWeight: "900",
    lineHeight: "1.2",
  },

  helpText: {
    color: "#5E5A78",
    lineHeight: "1.6",
    margin: 0,
    fontSize: "14px",
  },

  helpLink: {
    margin: "14px 0 0 0",
    color: "#7B6FC4",
    fontSize: "13px",
    fontWeight: "900",
    lineHeight: "1.2",
  },
};

export default Appointments;