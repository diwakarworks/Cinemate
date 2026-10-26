const BASE_URL = "https://openrouter.ai/api/v1";

async function normalChatCompletion(messages) {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_CHAT_MODEL || "openrouter/free",
      messages: [
        {
          role: "system",
          content: `
You are Cinemate, a friendly and knowledgeable movie companion.

Respond naturally and conversationally.
Keep answers concise unless the user requests details.
Personalize recommendations using the conversation history.

Always return valid JSON in this exact structure:
{
  "answer": "A short conversational response",
  "movies": ["Movie title 1", "Movie title 2"]
}

Rules:
- Return only a JSON object, without Markdown code fences.
- "answer" must always be a string.
- "movies" must always be an array of strings.
- Include movie titles in "movies" when recommending films.
- For general questions, return an empty movies array.
- Do not include additional keys.
`,
        },
        ...messages,
      ],
      temperature: 0.8,
      max_tokens: 500,
      reasoning: { enabled: false },
      response_format: { type: "json_object" },
      stream: false,
    }),
    signal: AbortSignal.timeout(120000),
  });

  if (!response.ok) {
    throw new Error(
      `OpenRouter error (${response.status}): ${await response.text()}`,
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Normal chat returned an empty response.");
  }

  let result;

  try {
    result = JSON.parse(content);
  } catch {
    throw new Error("Normal chat returned invalid JSON.");
  }

  if (
    typeof result.answer !== "string" ||
    !Array.isArray(result.movies) ||
    !result.movies.every((movie) => typeof movie === "string")
  ) {
    throw new Error("Normal chat returned an invalid response structure.");
  }

  return result;
}

module.exports = { normalChatCompletion };
