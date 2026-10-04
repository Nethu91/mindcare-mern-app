// Import operator-verified centers without publishing fabricated sample listings.
require("dotenv").config();
const fs = require("node:fs");
const mongoose = require("mongoose");
const { Center } = require("../models/Wellbeing");
async function run() {
  const file = process.argv[2];
  if (!file)
    throw new Error("Usage: node scripts/importCenters.js centers.json");
  const rows = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!Array.isArray(rows)) throw new Error("Expected an array of centers");
  for (const row of rows) {
    await new Center(row).validate();
    new Intl.DateTimeFormat("en", { timeZone: row.timeZone || "Asia/Colombo" });
    if (
      row.latitude != null &&
      (!Number.isFinite(row.latitude) || Math.abs(row.latitude) > 90)
    )
      throw new Error("Invalid latitude");
    if (
      row.longitude != null &&
      (!Number.isFinite(row.longitude) || Math.abs(row.longitude) > 180)
    )
      throw new Error("Invalid longitude");
    for (const h of row.hours || []) {
      if (
        !Number.isInteger(h.day) ||
        h.day < 0 ||
        h.day > 6 ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(h.start) ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(h.end) ||
        h.start >= h.end
      )
        throw new Error(
          "Hours must be same-day intervals, day 0 (Sunday) through 6",
        );
    }
  }
  await mongoose.connect(process.env.MONGO_URI);
  for (const row of rows)
    await Center.findOneAndUpdate(
      { name: row.name, address: row.address },
      { $set: row },
      { upsert: true, runValidators: true },
    );
  console.log(`Imported ${rows.length} centers`);
}
run()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
