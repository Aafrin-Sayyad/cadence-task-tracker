# AI Prompt Log — Sprint 16

Tool used: Claude (Anthropic). Log kept per Sprint 16 submission requirements.

## Phase 1 — Viewport Responsiveness

**Prompt:** "Audit `Layout.jsx` and `index.css` for mobile viewport bugs. On
screens under 880px the sidebar becomes a horizontal row and
`.sidebar-footer` is set to `display: none` — which removes the only Sign Out
button on mobile. Build a proper hamburger menu: a toggle button that opens
a collapsible drawer containing the nav links and the sign-out/footer
content, using React state instead of just hiding things with CSS media
queries."

**Outcome:** Rewrote `Layout.jsx` with a `menuOpen` state, an animated
hamburger icon (three bars → X), and `max-height` transition-based
open/close for `.nav-links` and `.sidebar-footer` under the 880px breakpoint.
Nav links close the menu on click via an `onClick` handler passed to each
`NavLink`.

**Prompt:** "The task table already wraps `<table>` in a `.table-wrap` div
with `overflow-x: auto` (good). Double check the stat-card grid, chart grid,
and form grid also collapse correctly at the iPhone 14 Pro width (393px),
and tighten row-action button wrapping so Edit/Delete/AI-Steps don't overflow
the cell."

**Outcome:** Added a secondary `480px` breakpoint, `flex-wrap` on
`.row-actions`, and reduced `.stat-row` to two columns on the smallest
screens.

## Phase 2 — The AI Injection

**Prompt:** "Design one scoped AI feature for a task tracker, matching the
Sprint 16 FAQ #1 example 'Auto-generate Task Sub-steps.' It must call the
Gemini API from a server-side function only (Vercel serverless function
under `/api`), never from the React bundle directly, per FAQ #3. Give me a
strict-JSON system prompt so the response is always parsable, per FAQ #2."

**Outcome:** Created `api/subtasks.js`: validates `title`/`category`,
rejects malformed payloads with `400`, calls
`gemini-2.0-flash:generateContent` with an explicit
'respond ONLY with valid JSON, no markdown fences' instruction, strips any
accidental ``` fences defensively, validates the parsed shape
(`{"subtasks": [...]}`, all strings) before returning `200`, and returns
`502`/`500` on any upstream or parsing failure instead of crashing.

**Prompt:** "Build the client side: a button per task row labeled '✨ Steps'
that opens a modal, calls `/api/subtasks` on mount, shows a loading spinner,
lists the returned sub-steps, and lets the user save them onto the task via
the existing `updateTask()` function as a new `subtasks` array field (no new
Firestore collection)."

**Outcome:** `AiSubtasksModal.jsx` + a "✨ Steps" button in `TaskTable.jsx`;
saved subtasks render as a small bulleted preview under the task title.

## Phase 3 — Micro-interactions & Fallback States

**Prompt:** "This app already uses inline `error-text` elements instead of
`alert()`, so there's nothing to rip out there — but add a proper toast
library anyway for positive feedback (task added/updated/deleted, sub-steps
saved) and for AI/network failures, using `sonner` themed to match the
existing dark ink/amber palette."

**Outcome:** Added `sonner`, mounted a single `<Toaster theme="dark" ... />`
in `App.jsx`, and added `toast.success` / `toast.error` calls in
`Dashboard.jsx`, `EditModal.jsx`, and `DeleteConfirm.jsx`.

**Prompt:** "Replace the plain 'Loading tasks…' text in `Dashboard.jsx` with
a proper skeleton loader shaped like the real table (same columns), using a
CSS shimmer animation, not a spinner or blank panel."

**Outcome:** Added `TableSkeleton.jsx` + `.skeleton-block` /
`@keyframes skeleton-shimmer` in `index.css`.

**Prompt:** "The existing empty state in `TaskTable.jsx` ('No tasks yet') is
functional but plain. Give it a small branded icon and a CTA that jumps back
to the add-task form, without introducing a new component library."

**Outcome:** Added a circular icon badge, tightened copy, and a
`<a href="#add-task-panel">` CTA button; gave the "Add a task" panel that id.

## Notes on scope discipline

No new routes, no new Firestore collections, and no new macro-features were
introduced. The only new server-side surface is the single `/api/subtasks`
function, which is a thin, single-purpose proxy to the Gemini API — not a
new backend architecture.
