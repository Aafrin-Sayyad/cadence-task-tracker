# Cadence — Task Tracker

A full CRUD dashboard built on React + a Backend-as-a-Service (Firebase), with an
analytics view powered by Recharts. Sprint 15 made it feature-complete; Sprint 16
("The AI Injection & Polish") took it from student project to a mobile-ready,
AI-assisted, SaaS-feeling app: a real hamburger menu on mobile, an AI
"generate sub-steps" feature backed by a serverless proxy, toast notifications,
skeleton loaders, and a branded empty state.

## live Link: https://cadence-task-tracker.vercel.app/

## Sprint 16 — The AI Injection & Polish

**Phase 1 — Viewport Responsiveness**
- `Layout.jsx` now has a real hamburger menu on mobile (< 880px): an animated
  icon toggles a collapsible drawer holding the nav links *and* the
  sign-out/mode-label footer, which previously just vanished (`display: none`)
  on small screens with no way to sign out.
- Tightened the stat-card grid, chart grid, and row actions for the
  iPhone-14-Pro-class 390–430px width range.
- Tables were already wrapped in `.table-wrap { overflow-x: auto }`, isolating
  horizontal scroll to the table itself.

**Phase 2 — The AI Injection**
- One scoped feature: **"✨ Steps"** on any task row calls `/api/subtasks`, a
  Vercel serverless function (`api/subtasks.js`) that prompts Gemini
  (`gemini-2.0-flash`) with a strict "respond ONLY with JSON" instruction and
  returns 3–5 actionable sub-steps for that task.
- The Gemini API key lives only in the server environment (`GEMINI_API_KEY`,
  set in Vercel's dashboard) — it is never bundled into the React app, so it
  can't be scraped from the client (Sprint 16 FAQ #3).
- The endpoint validates its input (empty/oversized `title` → `400`) and the
  AI's output (must parse as `{"subtasks": [...]}`) before ever touching the
  UI, and fails gracefully (`400`/`500`/`502` with a clean JSON error body)
  instead of crashing on a malformed payload or a malformed AI response.
- Accepted sub-steps save onto the task document as a new `subtasks` array
  field via the existing `updateTask()` call — no new collection.

**Phase 3 — Micro-interactions & Fallback States**
- **Toasts:** [`sonner`](https://sonner.emilkowal.ski/) is mounted once in
  `App.jsx` and used for task created/updated/deleted, sub-steps saved, and
  any AI/network failure — no blocking `alert()` calls anywhere in the app.
- **Skeleton loading:** `TableSkeleton.jsx` renders shimmering placeholder
  rows shaped like the real table while tasks are hydrating, replacing the
  old plain "Loading tasks…" text.
- **Empty state:** the "No tasks yet" state now has an icon badge and a CTA
  button that jumps back to the add-task form.

See `Prompts.md` for the AI development log.

## What's implemented

**Phase 1 — Create & Read**
- Data Hydration: on login, the dashboard subscribes to Firestore for documents
  where `uid == currentUser.uid` and renders them in a live-updating table.
- Payload Injection: the "Add a task" form writes a new document to Firestore
  stamped with the owner's `uid`; the table re-renders instantly via the
  Firestore realtime listener (no manual refetch).

**Phase 2 — Update & Delete**
- Edit: opens a modal pre-populated with the task's current state and issues
  a Firestore `updateDoc` (PATCH-style partial update) on save.
- Delete: requires confirmation in a modal before calling `deleteDoc`. The
  realtime listener removes it from the UI automatically.

**Phase 3 — Analytics**
- `src/utils/aggregations.js` has pure `reduce`/`map` functions that turn raw
  task documents into: tasks completed per day (14-day trend), tasks by
  category, tasks by status, and summary stats (completion rate, overdue count).
- `src/pages/Analytics.jsx` renders those aggregates with Recharts (line, bar,
  and donut charts).
- A small signature widget, the "cadence bar" on the dashboard, visualizes the
  same 14-day completion rhythm the app is named after.

## Demo mode vs. real Firebase

This project runs two ways, controlled entirely by whether `.env` has real
Firebase keys:

- **No `.env` / empty keys → demo mode.** `src/services/localBackend.js`
  simulates auth and Firestore using `localStorage`, so `npm install && npm run dev`
  works immediately with no setup, for local development and demoing the UI.
- **`.env` filled in → Firebase mode.** `src/services/firestoreBackend.js` is
  the real implementation: Firebase Auth for email/password sign-in, and
  Firestore for CRUD, with a `where("uid", "==", ...)` filter on every read
  and `orderBy("createdAt", "desc")`.

Both implementations satisfy the exact same interface (see
`src/services/backend.js`), so the rest of the app — components, pages,
context — never needs to know which one is active. A "Demo mode" /
"Firebase mode" label shows in the sidebar so it's always clear which one
you're looking at.

### Setting up your own Firebase project

1. Create a project at https://console.firebase.google.com.
2. Enable **Authentication → Sign-in method → Email/Password**.
3. Create a **Firestore Database** (start in production mode).
4. Project settings → General → "Your apps" → add a Web app → copy the config.
5. Copy `.env.example` to `.env` and paste in the values:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```
6. Deploy the included security rules so users can only read/write their own
   documents (answers FAQ #4, "Missing or insufficient permissions"):
   ```
   npm install -g firebase-tools
   firebase login
   firebase init firestore   # point it at firestore.rules when asked
   firebase deploy --only firestore:rules
   ```
   Or just paste the contents of `firestore.rules` into the Firebase console's
   Firestore → Rules tab and click Publish.
7. Restart `npm run dev`. The sidebar should now say "Firebase mode".

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL, click "Create an account", and start adding
tasks — in demo mode this works immediately with no keys.

## Project structure

```
api/
  subtasks.js                # Vercel serverless function: Gemini proxy for AI sub-steps
src/
  firebase.js                # Firebase init + isFirebaseConfigured flag
  services/
    backend.js                # picks firestoreBackend or localBackend
    firestoreBackend.js        # real Firebase Auth + Firestore CRUD
    localBackend.js            # localStorage-backed demo implementation
  context/AuthContext.jsx      # exposes user/login/signup/logout
  utils/aggregations.js        # reduce/map data-analytics functions
  components/
    Layout.jsx                 # sidebar + mobile hamburger menu
    ProtectedRoute.jsx, CadenceBar.jsx,
    TaskForm.jsx, TaskTable.jsx, EditModal.jsx, DeleteConfirm.jsx,
    TableSkeleton.jsx          # skeleton loader for the tasks table
    AiSubtasksModal.jsx        # calls /api/subtasks, shows + saves sub-steps
  pages/
    Login.jsx, Signup.jsx, Dashboard.jsx, Analytics.jsx
firestore.rules               # per-user data ownership security rules
Prompts.md                    # AI development log (Sprint 16)
```

```bash
npm run build     # outputs to dist/
```

## Testing the AI endpoint locally

Vite's dev server (`npm run dev`) does **not** run the `/api` serverless
function — that only runs on Vercel's infrastructure (or via the Vercel CLI).
To exercise `/api/subtasks` locally:

```bash
npm install -g vercel
vercel dev
```

`vercel dev` reads `GEMINI_API_KEY` from `.env.local` in the project root
(create it if it doesn't exist — it's gitignored) or from `vercel env pull`.
Otherwise, just deploy (see below) and test against the live URL.

## Deploying

### 1. Push to GitHub

```bash
git init                     # skip if the repo is already a git repo
git add .
git commit -m "Sprint 16: AI injection + mobile/UX polish"
git branch -M main
git remote add origin https://github.com/<your-username>/cadence-task-tracker.git
git push -u origin main
```

(If you cloned this from an existing repo, just `git add . && git commit && git push`.)

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New… → Project** → import
   your GitHub repo.
2. Framework preset: Vercel auto-detects **Vite** — build command
   `npm run build` / output directory `dist` need no changes.
3. Before the first deploy (or any time after, then redeploy), go to
   **Project Settings → Environment Variables** and add:
   | Key | Value |
   |---|---|
   | `GEMINI_API_KEY` | your key from [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |
   | `VITE_FIREBASE_API_KEY` | *(optional — only if running in Firebase mode)* |
   | `VITE_FIREBASE_AUTH_DOMAIN` | *(same)* |
   | `VITE_FIREBASE_PROJECT_ID` | *(same)* |
   | `VITE_FIREBASE_STORAGE_BUCKET` | *(same)* |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | *(same)* |
   | `VITE_FIREBASE_APP_ID` | *(same)* |
   Do **not** prefix `GEMINI_API_KEY` with `VITE_` — that would bundle it
   into client-side JS and expose it.
4. Click **Deploy**. Vercel builds the Vite app *and* picks up `api/subtasks.js`
   as a serverless function automatically — no `vercel.json` needed.
5. If you add/change env vars after the first deploy, redeploy from the
   **Deployments** tab (or push a new commit) for them to take effect.

### 3. Verify

- Open the Live URL, sign up/sign in, add a task, click **✨ Steps** on it —
  you should see a loading state, then 3–5 generated sub-steps.
- In Chrome DevTools, toggle the device toolbar to **iPhone 14 Pro** and
  confirm the hamburger menu opens/closes and Sign Out is reachable.
- In Postman, `POST` to `https://<your-app>.vercel.app/api/subtasks` with an
  empty body (`{}`) — you should get a clean `400` with a JSON error message,
  not a crash.
