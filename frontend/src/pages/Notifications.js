import { useEffect, useState } from "react";
import API from "../api/axios";
import WellbeingLayout from "../components/WellbeingLayout";
import { apiError } from "../utils/apiError";
import { useNavigate } from "react-router-dom";
export default function Notifications() {
  const nav = useNavigate(),
    [items, setItems] = useState([]),
    [prefs, setPrefs] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [quiet, setQuiet] = useState(false),
    [loading, setLoading] = useState(true);
  async function load() {
    try {
      const [a, b] = await Promise.all([
        API.get("/wellbeing/notifications"),
        API.get("/wellbeing/preferences"),
      ]);
      setItems(a.data);
      setPrefs(b.data);
    } catch (e) {
      setError(apiError(e));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function read(ids, path) {
    setBusy(true);
    setError("");
    try {
      await API.patch("/wellbeing/notifications/read", { ids });
      setItems(
        items.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n)),
      );
      window.dispatchEvent(new Event("mindcare-notifications"));
      if (path) nav(path);
    } catch (e) {
      setError(apiError(e));
    } finally {
      setBusy(false);
    }
  }
  async function update(patch) {
    setBusy(true);
    setError("");
    try {
      const r = await API.patch("/wellbeing/preferences", patch);
      setPrefs(r.data);
      window.dispatchEvent(new Event("mindcare-notifications"));
      const n = await API.get("/wellbeing/notifications");
      setItems(n.data);
    } catch (e) {
      setError(apiError(e));
    } finally {
      setBusy(false);
    }
  }
  const labels = [
    ["daily", "Daily Reminders", "Mood tracking & check-ins"],
    ["affirmations", "Daily Affirmations", "Positive messages"],
    ["sessions", "Session Alerts", "Upcoming counseling appointments"],
  ];
  return (
    <WellbeingLayout
      title={`Notifications (${items.filter((n) => !n.read).length})`}
    >
      <p role="alert" className="error">
        {error}
      </p>
      <h2>Recent</h2>
      <button
        disabled={busy || !items.some((n) => !n.read)}
        onClick={() => read(items.filter((n) => !n.read).map((n) => n.id))}
      >
        Mark all as read
      </button>
      {loading ? <p>Loading…</p> : !items.length && <p>No notifications.</p>}
      {items.map((n) => (
        <article key={n.id}>
          <h3>
            {n.icon} {n.title} {!n.read && <span aria-label="Unread">●</span>}
          </h3>
          <p>{n.message}</p>
          <button disabled={busy} onClick={() => read([n.id], n.path)}>
            Open
          </button>
        </article>
      ))}
      {prefs && (
        <>
          <h2>Notification Preferences</h2>
          <section>
            {labels.map(([key, title, sub]) => (
              <div className="row" key={key}>
                <div>
                  <h3>{title}</h3>
                  <p>{sub}</p>
                </div>
                <button
                  className="switch"
                  role="switch"
                  aria-label={title}
                  aria-checked={prefs[key]}
                  disabled={busy}
                  onClick={() => update({ [key]: !prefs[key] })}
                >
                  <span />
                </button>
              </div>
            ))}
          </section>
          <section>
            <h3>Quiet Hours</h3>
            <p>
              Save your preferred quiet times. This app currently provides an
              in-app inbox; background push reminders are not enabled.
            </p>
            <button onClick={() => setQuiet(!quiet)}>
              Configure Quiet Hours
            </button>
            {quiet && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  update({
                    quietEnabled: prefs.quietEnabled,
                    quietStart: prefs.quietStart,
                    quietEnd: prefs.quietEnd,
                    timeZone: prefs.timeZone,
                  });
                }}
              >
                <label>
                  <input
                    type="checkbox"
                    checked={prefs.quietEnabled}
                    onChange={(e) =>
                      setPrefs({ ...prefs, quietEnabled: e.target.checked })
                    }
                  />{" "}
                  Enable quiet hours
                </label>
                <label>
                  From{" "}
                  <input
                    type="time"
                    required
                    value={prefs.quietStart}
                    onChange={(e) =>
                      setPrefs({ ...prefs, quietStart: e.target.value })
                    }
                  />
                </label>
                <label>
                  Until{" "}
                  <input
                    type="time"
                    required
                    value={prefs.quietEnd}
                    onChange={(e) =>
                      setPrefs({ ...prefs, quietEnd: e.target.value })
                    }
                  />
                </label>
                <label>
                  Timezone{" "}
                  <input
                    required
                    value={prefs.timeZone}
                    onChange={(e) =>
                      setPrefs({ ...prefs, timeZone: e.target.value })
                    }
                  />
                </label>
                <button disabled={busy}>Save Quiet Hours</button>
              </form>
            )}
          </section>
        </>
      )}
    </WellbeingLayout>
  );
}
