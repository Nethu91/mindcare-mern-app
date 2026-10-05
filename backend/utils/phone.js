// Sri Lanka friendly: 0771234567 / +94771234567 / 94 77 123 4567 -> 94771234567
exports.phoneKey = (raw = "") => {
  let d = String(raw).replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0")) d = "94" + d.slice(1);
  return d;
};