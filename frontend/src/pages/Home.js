import React, { useEffect, useState } from "react";
import axios from "axios";
import MovieCard from "../components/MovieCard";
import { Link } from "react-router-dom";
import ShowCard from '../components/ShowCard';

const Home = () => {
  const [popularMovies, setPopularMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [open, setOpen] = useState(false);

  const apiKey = process.env.REACT_APP_TMDB_API_KEY;

  useEffect(() => {
    const fetchPopularMovies = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://api.themoviedb.org/3/trending/all/week`,
          {
            params: {
              api_key: apiKey,
              language: "en-US",
              page: currentPage,
            },
          },
        );

        const moviesWithDetails = await Promise.all(
          response.data.results.map(async (item) => {
            const mediaType = item.media_type;

            const detailResponse = await axios.get(
              `https://api.themoviedb.org/3/${mediaType}/${item.id}`,
              {
                params: {
                  api_key: apiKey,
                },
              },
            );

            const creditsResponse = await axios.get(
              `https://api.themoviedb.org/3/${mediaType}/${item.id}/credits`,
              {
                params: {
                  api_key: apiKey,
                },
              },
            );

            return {
              ...detailResponse.data,
              type: mediaType,
              title: detailResponse.data.title || detailResponse.data.name,
              director:
                mediaType === "movie"
                  ? creditsResponse.data.crew.find(
                      (member) => member.job === "Director",
                    )
                  : creditsResponse.data.crew.find(
                      (member) => member.job === "Executive Producer",
                    ),
              cast: creditsResponse.data.cast.slice(0, 8),
            };
          }),
        );

        setPopularMovies(moviesWithDetails);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchPopularMovies();
  }, [currentPage]);

  const nextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const previousPage = () => {
    setCurrentPage((prevPage) => (prevPage > 1 ? prevPage - 1 : 1));
  };

  if (loading) return <p className="text-center">Loading content...</p>;

  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="p-4">
      {/* Title */}
      <h2 className="absolute -mt-2 text-md ml-3 text-gray-400">
        POPULAR THIS WEEK
      </h2>

      {/* Dropdown (UNCHANGED) */}
      <div className="flex justify-end -mt-6">
        <button
          onClick={() => setOpen(!open)}
          className=" bg-blue-600 mt-3 hover:bg-blue-700 text-white px-1 py-0 rounded-lg shadow-md transition duration-200"
        >
          Movies ▾
        </button>

        {open && (
          <div className="absolute right-0 mt-10 w-30 bg-white rounded-lg shadow-lg border">
            <Link
              to="/ott"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-t-lg"
              onClick={() => setOpen(false)}
            >
              Now Playing
            </Link>
            <Link
              to="/upcoming"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-b-lg"
              onClick={() => setOpen(false)}
            >
              Upcoming
            </Link>
          </div>
        )}
      </div>

      <hr className="border-gray-700 mt-2" />

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {popularMovies.map((movie) => (
  <Link
    to={movie.type === "movie" ? `/movie/${movie.id}` : `/show/${movie.id}`}
    state={{ type: movie.type }}
    key={movie.id}
    className="movie-card p-2 flex"
  >
    {movie.type === "movie" ? (
      <MovieCard movie={movie} />
    ) : (
      <ShowCard show={movie} />
    )}
  </Link>
))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4">
        <button
          onClick={previousPage}
          className="bg-green-600 w-24 hover:bg-green-700 text-white p-2 rounded-full"
          disabled={currentPage === 1}
        >
          Previous
        </button>

        <button
          onClick={nextPage}
          className="bg-green-600 hover:bg-green-700 ml-24 w-20 text-white p-2 rounded-full"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Home;
