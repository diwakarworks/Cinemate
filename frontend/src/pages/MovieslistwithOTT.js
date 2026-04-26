// MovieListWithOTT.jsx
import React, { useEffect, useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import axios from "axios";
import { BiArrowBack } from "react-icons/bi";

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const REGION = "IN";

const MovieListWithOTT = () => {
  const [movies, setMovies] = useState([]);
  const [providers, setProviders] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const naviagate = useNavigate();

  const fetchMovies = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=ta-IN&page=${page}&region=IN`
      );
      setMovies(res.data.results);
      setTotalPages(Math.min(res.data.total_pages, 500)); // TMDB limits to 500 pages

      // Fetch providers for each movie
      const providerData = {};
      await Promise.all(
        res.data.results.map(async (movie) => {
          try {
            const prov = await axios.get(
              `https://api.themoviedb.org/3/movie/${movie.id}/watch/providers?api_key=${API_KEY}`
            );
            providerData[movie.id] =
              prov.data.results?.[REGION]?.flatrate || null;
          } catch (err) {
            providerData[movie.id] = null;
          }
        })
      );

      setProviders(providerData);
    } catch (error) {
      console.error("Failed to fetch movies", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies(currentPage);
  }, [currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    // Previous button
    if (currentPage > 1) {
      buttons.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-3 py-2 mx-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
        >
          ‹
        </button>
      );
    }

    // First page
    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-3 py-2 mx-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis1" className="px-3 py-2 mx-1 text-gray-500">
            ...
          </span>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 mx-1 rounded-md transition-colors ${i === currentPage
              ? "bg-blue-600 text-white border border-blue-600"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis2" className="px-3 py-2 mx-1 text-gray-500">
            ...
          </span>
        );
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-2 mx-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    if (currentPage < totalPages) {
      buttons.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-3 py-2 mx-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
        >
          ›
        </button>
      );
    }

    return buttons;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleHome = () => {
    naviagate("/")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-left">
        <BiArrowBack
          className="absolute -mt-1 w-10 h-10 cursor-pointer  text-white hover:text-blue-500"
          onClick={handleHome}
        />
      </div>
      <h1 className="text-2xl text-white ml-14 font-bold mb-6 text-left">Now Playing Movies</h1>
      <hr className="border-gray-700 mt-2 mb-8" />


      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {movies.map((movie) => (
          <Link
            to={`/movie/${movie.id}`}
            key={movie.id}
            className="group bg-white rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden border border-gray-200 hover:border-green-500"
          >
            <div className="flex flex-col h-full">
              <div className="relative aspect-[2/3] bg-gray-200 overflow-hidden">
                <img
                  src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
                {movie.vote_average > 0 && (
                  <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded-full">
                    ⭐ {movie.vote_average.toFixed(1)}
                  </div>
                )}
              </div>

              <div className="flex-1 p-3 flex flex-col">
                <h2 className="text-sm font-bold text-gray-800 mb-2 line-clamp-2 min-h-[2.5rem] leading-tight">
                  {movie.title}
                </h2>


                <p className="text-xs text-gray-500 mb-3">
                  {movie.release_date
                    ? new Date(movie.release_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                    : 'N/A'}
                </p>
                <div className="mt-auto">
                  <div className="flex flex-wrap gap-1 min-h-[2rem] items-center">
                    {providers[movie.id] && providers[movie.id].length > 0 ? (
                      providers[movie.id].slice(0, 4).map((prov) => (
                        <img
                          key={prov.provider_id}
                          src={`https://image.tmdb.org/t/p/w45${prov.logo_path}`}
                          alt={prov.provider_name}
                          title={prov.provider_name}
                          className="w-6 h-6 object-contain rounded border border-gray-200"
                        />
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">
                        Not on OTT
                      </span>
                    )}
                    {providers[movie.id] && providers[movie.id].length > 4 && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-1 rounded">
                        +{providers[movie.id].length - 4}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>


      {totalPages > 1 && (
        <div className="mt-12 flex justify-center items-center flex-wrap">
          <div className="flex items-center space-x-1">
            {renderPaginationButtons()}
          </div>


          <div className="ml-6 flex items-center space-x-2">
            <span className="text-sm text-gray-600">Go to:</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const page = parseInt(e.target.value);
                if (page && page >= 1 && page <= totalPages) {
                  handlePageChange(page);
                }
              }}
              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieListWithOTT;