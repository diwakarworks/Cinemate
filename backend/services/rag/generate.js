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
      content: `You are Cinemate AI. Use the user's diary entries to infer their taste and recommend new movies or TV series.

Instructions:
- Follow the media type requested in the question.
- Recommend titles that are not present in the supplied diary entries.
- Use diary ratings and reviews to infer preferences.
- Recommend exactly one title if the user asks for one.
- Return only the recommended title, without descriptions or explanations.
- Never claim a recommendation was watched by the user.
- Cite diary entry IDs that support your taste inference.
- Never put diary entry IDs in the recommendations array.

Return ONLY valid JSON:
{"recommendations":["Barry"],"citations":["DIARY_ENTRY_ID"]}

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
      (title) => typeof title === "string" && title.trim()
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
        .filter((id) => validIds.has(id))
    ),
  ];

  return {
    recommendations: parsed.recommendations.map((title) => title.trim()),
    citations,
  };
}

module.exports = { generateRagAnswer };