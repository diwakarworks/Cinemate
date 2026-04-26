import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BiArrowBack, BiX, BiCheck, BiPlus } from "react-icons/bi";
import { FiSearch } from "react-icons/fi";
import axios from "axios";

const API_URL = "https://cinemate-6k9l.onrender.com";
const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const CreateListPage = () => {
  const { userId, listId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!listId;

  const [listName, setListName] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState([]); // unified list: each item has a `type: 'movie' | 'series'`
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing) fetchListData();
  }, [listId]);

  const fetchListData = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${API_URL}/api/lists/${listId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = response.data;
      setListName(list.name);
      setDescription(list.description || "");

      // Merge movies and series into one unified array with type tags
      const movies = (list.movies || []).map((m) => ({ ...m, type: "movie" }));
      const series = (list.series || []).map((s) => ({ ...s, type: "series" }));
      setItems([...movies, ...series]);
    } catch (error) {
      console.error("Error fetching list:", error);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    try {
      // Search both movies AND series simultaneously
      const [movieRes, tvRes] = await Promise.all([
        axios.get(
          `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`,
        ),
        axios.get(
          `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`,
        ),
      ]);

      const movies = movieRes.data.results
        .slice(0, 5)
        .map((m) => ({ ...m, mediaType: "movie" }));
      const tvShows = tvRes.data.results
        .slice(0, 5)
        .map((s) => ({ ...s, mediaType: "series" }));

      // Interleave results so it doesn't feel like two separate lists
      const combined = [];
      const max = Math.max(movies.length, tvShows.length);
      for (let i = 0; i < max; i++) {
        if (movies[i]) combined.push(movies[i]);
        if (tvShows[i]) combined.push(tvShows[i]);
      }
      setSearchResults(combined);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => handleSearch(query), 500);
  };

  const addItemToList = async (item) => {
    const isMovie = item.mediaType === "movie";
    const token = localStorage.getItem("token");
    try {
      if (isMovie) {
        const response = await axios.post(
          `${API_URL}/api/lists/${listId}/movies`,
          {
            tmdbId: item.id,
            title: item.title,
            year: item.release_date
              ? new Date(item.release_date).getFullYear()
              : "",
            posterPath: item.poster_path,
            position: items.length + 1,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const updated = (response.data.movies || []).map((m) => ({
          ...m,
          type: "movie",
        }));
        setItems((prev) => [
          ...prev.filter((i) => i.type !== "movie"),
          ...updated,
        ]);
      } else {
        const response = await axios.post(
          `${API_URL}/api/lists/${listId}/series`,
          {
            tmdbId: item.id,
            title: item.name,
            year: item.first_air_date
              ? new Date(item.first_air_date).getFullYear()
              : "",
            posterPath: item.poster_path,
            position: items.length + 1,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const updated = (response.data.series || []).map((s) => ({
          ...s,
          type: "series",
        }));
        setItems((prev) => [
          ...prev.filter((i) => i.type !== "series"),
          ...updated,
        ]);
      }
      closeModal();
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const removeItem = async (item) => {
    const token = localStorage.getItem("token");
    try {
      if (item.type === "movie") {
        await axios.delete(
          `${API_URL}/api/lists/${listId}/movies/${item.tmdbId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      } else {
        await axios.delete(
          `${API_URL}/api/lists/${listId}/series/${item.tmdbId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      }
      setItems((prev) =>
        prev.filter((i) => !(i.tmdbId === item.tmdbId && i.type === item.type)),
      );
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSaveList = async () => {
    if (!listName.trim()) {
      alert("Please enter a list name");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const listData = { name: listName, description, user: userId };
      if (isEditing) {
        await axios.put(`${API_URL}/api/lists/${listId}`, listData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_URL}/api/lists`, listData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      navigate(`/user/${userId}`);
    } catch (error) {
      console.error("Error saving list:", error);
      alert("Failed to save list");
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <BiArrowBack
              className="w-8 h-8 cursor-pointer hover:text-blue-500"
              onClick={() => navigate(`/user/${userId}`)}
            />
            <h1 className="text-3xl font-bold">
              {isEditing ? "Edit List" : "New List"}
            </h1>
          </div>
          <button
            onClick={handleSaveList}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
          >
            <BiCheck className="w-5 h-5" /> Save List
          </button>
        </div>

        {/* Form */}
        <div className="bg-stone-800 rounded-lg p-6 mb-6">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">List Name</label>
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              className="w-full bg-stone-700 border border-stone-600 text-black rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Enter list name..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-stone-700 border border-stone-600 text-black rounded-lg px-4 py-2 h-24 resize-none focus:outline-none focus:border-blue-500"
              placeholder="Add description (optional)..."
            />
          </div>
        </div>

        {/* Items Section — no tabs */}
        <div className="bg-stone-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl ml-5 font-semibold">{items.length > 1 ? `Items (${items.length})` : 'Item (1)'}</h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
            >
              <BiPlus className="w-5 h-5" /> Add 
            </button>
          </div>

          <div className="space-y-4">
            {items.length > 0 ? (
              items.map((item) => (
                <div
                  key={`${item.type}-${item.tmdbId}`}
                  className="flex items-center gap-4 bg-stone-700 rounded-lg p-4"
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w92${item.posterPath}`}
                    alt={item.title}
                    className="w-16 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-stone-600 text-gray-300">
                        {item.type === "movie" ? "🎬 Movie" : "📺 Series"}
                      </span>
                    </div>
                    <h4 className="font-semibold">
                      {item.title} {item.year && `(${item.year})`}
                    </h4>
                  </div>
                  <button
                    onClick={() => removeItem(item)}
                    className="text-red-400 hover:text-red-300 p-2"
                  >
                    <BiX className="w-6 h-6" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                No items added yet. Search for a movie or series to get started.
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-stone-800 rounded-lg p-6 w-full max-w-2xl max-h-[32rem] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Browse
                </h3>
                <button onClick={closeModal}>
                  <BiX className="w-6 h-6" />
                </button>
              </div>

              <div className="relative mb-4">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full bg-stone-700 border text-black border-stone-600 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="Search content..."
                  autoFocus
                />
              </div>

              <div className="overflow-y-auto flex-1">
                {loading && (
                  <div className="text-center py-4 text-gray-400">
                    Searching...
                  </div>
                )}
                {searchResults.map((item) => (
                  <div
                    key={`${item.mediaType}-${item.id}`}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-stone-700 rounded-lg cursor-pointer"
                    onClick={() => addItemToList(item)}
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                      alt={item.title || item.name}
                      className="w-8 h-12 object-cover rounded flex-shrink-0" // ← was w-12 h-16
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {item.title || item.name}
                      </h4>{" "}
                      {/* truncate prevents overflow */}
                      <p className="text-xs text-gray-400">
                        {item.release_date || item.first_air_date
                          ? new Date(
                              item.release_date || item.first_air_date,
                            ).getFullYear()
                          : "Unknown"}
                        {" · "}
                        <span
                          className={
                            item.mediaType === "movie"
                              ? "text-blue-400"
                              : "text-purple-400"
                          }
                        >
                          {item.mediaType === "movie" ? "Movie" : "TV"}
                        </span>
                      </p>
                    </div>
                    <BiPlus className="w-4 h-4 text-green-400 flex-shrink-0" />
                  </div>
                ))}
                {searchQuery && !loading && searchResults.length === 0 && (
                  <div className="text-center py-4 text-gray-400">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateListPage;
