// Dependency-free multinomial Naive Bayes. The vocabulary and likelihoods are
// learned by scripts/trainChatbot.js, not handwritten message-to-intent rules.
const STOP_WORDS = new Set("a an the i am im me my myself we our you your he she it its they their this that these those is are was were be been being to of for with at in on and or but as by from so very really today now feel feeling feels can could would should please".split(" "));
for (const word of ["need", "help", "want", "do", "how", "what", "will", "have", "all", "everything"]) STOP_WORDS.add(word);
// Keep feel in phrase features, but not as an emotion-bearing unigram.
STOP_WORDS.delete("feel");

function normalize(text) {
  return text.normalize("NFKC").toLowerCase().replace(/[’‘]/g, "'")
    .replace(/\bcan't\b/g, "cannot").replace(/\bwon't\b/g, "will not")
    .replace(/\bdon't\b/g, "do not").replace(/\bisn't\b/g, "is not")
    .replace(/\bI'm\b/gi, "i am").replace(/\bit's\b/g, "it is")
    .replace(/\b(?:feeling|feels)\b/g, "feel").replace(/\bnot feel\b/g, "not");
}

function features(text) {
  const words = (normalize(text).match(/[a-z]+(?:'[a-z]+)?/g) || [])
    .filter((word) => !STOP_WORDS.has(word));
  // Preserve negated meanings without teaching "happy" from "not happy".
  const unigrams = words.flatMap((word, index) => word === "feel" ? [] : [index > 0 && words[index - 1] === "not" ? `not_${word}` : word]);
  return [...unigrams, ...words.slice(1).map((word, index) => `${words[index]} ${word}`)];
}

function train(examples, alpha = 0.5) {
  if (!examples.length) throw new Error("Training examples are required.");
  const labels = [...new Set(examples.map((row) => row.intent))].sort();
  const vocabulary = [...new Set(examples.flatMap((row) => features(row.text)))].sort();
  const lookup = new Map(vocabulary.map((word, index) => [word, index]));
  const counts = Object.fromEntries(labels.map((label) => [label, new Array(vocabulary.length).fill(0)]));
  const documents = Object.fromEntries(labels.map((label) => [label, 0]));
  for (const row of examples) {
    documents[row.intent]++;
    for (const feature of features(row.text)) counts[row.intent][lookup.get(feature)]++;
  }
  return {
    algorithm: "multinomial-naive-bayes",
    featureVersion: 3,
    alpha,
    labels,
    vocabulary,
    classLogPrior: labels.map((label) => Math.log(documents[label] / examples.length)),
    featureLogProbability: labels.map((label) => {
      const denominator = counts[label].reduce((sum, count) => sum + count, 0) + alpha * vocabulary.length;
      return counts[label].map((count) => Math.log((count + alpha) / denominator));
    }),
  };
}

// Scores are NOT calibrated probabilities of a person's emotional/medical state.
function createPredictor(model) {
  const lookup = new Map(model.vocabulary.map((word, index) => [word, index]));
  return (text) => {
    const tokens = features(text);
    const known = tokens.filter((word) => lookup.has(word));
    const scores = model.labels.map((intent, index) => ({
      intent,
      score: known.reduce((sum, word) => sum + model.featureLogProbability[index][lookup.get(word)], model.classLogPrior[index]),
    })).sort((a, b) => b.score - a.score);
    const denominator = scores.reduce((sum, item) => sum + Math.exp(item.score - scores[0].score), 0);
    const confidence = Math.exp(scores[0].score - scores[0].score) / denominator;
    const runnerUp = Math.exp(scores[1].score - scores[0].score) / denominator;
    return {
      intent: scores[0].intent,
      confidence,
      margin: confidence - runnerUp,
      knownFeatures: known.length,
      coverage: tokens.length ? known.length / tokens.length : 0,
    };
  };
}

module.exports = { features, normalize, train, createPredictor };
