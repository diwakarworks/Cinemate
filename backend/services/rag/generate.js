const { chatCompletion } = require("./localAI");

async function generateRagAnswer(question, diaryEntries = []) {
  if (!diaryEntries.length) {
    return {
      recommendations: [],
      citations: [],
    };
  }

  const context = diaryEntries.map((entry) => ({
    id: String(entry._id),
    title: entry.title,
    year: entry.year,
    mediaType: entry.mediaType,
    rating: entry.rating ?? null,
    review: entry.review || "",
    watchedDate: entry.watchedDate
      ? new Date(entry.watchedDate).toISOString().slice(0, 10)
      : null,
  }));

  const response = await chatCompletion([
    {
      role: "system",

      content: `You are Cinemate AI, a personalized movie and TV series recommendation assistant.

Return exactly 5 distinct recommendations unless the user requests a different number.

Rules:
- Follow every constraint in the user's question, including country, genre, language, release period, and media type.
- For Korean crime films, recommend only films produced in South Korea that belong to the crime genre.
- For TV series requests, recommend TV series only.
- For movie requests, recommend movies only.
- If no media type is specified, movies and TV series are both allowed.
- Never recommend titles already present in the supplied diary entries.
- Use ratings and reviews to infer the user's taste.
- Do not recommend a title unless you have reasonable confidence it matches the requested constraints.
- If you cannot confidently provide 5 relevant titles, return only the titles you can support.
- Write a short, natural explanation of why the recommendations fit the user's request and diary.
- Never claim the user watched a recommended title.
- Cite only supplied diary entry IDs that support your taste inference.
- Never invent diary entry IDs.

Return ONLY valid JSON:
{
  "answer": "A short explanation of the recommendations.",
  "recommendations": [
    "Movie One",
    "Movie Two",
    "Movie Three",
    "Movie Four",
    "Movie Five"
  ],
  "citations": ["DIARY_ENTRY_ID"]
}

The answer field must be a non-empty string.
The recommendations field must be an array of title strings.
The citations field must contain only supplied diary entry IDs.`,
    },
    {
      role: "user",
      content: JSON.stringify({
        question,
        diaryEntries: context,
      }),
    },
  ]);

  let parsed;

  try {
    const cleaned = response
      .replace(/^\s*```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();

    parsed = JSON.parse(cleaned);
  } catch (error) {
    console.error("Invalid LLM JSON output:", response);
    throw new Error("LLM returned invalid JSON. Check the backend logs.");
  }

  if (
    !Array.isArray(parsed.recommendations) ||
    !parsed.recommendations.every(
      (title) => typeof title === "string" && title.trim(),
    ) ||
    !Array.isArray(parsed.citations)
  ) {
    throw new Error("LLM returned an invalid response structure.");
  }

  const validIds = new Set(context.map((entry) => entry.id));

  const citations = [
    ...new Set(
      parsed.citations
        .filter((id) => typeof id === "string")
        .filter((id) => validIds.has(id)),
    ),
  ];

  return {
    answer: parsed.answer || "Here are your recommendations. 🎬",
    recommendations: parsed.recommendations.map((title) => title.trim()),
    citations,
  };
}

module.exports = { generateRagAnswer };
