const { test } = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const { createLLMResponder, metadata, outputText } = require("../utils/chatbotLLM");
const { createChatRouter } = require("../routes/chatRoutes");

const env = { OPENAI_API_KEY: "test-secret-not-a-real-key", OPENAI_MODEL: "gpt-4.1-mini", CHATBOT_MODE: "llm" };
const moderation = (categories = {}, flagged = false) => ({ results: [{ categories, flagged }] });
const generated = (text) => ({ status: "completed", output: [{ type: "message", content: [{ type: "output_text", text }] }] });
const ok = (body) => ({ ok: true, json: async () => body });

test("missing/placeholder key or explicit local mode makes no external requests", async () => {
  for (const settings of [{}, { OPENAI_API_KEY: "YOUR_OPENAI_API_KEY" }, { ...env, CHATBOT_MODE: "local" }]) {
    const respond = createLLMResponder({ env: settings, fetchImpl: () => { throw new Error("must not call network"); } });
    const result = await respond("I feel stressed");
    assert.equal(result.engine, "local");
    assert.equal(result.intent, "stress");
    assert.match(result.notice, /Basic support/);
  }
  const info = metadata(env);
  assert.equal(info.generation.engine, "llm");
  assert.equal(info.generation.model, env.OPENAI_MODEL);
  assert.ok(!JSON.stringify(info).includes(env.OPENAI_API_KEY));
});

test("LLM generation sends bounded recent context and store:false, moderates input/output", async () => {
  const calls = [];
  const responder = createLLMResponder({ env, fetchImpl: async (url, options) => {
    const body = JSON.parse(options.body);
    calls.push({ url, options, body });
    return ok(url.endsWith("/moderations") ? moderation() : generated("That meeting sounds difficult. What part stayed with you afterwards?"));
  } });
  const history = Array.from({ length: 8 }, (_, i) => ({ sender: i % 2 ? "bot" : "user", text: `Earlier message ${i}` }));
  const result = await responder("My manager dismissed my idea in a meeting", history);
  assert.equal(result.engine, "llm");
  assert.equal(result.source, "openai-responses");
  assert.match(result.reply, /meeting sounds difficult/);
  assert.equal(calls.length, 3);
  const generation = calls[1];
  assert.equal(generation.url, "https://api.openai.com/v1/responses");
  assert.equal(generation.body.store, false);
  assert.equal(generation.body.max_output_tokens, 360);
  assert.equal(generation.body.input.length, 7);
  assert.deepEqual(generation.body.input[0], { role: "user", content: "Earlier message 2" });
  assert.deepEqual(generation.body.input[6], { role: "user", content: "My manager dismissed my idea in a meeting" });
  assert.match(generation.body.instructions, /Do not diagnose/);
  assert.equal(generation.options.headers.Authorization, `Bearer ${env.OPENAI_API_KEY}`);
  assert.ok(!JSON.stringify(result).includes(env.OPENAI_API_KEY));
});

test("local crisis, medical and recent crisis context bypass cloud calls even when enabled", async () => {
  const responder = createLLMResponder({ env, fetchImpl: () => { throw new Error("should bypass cloud"); } });
  for (const text of ["I want to die", "I cannot breathe", "What dosage should I take?"]) {
    const result = await responder(text);
    assert.equal(result.engine, "safety", text);
  }
  assert.equal((await responder("yes please", [{ sender: "user", text: "I want to die" }])).urgent, true);
});

test("input moderation catches an indirect risk before generation", async () => {
  let calls = 0;
  const responder = createLLMResponder({ env, fetchImpl: async () => { calls++; return ok(moderation({ "self-harm/intent": true }, true)); } });
  const result = await responder("I am arranging a final goodbye");
  assert.equal(calls, 1);
  assert.equal(result.urgent, true);
  assert.equal(result.engine, "safety");
  assert.equal(result.actions[0].path, "/emergency");
});

test("unsafe generated output is replaced and never sent to the frontend", async () => {
  let calls = 0;
  const responder = createLLMResponder({ env, fetchImpl: async () => {
    calls++;
    return ok(calls === 1 ? moderation() : calls === 2 ? generated("unsafe-output-sentinel") : moderation({ "self-harm/instructions": true }, true));
  } });
  const result = await responder("I feel upset after an argument");
  assert.equal(result.engine, "safety");
  assert.ok(!result.reply.includes("unsafe-output-sentinel"));
});

test("provider errors produce transparent local fallback without leaking error bodies", async () => {
  for (const [status, reason] of [[401, "authentication"], [403, "authentication"], [429, "quota_or_rate_limit"], [500, "provider_error"]]) {
    const responder = createLLMResponder({ env, fetchImpl: async () => ({ ok: false, status, json: async () => ({ error: { message: env.OPENAI_API_KEY } }) }) });
    const result = await responder("I feel stressed");
    assert.equal(result.engine, "local");
    assert.equal(result.fallbackReason, reason);
    assert.match(result.notice, /basic local support/);
    assert.ok(!JSON.stringify(result).includes(env.OPENAI_API_KEY));
  }
});

test("incomplete/missing/overlong model output cannot be mistaken for successful AI generation", async () => {
  for (const response of [{ status: "incomplete", output: [] }, generated(""), generated("x".repeat(1501))]) {
    assert.throws(() => outputText(response));
    const responder = createLLMResponder({ env, fetchImpl: async (url) => ok(url.endsWith("/moderations") ? moderation() : response) });
    assert.equal((await responder("I feel sad")).fallbackReason, "bad_response");
  }
});

test("timeout falls back; caller cancellation aborts instead of producing a late reply", async () => {
  const stalledFetch = (url, { signal }) => new Promise((resolve, reject) => signal.addEventListener("abort", () => reject(Object.assign(new Error("aborted"), { name: "AbortError" })), { once: true }));
  const responder = createLLMResponder({ env, fetchImpl: stalledFetch, timeoutMs: 15 });
  const result = await responder("I feel stressed");
  assert.equal(result.fallbackReason, "timeout");
  const controller = new AbortController();
  const pending = responder("I feel stressed", [], { signal: controller.signal });
  controller.abort();
  await assert.rejects(pending, { name: "AbortError" });
});

test("an authenticated API request awaits generation and rejects concurrent requests per account", async () => {
  let resolve;
  const app = express();
  app.use(express.json());
  app.use("/api/chat", createChatRouter((req, res, next) => { req.user = { _id: "isolated-user" }; next(); }, () => new Promise((done) => { resolve = done; }), () => metadata(env)));
  const server = app.listen(0, "127.0.0.1");
  await new Promise((done) => server.once("listening", done));
  const base = `http://127.0.0.1:${server.address().port}/api/chat`;
  const call = () => fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: "A difficult meeting happened today" }) });
  try {
    const pending = call();
    for (let i = 0; !resolve && i < 100; i++) await new Promise((done) => setTimeout(done, 5));
    assert.ok(resolve);
    assert.equal((await call()).status, 429);
    resolve({ reply: "A generated reply", engine: "llm", actions: [] });
    assert.equal((await (await pending).json()).reply, "A generated reply");
  } finally {
    server.closeAllConnections();
    await new Promise((done) => server.close(done));
  }
});

test("Groq uses only its own endpoint/key and bounded context even with an old OpenAI key", async () => {
  const settings = { ...env, LLM_PROVIDER: "groq", GROQ_API_KEY: "groq-test-only" };
  const calls = [];
  const responder = createLLMResponder({ env: settings, fetchImpl: async (url, options) => {
    calls.push({ url, options, body: JSON.parse(options.body) });
    return ok({ choices: [{ finish_reason: "stop", message: { content: "That sounds tiring. Could you choose one small task to start with?", reasoning: "hidden" } }] });
  } });
  const result = await responder("I feel stressed", Array.from({ length: 8 }, () => ({ sender: "user", text: "Earlier" })));
  assert.equal(result.engine, "llm");
  assert.equal(result.provider, "groq");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://api.groq.com/openai/v1/chat/completions");
  assert.equal(calls[0].options.headers.Authorization, "Bearer groq-test-only");
  assert.equal(calls[0].body.model, "openai/gpt-oss-20b");
  assert.equal(calls[0].body.messages.length, 8);
  assert.equal(calls[0].body.reasoning_effort, "low");
  assert.equal(calls[0].body.include_reasoning, false);
  assert.ok(!JSON.stringify(result).includes("hidden"));
  assert.equal(metadata(settings).generation.provider, "groq");
});

test("Groq missing key, rate limit, incomplete output and crisis never use paid fallback", async () => {
  let calls = 0;
  const settings = { ...env, LLM_PROVIDER: "groq" };
  const disabled = createLLMResponder({ env: settings, fetchImpl: () => { throw new Error("no network"); } });
  assert.equal((await disabled("I feel stressed")).engine, "local");
  for (const payload of [{ ok: false, status: 429 }, ok({ choices: [{ finish_reason: "length", message: { content: "partial" } }] }), ok({ choices: [] })]) {
    const responder = createLLMResponder({ env: { ...settings, GROQ_API_KEY: "groq-test-only" }, fetchImpl: async url => { calls++; assert.ok(url.startsWith("https://api.groq.com/")); return payload; } });
    assert.equal((await responder("I feel stressed")).engine, "local");
    assert.equal((await responder("I want to die")).engine, "safety");
  }
  assert.equal(calls, 3);
});
