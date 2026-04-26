import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { BiArrowBack } from "react-icons/bi";

const API_URL = "https://cinemate-6k9l.onrender.com";

const Watchlist = () => {
  const userId = useParams();
  const [combinedWatchlist, setCombinedWatchlist] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWatchlist = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authorization token found");
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(
          `${API_URL}/api/user/${userId}/watchlist`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setUser(response.data);
        const movies = (response.data.watchlist || []).map((m) => ({
          ...m,
          mediaType: "movie",
          displayTitle: m.title,
        }));
        const series = (response.data.seriesWatchlist || []).map((s) => ({
          ...s,
          mediaType: "series",
          displayTitle: s.name,
        }));
        setCombinedWatchlist([...movies, ...series]);
        setLoading(false);
      } catch (error) {
        setError(
          error.response
            ? error.response.data.message
            : "Error fetching watchlist",
        );
        setLoading(false);
      }
    };
    fetchWatchlist();
  }, [userId]);

  const handleHome = () => navigate("/");

  if (loading) return <p>Loading user watchlist...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!user) return <p>User watchlist not found.</p>;

  return (
    <div className="text-white min-h-screen mt-8">
      <h1 className="text-2xl font-bold absolute -mt-9 ml-28 text-white mb-8">
        Watchlist
      </h1>
      <div className="flex items-left">
        <BiArrowBack
          className="-mt-9 w-10 h-10 cursor-pointer ml-2 text-white hover:text-blue-500"
          onClick={handleHome}
        />
      </div>
      <hr className="border-gray-700 mt-10 mb-10" />

      {combinedWatchlist.length === 0 ? (
        <p className="ml-6 text-gray-400">Your watchlist is empty.</p>
      ) : (
        <div className="bg-stone-900 grid grid-cols-8 gap-4 ml-6">
          {combinedWatchlist.map((item) => (
            <div
              key={`${item.mediaType}-${item.id}`}
              className="watchlist-item transition-transform transform hover:scale-105 hover:shadow-lg hover:brightness-110 duration-300"
            >
              <Link
                to={
                  item.mediaType === "movie"
                    ? `/movie/${item.id}`
                    : `/show/${item.id}`
                }
              >
                <img
                  className="mb-4 rounded-lg"
                  src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                  alt={item.displayTitle}
                />
                <p className="text-center text-lg">{item.displayTitle}</p>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
