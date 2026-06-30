import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { BiArrowBack } from "react-icons/bi";

const API_URL = "https://cinemate-6k9l.onrender.com/api/user";

const FavoriteSeries = () => {
  const userId = useParams();
  const [favoriteSeries, setFavoriteSeries] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavoriteSeries = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authorization token found");
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(
          `${API_URL}/${userId}/favorites/series`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setUser(response.data);
        const series = (response.data.favoriteSeries || response.data || []).map(
          (s) => ({
            ...s,
            displayTitle: s.title,
          }),
        );
        setFavoriteSeries(series);
        setLoading(false);
      } catch (error) {
        setError(
          error.response
            ? error.response.data.message
            : "Error fetching favorite series",
        );
        setLoading(false);
      }
    };
    fetchFavoriteSeries();
  }, [userId]);

  const handleHome = () => navigate("/");

  if (loading) return <p>Loading favorite series...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="text-white min-h-screen mt-8">
      <h1 className="text-2xl font-bold absolute -mt-8 ml-20 text-white mb-8">
        Favorite Series
      </h1>
      <div className="flex items-left">
        <BiArrowBack
          className="-mt-9 w-10 h-10 cursor-pointer ml-2 text-white hover:text-blue-500"
          onClick={handleHome}
        />
      </div>
      <hr className="border-gray-700 mt-10 mb-10" />
      {favoriteSeries.length === 0 ? (
        <p className="ml-6 text-gray-400">No favorite series yet.</p>
      ) : (
        <div className="bg-stone-900 grid grid-cols-8 gap-4 ml-6">
          {favoriteSeries.map((item) => (
            <div
              key={item.tmdbId}
              className="favorite-item transition-transform transform hover:scale-105 hover:shadow-lg hover:brightness-110 duration-300"
            >
              <Link to={`/show/${item.tmdbId}`}>
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

export default FavoriteSeries;