const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const axios = require("axios");
const Movie = require("../models/Movie");
const Series = require("../models/Series");
const mongoose = require("mongoose");
const Papa = require("papaparse");
const Review = require("../models/Review");
const DiaryEntry = require("../models/DiaryEntry");

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY;

const getUserStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.stats);
  } catch (error) {
    console.error(`Error ${error.message}`);
    res.status(500).json({ message: "Failed to get User Stats" });
  }
});

// const addToWatchlist = asyncHandler(async (req, res) => {
//     const userId = req.user._id;
//     const { movieId } = req.body;

//     try {
//         const user = await User.findById(userId);
//         if (!user) return res.status(404).json({ message: 'User not found' });

//         if (!Array.isArray(user.watchlist)) {
//             user.watchlist = [];
//         }

//         const movieIdStr = movieId ? movieId.toString() : null;
//         console.log(movieIdStr);
//         if (!movieIdStr) {
//             return res.status(400).json({ message: 'Invalid movieId' });
//         }

//         if (!user.watchlist.includes(movieIdStr)) {
//             user.watchlist.push(movieIdStr);
//             await user.save();
//             res.status(201).json({ message: 'Movie added to watchlist' });
//         } else {
//             res.status(200).json({ message: 'Movie already in watchlist' });
//         }
//     } catch (error) {
//         console.error(`Error: ${error.message}`);
//         res.status(500).json({ message: 'Movie Watchlist error' });
//     }
// });

const addToWatchlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { movieId, seriesId, type } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (type === "movie") {
      if (!Array.isArray(user.watchlist)) user.watchlist = [];

      const movieIdStr = movieId?.toString();
      if (!movieIdStr)
        return res.status(400).json({ message: "Invalid movieId" });

      if (!user.watchlist.includes(movieIdStr)) {
        user.watchlist.push(movieIdStr);
        await user.save();
        return res.status(201).json({ message: "Movie added to watchlist" });
      } else {
        return res.status(200).json({ message: "Movie already in watchlist" });
      }
    } else if (type === "series") {
      if (!Array.isArray(user.seriesWatchlist)) user.seriesWatchlist = [];

      const seriesIdStr = seriesId?.toString();
      if (!seriesIdStr)
        return res.status(400).json({ message: "Invalid seriesId" });

      if (!user.seriesWatchlist.includes(seriesIdStr)) {
        user.seriesWatchlist.push(seriesIdStr);
        await user.save();
        return res.status(201).json({ message: "Series added to watchlist" });
      } else {
        return res.status(200).json({ message: "Series already in watchlist" });
      }
    } else {
      return res
        .status(400)
        .json({ message: 'Invalid type. Use "movie" or "series"' });
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ message: "Watchlist error" });
  }
});

const updateStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { totalMoviesWatched, favoriteGenres } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.stats) {
      user.stats = { totalMoviesWatched: 0, favoriteGenres: new Map() };
    } else if (!user.stats.favoriteGenres) {
      user.stats.favoriteGenres = new Map();
    }

    user.stats.totalMoviesWatched += totalMoviesWatched;

    for (const genre in favoriteGenres) {
      const currentCount = user.stats.favoriteGenres.get(genre) || 0;
      user.stats.favoriteGenres.set(
        genre,
        currentCount + favoriteGenres[genre],
      );
    }

    await user.save();
    res.status(200).json({ message: "User stats updated" });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ message: "User stats error" });
  }
});

const deleteStats = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  try {
    // Find and update the user by unsetting the 'stats' field
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $unset: { stats: "" } },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User stats deleted successfully" });
  } catch (error) {
    console.error(`Error deleting stats: ${error.message}`);
    res.status(500).json({ message: "Failed to delete user stats" });
  }
});

const getWatchlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  try {
    const user = await User.findById(userId)
      .select("watchlist seriesWatchlist")
      .lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const agentOptions = {
      httpAgent: new (require("http").Agent)({ keepAlive: true }),
      httpsAgent: new (require("https").Agent)({ keepAlive: true }),
    };

    const fetchMovieDetails = async (movieId) => {
      try {
        const response = await axios.get(
          `https://api.themoviedb.org/3/movie/${movieId}`,
          {
            params: { api_key: process.env.TMDB_API_KEY },
            timeout: 5000,
            ...agentOptions,
          },
        );
        return { ...response.data, mediaType: "movie" };
      } catch (error) {
        console.error(`Failed to fetch movie ${movieId}:`, error.message);
        return null;
      }
    };

    const fetchSeriesDetails = async (seriesId) => {
      try {
        const response = await axios.get(
          `https://api.themoviedb.org/3/tv/${seriesId}`,
          {
            params: { api_key: process.env.TMDB_API_KEY },
            timeout: 5000,
            ...agentOptions,
          },
        );
        return { ...response.data, mediaType: "series" };
      } catch (error) {
        console.error(`Failed to fetch series ${seriesId}:`, error.message);
        return null;
      }
    };

    const [movieDetails, seriesDetails] = await Promise.all([
      Promise.all((user.watchlist || []).map((id) => fetchMovieDetails(id))),
      Promise.all(
        (user.seriesWatchlist || []).map((id) => fetchSeriesDetails(id)),
      ),
    ]);

    res.status(200).json({
      watchlist: movieDetails.filter(Boolean),
      seriesWatchlist: seriesDetails.filter(Boolean),
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ message: "Failed to retrieve watchlist" });
  }
});

const deleteWatchlistForSpecificMovie = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { movieId, seriesId, type } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (type === "series") {
      const itemIndex = user.seriesWatchlist.indexOf(seriesId.toString());
      if (itemIndex === -1) {
        return res
          .status(404)
          .json({ message: "Series not found in watchlist" });
      }
      user.seriesWatchlist.splice(itemIndex, 1);
    } else {
      const itemIndex = user.watchlist.indexOf(movieId.toString());
      if (itemIndex === -1) {
        return res
          .status(404)
          .json({ message: "Movie not found in watchlist" });
      }
      user.watchlist.splice(itemIndex, 1);
    }

    await user.save();
    res.status(200).json({ message: `${type} removed from watchlist` });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ message: "Error removing from watchlist" });
  }
});

const exportAllWatchlists = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  try {
    const user = await User.findById(userId)
      .select("watchlist seriesWatchlist")
      .lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const fetchDetails = async (id, isSeries) => {
      try {
        const url = `https://api.themoviedb.org/3/${isSeries ? "tv" : "movie"}/${id}`;
        const res = await axios.get(url, {
          params: { api_key: process.env.TMDB_API_KEY },
        });
        return res.data;
      } catch {
        return null;
      }
    };

    const movies = await Promise.all(
      (user.watchlist || []).map((id) => fetchDetails(id, false)),
    );
    const series = await Promise.all(
      (user.seriesWatchlist || []).map((id) => fetchDetails(id, true)),
    );

    const header = "type,title,year,tmdbId";
    const movieRows = movies
      .filter(Boolean)
      .map(
        (m) =>
          `movie,"${m.title}",${m.release_date?.slice(0, 4) || ""},${m.id}`,
      );
    const seriesRows = series
      .filter(Boolean)
      .map(
        (s) =>
          `series,"${s.name}",${s.first_air_date?.slice(0, 4) || ""},${s.id}`,
      );
    const csv = [header, ...movieRows, ...seriesRows].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="watchlist.csv"',
    );
    res.send(csv);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ message: "Failed to export watchlist" });
  }
});




const importAllWatchlists = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    if (!req.file) {
      console.log(" No file uploaded");
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

  
    const user = await User.findById(userId);

    if (!user) {
      console.log(" User not found");

      return res.status(404).json({
        message: "User not found",
      });
    }

    
    const csvText = req.file.buffer.toString("utf-8");

    const { data: rows } = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });

    console.log(`CSV rows found: ${rows.length}`);

    const results = {
      imported: 0,
      skipped: 0,
      unmatched: [],
      errors: [],
    };

    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

    
      const title = (
        row.title ||
        row.Title ||
        row.Name ||
        row.name ||
        ""
      ).trim();
      const yearValue =
        row.year ||
        row.Year ||
        "";

      const year = yearValue
        ? Number(String(yearValue).trim())
        : undefined;

      if (!title) {
        console.log(` [${i + 1}/${rows.length}] No title found`);

        continue;
      }

      console.log(
        `\n [${i + 1}/${rows.length}] ${title} ${
          year ? `(${year})` : ""
        }`
      );

      try {
       
        const movieResponse = await axios.get(
          "https://api.themoviedb.org/3/search/movie",
          {
            params: {
              api_key: process.env.TMDB_API_KEY,
              query: title,
              ...(year && { year }),
            },
          }
        );

    
        const seriesResponse = await axios.get(
          "https://api.themoviedb.org/3/search/tv",
          {
            params: {
              api_key: process.env.TMDB_API_KEY,
              query: title,
              ...(year && {
                first_air_date_year: year,
              }),
            },
          }
        );

        const movieResults = movieResponse.data.results || [];
        const seriesResults = seriesResponse.data.results || [];

        const movie = movieResults[0];
        const series = seriesResults[0];

        let type = null;
        let match = null;

        
        if (movie && !series) {
          type = "movie";
          match = movie;
        }

        else if (!movie && series) {
          type = "series";
          match = series;
        }

      
        else if (movie && series) {
          const movieTitle = (
            movie.title ||
            ""
          ).toLowerCase();

          const seriesTitle = (
            series.name ||
            ""
          ).toLowerCase();

          const normalizedTitle = title.toLowerCase();

          
          const movieExact =
            movieTitle === normalizedTitle;

          const seriesExact =
            seriesTitle === normalizedTitle;

          if (seriesExact && !movieExact) {
            type = "series";
            match = series;
          } else if (movieExact && !seriesExact) {
            type = "movie";
            match = movie;
          }

          
          else {
            const movieYear = movie.release_date
              ? Number(movie.release_date.slice(0, 4))
              : null;

            const seriesYear = series.first_air_date
              ? Number(series.first_air_date.slice(0, 4))
              : null;

            const movieYearMatch =
              year && movieYear === year;

            const seriesYearMatch =
              year && seriesYear === year;

            if (
              seriesYearMatch &&
              !movieYearMatch
            ) {
              type = "series";
              match = series;
            } else if (
              movieYearMatch &&
              !seriesYearMatch
            ) {
              type = "movie";
              match = movie;
            } else {
              if (
                (series.popularity || 0) >
                (movie.popularity || 0)
              ) {
                type = "series";
                match = series;
              } else {
                type = "movie";
                match = movie;
              }
            }
          }
        }


        if (!match || !type) {
          console.log(
            ` No TMDB match: ${title}`
          );

          results.unmatched.push(title);

          continue;
        }

        const tmdbId = String(match.id);

        console.log(
          ` ${title} → ${type} → TMDB ${tmdbId}`
        );

        if (type === "series") {
          let seriesDocument =
            await Series.findOne({ tmdbId });

          
          if (!seriesDocument) {
            console.log(
              `➕ Creating series: ${match.name}`
            );

            seriesDocument =
              await Series.create({
                tmdbId,
                title: match.name,

                year: match.first_air_date
                  ? Number(
                      match.first_air_date.slice(0, 4)
                    )
                  : undefined,

                poster_path:
                  match.poster_path,

                vote_average:
                  match.vote_average,
              });
          }
          if (
            user.seriesWatchlist.includes(
              tmdbId
            )
          ) {
            console.log(
              `⏭ Already in series watchlist: ${title}`
            );

            results.skipped++;

            continue;
          }

          
          user.seriesWatchlist.push(tmdbId);

        }

        else {
          let movieDocument =
            await Movie.findOne({ tmdbId });

       
          if (!movieDocument) {
            console.log(
              `➕ Creating movie: ${match.title}`
            );

            movieDocument =
              await Movie.create({
                tmdbId,
                title: match.title,

                year: match.release_date
                  ? Number(
                      match.release_date.slice(0, 4)
                    )
                  : undefined,

                poster_path:
                  match.poster_path,

                vote_average:
                  match.vote_average,
              });
          }

        
          if (
            user.watchlist.includes(tmdbId)
          ) {
            console.log(
              `Already in movie watchlist: ${title}`
            );

            results.skipped++;

            continue;
          }

          user.watchlist.push(tmdbId);

          console.log(
            `Added movie: ${title}`
          );
        }

        results.imported++;

        console.log(
          `Successfully imported: ${title}`
        );
      } catch (rowError) {
        console.error(
          `❌ Failed "${title}":`,
          rowError.message
        );

        results.errors.push({
          title,
          error: rowError.message,
        });
      }
    }

  
    await user.save();



    return res.json(results);
  } catch (error) {
    console.error(
      " Import watchlist error:",
      error
    );

    return res.status(500).json({
      message: "Failed to import watchlist",
      error: error.message,
    });
  }
});

// Clear both movies and series watchlist
const clearWatchlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { watchlist: [], seriesWatchlist: [] },
      { new: true },
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "Watchlist cleared" });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ message: "Failed to clear watchlist" });
  }
});

// Toggle watchlist visibility
const setWatchlistVisibility = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { isPrivate } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { isWatchlistPrivate: isPrivate },
      { new: true },
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({
      message: "Visibility updated",
      isWatchlistPrivate: user.isWatchlistPrivate,
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ message: "Failed to update visibility" });
  }
});

const addToFavorites = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { movieId, year, title, poster_path } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Use findOneAndUpdate with upsert (creates if doesn't exist)
    const movie = await Movie.findOneAndUpdate(
      { tmdbId: movieId },
      {
        tmdbId: movieId,
        title,
        year,
        poster_path,
      },
      {
        upsert: true, // Create if doesn't exist
        new: true, // Return the updated/created document
        setDefaultsOnInsert: true,
      },
    );

    console.log("✅ Movie:", movie.title);

    // Check if already in favorites
    const isAlreadyFavorite = user.favorites.some(
      (fav) => fav.toString() === movie._id.toString(),
    );

    if (isAlreadyFavorite) {
      return res.status(400).json({ message: "Movie is already in favorites" });
    }

    // Add to favorites
    user.favorites.push(movie._id);
    await user.save();

    res.status(201).json({
      message: "Movie added to favorites",
      movie: {
        _id: movie._id,
        tmdbId: movie.tmdbId,
        title: movie.title,
      },
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
});

const removeFromFavorites = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { movieId } = req.body;

  try {
    const user = await User.findById(userId).populate("favorites");
    if (!user) return res.status(404).json({ message: "User not found" });

    console.log("Current favorites:", user.favorites);
    console.log("Trying to remove movieId:", movieId);

    // Find the movie in the database by tmdbId
    const movie = await Movie.findOne({ tmdbId: movieId });

    if (!movie) {
      return res.status(404).json({ message: "Movie not found in database" });
    }

    // Check if the movie's _id is in user.favorites
    const index = user.favorites.findIndex(
      (fav) => fav._id.toString() === movie._id.toString(),
    );

    if (index > -1) {
      user.favorites.splice(index, 1);
      await user.save();
      return res.status(200).json({
        message: "Movie removed from favorites",
        favorites: user.favorites,
      });
    } else {
      return res.status(400).json({ message: "Movie is not in favorites" });
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ message: "Failed to remove movie from favorites" });
  }
});

const getFavorites = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    console.log("User favorites:", user.favorites);

    const movies = await Movie.find({ _id: { $in: user.favorites } });

    if (!movies.length) {
      return res.status(200).json({ message: "No favorites found" });
    }

    const favoriteMovies = movies.map((movie) => ({
      id: movie._id,
      title: movie.title,
      year: movie.year,
      poster_path: movie.poster_path,
    }));

    res.status(200).json(favoriteMovies);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ message: "Failed to fetch favorites" });
  }
});

const getFavoriteSeries = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("favoriteSeries");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.favoriteSeries || user.favoriteSeries.length === 0) {
      return res
        .status(200)
        .json({ message: "No favorite series found", favoriteSeries: [] });
    }
    res.status(200).json(user.favoriteSeries);
  } catch (error) {
    console.error(`Error fetching favorite series: ${error.message}`, error);
    res.status(500).json({
      message: "Failed to fetch favorite series",
      error: error.message,
    });
  }
});

const addFavoriteSeries = asyncHandler(async (req, res) => {
  try {
    const {
      tmdbId,
      title,
      year,
      rating,
      plot,
      poster_path,
      vote_average,
      genre_ids,
      cast,
      seasons,
      episodes,
    } = req.body;

    if (!tmdbId || !title || !poster_path) {
      return res
        .status(400)
        .json({ message: "tmdbId, title and poster_path are required" });
    }

    let series = await Series.findOne({ tmdbId });
    if (!series) {
      series = await Series.create({
        tmdbId,
        title,
        year,
        rating,
        plot,
        poster_path,
        vote_average,
        genre_ids,
        cast,
        seasons,
        episodes,
      });
    }

    const alreadyFavorited = await User.exists({
      _id: req.user._id,
      favoriteSeries: series._id,
    });
    if (alreadyFavorited) {
      return res.status(409).json({ message: "Already in favorites" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { favoriteSeries: series._id } },
      { new: true },
    ).populate("favoriteSeries");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(201).json(user.favoriteSeries);
  } catch (error) {
    console.error(`Error adding favorite series: ${error.message}`, error);
    res
      .status(500)
      .json({ message: "Failed to add favorite series", error: error.message });
  }
});

const removeFavoriteSeries = asyncHandler(async (req, res) => {
  try {
    const { tmdbId } = req.params;

    const series = await Series.findOne({ tmdbId });
    if (!series) {
      return res.status(404).json({ message: "Series not found" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { favoriteSeries: series._id } },
      { new: true },
    ).populate("favoriteSeries");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Successfully deleted",
      favoriteSeries: user.favoriteSeries,
    });
  } catch (error) {
    console.error(`Error removing favorite series: ${error.message}`, error);
    res.status(500).json({
      message: "Failed to remove favorite series",
      error: error.message,
    });
  }
});

const getTasteProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const profile = {
    genres: {},
    languages: {},
  };

  try {
    const diaryEntries = await DiaryEntry.find({ user: userId })
      .sort({ watchedDate: -1 })
      .limit(20);

    const filtered = diaryEntries.filter(
      (entry) => entry.rating >= 4 && entry.mediaId,
    );

    for (const diaryEntry of filtered) {
      try {
        const endpoint =
          diaryEntry.mediaType === "tv"
            ? `${TMDB_BASE_URL}/tv/${diaryEntry.mediaId}`
            : `${TMDB_BASE_URL}/movie/${diaryEntry.mediaId}`;

        const response = await axios.get(endpoint, {
          params: { api_key: TMDB_API_KEY },
          timeout: 10000,
        });

        const media = response.data;
        const weight = diaryEntry.rating / 5;

        for (const genre of media.genres || []) {
          profile.genres[genre.id] = (profile.genres[genre.id] || 0) + weight;
        }

        const language = media.original_language;
        if (language) {
          profile.languages[language] =
            (profile.languages[language] || 0) + weight;
        }
      } catch (innerError) {
        console.error(
          `Diary entry ${diaryEntry._id} failed:`,
          innerError.message,
        );
        continue;
      }
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error("Error building taste profile:", error.message);
    res.status(500).json({ message: "Failed to build taste profile" });
  }
});

const TV_GENRE_MAP = {
  28: null,
  12: 10759,
  16: 16,
  35: 35,
  80: 80,
  99: 99,
  18: 18,
  10751: 10751,
  14: null,
  36: null,
  27: null,
  9648: 9648,
  10402: null,
  878: 10765,
  10770: null,
  53: null,
  10752: null,
  37: 37,
};

const getRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const profileRes = await axios.get(
      `${req.protocol}://${req.get("host")}/api/user/${userId}/recommendations/taste-profile`,
      { headers: { Authorization: req.headers.authorization } },
    );

    const profile = profileRes.data;

    const reviews = await Review.find({ userId });
    const diaryEntries = await DiaryEntry.find({ user: userId })
      .sort({ watchedDate: -1 })
      .limit(20);

    const watchedIds = new Set(reviews.map((review) => String(review.movieId)));
    diaryEntries.forEach((entry) => watchedIds.add(String(entry.mediaId)));

    const topGenreIds = Object.entries(profile.genres || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genreId]) => Number(genreId));

    const topGenres = topGenreIds.join(",");

    const topLanguage = Object.entries(profile.languages || {}).sort(
      (a, b) => b[1] - a[1],
    )[0]?.[0];

    if (!topGenres) {
      return res.status(200).json({
        message: "Not enough review data to generate recommendations yet",
        recommendations: [],
      });
    }

    const tvGenreIds = [
      ...new Set(topGenreIds.map((id) => TV_GENRE_MAP[id]).filter(Boolean)),
    ];
    const tvGenres = tvGenreIds.join("|");

    const movieParams = {
      api_key: TMDB_API_KEY,
      with_genres: topGenreIds.join("|"),
      with_original_language: topLanguage,
      sort_by: "vote_average.desc",
      "vote_count.gte": 100,
    };

    const tvParams = {
      api_key: TMDB_API_KEY,
      with_original_language: topLanguage,
      sort_by: "vote_average.desc",
      "vote_count.gte": 50,
    };
    if (tvGenres) {
      tvParams.with_genres = tvGenres;
    }

    const topRatedMovies = diaryEntries
      .filter((e) => e.mediaType !== "tv" && e.rating >= 8 && e.mediaId)
      .slice(0, 5);
    const topRatedTv = diaryEntries
      .filter((e) => e.mediaType === "tv" && e.rating >= 8 && e.mediaId)
      .slice(0, 5);
    const topRatedEntries = [...topRatedMovies, ...topRatedTv];

    

    const similarRequests = topRatedEntries.map(async (entry) => {
      const base =
        entry.mediaType === "tv"
          ? `${TMDB_BASE_URL}/tv/${entry.mediaId}`
          : `${TMDB_BASE_URL}/movie/${entry.mediaId}`;

      let r = await axios
        .get(`${base}/recommendations`, {
          params: { api_key: TMDB_API_KEY },
          timeout: 8000,
        })
        .catch(() => null);

      if (!r || r.data.results.length === 0) {
        r = await axios
          .get(`${base}/similar`, {
            params: { api_key: TMDB_API_KEY },
            timeout: 8000,
          })
          .catch(() => null);
      }

      return { mediaType: entry.mediaType, sourceTitle: entry.title, results: r?.data?.results || [] };
    });

    const [movieRes, tvRes, ...similarRes] = await Promise.all([
      axios.get(`${TMDB_BASE_URL}/discover/movie`, {
        params: movieParams,
        timeout: 8000,
      }),
      axios.get(`${TMDB_BASE_URL}/discover/tv`, {
        params: tvParams,
        timeout: 8000,
      }),
      ...similarRequests,
    ]);

    const discoverMovies = movieRes.data.results.map((m) => ({
      ...m,
      mediaType: "movie",
      title: m.title,
      releaseDate: m.release_date,
    }));

    const discoverTv = tvRes.data.results.map((t) => ({
      ...t,
      mediaType: "tv",
      title: t.name,
      releaseDate: t.first_air_date,
    }));

    const similarItems = similarRes.flatMap(({ mediaType, sourceTitle, results }) =>
      results.map((item) => ({
        ...item,
        mediaType,
        title: mediaType === "tv" ? item.name : item.title,
        releaseDate:
          mediaType === "tv" ? item.first_air_date : item.release_date,
        _fromSimilar: true,
        _sourceTitle: sourceTitle,
      })),
    );



    const combinedMap = new Map();
    for (const item of [...similarItems, ...discoverMovies, ...discoverTv]) {
      const key = `${item.mediaType}-${item.id}`;
      if (!combinedMap.has(key)) {
        combinedMap.set(key, item);
      }
    }

    const combined = Array.from(combinedMap.values());

    const sortFn = (a, b) => {
      if (a._fromSimilar !== b._fromSimilar) return a._fromSimilar ? -1 : 1;
      if (b.vote_average !== a.vote_average) return b.vote_average - a.vote_average;
      if (b.vote_count !== a.vote_count) return b.vote_count - a.vote_count;
      return a.id - b.id;
    };

    const filtered = combined.filter((item) => !watchedIds.has(String(item.id)));

    const movieItems = filtered.filter((item) => item.mediaType === "movie").sort(sortFn);
    const tvItems = filtered.filter((item) => item.mediaType === "tv").sort(sortFn);

    const MOVIE_QUOTA = 10;
    const TV_QUOTA = 10;

    let recommendations = [
      ...movieItems.slice(0, MOVIE_QUOTA),
      ...tvItems.slice(0, TV_QUOTA),
    ];

    const shortfall = MOVIE_QUOTA + TV_QUOTA - recommendations.length;
    if (shortfall > 0) {
      const usedIds = new Set(recommendations.map((r) => `${r.mediaType}-${r.id}`));
      const backfillPool = [...movieItems, ...tvItems]
        .filter((item) => !usedIds.has(`${item.mediaType}-${item.id}`))
        .sort(sortFn);
      recommendations.push(...backfillPool.slice(0, shortfall));
    }

    recommendations.sort(sortFn);

    recommendations = recommendations
      .slice(0, 20)
      .map(({ _fromSimilar, _sourceTitle, ...rest }) => rest);

    res.status(200).json({ recommendations });
  } catch (error) {
    console.error(`Error generating recommendations: ${error.message}`, error);
    res.status(500).json({
      message: "Failed to generate recommendations",
      error: error.message,
    });
  }
});

module.exports = {
  getUserStats,
  addToWatchlist,
  updateStats,
  deleteStats,
  getWatchlist,
  addToFavorites,
  deleteWatchlistForSpecificMovie,
  removeFromFavorites,
  getFavorites,
  getFavoriteSeries,
  addFavoriteSeries,
  removeFavoriteSeries,
  importAllWatchlists,
  exportAllWatchlists,
  clearWatchlist,
  setWatchlistVisibility,
  getRecommendations,
  getTasteProfile,
};
