import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import WellbeingLayout from "../components/WellbeingLayout";
import { apiError } from "../utils/apiError";

/* ============================================================
   3D NOTIFICATION ICONS
   Pure SVG - no image files required
   ============================================================ */

let notificationIconId = 0;

function useIconId() {
  const ref = useRef(null);

  if (ref.current === null) {
    notificationIconId += 1;
    ref.current = `notification-icon-${notificationIconId}`;
  }

  return ref.current;
}

function Notification3DIcon({ type = "default", size = 54 }) {
  const uid = useIconId();

  const configs = {
    mood: {
      light: "#FFF1A8",
      mid: "#FFD166",
      dark: "#F59E0B",
      symbol: "😊",
    },

    daily: {
      light: "#FFF1A8",
      mid: "#FFD166",
      dark: "#F59E0B",
      symbol: "😊",
    },

    affirmation: {
      light: "#F4D8FF",
      mid: "#D8B4FE",
      dark: "#A855F7",
      symbol: "✨",
    },

    affirmations: {
      light: "#F4D8FF",
      mid: "#D8B4FE",
      dark: "#A855F7",
      symbol: "✨",
    },

    session: {
      light: "#D9F7FF",
      mid: "#8DDCF0",
      dark: "#3B82F6",
      symbol: "📅",
    },

    sessions: {
      light: "#D9F7FF",
      mid: "#8DDCF0",
      dark: "#3B82F6",
      symbol: "📅",
    },

    milestone: {
      light: "#FFF2C7",
      mid: "#FACC15",
      dark: "#E59A00",
      symbol: "🏆",
    },

    progress: {
      light: "#DDFCE7",
      mid: "#86EFAC",
      dark: "#22C55E",
      symbol: "📈",
    },

    reminder: {
      light: "#FFE4EE",
      mid: "#FDA4C7",
      dark: "#EC4899",
      symbol: "🔔",
    },

    default: {
      light: "#E9DDFF",
      mid: "#C4B5FD",
      dark: "#8B5CF6",
      symbol: "🔔",
    },
  };

  const config = configs[type] || configs.default;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      style={{
        display: "block",
        overflow: "visible",
        filter: "drop-shadow(0 7px 6px rgba(49,34,68,0.22))",
      }}
    >
      <defs>
        <radialGradient id={`${uid}-body`} cx="32%" cy="25%" r="85%">
          <stop offset="0%" stopColor={config.light} />
          <stop offset="55%" stopColor={config.mid} />
          <stop offset="100%" stopColor={config.dark} />
        </radialGradient>

        <radialGradient id={`${uid}-shine`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>

        <linearGradient id={`${uid}-bottom`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.32" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="45" fill={`url(#${uid}-body)`} />

      <ellipse
        cx="34"
        cy="22"
        rx="19"
        ry="10"
        transform="rotate(-24 34 22)"
        fill={`url(#${uid}-shine)`}
      />

      <ellipse
        cx="50"
        cy="83"
        rx="27"
        ry="12"
        fill={`url(#${uid}-bottom)`}
      />

      <text
        x="50"
        y="62"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="38"
        style={{
          filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.16))",
        }}
      >
        {config.symbol}
      </text>
    </svg>
  );
}

/* ============================================================
   DETECT NOTIFICATION TYPE
   Works even if backend type names differ slightly
   ============================================================ */

function getNotificationType(notification) {
  const text = `${notification?.type || ""} ${notification?.title || ""} ${
    notification?.message || ""
  }`.toLowerCase();

  if (text.includes("affirm")) return "affirmation";

  if (
    text.includes("session") ||
    text.includes("appointment") ||
    text.includes("counsel")
  ) {
    return "session";
  }

  if (
    text.includes("milestone") ||
    text.includes("achievement") ||
    text.includes("goal")
  ) {
    return "milestone";
  }

  if (
    text.includes("progress") ||
    text.includes("review") ||
    text.includes("report")
  ) {
    return "progress";
  }

  if (
    text.includes("mood") ||
    text.includes("check-in") ||
    text.includes("check in")
  ) {
    return "mood";
  }

  if (
    text.includes("reminder") ||
    text.includes("daily")
  ) {
    return "reminder";
  }

  return "default";
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function Notifications() {
  const nav = useNavigate();

  const [items, setItems] = useState([]);
  const [prefs, setPrefs] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [quiet, setQuiet] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ============================================================
     LOAD ALL NOTIFICATIONS + PREFERENCES
     ============================================================ */

  async function load() {
    try {
      setLoading(true);
      setError("");

      const [notificationsResponse, preferencesResponse] =
        await Promise.all([
          API.get("/wellbeing/notifications"),
          API.get("/wellbeing/preferences"),
        ]);

      setItems(
        Array.isArray(notificationsResponse.data)
          ? notificationsResponse.data
          : []
      );

      setPrefs(preferencesResponse.data);
    } catch (e) {
      setError(apiError(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  /* ============================================================
     MARK AS READ
     ============================================================ */

  async function read(ids, path) {
    if (!ids?.length) {
      if (path) nav(path);
      return;
    }

    setBusy(true);
    setError("");

    try {
      await API.patch("/wellbeing/notifications/read", {
        ids,
      });

      setItems((currentItems) =>
        currentItems.map((notification) =>
          ids.includes(notification.id)
            ? {
                ...notification,
                read: true,
              }
            : notification
        )
      );

      window.dispatchEvent(
        new Event("mindcare-notifications")
      );

      if (path) {
        nav(path);
      }
    } catch (e) {
      setError(apiError(e));
    } finally {
      setBusy(false);
    }
  }

  /* ============================================================
     UPDATE NOTIFICATION PREFERENCES
     ============================================================ */

  async function update(patch) {
    setBusy(true);
    setError("");

    try {
      const response = await API.patch(
        "/wellbeing/preferences",
        patch
      );

      setPrefs(response.data);

      window.dispatchEvent(
        new Event("mindcare-notifications")
      );

      const notificationsResponse = await API.get(
        "/wellbeing/notifications"
      );

      setItems(
        Array.isArray(notificationsResponse.data)
          ? notificationsResponse.data
          : []
      );
    } catch (e) {
      setError(apiError(e));
    } finally {
      setBusy(false);
    }
  }

  /* ============================================================
     NOTIFICATION PREFERENCE LABELS
     ============================================================ */

  const labels = [
    [
      "daily",
      "Daily Reminders",
      "Mood tracking & check-ins",
      "mood",
    ],
    [
      "affirmations",
      "Daily Affirmations",
      "Positive messages",
      "affirmation",
    ],
    [
      "sessions",
      "Session Alerts",
      "Upcoming counseling appointments",
      "session",
    ],
  ];

  const unreadCount = items.filter(
    (notification) => !notification.read
  ).length;

  const unreadIds = items
    .filter((notification) => !notification.read)
    .map((notification) => notification.id);

  return (
    <WellbeingLayout title={`Notifications (${unreadCount})`}>
      <div style={styles.pageContent}>

        {/* ====================================================
            HEADER / SUMMARY
            ==================================================== */}

        <section style={styles.hero}>
          <div style={styles.heroIcon}>
            <Notification3DIcon
              type="default"
              size={66}
            />

            {unreadCount > 0 && (
              <span style={styles.heroBadge}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>

          <div style={styles.heroContent}>
            <p style={styles.eyebrow}>
              MindCare Inbox
            </p>

            <h2 style={styles.heroTitle}>
              Stay connected with your wellbeing
            </h2>

            <p style={styles.heroText}>
              Your reminders, affirmations, sessions and progress
              updates will appear here.
            </p>
          </div>
        </section>

        {/* ====================================================
            ERROR
            ==================================================== */}

        {error && (
          <div
            role="alert"
            style={styles.errorBox}
          >
            <span>!</span>

            <div>
              <strong>Something went wrong</strong>
              <p style={styles.errorText}>{error}</p>
            </div>
          </div>
        )}

        {/* ====================================================
            RECENT HEADER
            ==================================================== */}

        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>
              Recent
            </h2>

            <p style={styles.sectionSub}>
              {loading
                ? "Checking your notifications..."
                : unreadCount > 0
                ? `${unreadCount} unread notification${
                    unreadCount === 1 ? "" : "s"
                  }`
                : "You're all caught up"}
            </p>
          </div>

          <button
            type="button"
            disabled={busy || unreadCount === 0}
            onClick={() => read(unreadIds)}
            style={{
              ...styles.readAllButton,
              opacity:
                busy || unreadCount === 0
                  ? 0.5
                  : 1,
              cursor:
                busy || unreadCount === 0
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            ✓ Mark all read
          </button>
        </div>

        {/* ====================================================
            LOADING
            ==================================================== */}

        {loading && (
          <div style={styles.loadingCard}>
            <div style={styles.loadingIcon}>
              <Notification3DIcon
                type="default"
                size={54}
              />
            </div>

            <p style={styles.loadingTitle}>
              Loading notifications...
            </p>

            <p style={styles.loadingText}>
              Getting your latest MindCare updates.
            </p>
          </div>
        )}

        {/* ====================================================
            EMPTY
            ==================================================== */}

        {!loading && items.length === 0 && (
          <div style={styles.emptyCard}>
            <Notification3DIcon
              type="affirmation"
              size={70}
            />

            <h3 style={styles.emptyTitle}>
              No notifications yet
            </h3>

            <p style={styles.emptyText}>
              Your wellbeing reminders and updates will appear
              here when they become available.
            </p>
          </div>
        )}

        {/* ====================================================
            ALL NOTIFICATIONS
            ==================================================== */}

        {!loading && items.length > 0 && (
          <div style={styles.notificationList}>
            {items.map((notification) => {
              const type =
                getNotificationType(notification);

              return (
                <article
                  key={notification.id}
                  style={{
                    ...styles.notificationCard,

                    ...(notification.read
                      ? styles.readCard
                      : styles.unreadCard),
                  }}
                >
                  {!notification.read && (
                    <span
                      aria-label="Unread"
                      title="Unread"
                      style={styles.unreadDot}
                    />
                  )}

                  <div style={styles.notificationIcon}>
                    <Notification3DIcon
                      type={type}
                      size={58}
                    />
                  </div>

                  <div style={styles.notificationContent}>
                    <div style={styles.notificationTitleRow}>
                      <h3 style={styles.notificationTitle}>
                        {notification.title}
                      </h3>

                      {!notification.read && (
                        <span style={styles.newBadge}>
                          NEW
                        </span>
                      )}
                    </div>

                    <p style={styles.notificationMessage}>
                      {notification.message}
                    </p>

                    {(notification.createdAt ||
                      notification.date) && (
                      <p style={styles.notificationDate}>
                        {notification.createdAt
                          ? new Date(
                              notification.createdAt
                            ).toLocaleString([], {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : notification.date}
                      </p>
                    )}

                    <div style={styles.notificationActions}>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          read(
                            [notification.id],
                            notification.path
                          )
                        }
                        style={{
                          ...styles.openButton,
                          opacity: busy ? 0.65 : 1,
                        }}
                      >
                        {notification.path
                          ? "Open →"
                          : notification.read
                          ? "Viewed ✓"
                          : "Mark as read ✓"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* ====================================================
            NOTIFICATION PREFERENCES
            ==================================================== */}

        {prefs && (
          <>
            <div style={styles.preferenceHeading}>
              <div>
                <h2 style={styles.sectionTitle}>
                  Notification Preferences
                </h2>

                <p style={styles.sectionSub}>
                  Choose the updates you want to receive.
                </p>
              </div>
            </div>

            <section style={styles.preferencesCard}>
              {labels.map(
                ([key, title, sub, iconType], index) => (
                  <div
                    key={key}
                    style={{
                      ...styles.preferenceRow,

                      borderBottom:
                        index === labels.length - 1
                          ? "none"
                          : "1px solid rgba(124,58,237,0.09)",
                    }}
                  >
                    <div style={styles.preferenceInfo}>
                      <Notification3DIcon
                        type={iconType}
                        size={45}
                      />

                      <div>
                        <h3 style={styles.preferenceTitle}>
                          {title}
                        </h3>

                        <p style={styles.preferenceText}>
                          {sub}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-label={title}
                      aria-checked={Boolean(prefs[key])}
                      disabled={busy}
                      onClick={() =>
                        update({
                          [key]: !prefs[key],
                        })
                      }
                      style={{
                        ...styles.switchButton,

                        background: prefs[key]
                          ? "linear-gradient(135deg,#7C3AED,#A855F7)"
                          : "#D8D1E4",

                        justifyContent: prefs[key]
                          ? "flex-end"
                          : "flex-start",

                        opacity: busy ? 0.65 : 1,
                      }}
                    >
                      <span style={styles.switchCircle} />
                    </button>
                  </div>
                )
              )}
            </section>

            {/* ==================================================
                QUIET HOURS
                ================================================== */}

            <section style={styles.quietCard}>
              <div style={styles.quietHeader}>
                <div style={styles.preferenceInfo}>
                  <Notification3DIcon
                    type="reminder"
                    size={50}
                  />

                  <div>
                    <h3 style={styles.quietTitle}>
                      Quiet Hours
                    </h3>

                    <p style={styles.preferenceText}>
                      Choose a time when you don't want
                      interruptions.
                    </p>
                  </div>
                </div>
              </div>

              <div style={styles.quietInfo}>
                <span style={styles.infoIcon}>i</span>

                <p style={styles.quietInfoText}>
                  This app currently provides an in-app inbox.
                  Background push reminders are not enabled.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setQuiet(!quiet)}
                style={styles.configureButton}
              >
                {quiet
                  ? "Hide Quiet Hours"
                  : "Configure Quiet Hours"}
              </button>

              {quiet && (
                <form
                  style={styles.quietForm}
                  onSubmit={(e) => {
                    e.preventDefault();

                    update({
                      quietEnabled:
                        prefs.quietEnabled,
                      quietStart:
                        prefs.quietStart,
                      quietEnd:
                        prefs.quietEnd,
                      timeZone:
                        prefs.timeZone,
                    });
                  }}
                >
                  <div style={styles.enableRow}>
                    <div>
                      <h4 style={styles.enableTitle}>
                        Enable Quiet Hours
                      </h4>

                      <p style={styles.preferenceText}>
                        Save your preferred quiet time.
                      </p>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-label="Enable quiet hours"
                      aria-checked={Boolean(
                        prefs.quietEnabled
                      )}
                      onClick={() =>
                        setPrefs({
                          ...prefs,
                          quietEnabled:
                            !prefs.quietEnabled,
                        })
                      }
                      style={{
                        ...styles.switchButton,

                        background:
                          prefs.quietEnabled
                            ? "linear-gradient(135deg,#7C3AED,#A855F7)"
                            : "#D8D1E4",

                        justifyContent:
                          prefs.quietEnabled
                            ? "flex-end"
                            : "flex-start",
                      }}
                    >
                      <span style={styles.switchCircle} />
                    </button>
                  </div>

                  <div style={styles.timeGrid}>
                    <label style={styles.field}>
                      <span style={styles.fieldLabel}>
                        From
                      </span>

                      <input
                        type="time"
                        required
                        value={prefs.quietStart || ""}
                        onChange={(e) =>
                          setPrefs({
                            ...prefs,
                            quietStart:
                              e.target.value,
                          })
                        }
                        style={styles.input}
                      />
                    </label>

                    <label style={styles.field}>
                      <span style={styles.fieldLabel}>
                        Until
                      </span>

                      <input
                        type="time"
                        required
                        value={prefs.quietEnd || ""}
                        onChange={(e) =>
                          setPrefs({
                            ...prefs,
                            quietEnd:
                              e.target.value,
                          })
                        }
                        style={styles.input}
                      />
                    </label>
                  </div>

                  <label style={styles.field}>
                    <span style={styles.fieldLabel}>
                      Timezone
                    </span>

                    <input
                      required
                      value={prefs.timeZone || ""}
                      placeholder="Asia/Colombo"
                      onChange={(e) =>
                        setPrefs({
                          ...prefs,
                          timeZone:
                            e.target.value,
                        })
                      }
                      style={styles.input}
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={busy}
                    style={{
                      ...styles.saveButton,
                      opacity: busy ? 0.7 : 1,
                    }}
                  >
                    {busy
                      ? "Saving..."
                      : "Save Quiet Hours"}
                  </button>
                </form>
              )}
            </section>
          </>
        )}
      </div>
    </WellbeingLayout>
  );
}

/* ============================================================
   STYLES
   ============================================================ */

const glass = {
  background: "rgba(255,255,255,0.66)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  border: "1px solid rgba(255,255,255,0.82)",
  boxShadow: "0 15px 35px rgba(49,34,68,0.10)",
};

const styles = {
  pageContent: {
    width: "100%",
    boxSizing: "border-box",
    paddingBottom: "30px",
  },

  hero: {
    ...glass,
    borderRadius: "26px",
    padding: "18px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "22px",
  },

  heroIcon: {
    position: "relative",
    flexShrink: 0,
  },

  heroBadge: {
    position: "absolute",
    top: "-3px",
    right: "-5px",
    minWidth: "20px",
    height: "20px",
    padding: "0 4px",
    borderRadius: "20px",
    background: "#EF4444",
    color: "#fff",
    border: "2px solid #fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    fontWeight: "900",
    boxSizing: "border-box",
  },

  heroContent: {
    minWidth: 0,
  },

  eyebrow: {
    margin: "0 0 4px",
    color: "#7C3AED",
    fontSize: "11px",
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
  },

  heroTitle: {
    margin: "0 0 6px",
    color: "#312244",
    fontSize: "18px",
    lineHeight: "1.35",
  },

  heroText: {
    margin: 0,
    color: "#6B5B7B",
    fontSize: "12px",
    lineHeight: "1.6",
  },

  errorBox: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
    padding: "13px 15px",
    borderRadius: "17px",
    background: "rgba(254,226,226,0.94)",
    color: "#991B1B",
    marginBottom: "18px",
    fontSize: "13px",
  },

  errorText: {
    margin: "3px 0 0",
    lineHeight: "1.5",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "14px",
  },

  sectionTitle: {
    margin: "0 0 3px",
    color: "#312244",
    fontSize: "20px",
    fontWeight: "900",
  },

  sectionSub: {
    margin: 0,
    color: "#7D6D89",
    fontSize: "12px",
  },

  readAllButton: {
    border: "1px solid rgba(124,58,237,0.15)",
    borderRadius: "14px",
    padding: "9px 11px",
    background: "rgba(255,255,255,0.72)",
    color: "#6D28D9",
    fontFamily: "inherit",
    fontSize: "11px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  notificationList: {
    display: "grid",
    gap: "12px",
    marginBottom: "30px",
  },

  notificationCard: {
    position: "relative",
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    padding: "16px",
    borderRadius: "23px",
    transition: "0.25s ease",
  },

  unreadCard: {
    background:
      "linear-gradient(135deg,rgba(255,255,255,0.94),rgba(245,239,255,0.90))",
    border: "1px solid rgba(167,139,250,0.40)",
    boxShadow: "0 12px 30px rgba(109,40,217,0.12)",
  },

  readCard: {
    background: "rgba(255,255,255,0.60)",
    border: "1px solid rgba(255,255,255,0.75)",
    boxShadow: "0 9px 24px rgba(49,34,68,0.07)",
  },

  unreadDot: {
    position: "absolute",
    top: "12px",
    right: "12px",
    width: "9px",
    height: "9px",
    borderRadius: "50%",
    background: "#8B5CF6",
    boxShadow: "0 0 0 4px rgba(139,92,246,0.12)",
  },

  notificationIcon: {
    flexShrink: 0,
    paddingTop: "2px",
  },

  notificationContent: {
    flex: 1,
    minWidth: 0,
  },

  notificationTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    paddingRight: "10px",
  },

  notificationTitle: {
    margin: 0,
    color: "#312244",
    fontSize: "15px",
    lineHeight: "1.4",
    fontWeight: "900",
  },

  newBadge: {
    padding: "3px 6px",
    borderRadius: "8px",
    background: "#EDE9FE",
    color: "#7C3AED",
    fontSize: "8px",
    fontWeight: "900",
  },

  notificationMessage: {
    margin: "5px 0 7px",
    color: "#64546F",
    fontSize: "12px",
    lineHeight: "1.6",
  },

  notificationDate: {
    margin: "0 0 9px",
    color: "#9B8DA5",
    fontSize: "10px",
    fontWeight: "600",
  },

  notificationActions: {
    display: "flex",
    justifyContent: "flex-end",
  },

  openButton: {
    border: "none",
    borderRadius: "12px",
    padding: "8px 13px",
    background: "linear-gradient(135deg,#7C3AED,#A855F7)",
    color: "#fff",
    fontFamily: "inherit",
    fontSize: "11px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 7px 15px rgba(124,58,237,0.20)",
  },

  loadingCard: {
    ...glass,
    borderRadius: "23px",
    padding: "28px 20px",
    textAlign: "center",
    marginBottom: "28px",
  },

  loadingIcon: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "10px",
  },

  loadingTitle: {
    margin: "0 0 5px",
    color: "#312244",
    fontWeight: "800",
  },

  loadingText: {
    margin: 0,
    color: "#7D6D89",
    fontSize: "12px",
  },

  emptyCard: {
    ...glass,
    borderRadius: "23px",
    padding: "28px 20px",
    textAlign: "center",
    marginBottom: "28px",
  },

  emptyTitle: {
    margin: "12px 0 6px",
    color: "#312244",
    fontSize: "17px",
  },

  emptyText: {
    margin: "0 auto",
    maxWidth: "300px",
    color: "#7D6D89",
    fontSize: "12px",
    lineHeight: "1.6",
  },

  preferenceHeading: {
    marginBottom: "14px",
  },

  preferencesCard: {
    ...glass,
    borderRadius: "24px",
    padding: "4px 16px",
    marginBottom: "18px",
  },

  preferenceRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "14px 0",
  },

  preferenceInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minWidth: 0,
  },

  preferenceTitle: {
    margin: "0 0 3px",
    color: "#312244",
    fontSize: "14px",
    fontWeight: "800",
  },

  preferenceText: {
    margin: 0,
    color: "#7D6D89",
    fontSize: "11px",
    lineHeight: "1.5",
  },

  switchButton: {
    width: "47px",
    height: "27px",
    border: "none",
    borderRadius: "30px",
    padding: "3px",
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
    cursor: "pointer",
    transition: "0.25s ease",
  },

  switchCircle: {
    width: "21px",
    height: "21px",
    borderRadius: "50%",
    background: "#fff",
    boxShadow: "0 3px 8px rgba(0,0,0,0.20)",
  },

  quietCard: {
    ...glass,
    borderRadius: "24px",
    padding: "17px",
  },

  quietHeader: {
    marginBottom: "13px",
  },

  quietTitle: {
    margin: "0 0 3px",
    color: "#312244",
    fontSize: "16px",
  },

  quietInfo: {
    display: "flex",
    alignItems: "flex-start",
    gap: "9px",
    background: "rgba(237,233,254,0.72)",
    borderRadius: "14px",
    padding: "11px",
    marginBottom: "13px",
  },

  infoIcon: {
    width: "20px",
    height: "20px",
    flexShrink: 0,
    borderRadius: "50%",
    background: "#8B5CF6",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "900",
  },

  quietInfoText: {
    margin: 0,
    color: "#62516F",
    fontSize: "11px",
    lineHeight: "1.55",
  },

  configureButton: {
    width: "100%",
    border: "1px solid rgba(124,58,237,0.15)",
    borderRadius: "15px",
    padding: "11px",
    background: "rgba(255,255,255,0.72)",
    color: "#6D28D9",
    fontFamily: "inherit",
    fontSize: "12px",
    fontWeight: "800",
    cursor: "pointer",
  },

  quietForm: {
    display: "grid",
    gap: "13px",
    marginTop: "15px",
    paddingTop: "15px",
    borderTop: "1px solid rgba(124,58,237,0.10)",
  },

  enableRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },

  enableTitle: {
    margin: "0 0 3px",
    color: "#312244",
    fontSize: "13px",
  },

  timeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2,minmax(0,1fr))",
    gap: "10px",
  },

  field: {
    display: "grid",
    gap: "6px",
  },

  fieldLabel: {
    color: "#5B4A6B",
    fontSize: "11px",
    fontWeight: "800",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid rgba(124,58,237,0.13)",
    outline: "none",
    borderRadius: "13px",
    padding: "11px",
    background: "rgba(255,255,255,0.78)",
    color: "#312244",
    fontFamily: "inherit",
    fontSize: "12px",
  },

  saveButton: {
    width: "100%",
    border: "none",
    borderRadius: "15px",
    padding: "12px",
    background: "linear-gradient(135deg,#7C3AED,#A855F7,#EC4899)",
    color: "#fff",
    fontFamily: "inherit",
    fontSize: "13px",
    fontWeight: "900",
    cursor: "pointer",
    boxShadow: "0 10px 22px rgba(124,58,237,0.22)",
  },
};