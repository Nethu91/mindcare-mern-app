import { useEffect, useState } from "react";
import API from "../api/axios";
import WellbeingLayout from "../components/WellbeingLayout";
import { apiError } from "../utils/apiError";
import { useSearchParams } from "react-router-dom";
import { distance, isOpen } from "../utils/centers";
export default function MeditationCenters() {
  const [params] = useSearchParams();
  const [centers, setCenters] = useState([]),
    [error, setError] = useState(""),
    [q, setQ] = useState(""),
    [filter, setFilter] = useState("Nearby"),
    [position, setPosition] = useState(null),
    [open, setOpen] = useState(params.get("center")),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    API.get("/wellbeing/centers")
      .then((r) => setCenters(r.data))
      .catch((e) => setError(apiError(e)))
      .finally(() => setLoading(false));
  }, []);
  function locate() {
    if (!navigator.geolocation) {
      setError("Location is unavailable on this device.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPosition(p.coords);
        setError("");
      },
      () =>
        setError(
          "Location permission was unavailable. You can still search by town.",
        ),
    );
  }
  let list = centers.filter((c) =>
    [c.name, c.address, ...(c.classes || [])]
      .join(" ")
      .toLowerCase()
      .includes(q.toLowerCase()),
  );
  if (filter === "Open Now") list = list.filter(isOpen);
  if (filter === "Top Rated")
    list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  if (filter === "Nearby" && position)
    list.sort(
      (a, b) =>
        (Number.isFinite(a.latitude) && Number.isFinite(a.longitude)
          ? distance(position, a)
          : Infinity) -
        (Number.isFinite(b.latitude) && Number.isFinite(b.longitude)
          ? distance(position, b)
          : Infinity),
    );
  return (
    <WellbeingLayout title="Meditation Centers">
      <p>Find peaceful spaces near you</p>
      <label>
        Search centers{" "}
        <input
          placeholder="Name, town or class…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </label>
      <div className="chips">
        {["Nearby", "Top Rated", "Open Now"].map((f) => (
          <button
            key={f}
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
        <button onClick={locate}>Use my location</button>
      </div>
      {filter === "Nearby" && !position && (
        <p>Allow location to sort by distance.</p>
      )}
      <p role="alert" className="error">
        {error}
      </p>
      {loading ? (
        <p>Loading…</p>
      ) : (
        !list.length && (
          <section>
            <p>
              No centers found. Center information must be added by the app
              operator.
            </p>
          </section>
        )
      )}
      {list.map((c) => (
        <article key={c._id}>
          <h3>🧘 {c.name}</h3>
          {c.rating != null && (
            <p>
              ★ {c.rating} · {c.reviewCount || 0} reviews
            </p>
          )}
          {position &&
            Number.isFinite(c.latitude) &&
            Number.isFinite(c.longitude) && (
              <p>{distance(position, c).toFixed(1)} km away</p>
            )}
          <p>📍 {c.address}</p>
          <p>{isOpen(c) ? "Open now" : "Closed or hours unavailable"}</p>
          <p className="tags">{(c.classes || []).join(" · ")}</p>
          {open === c._id && (
            <p>{c.description || "No additional details available."}</p>
          )}
          <div className="chips">
            <button onClick={() => setOpen(open === c._id ? null : c._id)}>
              {open === c._id ? "Hide Details" : "View Details"}
            </button>
            <a
              className="action"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.name + " " + c.address)}`}
              target="_blank"
              rel="noreferrer"
            >
              Directions
            </a>
            {c.phone && (
              <a
                className="action"
                href={`tel:${c.phone.replace(/[^+0-9]/g, "")}`}
              >
                Call
              </a>
            )}
          </div>
        </article>
      ))}
    </WellbeingLayout>
  );
}
