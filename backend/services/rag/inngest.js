
const Movie = require("../../models/Movie");
const { embedText } = require("./localAI");

async function ingestMovie(movie) {
  const text = [
    `Title: ${movie.title}`,
    `Plot: ${movie.plot || ""}`,
    `Year: ${movie.year || ""}`,
    `Genres: ${(movie.genre_ids || []).join(", ")}`,
    `Cast: ${(movie.cast || []).join(", ")}`,
  ].join("\n");

  movie.embedding = await embedText(text);
  await movie.save();

  await Movie.updateOne(
    { _id: movie._id },
    { $set: { embedding } }
  );

  return { tmdbId: movie.tmdbId, title: movie.title };
}

async function ingestAllMovies() {
  const movies = await Movie.find({
    embedding: { $exists: false },
  }).lean();

  let indexed = 0;

  for (const movie of movies) {
    try {
      await ingestMovie(movie);
      indexed++;
    } catch (error) {
      console.error(
        `Failed to index ${movie.title}:`,
        error.message
      );
    }
  }

  return { indexed, total: movies.length };
}

module.exports = { ingestMovie, ingestAllMovies };
