import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";

export default function TrackLocation() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let timer;
    const load = async () => {
      try {
        const res = await API.get(`/emergency/track/${token}`);
        setData(res.data);
        setError("");
      } catch {
        setError("This tracking link has expired or is invalid.");
      }
    };
    load();
    timer = setInterval(load, 8000); // refresh every 8s
    return () => clearInterval(timer);
  }, [token]);

  if (error) return <div style={{ padding: 30, fontFamily: "sans-serif" }}>{error}</div>;
  if (!data) return <div style={{ padding: 30, fontFamily: "sans-serif" }}>Loading…</div>;

  const d = 0.005;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${data.lng - d},${data.lat - d},${data.lng + d},${data.lat + d}&layer=mapnik&marker=${data.lat},${data.lng}`;

  return (
    <div style={{ fontFamily: "sans-serif", padding: 16, maxWidth: 700, margin: "0 auto" }}>
      <h2>🚨 {data.name} shared their live location</h2>
      <p>
        {data.active ? "Sharing live" : "Sharing stopped"} · last update{" "}
        {new Date(data.updatedAt).toLocaleTimeString()}
      </p>
      <iframe title="map" src={src} style={{ width: "100%", height: 420, border: 0, borderRadius: 16 }} />
      <p>
        <a href={`https://www.google.com/maps?q=${data.lat},${data.lng}`} target="_blank" rel="noreferrer">
          Open in Google Maps
        </a>
      </p>
    </div>
  );
}