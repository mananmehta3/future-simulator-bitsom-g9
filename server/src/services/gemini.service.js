import { AppError } from "../utils/AppError.js";

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
const MAX_ATTEMPTS = 2; // one retry — Gemini occasionally truncates or slips on JSON syntax for large outputs

function extractJSON(rawText) {
  // Strip markdown code fences in case the model wraps JSON in ```json ... ```
  // despite responseMimeType, then try the whole string before falling back
  // to the outermost {...} span.
  const text = rawText.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) throw new Error("no JSON object found");
    return JSON.parse(text.slice(start, end + 1));
  }
}

async function callGemini({ system, user, apiKey, model }) {
  const response = await fetch(
    `${GEMINI_BASE_URL}/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: {
          responseMimeType: "application/json",
          // Generous ceiling — this task's output (4 futures + AI board + decision
          // tree) can run 4-6K tokens of visible JSON plus Gemini's own hidden
          // "thinking" tokens, both of which count against this cap.
          maxOutputTokens: 16384,
        },
      }),
    }
  );

  const body = await response.json();

  if (!response.ok) {
    // Client/auth/quota errors won't fix themselves on retry.
    throw new AppError(
      `Gemini API error: ${body?.error?.message || response.statusText}`,
      502,
      body?.error
    );
  }

  if (body.promptFeedback?.blockReason) {
    // Safety-classifier block — retrying the identical prompt won't help.
    throw new AppError(
      `Gemini declined to generate this simulation (${body.promptFeedback.blockReason}).`,
      502,
      body.promptFeedback
    );
  }

  const candidate = body.candidates?.[0];
  const finishReason = candidate?.finishReason;

  if (!candidate) {
    throw new AppError("Gemini returned no candidate response.", 502, body);
  }
  if (finishReason && finishReason !== "STOP") {
    // MAX_TOKENS, RECITATION, etc. — often transient/output-length related, worth a retry.
    const err = new AppError(
      `Gemini did not return a complete response (${finishReason}).`,
      502,
      candidate
    );
    err.retryable = true;
    throw err;
  }

  const text = (candidate.content?.parts || []).map((part) => part.text || "").join("");
  if (!text) {
    const err = new AppError("The AI service returned an empty response.", 502);
    err.retryable = true;
    throw err;
  }

  try {
    return extractJSON(text);
  } catch {
    const err = new AppError("The AI service returned malformed JSON.", 502, {
      raw: text.slice(0, 2000),
    });
    err.retryable = true;
    throw err;
  }
}

/**
 * Sends a system + user prompt pair to the Gemini API and returns the parsed
 * JSON body. Modular on purpose: this is the only file that talks to Gemini —
 * swapping providers means touching one file. Uses plain fetch (no SDK
 * dependency) since the REST surface is small and well-defined. Retries once
 * on truncation/malformed-JSON, which is an occasional, non-deterministic
 * failure mode for large structured outputs rather than a persistent bug.
 */
export async function generateStructuredJSON({ system, user }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AppError(
      "GEMINI_API_KEY is not configured on the server. Add it to server/.env",
      500
    );
  }
  const model = process.env.GEMINI_MODEL || "gemini-flash-latest";

  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await callGemini({ system, user, apiKey, model });
    } catch (err) {
      lastError = err;
      if (!err.retryable || attempt === MAX_ATTEMPTS) throw err;
      console.warn(`[gemini] attempt ${attempt} failed (${err.message}), retrying...`);
    }
  }
  throw lastError;
}
