export function distance(a, b) {
  const rad = (x) => (x * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude),
    dLon = rad(b.longitude - a.longitude);
  const n =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) *
      Math.cos(rad(b.latitude)) *
      Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(n), Math.sqrt(1 - n));
}
export function isOpen(c) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: c.timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t)?.value;
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
      get("weekday"),
    ),
    time = `${get("hour")}:${get("minute")}`;
  return (c.hours || []).some(
    (h) => h.day === day && time >= h.start && time < h.end,
  );
}
