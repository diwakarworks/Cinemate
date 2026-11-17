import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const apiURL = "https://cinemate-6k9l.onrender.com"; // Replace with your backend API URL

function AISearch() {
  const [query, setQuery] = useState("");
  const [moods, setMoods] = useState([]);
  const [activeMood, setActiveMood] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    async function loadMoods() {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${apiURL}/api/search/discover`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMoods(data);
      } catch (err) {
        console.error("Error fetching moods:", err);
      }
    }
    loadMoods();
  }, []);

  async function runDiscover(body) {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Unauthorized: No token found. Please log in.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post(`${apiURL}/api/search/discover`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMovies(data.results || []);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    if (!query) return;
    setActiveMood(null);
    runDiscover({ query });
  }

  function handleMoodClick(moodKey) {
    setQuery("");
    setSearchOpen(false);
    setActiveMood(moodKey);
    runDiscover({ mood: moodKey });
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSearch();
  }

  function handleSearchClick() {
    if (!searchOpen) {
      setSearchOpen(true);
    } else if (query) {
      handleSearch();
    } else {
      setSearchOpen(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1117] text-white px-10 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-2xl font-black tracking-widest uppercase">
          CINE<span className="text-red-500">AI</span>
        </h1>

        <div className="flex items-center gap-3">
          {searchOpen && (
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Action"
              className="bg-[#1c1f2e] border border-[#2e3247] text-black  placeholder-zinc-500 text-sm rounded-xl px-4 py-2.5 w-72 outline-none focus:border-red-500 transition-all duration-300"
            />
          )}
          <button
            onClick={handleSearchClick}
            className="bg-red-600 hover:bg-red-500 text-white rounded-xl w-10 h-10 flex items-center justify-center transition-all duration-200"
          >
            {searchOpen ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mood chips */}
      {moods.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {moods.map((m) => (
            <button
              key={m.key}
              onClick={() => handleMoodClick(m.key)}
              className={`text-xs font-medium rounded-full px-4 py-2 border transition-all duration-200 ${
                activeMood === m.key
                  ? "bg-red-600 border-red-600 text-white"
                  : "bg-[#1c1f2e] border-[#2e3247] text-zinc-300 hover:border-red-500"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-red-400 text-sm mb-6 border border-red-800 bg-red-950/40 px-4 py-2 rounded-lg w-fit">
          {error}
        </p>
      )}

      {/* Skeletons */}
      {loading && (
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden bg-[#1c1f2e] animate-pulse">
              <div className="h-72 bg-[#252839]" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-[#2e3247] rounded w-3/4" />
                <div className="h-2.5 bg-[#2e3247] rounded w-1/3" />
                <div className="h-2.5 bg-[#2e3247] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Movie Grid */}
      {!loading && movies.length > 0 && (
        <div className="grid grid-cols-5 gap-4">
          {movies.map((movie, index) => (
            <Link
              key={`${movie.media_type}-${movie.id}`}
              to={`/${movie.media_type === "tv" ? "show" : "movie"}/${movie.id}`}
              className={`group relative rounded-2xl overflow-hidden bg-[#1c1f2e] block transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/60 ${
                index === 0 ? "ring-2 ring-red-500/60" : ""
              }`}
            >
              {/* Poster */}
              <div className="relative overflow-hidden h-72">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#1c1f2e] to-transparent" />

                {/* Media type badge */}
                <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wide bg-black/70 text-zinc-200 px-2 py-1 rounded-md">
                  {movie.media_type === "tv" ? "Show" : "Movie"}
                </span>

              </div>

              {/* Info */}
              <div className="px-3 pb-4 pt-1">
                <h2 className="text-sm font-bold text-white truncate group-hover:text-red-400 transition-colors duration-200 mb-1">
                  {movie.title}
                </h2>

                {/* Rating row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400 text-xs">★</span>
                    <span className="text-zinc-300 text-xs font-medium">
                      {movie.rating ? movie.rating.toFixed(1) : "N/A"}
                    </span>
                  </div>
                  <span className="text-zinc-500 text-xs">
                    {movie.year || ""}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && movies.length === 0 && (
        <div className="flex flex-col items-center justify-center mt-40 gap-4 text-zinc-600">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1z" />
          </svg>
          <p className="text-base font-semibold">What do you want to watch?</p>
          <p className="text-sm text-zinc-700">Type a mood, genre, or vibe above</p>
        </div>
      )}
    </div>
  );
}

export default AISearch;