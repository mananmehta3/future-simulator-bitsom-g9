import Anthropic from "@anthropic-ai/sdk";
import { AppError } from "../utils/AppError.js";

let client = null;

// Lazily construct the client so the server can boot (and serve /health) even
// if ANTHROPIC_API_KEY hasn't been configured yet — the error only surfaces when
// a simulation is actually requested.
function getClient() {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new AppError(
        "ANTHROPIC_API_KEY is not configured on the server. Add it to server/.env",
        500
      );
    }
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

function extractJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    // The model may wrap JSON in prose or markdown fences despite instructions —
    // fall back to the outermost {...} span before giving up.
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) throw new Error("no JSON object found");
    return JSON.parse(text.slice(start, end + 1));
  }
}

/**
 * Sends a system + user prompt pair to Claude and returns the parsed JSON body.
 * Modular on purpose: this is the only file that talks to the Anthropic SDK, so the
 * underlying provider/model can be swapped without touching the rest of the app.
 */
export async function generateStructuredJSON({ system, user }) {
  const anthropic = getClient();
  const model = process.env.ANTHROPIC_MODEL || "claude-opus-5";

  const response = await anthropic.beta.messages.create({
    model,
    max_tokens: 8000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default", // auto-retries on a fallback model if Claude Opus 5 declines
    system,
    messages: [{ role: "user", content: user }],
  });

  if (response.stop_reason === "refusal") {
    throw new AppError(
      "Claude declined to generate this simulation.",
      502,
      response.stop_details
    );
  }

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");

  if (!text) {
    throw new AppError("The AI service returned an empty response.", 502);
  }

  try {
    return extractJSON(text);
  } catch {
    throw new AppError("The AI service returned malformed JSON.", 502, { raw: text });
  }
}
