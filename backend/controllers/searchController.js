require("dotenv").config();
const axios = require("axios");
const cosine = require("compute-cosine-similarity");
const OpenAI = require("openai");
const { generateEmbedding } = require("../ai/embedding");

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const TMDB_API_KEY = process.env.TMDB_API_KEY;

// ============================================================
// Static maps
// ============================================================

// TMDB genre IDs differ between movie and TV — e.g. movie "Action" is 28,
// TV's equivalent is 10759 "Action & Adventure". TV has no standalone
// Horror genre, so that one is dropped rather than mismapped.
const GENRE_MAP_MOVIE = {
  crime: 80,
  thriller: 53,
  drama: 18,
  action: 28,
  horror: 27,
  mystery: 9648,
  comedy: 35,
  animated: 16,
  documentary: 99,
  fantasy: 14,
  adventure: 12,
  family: 10751,
  war: 10752,
};

const GENRE_MAP_TV = {
  crime: 80,
  thriller: 9648, // no TV Thriller genre — mystery is the nearest match
  drama: 18,
  action: 10759, // "Action & Adventure" on TV
  horror: null,
  mystery: 9648,
  comedy: 35,
  animated: 16,
  documentary: 99,
  fantasy: 10765, // "Sci-Fi & Fantasy" on TV
  adventure: 10759,
  family: 10751,
  war: 10768, // "War & Politics" on TV
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

// with_origin_country relies on TMDB production-country metadata, which is
// patchy for older/foreign titles. original_language is more reliably
// populated and catches titles origin_country misses.
const COUNTRY_LANGUAGE_MAP = { KR: "ko", JP: "ja", FR: "fr", IN: "hi" };

// Curated moods for the chip-based entry point. Hand-written descriptions,
// embedded once, compared against a candidate pool — no TMDB text param
// involved, since TMDB has no concept of mood.
const MOODS = {
  "mind-bending": {
    label: "Mind-bending",
    description:
      "A plot that twists reality, unreliable narrators, or a structure that makes you rethink everything you just watched.",
  },
  "heartbreak-cry": {
    label: "Need a good cry",
    description:
      "Emotionally heavy, cathartic sadness — grief, loss, or a reunion that earns its tears rather than manipulates you into them.",
  },
  "rainy-sunday": {
    label: "Rainy Sunday, zero motivation",
    description:
      "Low-stakes and cozy. Gentle pacing, nothing demanding, easy to half-watch without losing the thread.",
  },
  "family-safe": {
    label: "Watching with parents",
    description:
      "Wholesome, no graphic violence or explicit content, safe to put on with family in the room.",
  },
  "background-noise": {
    label: "Background noise while I work",
    description:
      "Visually simple, doesn't demand full attention, easy to follow with the sound low or while multitasking.",
  },
  "post-breakup": {
    label: "Post-breakup energy",
    description:
      "Angry or empowering — someone getting even, moving on, or thriving without the person who wronged them.",
  },
  "edge-of-seat": {
    label: "Edge of my seat",
    description:
      "Heart-pounding suspense that keeps ratcheting up tension, hard to pause once it starts.",
  },
  "laugh-out-loud": {
    label: "Just make me laugh",
    description:
      "Pure comedy that doesn't take itself seriously, built for actual laughing out loud.",
  },
  "feel-good": {
    label: "Feel-good only",
    description: "Uplifting and warm, a happy ending is basically guaranteed.",
  },
  "nostalgic-throwback": {
    label: "Nostalgic throwback",
    description:
      "Old-school vibes, coming-of-age memories, a specific decade's atmosphere.",
  },
  "date-night": {
    label: "Date night",
    description: "Romantic and charming, works well watching with a partner.",
  },
  "true-crime-obsessed": {
    label: "True crime obsessed",
    description:
      "Real cases, investigations, and chilling true stories told as documentary or drama.",
  },
  "epic-adventure": {
    label: "Epic adventure",
    description: "Grand-scale journeys and quests across sweeping landscapes.",
  },
  "sci-fi-deep-dive": {
    label: "Sci-fi deep dive",
    description:
      "Speculative technology, space, and existential questions about the future.",
  },
  "supernatural-chills": {
    label: "Supernatural chills",
    description: "Ghosts, hauntings, and things that go bump in the night.",
  },
  "slow-burn-drama": {
    label: "Slow-burn drama",
    description:
      "Patient character studies with quiet, accumulating emotional depth.",
  },
  "underdog-story": {
    label: "Underdog story",
    description: "Triumph against the odds, in sports or otherwise.",
  },
  "witty-banter": {
    label: "Witty banter",
    description:
      "Sharp, dialogue-driven, clever back-and-forth between characters.",
  },
  "gritty-crime": {
    label: "Gritty crime",
    description: "Hard-boiled crime stories with morally grey characters.",
  },
  "courtroom-thriller": {
    label: "Courtroom thriller",
    description: "Legal drama and high-stakes trials.",
  },
  "heist-caper": {
    label: "Heist caper",
    description:
      "Elaborate plans, cons, and stylish thieves pulling off the impossible.",
  },
  "war-epic": {
    label: "War epic",
    description: "Combat, sacrifice, and historical conflict on a large scale.",
  },
  "political-intrigue": {
    label: "Political intrigue",
    description: "Power struggles, scheming, and backroom deals.",
  },
  "music-and-performance": {
    label: "Music & performance",
    description: "Musicals, concert documentaries, and artist biopics.",
  },
  "animated-for-adults": {
    label: "Animated, but for adults",
    description: "Animation with mature themes, not aimed at kids.",
  },
  "found-family": {
    label: "Found family",
    description: "Misfits banding together into a warm, chosen family.",
  },
  "revenge-plot": {
    label: "Revenge plot",
    description:
      "Someone getting even, a satisfying comeuppance for the wronged.",
  },
  "workplace-comedy": {
    label: "Workplace comedy",
    description: "Office antics and ensemble banter among coworkers.",
  },
  "survival-story": {
    label: "Survival story",
    description:
      "Stranded or isolated, fighting to stay alive against the environment.",
  },
  "time-loop-puzzle": {
    label: "Time-loop puzzle",
    description:
      "Repeating days or branching timelines that reward close attention.",
  },
  "body-horror": {
    label: "Body horror",
    description:
      "Visceral transformation and dread, unsettling physical change.",
  },
  "cozy-mystery": {
    label: "Cozy mystery",
    description: "Light whodunits with comforting small-town sleuthing.",
  },
  "teen-drama": {
    label: "Teen drama",
    description: "High-school angst, friendship, and firsts.",
  },
  "anti-hero-journey": {
    label: "Anti-hero journey",
    description: "A flawed protagonist you root for despite themselves.",
  },
  "slice-of-life": {
    label: "Slice of life",
    description:
      "Everyday moments told through gentle, observational storytelling.",
  },
  "dystopian-future": {
    label: "Dystopian future",
    description: "Bleak societies and rebellion against control.",
  },
  "buddy-comedy": {
    label: "Buddy comedy",
    description: "Mismatched pairs with strong comedic chemistry.",
  },
  "tearjerker-romance": {
    label: "Tearjerker romance",
    description:
      "A love story that ends in heartbreak rather than a happy ending.",
  },
  "monster-movie": {
    label: "Monster movie",
    description: "Creatures, kaiju, or things actively hunting people.",
  },
  "binge-worthy-series": {
    label: "Built for bingeing",
    description: "Long serialized arcs designed to be watched in a marathon.",
  },
};

// ============================================================
// Embedding cache — shared by the vibe path and the mood path, and now
// keyed by media type since movie id 550 and tv id 550 are different
// titles on TMDB (they don't share an id namespace).
// ============================================================
const embeddingCache = new Map(); // cacheKey -> vector

async function getCachedEmbedding(text, cacheKey) {
  if (cacheKey && embeddingCache.has(cacheKey))
    return embeddingCache.get(cacheKey);
  const vec = await generateEmbedding(text);
  if (cacheKey) embeddingCache.set(cacheKey, vec);
  return vec;
}

// Mood description embeddings computed once at startup — 40 of them,
// never change at runtime.
let moodEmbeddings = null;
const moodEmbeddingsReady = (async () => {
  moodEmbeddings = {};
  for (const [key, mood] of Object.entries(MOODS)) {
    moodEmbeddings[key] = await getCachedEmbedding(
      mood.description,
      `mood:${key}`,
    );
  }
})();

// ============================================================
// TMDB helpers
// ============================================================

const posterUrl = (path) =>
  path ? `https://image.tmdb.org/t/p/w500${path}` : null;

const buildGenreIds = (genres = [], map) =>
  genres.map((g) => map[g.toLowerCase()]).filter((id) => id != null); // drops unmapped words and TV's null Horror

const buildCountryCode = (country) =>
  country ? COUNTRY_MAP[country.toLowerCase()] : null;

async function discoverMovies(params) {
  const res = await axios.get("https://api.themoviedb.org/3/discover/movie", {
    params: { api_key: TMDB_API_KEY, ...params },
  });
  return res.data.results;
}

async function discoverTv(params) {
  const res = await axios.get("https://api.themoviedb.org/3/discover/tv", {
    params: { api_key: TMDB_API_KEY, ...params },
  });
  return res.data.results;
}

async function fetchMoviesByKeyword(query) {
  const res = await axios.get("https://api.themoviedb.org/3/search/movie", {
    params: { api_key: TMDB_API_KEY, query, language: "en-US", page: 1 },
  });
  return res.data.results;
}

async function fetchShowsByKeyword(query) {
  const res = await axios.get("https://api.themoviedb.org/3/search/tv", {
    params: { api_key: TMDB_API_KEY, query, language: "en-US", page: 1 },
  });
  return res.data.results;
}

// page param added so the mood pool can pull several pages per list
// instead of just page 1 (~20 items), which was starving one media type.
async function fetchPopularMovies(page = 1) {
  const res = await axios.get("https://api.themoviedb.org/3/movie/popular", {
    params: { api_key: TMDB_API_KEY, page },
  });
  return res.data.results;
}

async function fetchTopRatedMovies(page = 1) {
  const res = await axios.get("https://api.themoviedb.org/3/movie/top_rated", {
    params: { api_key: TMDB_API_KEY, page },
  });
  return res.data.results;
}

async function fetchPopularShows(page = 1) {
  const res = await axios.get("https://api.themoviedb.org/3/tv/popular", {
    params: { api_key: TMDB_API_KEY, page },
  });
  return res.data.results;
}

async function fetchTopRatedShows(page = 1) {
  const res = await axios.get("https://api.themoviedb.org/3/tv/top_rated", {
    params: { api_key: TMDB_API_KEY, page },
  });
  return res.data.results;
}

// Resolve free-text mood/tone words into real TMDB keyword IDs. This is
// what "dark", "atmospheric", "neo-noir" should hit instead of being
// smuggled into a genre map.
async function resolveKeywordIds(words = []) {
  if (!words.length) return [];
  const lookups = await Promise.all(
    words.map((w) =>
      axios
        .get("https://api.themoviedb.org/3/search/keyword", {
          params: { api_key: TMDB_API_KEY, query: w },
        })
        .then((r) => r.data.results?.[0]?.id)
        .catch(() => null),
    ),
  );
  return lookups.filter(Boolean);
}

async function resolvePersonIds(names = []) {
  if (!names.length) return [];
  const lookups = await Promise.all(
    names.map((name) =>
      axios
        .get("https://api.themoviedb.org/3/search/person", {
          params: { api_key: TMDB_API_KEY, query: name },
        })
        .then((r) => r.data.results?.[0]?.id)
        .catch(() => null),
    ),
  );
  return lookups.filter(Boolean);
}

// ============================================================
// Normalization — one shape for every path, so the frontend never branches
// on which engine answered. `score` is present only on ranked (vibe/mood)
// results; facet results rely on TMDB's own sort_by ordering instead.
// ============================================================

function normalizeMovie(m, extra = {}) {
  return {
    id: m.id,
    media_type: "movie",
    title: m.title,
    poster: posterUrl(m.poster_path),
    year: m.release_date?.split("-")[0] || "",
    rating: m.vote_average,
    overview: m.overview,
    genres: m.genre_ids,
    ...extra,
  };
}

function normalizeShow(s, extra = {}) {
  return {
    id: s.id,
    media_type: "tv",
    title: s.name,
    poster: posterUrl(s.poster_path),
    year: s.first_air_date?.split("-")[0] || "",
    rating: s.vote_average,
    overview: s.overview,
    genres: s.genre_ids,
    ...extra,
  };
}

// ============================================================
// Path 1 — natural language, LLM extraction -> structured filters
// ============================================================

async function extractFilters(query) {
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
          "preferHighlyRated": false
        }

        - "mediaType": "movie" if films/movies are mentioned specifically (or
          nothing either way — default "movie" only when truly ambiguous).
          "tv" for series, shows, episodes, seasons, or region-specific TV
          terms like "K-drama". "all" only if both are explicitly requested.
        - "genres" must only use: crime, thriller, drama, action, horror,
          mystery, comedy, animated, documentary, fantasy, adventure,
          family, war. A bare plural like "dramas" or "comedies" still
          counts as its singular genre.
        - "moodKeywords": tone/atmosphere/style words that are NOT one of
          the genres above — e.g. "dark", "atmospheric", "slow burn",
          "neo-noir". Up to 3. Empty if the query has no tone beyond genre.
        - "cast": real actor or director full names mentioned. Empty if none.
        - "country" must be a full country name (e.g. "South Korea"), not a code.
        - "minRating": 0-10 ONLY if an explicit threshold is asked for
          (e.g. "rated above 8"). Otherwise null.
        - "preferHighlyRated": true for "highly rated", "best", "acclaimed"
          with no specific number.
        `,
      },
      { role: "user", content: query },
    ],
  });

  return JSON.parse(completion.choices[0].message.content);
}

// A query only needs the facet (hard-filter) path if it has something TMDB
// can filter on exactly. moodKeywords alone do NOT count — that's the vibe
// path's job. This is the line that fixes mood-only queries returning junk:
// they now go to embedding ranking instead of a bare with_keywords lookup.
function hasHardFacets(filters) {
  return Boolean(
    (filters.genres && filters.genres.length) ||
    (filters.cast && filters.cast.length) ||
    filters.country ||
    filters.fromYear ||
    filters.toYear ||
    filters.minRating ||
    filters.preferHighlyRated,
  );
}

async function runFacetSearch(filters) {
  const countryCode = buildCountryCode(filters.country);
  const languageCode = countryCode ? COUNTRY_LANGUAGE_MAP[countryCode] : null;

  const [keywordIds, personIds] = await Promise.all([
    resolveKeywordIds(filters.moodKeywords),
    resolvePersonIds(filters.cast),
  ]);

  const effectiveMediaType = filters.mediaType || "movie";
  const wantMovies = effectiveMediaType !== "tv";
  const wantShows = effectiveMediaType !== "movie";

  const sortBy =
    filters.preferHighlyRated || filters.minRating
      ? "vote_average.desc"
      : "popularity.desc";

  const sharedParams = (genreIds) => ({
    sort_by: sortBy,
    ...(genreIds.length && { with_genres: genreIds.join(",") }),
    ...(keywordIds.length && { with_keywords: keywordIds.join("|") }),
    ...(countryCode && { with_origin_country: countryCode }),
    ...(languageCode && { with_original_language: languageCode }),
    ...(filters.minRating && { "vote_average.gte": filters.minRating }),
    ...((filters.preferHighlyRated || filters.minRating) && {
      "vote_count.gte": 50,
    }),
  });

  const requests = [
    wantMovies
      ? discoverMovies({
          ...sharedParams(buildGenreIds(filters.genres, GENRE_MAP_MOVIE)),
          ...(personIds.length && { with_cast: personIds.join("|") }),
          ...(filters.fromYear && {
            "primary_release_date.gte": `${filters.fromYear}-01-01`,
          }),
          ...(filters.toYear && {
            "primary_release_date.lte": `${filters.toYear}-12-31`,
          }),
        })
      : Promise.resolve([]),
    wantShows
      ? discoverTv({
          ...sharedParams(buildGenreIds(filters.genres, GENRE_MAP_TV)),
          ...(personIds.length && { with_people: personIds.join("|") }),
          ...(filters.fromYear && {
            "first_air_date.gte": `${filters.fromYear}-01-01`,
          }),
          ...(filters.toYear && {
            "first_air_date.lte": `${filters.toYear}-12-31`,
          }),
        })
      : Promise.resolve([]),
  ];

  const [movies, shows] = await Promise.all(requests);

  return [
    ...movies.map((m) => normalizeMovie(m)),
    ...shows.map((s) => normalizeShow(s)),
  ];
}

// ============================================================
// Path 2 — vibe search (no hard facets). Embedding similarity over a
// merged movie + TV candidate pool, scoped by mediaType when the query
// signals one ("series", "show", "K-drama" -> tv; otherwise both).
// ============================================================

async function collectVibePool(query, keywordIds, wantMovies, wantShows) {
  const movieRequests = wantMovies
    ? [
        fetchMoviesByKeyword(query),
        fetchPopularMovies(),
        ...(keywordIds.length
          ? [
              discoverMovies({
                with_keywords: keywordIds.join("|"),
                sort_by: "popularity.desc",
              }),
            ]
          : []),
      ]
    : [];

  const showRequests = wantShows
    ? [
        fetchShowsByKeyword(query),
        fetchPopularShows(),
        ...(keywordIds.length
          ? [
              discoverTv({
                with_keywords: keywordIds.join("|"),
                sort_by: "popularity.desc",
              }),
            ]
          : []),
      ]
    : [];

  const [movieResponses, showResponses] = await Promise.all([
    Promise.all(movieRequests),
    Promise.all(showRequests),
  ]);

  const seen = new Set();
  const pool = [];

  for (const movie of movieResponses.flat()) {
    const key = `movie-${movie.id}`;
    if (!seen.has(key) && movie.overview && movie.poster_path) {
      seen.add(key);
      pool.push({ ...movie, __mediaType: "movie" });
    }
  }
  for (const show of showResponses.flat()) {
    const key = `tv-${show.id}`;
    if (!seen.has(key) && show.overview && show.poster_path) {
      seen.add(key);
      pool.push({ ...show, __mediaType: "tv" });
    }
  }
  return pool;
}

async function scorePool(pool, targetVector) {
  const scored = await Promise.all(
    pool.map(async (item) => {
      const cacheKey = `${item.__mediaType}:${item.id}`;
      const itemEmbedding = await getCachedEmbedding(item.overview, cacheKey);
      let score = cosine(targetVector, itemEmbedding) ?? 0;
      if (item.vote_average) score += (item.vote_average / 10) * 0.1;

      return item.__mediaType === "tv"
        ? normalizeShow(item, { score: Math.min(score, 1) })
        : normalizeMovie(item, { score: Math.min(score, 1) });
    }),
  );
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 15);
}

async function runVibeSearch(query, filters) {
  const keywordIds = await resolveKeywordIds(filters?.moodKeywords || []);

  const effectiveMediaType = filters?.mediaType || "movie";
  const wantMovies = effectiveMediaType !== "tv";
  const wantShows = effectiveMediaType !== "movie";

  const pool = await collectVibePool(query, keywordIds, wantMovies, wantShows);
  const queryEmbedding = await getCachedEmbedding(query); // no cache key — raw query text varies per request

  return scorePool(pool, queryEmbedding);
}

// ============================================================
// Path 3 — curated mood (chip click, no query text). mediaType is
// optional here since a chip carries no text signal; defaults to
// searching both movies and TV.
//
// Movie and TV pools are kept and scored SEPARATELY, then merged with an
// equal quota from each — otherwise whichever type happens to score
// higher on average dominates the merged top-N (this was the cause of the
// TV-heavy "family-safe" results). Pulls 3 pages per list (~120 raw items
// per side before dedup) so there's enough pool depth to fill 40 results.
// ============================================================

async function getMoodCandidatePool(mediaType = "all") {
  const wantMovies = mediaType !== "tv";
  const wantShows = mediaType !== "movie";
  const pages = [1, 2, 3];

  const [movieResults, showResults] = await Promise.all([
    wantMovies
      ? Promise.all(
          pages.flatMap((p) => [fetchPopularMovies(p), fetchTopRatedMovies(p)]),
        )
      : [],
    wantShows
      ? Promise.all(
          pages.flatMap((p) => [fetchPopularShows(p), fetchTopRatedShows(p)]),
        )
      : [],
  ]);

  const dedupe = (lists, type) => {
    const seen = new Set();
    const pool = [];
    for (const item of lists.flat()) {
      const key = `${type}-${item.id}`;
      if (!seen.has(key) && item.overview && item.poster_path) {
        seen.add(key);
        pool.push({ ...item, __mediaType: type });
      }
    }
    return pool;
  };

  return {
    moviePool: dedupe(movieResults, "movie"),
    showPool: dedupe(showResults, "tv"),
  };
}

async function scoreItems(items, targetVector) {
  return Promise.all(
    items.map(async (item) => {
      const cacheKey = `${item.__mediaType}:${item.id}`;
      const itemEmbedding = await getCachedEmbedding(item.overview, cacheKey);
      let score = cosine(targetVector, itemEmbedding) ?? 0;
      if (item.vote_average) score += (item.vote_average / 10) * 0.1;
      score = Math.min(score, 1);
      return item.__mediaType === "tv"
        ? normalizeShow(item, { score })
        : normalizeMovie(item, { score });
    }),
  );
}

async function scoreBalancedPool(moviePool, showPool, targetVector, { total = 40 } = {}) {
  const wantMovies = moviePool.length > 0;
  const wantShows = showPool.length > 0;
  const perType = wantMovies && wantShows ? Math.ceil(total / 2) : total;

  const [scoredMovies, scoredShows] = await Promise.all([
    scoreItems(moviePool, targetVector),
    scoreItems(showPool, targetVector),
  ]);

  scoredMovies.sort((a, b) => b.score - a.score);
  scoredShows.sort((a, b) => b.score - a.score);

  return [...scoredMovies.slice(0, perType), ...scoredShows.slice(0, perType)].sort(
    (a, b) => b.score - a.score,
  );
}

async function runMoodSearch(moodKey, mediaType = "all") {
  if (!MOODS[moodKey]) return null;

  await moodEmbeddingsReady;
  const moodVector = moodEmbeddings[moodKey];
  const { moviePool, showPool } = await getMoodCandidatePool(mediaType);

  return scoreBalancedPool(moviePool, showPool, moodVector, { total: 40 });
}

// ============================================================
// Single entry point for "What do you want to watch?"
// { mood: "rainy-sunday", mediaType?: "movie"|"tv"|"all" } -> mood path
// { query: "..." }                                         -> LLM decides facet vs vibe
// ============================================================

async function discoverSearch(req, res) {
  try {
    const { query, mood, mediaType } = req.body;

    if (mood) {
      const results = await runMoodSearch(mood, mediaType || "all");
      if (results === null)
        return res.status(400).json({ message: "Unknown mood" });
      return res.json({ intent: "mood", mood, results });
    }

    if (!query || !query.trim()) {
      return res.status(400).json({ message: "Query or mood required" });
    }

    const filters = await extractFilters(query);

    if (hasHardFacets(filters)) {
      const results = await runFacetSearch(filters);
      return res.json({ intent: "facet", filters, results });
    }

    const results = await runVibeSearch(query, filters);
    return res.json({ intent: "vibe", filters, results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Discover search failed" });
  }
}

// GET counterpart on the same route — static list, no body, cacheable.
// Lets the frontend render mood chips from one source of truth.
function getMoods(req, res) {
  const options = Object.entries(MOODS).map(([key, mood]) => ({
    key,
    label: mood.label,
  }));
  res.json(options);
}

module.exports = { discoverSearch, getMoods };