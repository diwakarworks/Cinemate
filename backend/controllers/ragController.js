const { retrieveDiaryEntries } = require("../services/rag/retreive");
const { generateRagAnswer } = require("../services/rag/generate");
const asyncHandler = require("express-async-handler");

const chat = asyncHandler(async (req, res) => {
  try {
    const question = req.body?.question;

    if (
      typeof question !== "string" ||
      !question.trim() ||
      question.length > 1000
    ) {
      return res.status(400).json({
        message: "Enter a question of up to 1000 characters.",
      });
    }

    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const cleanedQuestion = question.trim();
    const normalizedQuestion = cleanedQuestion.toLowerCase();

    const asksForTV =
      /\b(series|tv shows?|television shows?|sitcoms?)\b/.test(
        normalizedQuestion
      );

    const asksForMovies = /\bmovies?\b/.test(normalizedQuestion);

    const mediaType =
      asksForTV && !asksForMovies
        ? "tv"
        : asksForMovies && !asksForTV
          ? "movie"
          : null;

    const diaryEntries = await retrieveDiaryEntries(
      userId,
      cleanedQuestion,
      8,
      mediaType
    );

    const result = await generateRagAnswer(
      cleanedQuestion,
      diaryEntries
    );

    const citedIds = new Set(result.citations || []);

    const sources = diaryEntries
      .filter((entry) => citedIds.has(String(entry._id)))
      .map((entry) => ({
        id: String(entry._id),
        mediaId: entry.mediaId,
        title: entry.title,
        year: entry.year,
        mediaType: entry.mediaType,
        rating: entry.rating,
        review: entry.review,
        watchedDate: entry.watchedDate,
        score: entry.score,
      }));

    return res.json({
      recommendations: result.recommendations,
      sources,
    });
  } catch (error) {
    console.error("RAG chat error:", error);

    return res.status(500).json({
      message: "Failed to process your request. Please try again.",
    });
  }
});

module.exports = { chat };