const OpenAI = require("openai");
const axios = require("axios");

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});


const GENRE_MAP_MOVIE = {
  crime: 80,
  thriller: 53,
  drama: 18,
  action: 28,
  horror: 27,
  mystery: 9648,
};

const GENRE_MAP_TV = {
  crime: 80,
  thriller: 9648,
  drama: 18,
  action: 10759, 
  horror: null, 
  mystery: 9648,
};


const COUNTRY_MAP = {
  "south korea": "KR",
  korea: "KR",
  japan: "JP",
  usa: "US",
  "united states": "US",
  france: "FR",
  india: "IN",
};

const COUNTRY_LANGUAGE_MAP = {
  KR: "ko",
  JP: "ja",
  FR: "fr",
  IN: "hi",
};

const buildGenreIds = (genres = [], map) =>
  genres.map((g) => map[g.toLowerCase()]).filter(Boolean);

const buildCountryCode = (country) =>
  country ? COUNTRY_MAP[country.toLowerCase()] : null;


const resolveKeywordIds = async (moodWords = []) => {
  if (!moodWords.length) return [];
  const lookups = await Promise.all(
    moodWords.map((word) =>
      axios
        .get("https://api.themoviedb.org/3/search/keyword", {
          params: { api_key: process.env.TMDB_API_KEY, query: word },
        })
        .then((r) => r.data.results?.[0]?.id)
        .catch(() => null),
    ),
  );
  return lookups.filter(Boolean);
};


const resolvePersonIds = async (names = []) => {
  if (!names.length) return [];
  const lookups = await Promise.all(
    names.map((name) =>
      axios
        .get("https://api.themoviedb.org/3/search/person", {
          params: { api_key: process.env.TMDB_API_KEY, query: name },
        })
        .then((r) => r.data.results?.[0]?.id)
        .catch(() => null),
    ),
  );
  return lookups.filter(Boolean);
};


const normalizeMovie = (m) => ({
  id: m.id,
  media_type: "movie",
  title: m.title,
  release_date: m.release_date,
  poster_path: m.poster_path,
  vote_average: m.vote_average,
  overview: m.overview,
});

const normalizeShow = (s) => ({
  id: s.id,
  media_type: "tv",
  title: s.name,
  release_date: s.first_air_date,
  poster_path: s.poster_path,
  vote_average: s.vote_average,
  overview: s.overview,
});

const naturalSearch = async (req, res) => {
  try {
    const { query, mediaType: mediaTypeOverride } = req.body; 

    if (!query) {
      return res.status(400).json({ message: "Search query required" });
    }

    const completion = await openai.chat.completions.create({
      model: "openrouter/free",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
          Convert a movie/TV search query into JSON.

          Return:
          {
            "mediaType": "movie" | "tv" | "all",
            "genres": [],
            "moodKeywords": [],
            "cast": [],
            "fromYear": null,
            "toYear": null,
            "country": null,
            "minRating": null,
            "preferHighlyRated": false,
            "keywords": []
          }

          - "mediaType": "movie" if the query mentions films/movies specifically
            (or says nothing either way — default to "movie" only when truly
            ambiguous with no other signal). "tv" if it mentions series, shows,
            episodes, seasons, or a region-specific TV term like "K-drama" or
            "anime series". "all" only if the query explicitly asks for both
            (e.g. "movies and shows").
          - "genres" must only use these exact values: crime, thriller, drama, action, horror, mystery.
            Do NOT put tone/mood/atmosphere words here.
          - "moodKeywords": short tone/atmosphere/style phrases that are NOT one
            of the fixed genres above — e.g. "dark", "atmospheric", "slow burn",
            "neo-noir", "morally gray", "based on a true story". 1-3 words each,
            up to 3 total. Leave empty if the query has no tone beyond its genre.
          - "cast": real actor or director full names mentioned in the query
            (e.g. "Song Kang-ho", "Bong Joon-ho"). Empty if none.
          - "country" must be a full country name (e.g. "South Korea"), not a code.
          - "minRating": a 0-10 number ONLY if the query explicitly asks for a
            rating threshold (e.g. "rated above 8"). Otherwise null.
          - "preferHighlyRated": true if the query uses phrases like "highly rated",
            "critically acclaimed", "best", "top" without a specific number.
          `,
        },
        { role: "user", content: query },
      ],
    });

    const filters = JSON.parse(completion.choices[0].message.content);
    const countryCode = buildCountryCode(filters.country);
    const languageCode = countryCode ? COUNTRY_LANGUAGE_MAP[countryCode] : null;

    const [keywordIds, personIds] = await Promise.all([
      resolveKeywordIds(filters.moodKeywords),
      resolvePersonIds(filters.cast),
    ]);

 
    const effectiveMediaType = mediaTypeOverride || filters.mediaType || "movie";
    const wantMovies = effectiveMediaType !== "tv";
    const wantShows = effectiveMediaType !== "movie";

    const sortBy =
      filters.preferHighlyRated || filters.minRating
        ? "vote_average.desc"
        : "popularity.desc";

    const buildParams = (genreIds) => ({
      api_key: process.env.TMDB_API_KEY,
      sort_by: sortBy,
      ...(genreIds.length && { with_genres: genreIds.join(",") }),
      ...(keywordIds.length && { with_keywords: keywordIds.join("|") }),
      ...(personIds.length && { with_cast: personIds.join("|") }),
      ...(countryCode && { with_origin_country: countryCode }),
      ...(languageCode && { with_original_language: languageCode }),
      ...(filters.minRating && { "vote_average.gte": filters.minRating }),
      ...((filters.preferHighlyRated || filters.minRating) && {
        "vote_count.gte": 50,
      }),
      ...(filters.fromYear && {
        "primary_release_date.gte": `${filters.fromYear}-01-01`,
      }),
      ...(filters.toYear && {
        "primary_release_date.lte": `${filters.toYear}-12-31`,
      }),
    });
    const buildTvParams = (genreIds) => ({
      api_key: process.env.TMDB_API_KEY,
      sort_by: sortBy,
      ...(genreIds.length && { with_genres: genreIds.join(",") }),
      ...(keywordIds.length && { with_keywords: keywordIds.join("|") }),
      ...(personIds.length && { with_people: personIds.join("|") }),
      ...(countryCode && { with_origin_country: countryCode }),
      ...(languageCode && { with_original_language: languageCode }),
      ...(filters.minRating && { "vote_average.gte": filters.minRating }),
      ...((filters.preferHighlyRated || filters.minRating) && {
        "vote_count.gte": 50,
      }),
      ...(filters.fromYear && {
        "first_air_date.gte": `${filters.fromYear}-01-01`,
      }),
      ...(filters.toYear && {
        "first_air_date.lte": `${filters.toYear}-12-31`,
      }),
    });

    const requests = [];

    if (wantMovies) {
      const movieGenreIds = buildGenreIds(filters.genres, GENRE_MAP_MOVIE);
      requests.push(
        axios.get("https://api.themoviedb.org/3/discover/movie", {
          params: buildParams(movieGenreIds),
        }),
      );
    } else {
      requests.push(Promise.resolve({ data: { results: [] } }));
    }

    if (wantShows) {
      const tvGenreIds = buildGenreIds(filters.genres, GENRE_MAP_TV);
      requests.push(
        axios.get("https://api.themoviedb.org/3/discover/tv", {
          params: buildTvParams(tvGenreIds),
        }),
      );
    } else {
      requests.push(Promise.resolve({ data: { results: [] } }));
    }

    const [movieResponse, tvResponse] = await Promise.all(requests);

    const movies = wantMovies
      ? (movieResponse.data.results || []).map(normalizeMovie)
      : [];
    const shows = wantShows
      ? (tvResponse.data.results || []).map(normalizeShow)
      : [];
    res.json({
      filters,
      mediaType: effectiveMediaType, 
      movies,
      shows,
      counts: { movies: movies.length, shows: shows.length },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Natural search failed" });
  }
};

module.exports = {
  naturalSearch,
};