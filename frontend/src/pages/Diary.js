import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";

const API_URL = "https://cinemate-6k9l.onrender.com";

const SORT_OPTIONS = [
  { value: "watchedDate", label: "Watched Date" },
  { value: "filmName", label: "Film Name" },
  { value: "popularity", label: "Film Popularity" },
  { value: "releaseDateNewest", label: "Release Date (Newest)" },
  { value: "releaseDateOldest", label: "Release Date (Oldest)" },
  { value: "avgRatingHighest", label: "Average Rating (Highest)" },
  { value: "avgRatingLowest", label: "Average Rating (Lowest)" },
  { value: "ratingHighest", label: "Your Rating (Highest)" },
  { value: "ratingLowest", label: "Your Rating (Lowest)" },
  { value: "runtimeShortest", label: "Film Length (Shortest)" },
  { value: "runtimeLongest", label: "Film Length (Longest)" },
];

const Diary = () => {
  const { userId } = useParams();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [sortBy, setSortBy] = useState("watchedDate");

  
  const [filters, setFilters] = useState({
    rating: null, 
    diaryYear: null, 
    decade: null, 
  });

  const navigate = useNavigate();

  const formattedDate = (date) =>
    new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  const formattedDay = (date) =>
    new Intl.DateTimeFormat("en-US", { day: "numeric" }).format(new Date(date));

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
          },
        );

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
  }, [userId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;


  const availableYears = [
    ...new Set(entries.map((e) => new Date(e.watchedDate).getFullYear())),
  ].sort((a, b) => b - a);

  const availableDecades = [
    ...new Set(entries.map((e) => Math.floor((e.year || 0) / 10) * 10)),
  ].sort((a, b) => b - a);

 
  const filteredEntries = entries.filter((entry) => {
    if (filters.rating && (entry.rating || 0) !== filters.rating) return false;
    if (
      filters.diaryYear &&
      new Date(entry.watchedDate).getFullYear() !== filters.diaryYear
    )
      return false;
    if (
      filters.decade &&
      Math.floor((entry.year || 0) / 10) * 10 !== filters.decade
    )
      return false;
    return true;
  });

 
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    switch (sortBy) {
      case "watchedDate":
        return new Date(b.watchedDate) - new Date(a.watchedDate);
      case "filmName":
        return a.title.localeCompare(b.title);
      case "releaseDateNewest":
        return (b.year || 0) - (a.year || 0);
      case "releaseDateOldest":
        return (a.year || 0) - (b.year || 0);
      case "avgRatingHighest":
        return (b.voteAverage || 0) - (a.voteAverage || 0);
      case "avgRatingLowest":
        return (a.voteAverage || 0) - (b.voteAverage || 0);
      case "ratingHighest":
        return (b.rating || 0) - (a.rating || 0);
      case "ratingLowest":
        return (a.rating || 0) - (b.rating || 0);
      case "popularity":
        return (b.popularity || 0) - (a.popularity || 0);
      case "runtimeShortest":
        return (a.runtime || 0) - (b.runtime || 0);
      case "runtimeLongest":
        return (b.runtime || 0) - (a.runtime || 0);
      default:
        return 0;
    }
  });

  const isGrouped = sortBy === "watchedDate";

  const groupedEntries = isGrouped
    ? sortedEntries.reduce((groups, entry) => {
        const monthYear = formattedDate(entry.watchedDate);
        if (!groups[monthYear]) {
          groups[monthYear] = [];
        }
        groups[monthYear].push(entry);
        return groups;
      }, {})
    : null;

  const handleHome = () => {
    navigate("/");
  };

  const clearFilters = () => {
    setFilters({ rating: null, diaryYear: null, decade: null });
  };

  const hasActiveFilters =
    filters.rating || filters.diaryYear || filters.decade;

  const renderEntryCard = (entry) => (
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
  );

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

      <div className="flex gap-6 ml-4 mt-4">
        <Link
          to={`/adddiaryentry`}
          className="text-green-400 hover:text-green-500 font-semibold"
        >
          ADD
        </Link>
        <Link
          to={`/diary/${user._id}/watched`}
          className="text-green-400 hover:text-green-500 font-semibold"
        >
          WATCHED
        </Link>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mt-6 mr-4">
        <select
          value={filters.rating || ""}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              rating: e.target.value ? Number(e.target.value) : null,
            }))
          }
          className="bg-gray-800 text-white rounded px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Rating </option>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((r) => (
            <option key={r} value={r}>
              {r} ★
            </option>
          ))}
        </select>

        <select
          value={filters.diaryYear || ""}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              diaryYear: e.target.value ? Number(e.target.value) : null,
            }))
          }
          className="bg-gray-800 text-white rounded px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Diary Year </option>
          {availableYears.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <select
          value={filters.decade || ""}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              decade: e.target.value ? Number(e.target.value) : null,
            }))
          }
          className="bg-gray-800 text-white rounded px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Decade </option>
          {availableDecades.map((d) => (
            <option key={d} value={d}>
              {d}s
            </option>
          ))}
        </select>
      </div>

      {/* Sort bar */}
      <div className="flex justify-end mb-4 -mt-6">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-gray-800 text-white rounded px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <hr className="border-gray-700 mt-10 mb-10" />

      {sortedEntries.length === 0 ? (
        <p className="text-gray-400 text-center">
          No entries match the current filters.
        </p>
      ) : isGrouped ? (
        <div className="space-y-10">
          {Object.keys(groupedEntries)
            .sort((a, b) => new Date(b) - new Date(a))
            .map((monthYear) => (
              <div key={monthYear}>
                <h2 className="text-3xl font-bold text-white mb-4">
                  {monthYear}
                </h2>
                <div className="space-y-6">
                  {groupedEntries[monthYear].map((entry) =>
                    renderEntryCard(entry),
                  )}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="space-y-6">
          {sortedEntries.map((entry) => renderEntryCard(entry))}
        </div>
      )}
    </div>
  );
};

export default Diary;
