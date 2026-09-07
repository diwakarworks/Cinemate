import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BiArrowBack } from "react-icons/bi";

const API_URL = "https://cinemate-6k9l.onrender.com";

const RecommendationsPage = () => {
  const { userId } = useParams();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;

    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          `${API_URL}/api/user/${userId}/recommendations`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        console.log("Fetched recommendations:", data);
        setRecommendations(data.recommendations || []);
      } catch (err) {
        setError("Failed to load recommendations");
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, [userId]);

  const handleHome = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4">
        <h1 className="text-3xl font-bold text-white mb-8">Suggestions</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rounded-lg overflow-hidden bg-zinc-900">
              <div className="w-full aspect-[2/3] bg-zinc-800 animate-pulse rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-12 text-center">
        <p className="text-red-400 mb-1">{error}</p>
        <p className="text-sm text-gray-500">Try refreshing the page.</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="min-h-screen p-12 text-center max-w-md mx-auto">
        <h2 className="text-lg font-semibold text-white mb-2">
          No suggestions yet
        </h2>
        <p className="text-gray-400 text-sm">
          Rate a few more movies to unlock personalized suggestions.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <BiArrowBack
        className="mt-9 w-10 h-10 cursor-pointer ml-2 text-white hover:text-blue-500"
        onClick={handleHome}
      />

      <h1 className="text-3xl font-bold text-white -mt-10 ml-20 mb-8">
        Suggestions
      </h1>
      <hr className="border-gray-700 mt-10 mb-10" />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {recommendations.map((movie) => (
          <Link
            to={
              movie.mediaType === "tv"
                ? `/show/${movie.id}`
                : `/movie/${movie.id}`
            }
            key={`${movie.mediaType}-${movie.id}`}
            className="transition-transform transform hover:scale-105 hover:shadow-lg hover:brightness-110 duration-300"
          >
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.posterPath || movie.poster_path}`}
              alt={movie.title}
              loading="lazy"
              className="w-full aspect-[2/3] object-cover rounded-lg shadow-md"
            />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecommendationsPage;