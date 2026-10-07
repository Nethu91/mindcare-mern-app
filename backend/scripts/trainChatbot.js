const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { train, createPredictor, normalize } = require("../utils/chatbotModel");

const dataPath = path.join(__dirname, "../data/chatbot-dataset.json");
const raw = fs.readFileSync(dataPath, "utf8");
const dataset = JSON.parse(raw);
const splits = { train: [], validation: [], test: [] };
const seen = new Set();
const tags = new Set();
for (const intent of dataset.intents) {
  if (tags.has(intent.tag)) throw new Error(`Duplicate intent: ${intent.tag}`);
  tags.add(intent.tag);
  if (intent.patterns.length !== 10 || !intent.responses.length || !intent.followUp) {
    throw new Error(`${intent.tag} requires 10 unique patterns, responses and a follow-up.`);
  }
  intent.patterns.forEach((text, index) => {
    if (typeof text !== "string" || !text.trim()) throw new Error("Invalid example.");
    const key = normalize(text).replace(/[^a-z ]/g, "").trim();
    if (seen.has(key)) throw new Error(`Duplicate example: ${text}`);
    seen.add(key);
    const split = index < 8 ? "train" : index === 8 ? "validation" : "test";
    splits[split].push({ id: `${intent.tag}-${index + 1}`, text, intent: intent.tag });
  });
}

function evaluate(model, examples) {
  const predict = createPredictor(model);
  const matrix = Object.fromEntries(model.labels.map((label) => [label, Object.fromEntries(model.labels.map((other) => [other, 0]))]));
  const predictions = examples.map((example) => {
    const result = predict(example.text);
    matrix[example.intent][result.intent]++;
    return { ...example, predicted: result.intent, score: Number(result.confidence.toFixed(4)), correct: example.intent === result.intent };
  });
  const correct = predictions.filter((item) => item.correct).length;
  const perIntent = model.labels.map((intent) => {
    const tp = matrix[intent][intent];
    const actual = Object.values(matrix[intent]).reduce((a, b) => a + b, 0);
    const predicted = model.labels.reduce((total, label) => total + matrix[label][intent], 0);
    const precision = predicted ? tp / predicted : 0;
    const recall = actual ? tp / actual : 0;
    return { intent, support: actual, precision, recall, f1: precision + recall ? 2 * precision * recall / (precision + recall) : 0 };
  });
  return { total: examples.length, correct, accuracy: correct / examples.length, macroF1: perIntent.reduce((sum, row) => sum + row.f1, 0) / perIntent.length, perIntent, confusionMatrix: matrix, predictions };
}

// Choose smoothing using validation only; test examples never enter fitting.
const candidates = [0.25, 0.5, 1].map((alpha) => {
  const model = train(splits.train, alpha);
  return { model, validation: evaluate(model, splits.validation) };
}).sort((a, b) => b.validation.accuracy - a.validation.accuracy || b.validation.macroF1 - a.validation.macroF1 || b.model.alpha - a.model.alpha);
const selected = candidates[0];
const dataHash = crypto.createHash("sha256").update(raw).digest("hex");
const model = {
  ...selected.model,
  datasetVersion: dataset.version,
  datasetSha256: dataHash,
  language: "en",
  counts: Object.fromEntries(Object.entries(splits).map(([name, rows]) => [name, rows.length])),
  // Conservative demo thresholds. Do not present the NB score as medical certainty.
  thresholds: { minScore: 0.14, minMargin: 0.05, minCoverage: 0.3 },
};
const report = {
  algorithm: model.algorithm,
  datasetVersion: dataset.version,
  datasetSha256: dataHash,
  source: dataset.source,
  reviewStatus: dataset.reviewStatus,
  counts: model.counts,
  selectedAlpha: model.alpha,
  vocabularySize: model.vocabulary.length,
  validationCandidates: candidates.map(({ model: candidate, validation }) => ({ alpha: candidate.alpha, accuracy: validation.accuracy })),
  validation: selected.validation,
  test: evaluate(model, splits.test),
  limitations: ["Only 12 synthetic examples in each held-out split; similar language to training examples.", "Intent accuracy does not evaluate reply quality, crisis recall in the real world, or clinical safety.", "Responses are authored templates; this is not a generative language model or LLM fine-tuning.", "No qualified clinical review has been completed; this is an educational prototype."],
};
const directory = path.join(__dirname, "../models/chatbot");
fs.mkdirSync(directory, { recursive: true });
fs.writeFileSync(path.join(directory, "intent-model.json"), JSON.stringify(model, null, 2) + "\n");
fs.writeFileSync(path.join(directory, "evaluation.json"), JSON.stringify(report, null, 2) + "\n");
for (const [name, rows] of Object.entries(splits)) {
  fs.writeFileSync(path.join(directory, `${name}.jsonl`), rows.map((row) => JSON.stringify(row)).join("\n") + "\n");
}
// Report actual routing (including abstentions) separately from forced classification.
const { respond } = require("../utils/chatbotService");
report.runtimeTest = {
  total: splits.test.length,
  predictions: splits.test.map((row) => ({ id: row.id, expected: row.intent, actual: respond(row.text).intent, source: respond(row.text).source })),
};
report.runtimeTest.correct = report.runtimeTest.predictions.filter((row) => row.expected === row.actual).length;
report.runtimeTest.accuracy = report.runtimeTest.correct / report.runtimeTest.total;
report.runtimeTest.fallbackCount = report.runtimeTest.predictions.filter((row) => row.actual === "fallback").length;
fs.writeFileSync(path.join(directory, "evaluation.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({ counts: model.counts, vocabularySize: model.vocabulary.length, selectedAlpha: model.alpha, validationAccuracy: report.validation.accuracy, testAccuracy: report.test.accuracy, testMacroF1: report.test.macroF1, runtimeTestAccuracy: report.runtimeTest.accuracy, fallbackCount: report.runtimeTest.fallbackCount }, null, 2));
