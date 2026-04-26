import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;

const CompanyExplorer = () => {
  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [moviesLoading, setMoviesLoading] = useState(true);
  const [seriesLoading, setSeriesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("movies");
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    setCompanyDetails(null);
    setMovies([]);
    setSeries([]);
    setMoviesLoading(true);
    setSeriesLoading(true);
    fetchCompanyDetails(id);
    fetchAllCompanyMovies(id);
    fetchAllCompanySeries(id);
  }, [id]);

  const fetchCompanyDetails = async (companyId) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/company/${companyId}?api_key=${API_KEY}`,
      );
      const data = await response.json();
      setCompanyDetails(data);
    } catch (error) {
      setError("Failed to load company details");
    }
  };

const fetchAllCompanyMovies = async (companyId) => {
  try {
    setMoviesLoading(true);
    let allMovies = [];
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages && page <= 500) {
      const response = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_companies=${companyId}&language=en-US&sort_by=popularity.desc&page=${page}` // ✅ switched to discover + sort
      );
      const data = await response.json();
      if (page === 1) totalPages = Math.min(data.total_pages || 1, 500);
      if (!data.results || data.results.length === 0) break;
      allMovies = [...allMovies, ...data.results];
      if (allMovies.length >= data.total_results) break;
      page++;
    }

    const unique = Array.from(new Map(allMovies.map(i => [i.id, i])).values())
  .filter(item => item.poster_path); // ✅ remove no-image items
  setMovies(unique);
  } catch (error) {
    setError("Failed to load movies");
  } finally {
    setMoviesLoading(false);
  }
};

const fetchAllCompanySeries = async (companyId) => {
  try {
    setSeriesLoading(true);
    let allSeries = [];
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages && page <= 500) {
      const response = await fetch(
        `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_companies=${companyId}&language=en-US&sort_by=popularity.desc&page=${page}` // ✅ sort by popularity
      );
      const data = await response.json();
      if (page === 1) totalPages = Math.min(data.total_pages || 1, 500);
      if (!data.results || data.results.length === 0) break;
      allSeries = [...allSeries, ...data.results];
      if (allSeries.length >= data.total_results) break;
      page++;
    }
    const unique = Array.from(new Map(allSeries.map(i => [i.id, i])).values())
  .filter(item => item.poster_path); 
  setSeries(unique);
  } catch (error) {
    console.error("Error fetching series:", error);
    setSeries([]);
  } finally {
    setSeriesLoading(false);
  }
};

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">Error</div>
          <div className="text-gray-400">{error}</div>
        </div>
      </div>
    );
  }

  const handleHome = () => navigate("/studios");
  const isLoading = activeTab === "movies" ? moviesLoading : seriesLoading;
  const activeItems = activeTab === "movies" ? [...movies] : [...series];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Back Button */}
      <div className="flex ml-20">
        <BiArrowBack
          className="absolute mt-10 w-10 h-10 cursor-pointer text-white hover:text-blue-500"
          onClick={handleHome}
        />
      </div>

      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            {companyDetails?.logo_path && (
              <img
                src={`https://image.tmdb.org/t/p/w200${companyDetails.logo_path}`}
                alt={companyDetails.name}
                className="h-16 w-auto object-contain bg-white/10 rounded p-2"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-white">
                {companyDetails?.name || "Loading..."}
              </h1>
              <p className="text-gray-400 mt-1">
                {!isLoading &&
                  activeItems.length > 0 &&
                  `${activeItems.length} ${activeTab === "movies" ? "movies" : "series"}`}
              </p>
            </div>
          </div>

          {/* Toggle Tabs */}
          <div className="flex mt-5 space-x-2">
            <button
              onClick={() => setActiveTab("movies")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeTab === "movies"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              🎬 Movies
              {!moviesLoading && movies.length > 0 && (
                <span className="ml-2 bg-white/20 text-xs px-2 py-0.5 rounded-full">
                  {movies.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("series")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeTab === "series"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              📺 Series
              {!seriesLoading && series.length > 0 && (
                <span className="ml-2 bg-white/20 text-xs px-2 py-0.5 rounded-full">
                  {series.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

           {/* Grid Section */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-white text-xl">
              Loading {activeTab === "movies" ? "movies" : "series"}...
            </div>
          </div>
        ) : (activeTab === "movies" ? movies : series).length > 0 ? (
          <div key={activeTab}  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {(activeTab === "movies" ? movies : series).map((item) => (
              <Link
                key={`${activeTab}-${item.id}`}
                to={
                  activeTab === "movies"
                    ? `/movie/${item.id}`
                    : `/show/${item.id}`
                }
                className="group block bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="aspect-[2/3] relative">
                  {item.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                      alt={item.name || item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                   ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                </div>
                <div className="p-3">
                  <h3 className="text-white font-semibold text-sm line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {item.name || item.title}
                  </h3>
                  {(item.first_air_date || item.release_date) && (
                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(
                        item.first_air_date || item.release_date,
                      ).getFullYear()}
                    </p>
                  )}
                  {item.vote_average > 0 && (
                    <div className="flex items-center mt-1">
                      <span className="text-yellow-400 text-xs">★</span>
                      <span className="text-gray-400 text-xs ml-1">
                        {item.vote_average.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-gray-500 text-xl mb-2">
              No {activeTab === "movies" ? "movies" : "series"} found
            </div>
            <p className="text-gray-400">
              This company has no {activeTab === "movies" ? "movies" : "series"}{" "}
              in the database
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default CompanyExplorer;
