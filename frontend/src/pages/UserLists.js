import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BiArrowBack } from "react-icons/bi";

const API_URL = "https://cinemate-6k9l.onrender.com";

const FilmStrip = ({ movies = [], series = [] }) => {
  // ← removed the wrong user state that was here
  const items = [...movies, ...series].slice(0, 5);


  return (
    <div className="flex gap-0.5 h-36 overflow-hidden rounded-md mb-3">
      {items.length === 0 ? (
        <div className="flex-1 bg-[#1e2235] rounded-md flex items-center justify-center">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#444"
            strokeWidth="1.5"
          >
            <rect x="2" y="2" width="20" height="20" rx="2.5" />
            <line x1="7" y1="2" x2="7" y2="22" />
            <line x1="17" y1="2" x2="17" y2="22" />
            <line x1="2" y1="12" x2="7" y2="12" />
            <line x1="17" y1="12" x2="22" y2="12" />
            <line x1="2" y1="17" x2="7" y2="17" />
            <line x1="17" y1="17" x2="22" y2="17" />
          </svg>
        </div>
      ) : (
        items.map((item, i) => (
          <div
            key={i}
            className="relative overflow-hidden h-full"
            style={{
              flex: i === 0 ? 2 : 1,
              backgroundImage: item.posterPath
                ? `url(https://image.tmdb.org/t/p/w200${item.posterPath})`
                : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundColor: !item.posterPath ? "#1e2235" : undefined,
              borderRadius:
                i === 0
                  ? "6px 2px 2px 6px"
                  : i === items.length - 1
                    ? "2px 6px 6px 2px"
                    : "2px",
            }}
          >
            {!item.posterPath && (
              <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white/30 font-semibold text-center px-1 leading-tight">
                {(item.title || "").slice(0, 12)}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

const ListCard = ({ list }) => {
  return (
    <div className="cursor-pointer group">
      <div className="border-gray-600 border-2 hover:border-white ">
        <Link to={`/user/${list.user?._id}/lists/${list._id}/posters`}>
          <FilmStrip movies={list.movies} series={list.series} />
        </Link>
      </div>

      <h2 className="text-white font-bold text-[15px] leading-snug mb-1.5 group-hover:text-[#99aabb] transition-colors">
        {list.name}
      </h2>

      {/* Author row — Link goes to that user's profile */}
      <div className="flex items-center gap-1.5 mt-1">
        <img
          src={list.user?.profilePic}
          alt={list.user?.username}
          className="w-5 h-5 rounded-full object-cover"
        />
        <span className="text-sm text-gray-500">
          Created by{" "}
          <span className="font-bold text-gray-200">{list.user?.username}</span>
        </span>
      </div>
    </div>
  );
};

const UserLists = () => {
  const { userId } = useParams();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLists = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(`${API_URL}/api/lists/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLists(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchLists();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#14181c] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2a2f42] border-t-[#40c9a2] rounded-full animate-spin" />
      </div>
    );
  }

  const handleHome = () => {
    navigate("/");
  }


  return (
    <div className="min-h-screen bg-[#14181c] text-white font-sans px-6 py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#2c3440]">
        <BiArrowBack
          className="absolute w-6 h-6 mt-2 cursor-pointer text-white hover:text-blue-500"
          onClick={handleHome}
        />
        <h1 className="text-[11px] ml-10 mt-2 font-semibold tracking-widest text-[#667788] uppercase">
          Featured Lists
        </h1>
      </div>

      {lists.length === 0 ? (
        <div className="text-center py-20 text-[#667788]">
          <p className="text-sm">No lists yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {lists.map((list) => (
            <ListCard key={list._id} list={list} />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserLists;
