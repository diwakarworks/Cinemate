import React, { useState, useEffect } from "react";
import axios from "axios";
import { Heart } from "lucide-react";

const API_URL = "https://cinemate-6k9l.onrender.com/api/user";

const AddToFavoritesButton = ({ movieId, title, year, posterPath, onStatusChange }) => {
  const [status, setStatus] = useState("default");
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token || !userId) return;

      try {
        const response = await axios.get(`${API_URL}/${userId}/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const favorites = response.data.favorites || response.data;
        console.log("📋 Favorites:", favorites);

        // Check if current movie is in favorites
        const isInFavorites = favorites.some(
          (fav) => {
            const favId = fav.tmdbId || fav.movieId || fav.id;
            return String(favId) === String(movieId);
          }
        );

        if (isInFavorites) {
          setStatus("added");
          localStorage.setItem(`favorites-${movieId}`, "added");
          if (onStatusChange) onStatusChange(true);
        } else {
          setStatus("default");
          localStorage.removeItem(`favorites-${movieId}`);
          if (onStatusChange) onStatusChange(false);
        }
      } catch (err) {
        console.error("❌ Error checking favorites:", err);
      }
    };

    if (userId && movieId) {
      checkFavoriteStatus();

      // Check localStorage for stored status
      const storedStatus = localStorage.getItem(`favorites-${movieId}`);
      if (storedStatus === "added") {
        setStatus("added");
      }
    }
  }, [movieId, userId, onStatusChange]);

  const toggleFavorites = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!movieId) {
        console.error("❌ Movie ID is not available");
        return;
      }

      if (!token) {
        alert("Please login to add favorites");
        return;
      }

      setLoading(true);

      if (status === "default" || status === "removed") {
        // Add to favorites
        console.log("➕ Adding to favorites:", { movieId, title, year, posterPath });
        
        await axios.post(
          `${API_URL}/${userId}/favorites`,
          {
            movieId: movieId,
            title: title,
            year: year,
            poster_path: posterPath,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setStatus("added");
        localStorage.setItem(`favorites-${movieId}`, "added");
        if (onStatusChange) onStatusChange(true);
        console.log("✅ Added to favorites");
      } else {
        // Remove from favorites
        console.log("➖ Removing from favorites:", movieId);
        
        await axios.delete(`${API_URL}/${userId}/favorites`, {
          data: { movieId: movieId },
          headers: { Authorization: `Bearer ${token}` },
        });

        setStatus("removed");
        localStorage.setItem(`favorites-${movieId}`, "removed");
        if (onStatusChange) onStatusChange(false);
        console.log("🔵 Removed from favorites");

        // Reset to default after 5 seconds
        setTimeout(() => {
          setStatus("default");
          localStorage.removeItem(`favorites-${movieId}`);
          console.log("🔄 Reset to default");
        }, 5000);
      }
    } catch (error) {
      console.error("❌ Error toggling favorites:", error.response?.data || error.message);
      
      if (error.response?.status === 400) {
        // Already in favorites or already removed
        setStatus(status === "added" ? "removed" : "added");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorites}
      disabled={loading}
      className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${
        loading ? "opacity-50 cursor-not-allowed" : ""
      }`}
      title={
        status === "added"
          ? "Remove from favorites"
          : status === "removed"
          ? "Removed from favorites"
          : "Add to favorites"
      }
    >
      <Heart
        size={32}
        fill={status === "added" ? "#10b981" : status === "removed" ? "#3b82f6" : "none"}
        stroke={
          status === "added"
            ? "#10b981"
            : status === "removed"
            ? "#3b82f6"
            : "#ef4444"
        }
        strokeWidth={2}
        className="transition-all -mt-4 -ml-4 duration-300"
      />
    </button>
  );
};

export default AddToFavoritesButton;
