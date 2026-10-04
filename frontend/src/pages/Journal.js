import { useEffect, useState } from "react";
import API from "../api/axios";
import WellbeingLayout from "../components/WellbeingLayout";
import { apiError } from "../utils/apiError";
export default function Journal() {
  const [entries, setEntries] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    title: "",
    content: "",
    mood: "Happy",
    tags: "",
  });
  useEffect(() => {
    API.get("/wellbeing/journal")
      .then((r) => setEntries(r.data))
      .catch((e) => setError(apiError(e)))
      .finally(() => setLoading(false));
  }, []);
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await API.post("/wellbeing/journal", {
        ...draft,
        tags: draft.tags
          .split(",")
          .map((t) => t.trim().replace(/^#/, ""))
          .filter(Boolean),
      });
      setEntries([r.data, ...entries]);
      setOpen(false);
      setDraft({ title: "", content: "", mood: "Happy", tags: "" });
    } catch (e) {
      setError(apiError(e));
    } finally {
      setBusy(false);
    }
  }
  async function remove(id) {
    if (!window.confirm("Delete this journal entry?")) return;
    setBusy(true);
    try {
      await API.delete(`/wellbeing/journal/${id}`);
      setEntries(entries.filter((e) => e._id !== id));
    } catch (e) {
      setError(apiError(e));
    } finally {
      setBusy(false);
    }
  }
  const now = new Date();
  return (
    <WellbeingLayout title="My Journal">
      <section>
        <h3>Your private reflection space</h3>
        <p>Entries are saved to your account.</p>
        <div className="stats">
          <span>{entries.length} entries</span>
          <span>
            {
              entries.filter(
                (e) =>
                  new Date(e.createdAt).getMonth() === now.getMonth() &&
                  new Date(e.createdAt).getFullYear() === now.getFullYear(),
              ).length
            }{" "}
            this month
          </span>
        </div>
      </section>
      <p role="alert" className="error">
        {error}
      </p>
      <button onClick={() => setOpen(!open)}>
        {open ? "Close" : "+ New Entry"}
      </button>
      {open && (
        <section>
          <form onSubmit={save}>
            <label>
              Title{" "}
              <input
                required
                maxLength={150}
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </label>
            <label>
              How are you feeling?{" "}
              <select
                value={draft.mood}
                onChange={(e) => setDraft({ ...draft, mood: e.target.value })}
              >
                {["Happy", "Peaceful", "Anxious", "Sad", "Angry"].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </label>
            <label>
              Your thoughts{" "}
              <textarea
                required
                maxLength={20000}
                value={draft.content}
                onChange={(e) =>
                  setDraft({ ...draft, content: e.target.value })
                }
              />
            </label>
            <label>
              Tags (comma separated){" "}
              <input
                value={draft.tags}
                onChange={(e) => setDraft({ ...draft, tags: e.target.value })}
              />
            </label>
            <button disabled={busy}>Save Entry</button>
          </form>
        </section>
      )}
      <h2>Recent Entries</h2>
      {loading ? (
        <p>Loading…</p>
      ) : (
        !entries.length && <p>No entries yet. Write your first reflection.</p>
      )}
      {entries.map((e) => (
        <article key={e._id}>
          <h3>{e.title}</h3>
          <p>{e.content}</p>
          <p>
            {new Date(e.createdAt).toLocaleDateString()} · {e.mood}
          </p>
          <p className="tags">{e.tags.map((t) => `#${t}`).join(" ")}</p>
          <button disabled={busy} onClick={() => remove(e._id)}>
            Delete
          </button>
        </article>
      ))}
    </WellbeingLayout>
  );
}
