# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/cf7edb92-d630-4940-8d4d-110292629d79

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/cf7edb92-d630-4940-8d4d-110292629d79) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/cf7edb92-d630-4940-8d4d-110292629d79) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

---

# Monorepo: Frontend + Backend (Development Guide)

This project now includes a backend (Node.js + Express + TypeScript + MongoDB) and the existing frontend (Vite + React + TS).

## Run Backend

1. Create an `.env` in `backend/` from `.env.example` and set a valid `MONGODB_URI`.
   - Populate `DB_NAME` if you use a different database name.
   - Add a strong `JWT_SECRET` for signing admin sessions.
2. Install and start:

```sh
cd backend
npm install
npm run dev
```

Server defaults to `http://localhost:5000` and exposes `GET /health` and `/api/menu` routes.

### Admin authentication API

- `POST /api/admin/login` expects `{ "email": string, "password": string }` and returns `{ token, admin }`.
- The JWT includes the admin id (`adminId`) and role. Tokens expire after 1 hour.

### Seed an initial admin user

The repo ships with a helper script that will create (or update) the default admin:

```powershell
npx ts-node backend/scripts/seedAdmin.ts
```

Environment variables required by the script/server:

```
MONGODB_URI=mongodb://127.0.0.1:27017
MONGO_URI=mongodb://127.0.0.1:27017/digital-menu-charm # optional alias
DB_NAME=digital-menu-charm
JWT_SECRET=replace_with_strong_secret
```

The script seeds `superadmin / admin@grandvista.com` with password `Admin@123`. Run it again any time to update the password. Afterwards you can validate via `mongosh`:

```javascript
use digital-menu-charm;
db.admins.find({ email: "admin@grandvista.com" }).pretty();
```

## Run Frontend

From repo root, run inside the `frontend/` folder:

```sh
cd frontend
npm install
npm run dev
```

Optionally create an `.env` variable for API base URL:

```
VITE_API_URL=http://localhost:5000/api
```

If not set, the app defaults to `http://localhost:5000/api` for API calls.
