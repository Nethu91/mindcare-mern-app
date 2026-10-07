const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, "../.env"), quiet: true });
const { config, respondWithAI } = require("../utils/chatbotLLM");

async function main() {
  const settings = config();
  if (!settings.enabled) {
    console.error("AI mode is not configured. Set LLM_PROVIDER=groq, your own GROQ_API_KEY and CHATBOT_MODE=llm to backend/.env, then retry. Never paste your key into chat or commit it.");
    process.exitCode = 1;
    return;
  }
  console.log(`Testing ${settings.provider} model ${settings.model} with one non-personal demo message. ${settings.provider === "groq" ? "Use the Free plan; free limits apply. No paid-provider fallback." : "API usage may incur charges."}`);
  const result = await respondWithAI("I have a busy week and feel overwhelmed. Can you suggest one gentle next step?");
  if (result.engine !== "llm") {
    const descriptions = { authentication: "The API key or project permissions were rejected.", quota_or_rate_limit: settings.provider === "groq" ? "Groq free usage limit reached. Wait and retry; basic local support remains available." : "Check your API billing/credits and rate limits.", timeout: "The API request timed out. Check your connection and retry.", network: "Cannot reach the API. Check your internet connection and Node.js version.", provider_error: "The API service returned an error.", bad_response: "The model or moderation response was incomplete or unsupported.", runtime: "Node.js 18 or newer is required." };
    console.error(descriptions[result.fallbackReason] || "Generated replies were unavailable. Basic support remains active.");
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: generated reply received from ${settings.provider}. No API key is printed.`);
  console.log(result.reply);
}
main().catch(() => { console.error("Could not complete the AI check. Verify the backend configuration."); process.exitCode = 1; });
