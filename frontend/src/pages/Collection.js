import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const apiKey = process.env.REACT_APP_TMDB_API_KEY;

const CollectionPage = () => {
  const { id } = useParams();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format date to "Nov 14, 2014" format
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (err) {
      return "Unknown";
    }
  };

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(
          `https://api.themoviedb.org/3/collection/${id}?api_key=${apiKey}`
        );
        console.log(res.data);
        setCollection(res.data);
      } catch (err) {
        console.error("Error fetching collection:", err);
        setError(err.response?.data?.status_message || "Failed to load collection");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCollection();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white mt-4 text-lg">Loading collection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-8 bg-red-900/20 rounded-xl border border-red-500/30">
          <p className="text-red-400 text-xl font-semibold mb-2">Error Loading Collection</p>
          <p className="text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!collection) return null;

  return (
    <div className="max-w-7xl min-h-screen mx-auto p-6 text-white">
      {/* Backdrop with Overlay */}
      <div className="relative h-80 w-full rounded-2xl overflow-hidden shadow-2xl group">
        <div
          className="absolute inset-0 bg-cover bg-center transform transition-transform duration-700 group-hover:scale-105"
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/original${collection.backdrop_path})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
        
        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <h1 className="text-5xl font-bold drop-shadow-lg transform transition-transform duration-300 hover:translate-x-2">
            {collection.name}
          </h1>
          <div className="flex items-center gap-4 mt-3">
            <p className="text-gray-200 text-lg font-medium bg-blue-600/80 px-4 py-1 rounded-full backdrop-blur-sm">
              {collection.parts.length} {collection.parts.length === 1 ? "Film" : "Films"}
            </p>
          </div>
        </div>
      </div>

      {/* Overview */}
      {collection.overview && (
        <div className="mt-8 bg-gray-800/40 p-6 rounded-xl border border-gray-700/50 backdrop-blur-sm">
          <h2 className="text-2xl font-semibold mb-3 text-blue-400">About Collection</h2>
          <p className="text-gray-300 leading-relaxed">{collection.overview}</p>
        </div>
      )}

      {/* Movies Grid */}
      <div className="mt-10">
        <h2 className="text-3xl font-bold mb-6">{collection.parts.length} movies</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {collection.parts.map((movie) => (
            <Link to={`/movie/${movie.id}`} key={movie.id}>
              <div className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-xl shadow-lg">
                  {/* Poster Image */}
                  <img
                    src={
                      movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : "https://via.placeholder.com/500x750?text=No+Image"
                    }
                    alt={movie.title}
                    className="w-full h-auto transform transition-all duration-500 group-hover:scale-110"
                  />
                  
                  
                  
                  {/* Rating Badge */}
                  {movie.vote_average > 0 && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-black font-bold text-xs px-2 py-1 rounded-lg shadow-lg">
                      ⭐ {movie.vote_average.toFixed(1)}
                    </div>
                  )}
                </div>

                {/* Movie Info */}
                <div className="mt-3">
                  <p className="text-white font-semibold text-sm line-clamp-2 group-hover:text-blue-400 transition-colors duration-200">
                    {movie.title}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {formatDate(movie.release_date)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollectionPage;