import  { useEffect, useState } from "react";
import { useNavigate,Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Calendar, Star } from "lucide-react";
import { BiArrowBack } from "react-icons/bi";

const UpcomingMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Use environment variable for API key
  const api_key = process.env.REACT_APP_TMDB_API_KEY;

  const fetchMovies = async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      let allEnglishMovies = [];
      let allOtherMovies = [];
      let currentApiPage = 1;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch from multiple API pages to get enough movies
      while (currentApiPage <= 15) { // Increased to get more movies
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/upcoming?api_key=${api_key}&language=en-US&page=${currentApiPage}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch movies');
        }
        
        const data = await response.json();
        
        // Filter movies releasing from today onwards and separate by language
        const upcomingMovies = data.results.filter((movie) => {
          const releaseDate = new Date(movie.release_date);
          releaseDate.setHours(0, 0, 0, 0);
          return releaseDate >= today;
        });

        // Separate English and other language movies
        upcomingMovies.forEach((movie) => {
          if (movie.original_language === 'en') {
            allEnglishMovies.push(movie);
          } else {
            allOtherMovies.push(movie);
          }
        });
        
        // If this is the last page from API, break
        if (currentApiPage >= data.total_pages) break;
        
        currentApiPage++;
      }

      // Sort by popularity within each language group
      allEnglishMovies.sort((a, b) => b.popularity - a.popularity);
      allOtherMovies.sort((a, b) => b.popularity - a.popularity);

      // Combine: English movies first, then other movies
      const combinedMovies = [...allEnglishMovies, ...allOtherMovies];

      // Calculate pagination for 24 movies per page
      const startIndex = (page - 1) * 24;
      const endIndex = startIndex + 24;
      const paginatedMovies = combinedMovies.slice(startIndex, endIndex);
      
      // Calculate total pages based on all movies
      const calculatedTotalPages = Math.ceil(combinedMovies.length / 24);

      setMovies(paginatedMovies);
      setTotalPages(calculatedTotalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching upcoming movies:", error);
      setError("Failed to load movies. Please check your API key and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!api_key) {
      setError("TMDB API key is missing. Please add REACT_APP_TMDB_API_KEY to your environment variables.");
      setLoading(false);
      return;
    }
    fetchMovies(currentPage);
  }, [currentPage, api_key]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getDaysUntilRelease = (releaseDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const release = new Date(releaseDate);
    release.setHours(0, 0, 0, 0);
    const diffTime = release - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  const handleHome = () => {
    navigate(-1);
  } 

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          <p className="text-purple-200 text-lg font-medium">Loading upcoming movies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error Loading Movies</h2>
          <p className="text-purple-200 mb-4">{error}</p>
          <button
            onClick={() => fetchMovies(currentPage)}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-stone-900 opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-6 text-center">
        </div>
        <BiArrowBack
                  className="absolute -mt-10 ml-4 w-10 h-10 cursor-pointer  text-white hover:text-blue-500"
                  onClick={handleHome}
        />
        <h1 className="text-3xl md:text-3xl ml-20 -mt-10 font-semibold text-white ">Upcoming Movies</h1>
      </div>
      <hr className="border-gray-700 -mt-8 mb-2" />

      

      {/* Movies Grid */}
      <div className="max-w-7xl mt-10 mx-auto px-6 py-12">
        {movies.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎭</div>
            <h3 className="text-2xl font-semibold text-purple-200 mb-2">No Upcoming Movies</h3>
            <p className="text-purple-300">Check back later for new releases!</p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {movies.map((movie) => {
              return (
                <Link 
                  to={`/movie/${movie.id}`} 
                  key={movie.id} 
                  className="group cursor-pointer block"
                >
                  <div className="relative bg-slate-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 min-w-[320px]">
                    {/* Movie Poster */}
                    <div className="relative overflow-hidden aspect-[2/3]">
                      <img
                        src={
                          movie.poster_path
                            ? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
                            : "https://placehold.co/500x750/374151/9CA3AF/png?text=No+Image"
                        }
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = "https://placehold.co/500x750/374151/9CA3AF/png?text=No+Image";
                        }}
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                    </div>

                    {/* Movie Info */}
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-purple-300 transition-colors min-h-[3.5rem] flex items-center">
                        {movie.title}
                      </h2>
                      
                      <div className="flex items-center space-x-2 text-purple-300">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm font-medium">
                          {formatDate(movie.release_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-12">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Page Numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    currentPage === pageNum
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-purple-200 hover:bg-slate-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingMovies;