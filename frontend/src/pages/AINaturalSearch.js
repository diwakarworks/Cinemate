import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_URL = "https://cinemate-6k9l.onrender.com"; // Replace with your backend API URL
const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p/w500";


function getPosterUrl(item = {}) {
  const posterValue =
    item.poster ||
    item.poster_url ||
    item.posterUrl ||
    item.poster_path ||
    item.posterPath ||
    null;

  if (!posterValue || typeof posterValue !== "string") {
    return null;
  }

  const poster = posterValue.trim();

  if (!poster) {
    return null;
  }

  // Already a complete URL or a local data/blob URL.
  if (
    poster.startsWith("http://") ||
    poster.startsWith("https://") ||
    poster.startsWith("data:") ||
    poster.startsWith("blob:")
  ) {
    return poster;
  }

  // If the backend returns a path such as /abc.jpg, remove the leading slash
  // before joining it to the TMDB image URL.
  return `${TMDB_IMAGE_URL}/${poster.replace(/^\/+/, "")}`;
}

function normalizeItem(item = {}) {
  const isTv =
    item.media_type === "tv" ||
    item.mediaType === "tv" ||
    Boolean(item.name && !item.title);

  const releaseDate = item.release_date || item.releaseDate || "";
  const firstAirDate = item.first_air_date || item.firstAirDate || "";

  const year =
    item.year ||
    releaseDate.slice(0, 4) ||
    firstAirDate.slice(0, 4) ||
    "";

  return {
    id: item.id,
    media_type: isTv ? "tv" : "movie",
    title: item.title || item.name || "Untitled",
    poster: getPosterUrl(item),
    rating: item.rating ?? item.vote_average ?? null,
    year,
    overview: item.overview || "",
  };
}

const NaturalSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [token] = useState(() => localStorage.getItem("token"));

  useEffect(() => {
    if (!token) {
      setError("No authorization token found");
    }
  }, [token]);

  const runSearch = async (searchQuery) => {
    const trimmed = searchQuery.trim();

    if (!trimmed || loading) {
      return;
    }

    if (!token) {
      setError("No authorization token found");
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/search/natural`,
        { query: trimmed },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data || {};
      const movies = Array.isArray(data.movies) ? data.movies : [];
      const shows = Array.isArray(data.shows) ? data.shows : [];

      // Some APIs return one results array instead of separate movies/shows.
      const apiResults = Array.isArray(data.results) ? data.results : [];
      const combined = [...movies, ...shows, ...apiResults].map(normalizeItem);

      setResults(combined);
      setAppliedFilters(data.filters || null);
    } catch (err) {
      console.error("Natural search error:", err);

      if (err.code === "ERR_NETWORK") {
        setError(
          `Can't reach the server at ${API_URL}. Is the backend running?`
        );
      } else if (err.response) {
        setError(
          `Server error (${err.response.status}): ${
            err.response.data?.message || "Something went wrong"
          }`
        );
      } else {
        setError(err.message || "Something went wrong");
      }

      setResults([]);
      setAppliedFilters(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    runSearch(query);
  };

  const handleExampleClick = (example) => {
    setQuery(example);
    runSearch(example);
  };

  return (
    <div className="min-h-screen text-white950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-16">

        <form onSubmit={handleSubmit} className="mb-5 flex gap-3">
          <div className="relative flex-1">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              className="w-full rounded-full border border-black text-black  px-4 py-3.5 text-sm text-black  placeholder:text-black focus:border-gray-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="whitespace-nowrap rounded-full bg-red-600 px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:text-white900 disabled:text-slate-600"
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </form>

        

        {appliedFilters && !loading && (
          <div className="mb-8 flex flex-wrap gap-2">
            {appliedFilters.genres?.length > 0 && (
              <span className="rounded-full border border-slate-800 text-white900 px-3 py-1 text-xs font-medium text-white">
                {appliedFilters.genres.join(", ")}
              </span>
            )}

            {appliedFilters.country && (
              <span className="rounded-full border border-slate-800 text-white900 px-3 py-1 text-xs font-medium text-white">
                {appliedFilters.country}
              </span>
            )}

            {(appliedFilters.fromYear || appliedFilters.toYear) && (
              <span className="rounded-full border border-slate-800 text-white900 px-3 py-1 text-xs font-medium text-white">
                {appliedFilters.fromYear || "…"}–
                {appliedFilters.toYear || "…"}
              </span>
            )}
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4 md:grid-cols-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div
                  className="rounded-lg text-white900"
                  style={{ aspectRatio: "2 / 3" }}
                />
                <div className="mt-3 h-3 w-4/5 rounded text-white900" />
                <div className="mt-2 h-2.5 w-1/3 rounded text-white900" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-900 bg-red-950 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4 md:grid-cols-6">
            {results.map((item, index) => (
              <Link
                key={`${item.media_type}-${item.id ?? index}`}
                to={`/${item.media_type === "tv" ? "show" : "movie"}/${item.id}`}
                aria-label={`View details for ${item.title}`}
                className="group block"
              >
                <div
                  className="relative overflow-hidden rounded-lg text-white900 ring-1 ring-white/10 transition-transform duration-300 ease-out group-hover:-translate-y-1 group-hover:ring-red-500/50"
                  style={{ aspectRatio: "2 / 3" }}
                >
                  {item.poster ? (
                    <img
                      src={item.poster}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform transform hover:scale-105 hover:shadow-lg hover:brightness-110 duration-300"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center px-2 text-center text-xs text-slate-500">
                      No poster available
                    </div>
                  )}

                  <span className="absolute left-2 top-2 rounded-full border border-white/15 bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-md">
                    {item.media_type === "tv" ? "Series" : "Movie"}
                  </span>
                </div>

                <p className="mt-3 truncate text-sm font-semibold text-white">
                  {item.title}
                </p>

                <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                  <span className="text-amber-400">★</span>
                  <span>
                    {item.rating != null
                      ? Number(item.rating).toFixed(1)
                      : "N/A"}
                  </span>

                  {item.year && (
                    <>
                      <span className="text-slate-700">·</span>
                      <span>{item.year}</span>
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && searched && results.length === 0 && !error && (
          <p className="py-8 text-center text-sm text-slate-500">
            No matches — try a broader query.
          </p>
        )}
      </div>
    </div>
  );
};

export default NaturalSearch;