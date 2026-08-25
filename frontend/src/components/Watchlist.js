import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { BiArrowBack, BiDotsVerticalRounded } from "react-icons/bi";

const API_URL = "https://cinemate-6k9l.onrender.com"; // Replace with your backend URL

const Watchlist = () => {
  const { userId } = useParams();
  const [combinedWatchlist, setCombinedWatchlist] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchWatchlist = async () => {
    if (!token) {
      setError("No authorization token found");
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(`${API_URL}/api/user/${userId}/watchlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
      setIsPrivate(response.data.isWatchlistPrivate || false);
      const movies = (response.data.watchlist || []).map((m) => ({
        ...m, mediaType: "movie", displayTitle: m.title,
      }));
      const series = (response.data.seriesWatchlist || []).map((s) => ({
        ...s, mediaType: "series", displayTitle: s.name,
      }));
      setCombinedWatchlist([...movies, ...series]);
      setLoading(false);
    } catch (error) {
      setError(error.response ? error.response.data.message : "Error fetching watchlist");
      setLoading(false);
    }
  };

  useEffect(() => { fetchWatchlist(); }, [userId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleHome = () => navigate("/");

  const handleExport = async () => {
    setMenuOpen(false);
    try {
      const res = await axios.get(`${API_URL}/api/user/watchlist/export-all`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = "watchlist.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.response?.data?.message || "Export failed");
    }
  };

  const handleClear = async () => {
    setMenuOpen(false);
    if (!window.confirm("This will remove all items from your watchlist. Continue?")) return;
    try {
      await axios.delete(`${API_URL}/api/user/watchlist/clear`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCombinedWatchlist([]);
    } catch (err) {
      alert(err.response?.data?.message || "Clear failed");
    }
  };

  const handleTogglePrivate = async () => {
    setMenuOpen(false);
    const next = !isPrivate;
    try {
      await axios.patch(
        `${API_URL}/api/user/watchlist/visibility`,
        { isPrivate: next },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsPrivate(next);
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  const handleImportClick = () => {
    setMenuOpen(false);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post(`${API_URL}/api/user/watchlist/import-all`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      alert(`Imported: ${res.data.imported}, Skipped: ${res.data.skipped}, Unmatched: ${res.data.unmatched.length}`);
      fetchWatchlist();
    } catch (err) {
      alert(err.response?.data?.message || "Import failed");
    } finally {
      e.target.value = "";
    }
  };

  if (loading) return <p>Loading user watchlist...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!user) return <p>User watchlist not found.</p>;

  const menuItems = [
    {
      label: isPrivate ? "Make this list public" : "Make this list private",
      onClick: handleTogglePrivate,
    },
    { label: "Import to watchlist…", onClick: handleImportClick },
    { label: "Export watchlist", onClick: handleExport },
    { label: "Clear watchlist", onClick: handleClear, danger: true },
  ];

  return (
    <div className="text-white min-h-screen mt-8">
      <div className="flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <BiArrowBack
            className="w-7 h-7 cursor-pointer text-white hover:text-blue-500"
            onClick={handleHome}
          />
          <h1 className="text-2xl font-bold">Watchlist</h1>
        </div>

        <div className="relative" ref={menuRef}>
          <BiDotsVerticalRounded
            className="w-7 h-7 cursor-pointer text-white hover:text-blue-500"
            onClick={() => setMenuOpen((o) => !o)}
          />

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-11 w-60 bg-slate-700 rounded-xl shadow-xl overflow-hidden z-50 border border-slate-600"
            >
              {menuItems.map(({ label, onClick, danger }, i) => (
                <button
                  key={label}
                  role="menuitem"
                  onClick={onClick}
                  className={`block w-full text-left px-4 py-3 text-sm transition-colors ${
                    i !== menuItems.length - 1 ? "border-b border-slate-600" : ""
                  } ${
                    danger
                      ? "text-red-400 hover:bg-slate-600"
                      : "text-white hover:bg-slate-600"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>
      </div>

      <hr className="border-white/10 mt-6 mb-10" />

      {combinedWatchlist.length === 0 ? (
        <p className="ml-6 text-slate-400">Your watchlist is empty.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-5 px-6">
          {combinedWatchlist.map((item) => (
            <Link
              key={`${item.mediaType}-${item.id}`}
              to={item.mediaType === "movie" ? `/movie/${item.id}` : `/show/${item.id}`}
              className="group"
            >
              <div className="overflow-hidden rounded-lg ring-1 ring-white/5 shadow-md group-hover:shadow-xl group-hover:ring-white/20 group-hover:scale-[1.03] transition-all duration-300">
                <img
                  className="w-full h-auto"
                  src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                  alt={item.displayTitle}
                />
              </div>
              <p className="mt-2 text-center text-sm text-slate-200 group-hover:text-white transition-colors line-clamp-2">
                {item.displayTitle}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;