const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { respondWithAI, metadata } = require("../utils/chatbotLLM");

function validateBody(body) {
  if (!body || typeof body.message !== "string" || !body.message.trim() || body.message.length > 1000) {
    return "Please send a message between 1 and 1000 characters.";
  }
  if (body.history !== undefined && (!Array.isArray(body.history) || body.history.length > 6 ||
      body.history.some((item) => !item || !["user", "bot"].includes(item.sender) ||
        typeof item.text !== "string" || !item.text.trim() || item.text.length > 1500))) {
    return "Conversation history must contain at most 6 valid messages.";
  }
  return null;
}

// In-memory demo limit, per authenticated account. No conversation logging or DB writes.
function createChatRouter(auth = protect, responder = respondWithAI, info = metadata) {
  const router = express.Router();
  const windows = new Map();
  const inFlight = new Set();
  router.use(auth);
  router.get("/model", (req, res) => {
    res.set("Cache-Control", "no-store");
    res.json(info());
  });
  router.post("/", async (req, res, next) => {
    const error = validateBody(req.body);
    if (error) return res.status(400).json({ message: error });
    const now = Date.now();
    const key = String(req.user._id);
    if (inFlight.has(key)) return res.status(429).json({ message: "Please wait for your current reply before sending another message." });
    // Prune expired accounts so long-running processes do not retain them forever.
    for (const [id, window] of windows) if (window.expires <= now) windows.delete(id);
    const window = windows.get(key) || { count: 0, expires: now + 60000 };
    window.count++;
    windows.set(key, window);
    if (window.count > 60) {
      res.set("Retry-After", String(Math.ceil((window.expires - now) / 1000)));
      return res.status(429).json({ message: "Please pause for a moment before sending another message." });
    }
    res.set("Cache-Control", "no-store");
    const controller = new AbortController();
    const cancel = () => { if (!res.writableEnded) controller.abort(); };
    res.once("close", cancel);
    inFlight.add(key);
    try {
      const reply = await responder(req.body.message.trim(), req.body.history || [], { signal: controller.signal });
      if (!controller.signal.aborted) res.json(reply);
    } catch (error) {
      if (!controller.signal.aborted) next(error);
    } finally {
      inFlight.delete(key);
      res.removeListener("close", cancel);
    }
  });
  return router;
}

module.exports = createChatRouter();
module.exports.createChatRouter = createChatRouter;
module.exports.validateBody = validateBody;
