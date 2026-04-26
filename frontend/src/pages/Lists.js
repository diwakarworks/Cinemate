import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import axios from "axios";

const API_URL = "https://cinemate-6k9l.onrender.com";

const emptyQuotes = [
  "GoodBye, Mr.Bond.",
  "Fuh-get about it.",
  "Game over, man! It's game over!",
  "Houston, we have a problem.",
  "Technically missing. Soon to be presumed dead. Gone.",
  "And like that,poof.He's gone.",
  "Just another clue.",
];

const ListsPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);
  const [quote, setQuote] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserLists();
  }, [userId]);

  useEffect(() => {
    const random = emptyQuotes[Math.floor(Math.random() * emptyQuotes.length)];
    setQuote(random);
  }, []);

  const fetchUserLists = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/lists/user/${userId}`);
      setLists(response.data);
    } catch (error) {
      console.error("Error fetching lists:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditList = (listId) => {
    navigate(`/user/${userId}/lists/${listId}`);
  };

  const handleDeleteList = async (listId) => {
    if (window.confirm("Delete this list?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_URL}/api/lists/${listId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchUserLists();
      } catch (error) {
        console.error("Error deleting list:", error);
      }
    }
  };

  const handleBack = () => {
    navigate(`/profile`);
  };

  if (loading)
    return <div className="text-white text-center mt-10">Loading lists...</div>;

  return (
    <div className="min-h-screen bg-stone-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <BiArrowBack
              className="w-8 h-8 cursor-pointer hover:text-blue-500"
              onClick={handleBack}
            />
            <h1 className="text-3xl ml-10 font-bold">My Lists</h1>
          </div>
        </div>
        <hr className="border-gray-700 mt-10 mb-10" />

        {/* Lists */}
        {lists.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">No lists.</p>
            <p className="text-gray-400 text-lg -mt-4">{quote}</p>
          </div>
        ) : (
          <div>
            {lists.map((list, index) => {
              const totalCount =
                (list.movies?.length || 0) + (list.series?.length || 0);
              const allItems = [
                ...(list.movies || []),
                ...(list.series || []),
              ];

              return (
                <div
                  key={index}
                  className="list-container group bg-stone-900 p-6 transition-all duration-500 hover:border-blue-500/40 hover:shadow-[0_10px_50px_-10px_rgba(0,0,0,0.7)] hover:scale-[1.02] hover:z-10 transform"
                  style={{ transitionDelay: `${index * 60}ms` }}
                >
                  {index > 0 && <hr className="border-gray-700 mt-2 mb-4" />}

                  <div className="absolute inset-0 rounded-2xl opacity-0"></div>

                  {/* Posters + Info Row */}
                  <div className="flex gap-4 mb-4">

                    {/* Poster Stack */}
                    <div className="flex-shrink-0 w-46 h-28 overflow-hidden">
                      {allItems.length > 0 ? (
                        <Link to={`/user/${userId}/lists/${list._id}/posters`}>
                          <div className="flex h-full gap-1 p-1 group cursor-pointer">
                            {allItems.slice(0, 5).map((item, i) => (
                              <img
                                key={i}
                                src={`https://image.tmdb.org/t/p/w300${item.posterPath}`}
                                alt={item.title}
                                className={`h-full object-cover border-4 border-transparent group-hover:border-white transition-all duration-500 ${
                                  i === 0 ? "w-14 z-10" : "w-14 -ml-5 z-0"
                                }`}
                              />
                            ))}
                          </div>
                        </Link>
                      ) : (
                        <div className="col-span-2 bg-stone-800/70 text-gray-400 italic flex items-center justify-center rounded-xl h-full text-sm">
                          Nothing added yet
                        </div>
                      )}
                    </div>

                    {/* Title, Count, Description */}
                    <div className="flex-1">
                      <Link to={`/user/${userId}/lists/${list._id}/posters`}>
                        <h3 className="text-xl font-semibold mb-1 text-white tracking-tight transition-colors duration-300 group-hover:text-blue-400">
                          {list.name}
                        </h3>
                      </Link>

                      <p className="text-sm font-semibold text-gray-500 mb-2">
                        {totalCount} {totalCount === 1 ? "title" : "titles"}
                      </p>

                      <p
                        className="text-gray-400 font-semibold text-md"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 4,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {list.description || "No description"}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 justify-end relative z-20">
                    <button
                      onClick={() => handleEditList(list._id)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-medium text-white flex items-center justify-center gap-1 transition-all duration-300 hover:scale-[1.05]"
                    >
                      <FiEdit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteList(list._id)}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-sm font-medium text-white flex items-center justify-center transition-all duration-300 hover:scale-[1.05]"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListsPage;
