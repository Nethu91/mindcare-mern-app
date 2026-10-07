# MindCare MERN app

## Run locally

Requires Node.js and MongoDB. In `backend`, create `.env` with `MONGO_URI`, a strong `JWT_SECRET`, `EMAIL_USER` and `EMAIL_PASS` (SMTP credentials for account verification); optionally set `PORT=5000`. Do not commit secrets.

```sh
cd backend
npm ci
npm start
```

In another terminal:

```sh
cd frontend
npm ci
npm start
```

For a hosted API, set `REACT_APP_API_URL=https://your-api-host/api` in the frontend environment before building. HTTPS is required for browser location on a deployed site.

## New pages

Dashboard links open `/journal`, `/notifications`, and `/meditation-centers`; all require login. Journal records, read state and preferences persist in MongoDB and are scoped to the authenticated account. Journal supports create, list and delete. Notifications include daily check-ins, affirmations and the user's upcoming pending/accepted appointments. No fabricated goal achievements or progress events are generated. Preferences affect the inbox. Quiet-hours preferences are saved, but background email/push scheduling is not implemented; the inbox remains accessible during quiet hours.

Meditation centers come from MongoDB, not the prototype's fictional names, ratings, telephone numbers or distances. An empty database displays an empty state. An operator should verify information before importing a JSON array:

```sh
cd backend
node scripts/importCenters.js /path/to/verified-centers.json
```

Each record requires `name` and `address`; optional fields: `phone`, `description`, `classes` (string array), `latitude`, `longitude`, `rating`, `reviewCount`, `timeZone` (defaults to `Asia/Colombo`), and `hours` (array of `{day: 0..6, start: "HH:mm", end: "HH:mm"}`, Sunday = 0). Split overnight hours across two days. Open Now uses each center's timezone and recorded hours. Nearby uses browser location and coordinates to calculate straight-line distance; listings without coordinates appear last. Directions opens Maps; Call opens the phone handler.

These changes do not deploy the app or certify all existing features as production-ready. Live verification requires a configured database and SMTP account.

Dashboard now includes matching feature cards for Breathing Practice (the existing meditation sessions), Journal and Meditation Centers. A shared bell opens the notification inbox from every signed-in page and refreshes unread counts every minute and after marking items read. Center directory records appear in the inbox and open their expanded details.

## Trained English support chatbot

The chatbot now calls `POST /api/chat` through the existing authenticated Axios client. A trained local **multinomial Naive Bayes intent model** replaces the old frontend keyword lookup. It selects authored support replies, supports brief follow-ups and in-app feature links, and asks for clarification when the classification is uncertain. Crisis and medical-boundary safeguards run separately. This is a supervised intent model with template responses, **not an LLM fine-tune**.

The trained model is committed, so normal `npm start` loads it without a GPU, API key, or extra service. After editing the dataset, retrain before starting:

```sh
cd backend
npm run train:chatbot
npm test
```

The dataset contains 120 synthetic English messages: 96 training, 12 validation, and 12 test. Dataset, learned weights, split files, evaluation metrics, limitations and a viva explanation are documented in [the model card](backend/models/chatbot/MODEL_CARD.md). These small synthetic metrics do not demonstrate clinical safety; the examples are not clinically reviewed.

In the UI, send an English message or tap a suggestion. Failed requests offer retry without duplicating the message; expired authentication offers sign-in. New chat clears the in-page conversation and cancels any pending request. Chat messages are not persisted by this feature. Emergency support remains accessible during connection errors.

Frontend checks:

```sh
cd frontend
npm test -- --watchAll=false --runInBand
npm run build
```

For a local demo, start the configured backend on port 5000 and the frontend on port 3000, sign in with your existing account, then open `/chatbot`. Try “I feel stressed”, “I cannot sleep”, “How do I book a counselor appointment”, and a brief follow-up such as “yes please”. This change does not deploy the app; MongoDB/account verification and other existing flows still require their configured services.

## Generated replies with OpenAI

Optional OpenAI Responses API generation is now supported. Follow backend/CHATBOT_LLM_SETUP.md to add your own key only in backend/.env, check live generation, and restart the backend. The local trained model remains available for explicitly labeled fallback. This integration is not LLM fine-tuning.

## Generated replies with Groq

Groq Free plan generation is now supported. Explicit Groq mode never calls OpenAI. Follow backend/CHATBOT_LLM_SETUP.md to add your own key only in backend/.env, check live generation, and restart the backend. The local trained model remains available for explicitly labeled fallback. This integration is not LLM fine-tuning.
