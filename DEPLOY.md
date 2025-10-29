## Render (Backend)

1. Connect GitHub repo to Render and create a new Web Service.

   - Root Directory: `backend`
   - Branch: `main`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Health Check Path: `/health`

2. Environment variables (add as secrets):

   - `PORT` = 5001 (optional — Render provides an internal port via `PORT`; server will use that if present)
   - `MONGODB_URI` (or `MONGO_URI`) = your MongoDB Atlas connection string
   - `DB_NAME` = `digital-menu-charm`
   - `JWT_SECRET` = <strong-random-secret>
   - Any mail/Twilio credentials used by your app (e.g., `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `TWILIO_SID`, `TWILIO_TOKEN`)

3. Deploy and verify:
   - Visit the Render service URL (e.g. `https://<your-service>.onrender.com`).
   - Verify health:
     ```bash
     curl https://<your-service>.onrender.com/health
     ```
   - Verify API endpoints:
     ```bash
     curl https://<your-service>.onrender.com/api/menu
     curl https://<your-service>.onrender.com/api/menu/categories
     ```

## Vercel (Frontend)

1. Create a new project in Vercel and import from GitHub.

   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

2. Environment variables (Preview + Production):

   - `VITE_API_URL` = `https://<your-render-service>.onrender.com/api` # include `/api`

3. Deploy and verify:
   - Visit the Vercel URL and open the network panel to ensure requests go to the Render URL.

## Notes & Security

- Do NOT commit `.env` with secrets. Use Render and Vercel environment variable UI to store secrets.
- If `.env` was committed, rotate the secrets immediately (rotate DB user password and JWT secret).
- The backend now prefers `process.env.PORT` (Render will set it automatically). If you want the server to run on a fixed port locally, put `PORT=5001` in `backend/.env` (but keep that file out of git).

## Troubleshooting

- If you see "API endpoint not found" in the frontend, verify `VITE_API_URL` has the `/api` suffix and the Render service is healthy.
- If the Render build fails, open the build logs and look for `tsc`/`npm install` errors; copy and paste logs if you want me to triage them.
