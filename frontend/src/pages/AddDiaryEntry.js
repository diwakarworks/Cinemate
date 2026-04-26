import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Search, X, Calendar, Star, Save } from "lucide-react";
import { useParams } from "react-router-dom";
import axios from "axios";

const FilmDiaryApp = () => {
  const { userId } = useParams();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showDiaryModal, setShowDiaryModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading] = useState(false);

  // Diary entry state
  const [watchedDate, setWatchedDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [saving, setSaving] = useState(false);

  // TMDB API key - replace with your actual API key
  const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;
  const TMDB_BASE_URL = "https://api.themoviedb.org/3";

  // Backend API configuration
  const API_URL = "https://cinemate-6k9l.onrender.com";

  const searchMovies = useCallback(
    async (query) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(
          `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`,
        );
        const data = response.data;
        setSearchResults(data.results || []);
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    },
    [TMDB_API_KEY, TMDB_BASE_URL],
  );

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchMovies(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchMovies]);

  const handleMovieSelect = useCallback((movie) => {
    setSelectedMovie(movie);
    setShowSearchModal(false);
    setShowDiaryModal(true);
  }, []);

  const handleSaveDiary = useCallback(async () => {
    if (!selectedMovie) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("token");

      const diaryEntry = {
        mediaId: selectedMovie.id, 
        mediaType: selectedMovie.media_type || "movie", 
        title: selectedMovie.title || selectedMovie.name, 
        year:
          (selectedMovie.release_date || selectedMovie.first_air_date)?.split(
            "-",
          )[0] || "Unknown",
        posterPath: selectedMovie.poster_path
          ? `https://image.tmdb.org/t/p/original${selectedMovie.poster_path}`
          : "",
        watchedDate,
        rating,
        review,
      };

      const response = await fetch(`${API_URL}/api/diary/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(diaryEntry),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Diary entry saved successfully:", result);

      setShowDiaryModal(false);
      resetDiaryState();
      alert("Diary entry saved successfully!");
    } catch (error) {
      console.error("Failed to save diary entry:", error);
      alert("Failed to save diary entry. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [selectedMovie, watchedDate, rating, review, userId, API_URL]);

  const resetDiaryState = useCallback(() => {
    setSelectedMovie(null);
    setWatchedDate(new Date().toISOString().split("T")[0]);
    setRating(0);
    setReview("");
  }, []);

  // Memoize the SearchModal to prevent re-renders
  const SearchModal = useMemo(() => {
    if (!showSearchModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">
                Add to your films...
              </h2>
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-gray-400 hover:text-black transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="relative">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search for a film..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-700 text-black rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                Searching...
              </div>
            ) : searchResults.length > 0 ? (
              <div className="p-4">
                {searchResults.map((movie) => (
                  <div
                    key={movie.id}
                    onClick={() => handleMovieSelect(movie)}
                    className="flex items-center p-3 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
                  >
                    <img
                      src={
                        movie.poster_path
                          ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                          : "/api/placeholder/60/90"
                      }
                      alt={movie.title}
                      className="w-12 h-18 object-cover rounded mr-4"
                    />
                    <div className="flex-1">
                      <h3 className="text-white font-medium">
                        {movie.title || movie.name}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {(movie.release_date || movie.first_air_date)?.split(
                          "-",
                        )[0] || "Unknown"}{" "}
                        • {movie.overview?.slice(0, 100)}...
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="p-8 text-center text-gray-400">
                No films found. Try a different search term.
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400">
                Start typing to search for films...
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }, [showSearchModal, searchQuery, searchResults, loading, handleMovieSelect]);

  // Memoize the DiaryModal to prevent re-renders
  const DiaryModal = useMemo(() => {
    if (!showDiaryModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setShowDiaryModal(false);
                    setShowSearchModal(true);
                  }}
                  className="text-gray-400 hover:text-white transition-colors px-3 py-1 rounded bg-slate-700"
                >
                  BACK
                </button>
                <h2 className="text-2xl font-bold text-white">I watched...</h2>
              </div>
              <button
                onClick={() => setShowDiaryModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {selectedMovie && (
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-shrink-0">
                  <img
                    src={
                      selectedMovie.poster_path
                        ? `https://image.tmdb.org/t/p/w342${selectedMovie.poster_path}`
                        : "/api/placeholder/200/300"
                    }
                    alt={selectedMovie.title}
                    className="w-48 h-72 object-cover rounded-lg shadow-lg"
                  />
                </div>

                <div className="flex-1 space-y-6">
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-2">
                      {selectedMovie.title || selectedMovie.name}
                      <span className="text-gray-400 font-normal ml-2">
                        (
                        {(
                          selectedMovie.release_date ||
                          selectedMovie.first_air_date
                        )?.split("-")[0] || "Unknown"}
                        )
                      </span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="text-gray-400" size={16} />
                      <span className="text-sm text-gray-300">Watched on</span>
                      <input
                        type="date"
                        value={watchedDate}
                        onChange={(e) => setWatchedDate(e.target.value)}
                        className="bg-slate-700 text-black px-3 py-1 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <textarea
                      key="review-textarea"
                      placeholder="Add a review..."
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      className="w-full h-32 p-4 bg-slate-700 text-black rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Star className="inline mr-2" size={16} />
                        Rating
                      </label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className={`p-1 transition-colors ${star <= rating ? "text-yellow-400" : "text-gray-500"}`}
                          >
                            <Star
                              size={24}
                              fill={star <= rating ? "currentColor" : "none"}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleSaveDiary}
                      disabled={saving}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      <Save size={20} />
                      {saving ? "Saving..." : "SAVE"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }, [
    showDiaryModal,
    selectedMovie,
    watchedDate,
    rating,
    review,
    saving,
    handleSaveDiary,
  ]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
      <div className="text-center">
        <button
          onClick={() => setShowSearchModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
        >
          Log Entry
        </button>
      </div>

      {SearchModal}
      {DiaryModal}
    </div>
  );
};

export default FilmDiaryApp;
