const GEMINI_MODEL = 'gemini-3.5-flash-lite';
const MAX_TITLE_LENGTH = 200;

export default async function handler(req, res) {
  // ---- Method guard ----
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // ---- Payload validation (this is what the Postman "malformed payload"
  // demo is exercising: missing/empty/oversized title all get a clean 400,
  // never a 500 or an unhandled crash). ----
  const body = req.body || {};
  const { title, category } = body;

  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'A non-empty "title" string is required.' });
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return res.status(400).json({ error: `"title" must be ${MAX_TITLE_LENGTH} characters or fewer.` });
  }
  if (category !== undefined && typeof category !== 'string') {
    return res.status(400).json({ error: '"category" must be a string if provided.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set in the server environment.');
    return res.status(500).json({ error: 'AI is not configured on the server yet.' });
  }

  // ---- Strict-JSON prompt (Sprint 16 FAQ #2) ----
  const prompt = `You are an API. A student has a task titled "${title.trim()}"${
    category ? ` in the category "${category}"` : ''
  }. Break it into 3 to 5 short, concrete, actionable sub-steps a student could check off one by one.
You must respond ONLY with a valid, parsable JSON object matching this exact schema:
{"subtasks": ["string", "string", "string"]}
Do not include markdown wrappers, backticks, explanations, or any other text before or after the JSON.`;

  try {
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 400 },
        }),
      }
    );

    if (!upstream.ok) {
      const errText = await upstream.text();
      console.error('Gemini upstream error', upstream.status, errText);
      return res.status(502).json({ error: 'The AI provider request failed. Try again in a moment.' });
    }

    const data = await upstream.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error('Gemini returned non-JSON payload:', raw.slice(0, 300));
      return res.status(502).json({ error: 'The AI returned a malformed response. Please try again.' });
    }

    if (!parsed || !Array.isArray(parsed.subtasks)) {
      return res.status(502).json({ error: 'The AI response did not match the expected schema.' });
    }

    const subtasks = parsed.subtasks
      .filter((s) => typeof s === 'string' && s.trim().length > 0)
      .slice(0, 6)
      .map((s) => s.trim());

    if (subtasks.length === 0) {
      return res.status(502).json({ error: 'The AI did not return any usable sub-steps.' });
    }

    return res.status(200).json({ subtasks });
  } catch (err) {
    console.error('Unexpected /api/subtasks error:', err);
    return res.status(500).json({ error: 'Unexpected server error. Please try again.' });
  }
}