import React, { useEffect, useState } from "react";
import { useParams, Link,useNavigate } from "react-router-dom";
import axios from "axios";
import { ChevronLeft, ChevronRight, Star, Calendar, Film, Tv, ArrowLeft } from "lucide-react";

const GenrePage = () => {
  const { genreIdName, type } = useParams(); 
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const navigate = useNavigate();

  const genreId = genreIdName.split("-")[0];
  const genreName = decodeURIComponent(genreIdName.split("-")[1]);

  useEffect(() => {
    const fetchGenreItems = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `https://api.themoviedb.org/3/discover/${type}`,
          {
            params: {
              api_key: process.env.REACT_APP_TMDB_API_KEY,
              with_genres: genreId,
              sort_by: "popularity.desc",
              language: "en-US",
              page: currentPage,
            },
          }
        );
        setItems(res.data.results);
        setTotalPages(Math.min(res.data.total_pages, 500)); // TMDB limits to 500 pages
        setTotalResults(res.data.total_results);
      } catch (err) {
        console.error("Failed to fetch genre-based content", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGenreItems();
  }, [genreId, type, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPaginationRange = () => {
    const range = [];
    const showPages = 5;
    let start = Math.max(1, currentPage - Math.floor(showPages / 2));
    let end = Math.min(totalPages, start + showPages - 1);

    if (end - start + 1 < showPages) {
      start = Math.max(1, end - showPages + 1);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    return range;
  };

  const handleBack = () => {
    navigate(-1);
  }

  const ItemCard = ({ item }) => (
    <Link
      to={`/${type === 'tv' ? 'show' : 'movie'}/${item.id}`}
      className="group bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105"
    >
      <div className="relative overflow-hidden">
        <img
          src={
            item.poster_path
              ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
              : "/api/placeholder/300/450"
          }
          alt={item.title || item.name}
          className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <Star className="w-3 h-3 fill-current" />
          {item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}
        </div>

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
            {type === 'movie' ? (
              <Film className="w-8 h-8 text-white" />
            ) : (
              <Tv className="w-8 h-8 text-white" />
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2 group-hover:text-yellow-400 transition-colors">
          {item.title || item.name}
        </h3>
        
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Calendar className="w-3 h-3" />
          <span>
            {item.release_date || item.first_air_date
              ? new Date(item.release_date || item.first_air_date).getFullYear()
              : 'TBA'}
          </span>
        </div>
      </div>
    </Link>
  );

  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="w-full h-80 bg-gray-700"></div>
        <div className="p-4">
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-b border-gray-800">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={handleBack}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              {type === 'movie' ? (
                <Film className="w-8 h-8 text-purple-400" />
              ) : (
                <Tv className="w-8 h-8 text-blue-400" />
              )}
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {type === "movie" ? "Movies" : "TV Shows"} in{" "}
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {genreName}
                </span>
              </h1>
            </div>
          </div>
          
          {!loading && (
            <div className="flex flex-wrap gap-4 text-md text-gray-300">
              <span className="bg-white/10 ml-20 backdrop-blur-sm px-3 py-1 rounded-full">
                {totalResults.toLocaleString()} {type === "movie" ? "movies" : "shows"} found
              </span>
              <span className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1">
            {Array.from({ length: 20 }).map((_, index) => (
              <LoadingSkeleton key={index} />
            ))}
          </div>
        ) : (
          <>
            {/* Items Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mb-8">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* First Page */}
                {currentPage > 3 && (
                  <>
                    <button
                      onClick={() => handlePageChange(1)}
                      className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                    >
                      1
                    </button>
                    {currentPage > 4 && (
                      <span className="text-gray-500 px-2">...</span>
                    )}
                  </>
                )}

                {/* Page Numbers */}
                {getPaginationRange().map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      page === currentPage
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                        : "bg-gray-800 text-white hover:bg-gray-700"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                {/* Last Page */}
                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && (
                      <span className="text-gray-500 px-2">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Quick Navigation */}
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-4 bg-gray-800/50 backdrop-blur-sm rounded-lg px-6 py-3">
                <span className="text-gray-400 text-sm">Jump to page:</span>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= totalPages) {
                      handlePageChange(page);
                    }
                  }}
                  className="w-16 px-2 py-1 bg-gray-700 text-white rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-gray-400 text-sm">of {totalPages}</span>
              </div>
            </div>
          </>
        )}

        {/* No Results */}
        {!loading && items.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">
              {type === 'movie' ? '🎬' : '📺'}
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              No {type === "movie" ? "movies" : "TV shows"} found
            </h3>
            <p className="text-gray-400 mb-6">
              We couldn't find any {type === "movie" ? "movies" : "TV shows"} in the {genreName} genre.
            </p>
            <button onClick={handleBack} 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenrePage;