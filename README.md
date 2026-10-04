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
