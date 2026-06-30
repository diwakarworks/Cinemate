import React, { useState, useEffect } from "react";
import axios from "axios";
import { Heart } from "lucide-react";

const API_URL = "https://cinemate-6k9l.onrender.com/api/user"; 

const AddToFavoriteSeries = ({ seriesId, title, year, posterPath, onStatusChange }) => {
  const [status, setStatus] = useState("default");
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token || !userId) return;

      try {
        const response = await axios.get(`${API_URL}/${userId}/favorites/series`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const favorites = response.data.favoriteSeries || response.data;
        console.log("📋 Favorite Series:", favorites);

        const isInFavorites = favorites.some(
          (fav) => String(fav.tmdbId) === String(seriesId)
        );

        if (isInFavorites) {
          setStatus("added");
          localStorage.setItem(`favorite-series-${seriesId}`, "added");
          if (onStatusChange) onStatusChange(true);
        } else {
          setStatus("default");
          localStorage.removeItem(`favorite-series-${seriesId}`);
          if (onStatusChange) onStatusChange(false);
        }
      } catch (err) {
        console.error("❌ Error checking favorite series:", err);
      }
    };

    if (userId && seriesId) {
      checkFavoriteStatus();

      const storedStatus = localStorage.getItem(`favorite-series-${seriesId}`);
      if (storedStatus === "added") {
        setStatus("added");
      }
    }
  }, [seriesId, userId, onStatusChange]);

  const toggleFavorites = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!seriesId) {
        console.error("❌ Series ID is not available");
        return;
      }

      if (!token) {
        alert("Please login to add favorites");
        return;
      }

      setLoading(true);

      if (status === "default" || status === "removed") {
        console.log("➕ Adding series to favorites:", { seriesId, title, year, posterPath });

        await axios.post(
          `${API_URL}/${userId}/favorites/series`,
          {
            tmdbId: String(seriesId),
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
        localStorage.setItem(`favorite-series-${seriesId}`, "added");
        if (onStatusChange) onStatusChange(true);
        console.log("✅ Added series to favorites");
      } else {
        console.log("➖ Removing series from favorites:", seriesId);

        await axios.delete(`${API_URL}/${userId}/favorites/series/${seriesId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStatus("removed");
        localStorage.setItem(`favorite-series-${seriesId}`, "removed");
        if (onStatusChange) onStatusChange(false);
        console.log("🔵 Removed series from favorites");

        setTimeout(() => {
          setStatus("default");
          localStorage.removeItem(`favorite-series-${seriesId}`);
          console.log("🔄 Reset to default");
        }, 5000);
      }
    } catch (error) {
      console.error("❌ Error toggling favorite series:", error.response?.data || error.message);

      if (error.response?.status === 409) {
        setStatus("added");
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

export default AddToFavoriteSeries;