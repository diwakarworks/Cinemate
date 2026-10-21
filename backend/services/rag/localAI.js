const BASE_URL = "https://openrouter.ai/api/v1";

async function postJSON(path, body) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is missing.");
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120000),
  });

  if (!response.ok) {
    throw new Error(
      `OpenRouter error (${response.status}): ${await response.text()}`
    );
  }

  return response.json();
}

async function embedText(text) {
  const data = await postJSON("/embeddings", {
    model:
      process.env.OPENROUTER_EMBED_MODEL ||
      "openai/text-embedding-3-small",
    input: text,
  });

  const vector = data.data?.[0]?.embedding;

  if (
    !Array.isArray(vector) ||
    vector.length !== 1536 ||
    !vector.every(Number.isFinite)
  ) {
    throw new Error(
      `Expected a valid 1536-dimensional embedding; received ${
        vector?.length ?? 0
      } dimensions.`
    );
  }

  return vector;
}

async function chatCompletion(messages) {
  const data = await postJSON("/chat/completions", {
    model: process.env.OPENROUTER_CHAT_MODEL || "qwen/qwen3.7-plus",
    messages,
    temperature: 0.2,
    max_tokens: 1000,
    reasoning: {
      effort: "none",
    },
    stream: false,
  });

  const choice = data.choices?.[0];


  const answer = choice?.message?.content;

  if (typeof answer !== "string" || !answer.trim()) {
    console.error("OpenRouter returned no answer:", {
      model: data.model,
      finish_reason: choice?.finish_reason,
      message: choice?.message,
      usage: data.usage,
    });

    throw new Error(
      "OpenRouter returned no usable answer. Check the logged response."
    );
  }

  return answer;
}

module.exports = { embedText, chatCompletion };