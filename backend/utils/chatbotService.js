const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const dataset = require("../data/chatbot-dataset.json");
const model = require("../models/chatbot/intent-model.json");
const report = require("../models/chatbot/evaluation.json");
const { createPredictor, normalize } = require("./chatbotModel");

const hash = crypto.createHash("sha256").update(fs.readFileSync(path.join(__dirname, "../data/chatbot-dataset.json"))).digest("hex");
if (hash !== model.datasetSha256 || model.datasetVersion !== dataset.version) {
  throw new Error("Chatbot dataset changed. Run npm run train:chatbot before starting the server.");
}
const predict = createPredictor(model);
const intents = Object.fromEntries(dataset.intents.map((intent) => [intent.tag, intent]));
const link = (label, path) => ({ label, path });
const actionsByIntent = {
  greeting: [link("Mood tracker", "/mood"), link("Journal", "/journal")],
  stress: [link("Take a calm break", "/calm-videos"), link("Journal", "/journal")],
  anxiety: [link("Calming activities", "/meditation"), link("Find a counselor", "/counselor")],
  sadness: [link("Write in journal", "/journal"), link("Find a counselor", "/counselor")],
  loneliness: [link("Find a counselor", "/counselor"), link("Journal", "/journal")],
  sleep: [link("Calm music", "/music"), link("Find a counselor", "/counselor")],
  positive: [link("Save your mood", "/mood"), link("Journal", "/journal")],
  calming: [link("Calm videos", "/calm-videos"), link("Music", "/music"), link("Meditation", "/meditation")],
  app_help: [link("Mood tracker", "/mood"), link("Journal", "/journal"), link("Counselors", "/counselor")],
  medical_boundary: [link("Find a counselor", "/counselor"), link("Emergency support", "/emergency")],
  crisis: [link("Open Emergency support", "/emergency")],
  thanks: [link("Dashboard", "/dashboard")],
  fallback: [link("Mood tracker", "/mood"), link("Find a counselor", "/counselor")],
};

function reliable(prediction) {
  return prediction.knownFeatures > 0 && prediction.confidence >= model.thresholds.minScore &&
    prediction.margin >= model.thresholds.minMargin && prediction.coverage >= model.thresholds.minCoverage;
}

// A separate conservative safeguard: finite patterns cannot guarantee crisis detection.
// Explicit denials remove only the denied phrase, not other risks in the message.
function safetyCategory(text) {
  const normalized = normalize(text);
  const riskText = normalized
    .replace(/\b(?:not suicidal|not thinking (?:about|of) suicide|no suicidal thoughts)\b/g, " ")
    .replace(/\b(?:do not|don't|will not|won't) (?:want to |plan to |intend to )?(?:kill|hurt|harm) myself\b/g, " ");
  const riskPatterns = [
    /\b(?:suicid\w*|self[ -]?harm\w*|overdos\w*)\b/,
    /\b(?:kill|hurt|harm|cut|injure) (?:myself|yourself|someone|somebody|another person|other people)\b/,
    /\b(?:end|take) my (?:own )?life\b/,
    /\b(?:want|wish|need|going|plan|planning) (?:to )?(?:die|be dead|kill)\b/,
    /\b(?:do not|don't|cannot|can't) want to (?:be alive|live|go on living)\b/,
    /\b(?:not safe|unsafe|in (?:immediate )?danger|being abused|being attacked)\b/,
    /\b(?:took|taken|swallowed) (?:too many|a lot of|all (?:of )?(?:my|the)) (?:pills|tablets|medication)\b/,
    /\b(?:better off dead|no reason to live|do not want to wake up|don't want to wake up)\b/,
    /\b(?:wish i (?:was|were) dead|do not want to exist|ending it all|end it all)\b/,
    /\b(?:someone|my partner|my family|he|she) (?:is )?(?:hurting|threatening|attacking) me\b/,
  ];
  if (riskPatterns.some((pattern) => pattern.test(riskText))) return "crisis";
  if (/\b(?:severe chest pain|cannot breathe|trouble breathing|difficulty breathing|can't breathe)\b/.test(normalized)) return "urgent_medical";
  if (/\b(?:diagnos\w*|prescrib\w*|dosage|dose|antidepressant\w*)\b/.test(normalized) ||
      /\b(?:what|which|should|stop|start|change|take|recommend)\b.{0,50}\b(?:medication|medicine|tablets|pills)\b/.test(normalized) ||
      /\b(?:do i have|am i|is this)\b.{0,25}\b(?:depression|bipolar|a disorder|an anxiety disorder|schizophrenia)\b/.test(normalized)) return "medical_boundary";
  return null;
}

function navigationActions(text) {
  const options = [
    [/\bmood\b/, link("Open mood tracker", "/mood")],
    [/\bjournal\b/, link("Open journal", "/journal")],
    [/\b(?:appointment|book|booking)\b/, link("Open appointments", "/appointments")],
    [/\bcounsel(?:or|lor|ors|lors)\b/, link("Find a counselor", "/counselor")],
    [/\b(?:assessment|test)\b/, link("Open self-assessment", "/assessment")],
    [/\bvideo(?:s)?\b/, link("Open calm videos", "/calm-videos")],
    [/\bmusic\b/, link("Open music", "/music")],
    [/\bbreathing\b/, link("Open breathing practice", "/breathing")],
    [/\bmeditation\b/, link("Open meditation", "/meditation")],
    [/\bgames?\b/, link("Open mind relax games", "/mind-relax-games")],
  ];
  const matches = options.filter(([pattern]) => pattern.test(normalize(text))).map(([, action]) => action);
  return matches.length ? matches.slice(0, 3) : actionsByIntent.app_help;
}

function respond(message, history = []) {
  const safety = safetyCategory(message);
  if (safety === "urgent_medical") {
    return { intent: "urgent_medical", reply: "Severe chest pain or difficulty breathing can need urgent medical attention. Please contact local emergency services or go to the nearest emergency department now. This chat cannot assess the cause or provide emergency care.", actions: actionsByIntent.crisis, urgent: true, source: "safety-rule" };
  }
  if (safety) return { intent: safety, reply: intents[safety].responses[0], actions: actionsByIntent[safety], urgent: safety === "crisis", source: "safety-rule" };
  if (/\b(?:not suicidal|not thinking (?:about|of) suicide|no suicidal thoughts|do not want to (?:kill|hurt|harm) myself|will not (?:kill|hurt|harm) myself)\b/.test(normalize(message))) {
    return { intent: "fallback", reply: "Thank you for clarifying. What kind of support would you like right now? I can listen or help you find a MindCare feature.", actions: actionsByIntent.fallback, urgent: false, source: "safety-clarification" };
  }

  const previousUser = [...history].reverse().find((item) => item.sender === "user");
  const previousPrediction = previousUser ? predict(previousUser.text) : null;
  const shortFollowUp = /^(?:yes|yes please|okay|ok|sure|please|tell me more|what can i do|what should i do|i do not know|i don't know|not sure|it is still difficult|it's still difficult)[.!?]*$/i.test(message.trim());
  if (shortFollowUp && previousUser) {
    const previousSafety = safetyCategory(previousUser.text);
    if (previousSafety === "crisis" || previousSafety === "urgent_medical") {
      return { intent: "crisis", reply: intents.crisis.followUp, actions: actionsByIntent.crisis, urgent: true, source: "safety-context" };
    }
    if (reliable(previousPrediction)) {
      const intent = previousPrediction.intent;
      return { intent, reply: intents[intent].followUp, actions: actionsByIntent[intent], urgent: intent === "crisis", source: "model-context" };
    }
  }

  const prediction = predict(message);
  if (!reliable(prediction)) {
    return { intent: "fallback", reply: "I may not have understood that fully. I can offer basic emotional support or help you find a MindCare feature. Could you tell me a little more about how you are feeling or what you need?", actions: actionsByIntent.fallback, urgent: false, source: "uncertain-model" };
  }
  const intent = prediction.intent;
  // Alternate templates only when continuing the same topic. No claims of memory beyond this request.
  const sameTopic = previousPrediction && reliable(previousPrediction) && previousPrediction.intent === intent;
  const responses = intents[intent].responses;
  return {
    intent,
    reply: responses[sameTopic && responses.length > 1 ? 1 : 0],
    actions: intent === "app_help" ? navigationActions(message) : actionsByIntent[intent],
    urgent: intent === "crisis",
    source: "trained-intent-model",
  };
}

function modelInfo() {
  return { name: "MindCare English intent model", algorithm: model.algorithm, datasetVersion: model.datasetVersion, language: model.language, counts: model.counts, intents: model.labels.length, testAccuracy: report.test.accuracy, note: "Small synthetic benchmark. Template replies; not an LLM or a medical assessment." };
}

module.exports = { respond, safetyCategory, reliable, modelInfo };
