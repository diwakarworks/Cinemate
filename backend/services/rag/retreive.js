const DiaryEntry = require("../../models/DiaryEntry");
const { embedText } = require("./localAI");

async function retrieveDiaryEntries(
  userId,
  question,
  limit = 8,
  mediaType = null
) {
  const queryVector = await embedText(question);

  const filter = { user: userId };

  if (mediaType === "movie" || mediaType === "tv") {
    filter.mediaType = mediaType;
  }

  return DiaryEntry.aggregate([
    {
      $vectorSearch: {
        index: "diary_embedding_index",
        path: "embedding",
        queryVector,
        numCandidates: 100,
        limit,
        filter,
      },
    },
    {
      $project: {
        _id: 1,
        mediaId: 1,
        mediaType: 1,
        title: 1,
        year: 1,
        rating: 1,
        review: 1,
        watchedDate: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
  ]);
}

module.exports = { retrieveDiaryEntries };