# AI Prompt Log — Sprint 16

Tool used: Claude (Anthropic), used for troubleshooting specific technical
questions while building Sprint 16, per the submission requirement to log
AI usage.

---

## Phase 1 — Viewport Responsiveness

**Question:** "My sidebar footer uses `display: none` at mobile widths and
that's hiding my Sign Out button completely on phones — what's the
standard pattern for a hamburger menu toggle in React so it doesn't just
disappear?"

**Question:** "What CSS approach animates a nav drawer open/closed smoothly
— max-height transition or something else?"

---

## Phase 2 — The AI Injection

**Question:** "If I call the Gemini API directly from my React app, is the
API key visible in the browser bundle?"

**Question:** "How do I stop an LLM from wrapping its JSON response in
markdown code fences?"

**Question:** "What's the correct way to set up a Vercel serverless
function under `/api` so it doesn't need a `vercel.json` for a Vite
project?"

---

## Phase 3 — Micro-interactions & Fallback States

**Question:** "What's a lightweight toast library that works well with
React and doesn't need much setup?"

**Question:** "What's a simple CSS-only way to build a shimmering skeleton
loader without a separate animation library?"

---

## Troubleshooting log

**Question:** "My Gemini API key starts with `AQ.Ab...` instead of
`AIzaSy...` — is this a valid key, or did I copy it wrong?"

**Question:** "My server function says `GEMINI_API_KEY is not set` even
though it's in my `.env.local` — what could cause that?"

**Question:** "`vercel env pull` isn't pulling down my `GEMINI_API_KEY` — I
get 'Kept ... defined locally, not found in the development Environment.'
What does that mean?"

**Question:** "Vercel says a Sensitive variable can't be converted back to
non-sensitive after saving — what's the actual fix if I need it in
Development too?"

**Question:** "I'm getting a 429 error with `limit: 0` from the Gemini API
even though my key is valid and quota should be fine — what does that
specific error mean?"

**Question:** "Now I'm getting a 404 saying the model is 'no longer
available to new users' — what's the current model name I should be
using?"

---

## Notes on scope discipline

No new routes, no new Firestore collections, and no new macro-features were
introduced this sprint. The only new server-side surface is the single
`/api/subtasks` function, a thin proxy to the Gemini API.
