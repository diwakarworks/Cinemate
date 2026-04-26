import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { BiArrowBack } from "react-icons/bi";

const API_URL = "https://cinemate-6k9l.onrender.com";
const apiKey = process.env.REACT_APP_TMDB_API_KEY;

const FilmographyManager = () => {
  const { userId, directorId } = useParams();
  const [rankingData, setRankingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [directorInfo, setDirectorInfo] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    films: [],
  });
  const [newFilm, setNewFilm] = useState({
    tmdbId: "",
    title: "",
    year: "",
    poster_path: "",
    rank: 1,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [userId, directorId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Try to fetch existing ranking
      try {
        const response = await axios.get(
          `${API_URL}/api/ranking/${userId}/${directorId}`,
        );
        setRankingData(response.data.ranking);
        setFormData({
          name: response.data.ranking.name || "",
          bio: response.data.ranking.bio || "",
          films: response.data.ranking.films || [],
        });
      } catch (rankingError) {
        // If no ranking exists, fetch director info from TMDB
        const tmdbResponse = await axios.get(
          `https://api.themoviedb.org/3/person/${directorId}?api_key=${apiKey}`,
        );
        setDirectorInfo(tmdbResponse.data);
        setFormData({
          name: tmdbResponse.data.name || "",
          bio: tmdbResponse.data.biography || "",
          films: [],
        });
        setShowAddForm(true);
      }
    } catch (err) {
      setError("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  const searchMovies = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}`,
      );
      setSearchResults(response.data.results.slice(0, 5));
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const addFilmToList = (movie) => {
    const newRank = Math.max(...formData.films.map((f) => f.rank), 0) + 1;
    const filmToAdd = {
      tmdbId: movie.id,
      mediaType: movie.media_type,
      title: movie.title,
      year: new Date(movie.release_date).getFullYear(),
      poster_path: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : "",
      rank: newRank,
    };

    setFormData((prev) => ({
      ...prev,
      films: [...prev.films, filmToAdd],
    }));

    setSearchQuery("");
    setSearchResults([]);
  };

  const removeFilm = (tmdbId) => {
    setFormData((prev) => ({
      ...prev,
      films: prev.films.filter((film) => film.tmdbId !== tmdbId),
    }));
  };

  const updateFilmRank = (tmdbId, newRank) => {
    setFormData((prev) => ({
      ...prev,
      films: prev.films.map((film) =>
        film.tmdbId === tmdbId ? { ...film, rank: parseInt(newRank) } : film,
      ),
    }));
  };

  const saveRanking = async () => {
    try {
      const token = localStorage.getItem("token");

      // Debug logging
      console.log("Attempting to save ranking...");
      console.log("Token exists:", !!token);

      if (!token) {
        setError("Please login to save rankings");
        return;
      }

      // Check token format
      if (!token.includes(".")) {
        setError("Invalid token format. Please login again.");
        localStorage.removeItem("token");
        return;
      }

      setSaving(true);

      const response = await axios.post(
        `${API_URL}/api/ranking/${userId}/${directorId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Save successful:", response.data);
      await fetchData();
      setIsEditing(false);
      setShowAddForm(false);
    } catch (error) {
      console.error("Save error:", {
        status: error.response?.status,
        message: error.response?.data?.message,
        headers: error.response?.headers,
      });

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        setError("Session expired. Please login again.");
        // Redirect to login page
        // navigate('/login');
      } else {
        setError(error.response?.data?.message || "Error saving ranking");
      }
    } finally {
      setSaving(false);
    }
  };

  const getRankStyle = (rank) => {
    if (rank <= 3) {
      return {
        bg: "bg-gradient-to-br from-yellow-400 to-orange-500",
        text: "text-white",
        shadow: "shadow-xl shadow-orange-500/30",
      };
    } else if (rank <= 10) {
      return {
        bg: "bg-gradient-to-br from-gray-300 to-gray-400",
        text: "text-gray-900",
        shadow: "shadow-lg shadow-gray-400/20",
      };
    } else {
      return {
        bg: "bg-gradient-to-br from-orange-600 to-orange-700",
        text: "text-white",
        shadow: "shadow-lg shadow-orange-600/20",
      };
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading filmography...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center bg-red-900/20 border border-red-500/30 rounded-lg p-8">
          <p className="text-red-400 text-lg">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header Section */}
        <div className="relative mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <BiArrowBack
                className="w-10 h-10  -ml-10 cursor-pointer text-white hover:text-blue-500"
                onClick={() => navigate(-1)}
              />
              <div>
                <h1 className="text-4xl  font-bold text-white mb-2">
                  {formData.name}{" "}
                  <span className="text-orange-500">Filmography</span>
                </h1>
                <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full"></div>
              </div>
            </div>

            <div className="flex gap-3">
              {rankingData && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                >
                  Edit Ranking
                </button>
              )}
            </div>
          </div>

          {/* Bio Section */}
          {isEditing || showAddForm ? (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mt-6">
              <label className="block -ml-1  text-white font-medium mb-2">
                Director Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bio: e.target.value }))
                }
                className="w-full bg-gray-700 -ml-5 text-white rounded-lg p-4 min-h-32 resize-none focus:ring-2 focus:ring-orange-500 focus:outline-none"
                placeholder="Enter director biography..."
              />
            </div>
          ) : (
            formData.bio && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mt-6">
                <p className="text-gray-300 text-lg -ml-1 leading-relaxed max-w-4xl">
                  {formData.bio}
                </p>
              </div>
            )
          )}
        </div>

        {/* Add Film Section */}
        {(isEditing || showAddForm) && (
          <div className="mb-12 bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl -ml-3 font-bold text-white mb-6 flex items-center gap-3">
              Add Films to Ranking
            </h2>

            <div className="relative mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchMovies(e.target.value);
                }}
                placeholder="Search for movies to add..."
                className="w-full -ml-4 bg-gray-700 text-white rounded-lg p-4 pr-12 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
              <svg
                className="absolute right-4 top-4 w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>

              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-gray-800 rounded-lg mt-2 shadow-2xl border border-gray-600 z-10">
                  {searchResults.map((movie) => (
                    <button
                      key={movie.id}
                      onClick={() => addFilmToList(movie)}
                      className="w-full p-4 text-left hover:bg-gray-700 transition-colors flex items-center gap-4 first:rounded-t-lg last:rounded-b-lg"
                    >
                      <img
                        src={
                          movie.poster_path
                            ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                            : "https://via.placeholder.com/92x138/374151/9CA3AF?text=No+Image"
                        }
                        alt={movie.title}
                        className="w-12 ml-4 h-18 object-cover rounded"
                      />
                      <div>
                        <p className="text-white font-medium">
                          {movie.title || movie.name}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {movie.release_date || movie.first_air_date
                            ? new Date(
                                movie.release_date || movie.first_air_date,
                              ).getFullYear()
                            : "Unknown Year"}
                          {" • "}
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded ${movie.media_type === "tv" ? "bg-blue-600" : "bg-orange-600"} text-white`}
                          >
                            {movie.media_type === "tv" ? "TV" : "Movie"}
                          </span>
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={saveRanking}
                disabled={saving || formData.films.length === 0}
                className="px-8 py-3 -ml-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>Save Ranking</>
                )}
              </button>

              <button
                onClick={() => {
                  setIsEditing(false);
                  setShowAddForm(false);
                  if (rankingData) {
                    setFormData({
                      name: rankingData.name,
                      bio: rankingData.bio,
                      films: rankingData.films || [],
                    });
                  }
                }}
                className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Films List/Grid */}
        {formData.films.length > 0 ? (
          <div className="space-y-8">
            {isEditing || showAddForm ? (
              // Editable List View
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Current Films ({formData.films.length})
                </h2>
                {formData.films
                  .sort((a, b) => a.rank - b.rank)
                  .map((film) => (
                    <div
                      key={film.tmdbId}
                      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 flex items-center gap-6"
                    >
                      <img
                        src={
                          film.poster_path ||
                          "https://via.placeholder.com/80x120/374151/9CA3AF?text=No+Image"
                        }
                        alt={film.title}
                        className="w-16  h-24 object-cover rounded-lg"
                      />

                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white">
                          {film.title}
                        </h3>
                        <p className="text-gray-400">{film.year}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <label className="text-gray-300 font-medium">
                            Rank:
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={film.rank}
                            onChange={(e) =>
                              updateFilmRank(film.tmdbId, e.target.value)
                            }
                            className="w-20 bg-gray-700 text-white rounded px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          />
                        </div>

                        <button
                          onClick={() => removeFilm(film.tmdbId)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              // Display Grid View
              <div className="grid ml-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {formData.films
                  .sort((a, b) => a.rank - b.rank)
                  .map((film) => {
                    const rankStyle = getRankStyle(film.rank);
                    return (
                      <div
                        key={film.tmdbId}
                        className="group relative border border-stone-500 bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 hover:scale-105 hover:bg-gray-800/90"
                      >
                        {/* Rank Badge */}
                        <div className="absolute -top-7 -right-3 z-10">
                          <div
                            className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${rankStyle.bg} ${rankStyle.text} ${rankStyle.shadow} transform transition-all duration-300 group-hover:scale-110 border-4 border-gray-900`}
                          >
                            {film.rank}
                          </div>
                        </div>

                        {/* Movie Poster */}
                        <Link
                          to={`/movie/${film.tmdbId}`}
                          className="block hover:scale-105 transition-transform duration-300"
                        >
                          <div className="relative overflow-hidden rounded-xl mb-4">
                            <img
                              src={
                                film.poster_path ||
                                "https://via.placeholder.com/300x450/374151/9CA3AF?text=No+Image"
                              }
                              alt={film.title}
                              className="w-full -ml-2  h-80 object-cover transition-transform duration-500 rounded-2xl border-4 border-gray-900 group-hover:border-orange-500"
                            />
                          </div>
                        </Link>

                        {/* Movie Info */}
                        <div className="text-center space-y-2">
                          <Link
                            to={`/movie/${film.tmdbId}`}
                            className="block hover:scale-105 transition-transform duration-300"
                          >
                            <h2 className="text-xl -ml-2 font-bold hover:text-orange-400 text-white transition-colors duration-300 leading-tight">
                              {film.title}
                            </h2>
                          </Link>
                          <p className="text-gray-400  -ml-4 text-lg font-medium">
                            {film.year}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        ) : (
          // Empty State
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">
              {showAddForm
                ? "Start Building Your Filmography"
                : "No Films Ranked Yet"}
            </h3>
            <p className="text-gray-500 mb-8">
              {showAddForm
                ? "Search and add films to create your director ranking."
                : "This director's filmography hasn't been ranked yet."}
            </p>
            {!showAddForm && !rankingData && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 mx-auto"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Start Ranking
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilmographyManager;
