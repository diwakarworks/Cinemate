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
  thriller: 9648, // TMDB TV has no Thriller genre — mystery is the nearest match
  drama: 18,
  action: 10759, // "Action & Adventure" on TV
  horror: null, // no TV Horror genre — dropped, not mapped to something wrong
  mystery: 9648,
};

// Minimal country name -> ISO 3166-1 code map (extend as needed)
const COUNTRY_MAP = {
  "south korea": "KR",
  korea: "KR",
  japan: "JP",
  usa: "US",
  "united states": "US",
  france: "FR",
  india: "IN",
};

// Minimal country -> primary spoken language, used as a fallback filter.
// with_origin_country relies on TMDB's production-country metadata, which
// is patchy for older/foreign titles; original_language is more reliably
// populated and catches titles origin_country misses.
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

// Resolve free-text mood/tone words ("dark", "atmospheric", "slow burn",
// "neo-noir") into real TMDB keyword IDs via /search/keyword. This is the
// correct place for tone — TMDB genres were never meant to carry it, which
// is why "dark" used to get mapped onto whatever genre was closest and
// silently distorted results. Runs all lookups in parallel; anything with
// no match is dropped rather than guessed.
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

// Resolve cast/director names into TMDB person IDs via /search/person.
// Movie discover supports with_cast (actor) and with_crew (director, etc);
// TV discover only supports with_people (any credited person), so we reuse
// the same resolved IDs there.
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

// Normalize a movie or TV result into one shared shape so the frontend
// can render either through the same grid and dispatch to MovieCard /
// ShowCard based on media_type.
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
    const { query, mediaType: mediaTypeOverride } = req.body; // optional explicit override from a frontend toggle

    if (!query) {
      return res.status(400).json({ message: "Search query required" });
    }

    // 1. Convert natural language -> structured filters, including which
    // media type the query itself implies (e.g. "series", "show", "K-drama"
    // vs "movie", "film")
    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
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

    // Resolve keyword and person names in parallel — independent lookups,
    // no reason to serialize them.
    const [keywordIds, personIds] = await Promise.all([
      resolveKeywordIds(filters.moodKeywords),
      resolvePersonIds(filters.cast),
    ]);

    // An explicit toggle from the frontend wins; otherwise use what the
    // LLM inferred from the query text itself.
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
      // vote_count floor keeps "highly rated" from surfacing obscure titles
      // with a single 10/10 vote — require a real sample size first.
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

    // TV uses first_air_date range params instead of primary_release_date,
    // and with_people instead of with_cast (TV discover has no with_cast).
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

    // 2. Query TMDB — movies and TV in parallel, only what was asked for
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

    // 3. Return movies and shows as separate arrays — no merging.
    // A "movies" query gets only `movies` populated; a "series" query gets
    // only `shows`; only an explicit "all" query populates both.
    res.json({
      filters,
      mediaType: effectiveMediaType, // "movie" | "tv" | "all"
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