# Generated English replies with Groq Free plan

1. Create your own key at https://console.groq.com/keys. Stay on the Free plan; no paid upgrade is needed for this prototype.
2. Add the following only to backend/.env (preserve MongoDB/JWT settings):

```env
LLM_PROVIDER=groq
GROQ_API_KEY=your_actual_key
GROQ_MODEL=openai/gpt-oss-20b
CHATBOT_MODE=llm
```

3. In backend run `npm run check:llm`. Expect `PASS: generated reply received from groq`. Restart backend with `npm start`. Restart frontend and open its printed localhost URL, currently port 3001.

Groq mode never calls OpenAI, even if an old OPENAI_API_KEY remains. Limits and connectivity errors produce visibly labelled local support; there is no automatic paid fallback. The selected model is pretrained, not fine-tuned with the local intent dataset. No additional dependency is required.

Messages and up to six recent messages are sent to Groq. Avoid identifying details. Local crisis/medical checks run before generation. Groq mode uses those checks plus a system policy and a local output check, not OpenAI moderation. These checks are limited and not clinically validated. This student prototype is not a substitute for professional or emergency support.

Optional existing OpenAI mode remains: explicitly set LLM_PROVIDER=openai and OPENAI_API_KEY, OPENAI_MODEL=gpt-4.1-mini. That mode requires available API credits and moderates input/output. CHATBOT_MODE=local makes no provider calls.

Provider integration tests use mocked responses; a real Groq key is required for the live check. Keep all keys out of frontend files, Git, screenshots and chat.
