import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";

const API_URL = "https://cinemate-6k9l.onrender.com";
// const userId = "6729bdee4d96b9e3cf88229b";


const Diary = () => {
  const userId = useParams();
  const entryId = useParams();
  // const [entryId,setEntryId] = useState(null); 
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const formattedDate = (date) =>
    new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  const formattedDay = (date) =>
    new Intl.DateTimeFormat("en-US", { day: "numeric" }).format(
      new Date(date)
    );

  console.log(userId);
  useEffect(() => {
    const fetchDiaryEntries = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authorization token found");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${API_URL}/api/diary/${userId}/entries`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("API Response:", response.data);

        if (response.data && response.data.user && response.data.entries) {
          setUser(response.data.user);
          setEntries(response.data.entries);
        } else {
          console.error("Invalid response structure:", response.data);
          setError("User or entries data is missing.");
        }
      } catch (error) {
        console.error("Error fetching diary entries:", error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDiaryEntries();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const groupedEntries = entries.reduce((groups, entry) => {
    const monthYear = formattedDate(entry.watchedDate);
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(entry);
    return groups;
  }, {});

  const handleHome = () => {
    navigate("/");
  };



  return (
    <div className="max-w-3xl min-h-screen mx-auto mt-12">
      <h1 className="text-3xl font-bold -mt-8 ml-28 text-white mb-2 text-left">
        {user.username}'s Diary
      </h1>
      <div className="flex items-left">
        <BiArrowBack
          className="-mt-10 w-10 h-10 cursor-pointer ml-2 text-white hover:text-blue-500"
          onClick={handleHome}
        />
      </div>
       <Link to={`/adddiaryentry`} className="absolute text-green-400 hover:text-green-500 font-semibold mt-4">
        ADD 
      </Link>
      <Link to={`/diary/${user._id}/watched`} className="absolute ml-14 text-green-400 hover:text-green-500 font-semibold mt-4">
        WATCHED
      </Link>
      <hr className="border-gray-700 mt-10 mb-10" />

      <div className="space-y-10">
        {Object.keys(groupedEntries)
          .sort((a, b) => new Date(b) - new Date(a))
          .map((monthYear) => (
            <div key={monthYear}>
              <h2 className="text-3xl font-bold text-white mb-4">
                {monthYear}
              </h2>
              <div className="space-y-6">
                {groupedEntries[monthYear].map((entry) => (
                  <div
                    key={entry._id}
                    className="flex bg-gray-800 text-white rounded-lg p-4 shadow-md"
                  >
                    <div className="w-16 h-16 bg-gray-800 border-2 border-gray-300 text-center mt-10 text-2xl font-bold rounded flex items-center justify-center">
                      {formattedDay(entry.watchedDate)}
                    </div>
                    <img
                      src={`https://image.tmdb.org/t/p/w200${entry.posterPath}`}
                      alt={entry.title}
                      className="w-24 h-36 rounded-lg ml-6"
                    />
                    <div className="ml-6 flex-1">
                      <h2 className="text-2xl font-semibold">
                        {entry.title} {entry.year}
                      </h2>
                      <p className="mt-2 text-lg">Rating: {entry.rating}/10</p>
                      <Link
                        to={`/diary/${user._id}/entries/${entry._id}`}
                        className="mt-4 inline-block text-blue-400 hover:underline"
                      >
                        View Review
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Diary;
