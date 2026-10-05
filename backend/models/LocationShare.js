const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  token: { type: String, required: true, unique: true },
  lat: Number,
  lng: Number,
  accuracy: Number,
  active: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }, // auto-deleted by Mongo after this time
});

schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("LocationShare", schema);