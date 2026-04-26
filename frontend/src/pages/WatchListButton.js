import { useState, useEffect } from "react";
import { FaBookmark } from "react-icons/fa";
import axios from "axios";
import { useParams } from "react-router-dom";

const API_URL = "https://cinemate-6k9l.onrender.com";

const WatchlistButton = ({ movieId, onStatusChange, type = "movie" }) => {
    const { id } = useParams();
    const [status, setStatus] = useState("default");
    const userId = localStorage.getItem("userId");
    const [isInWatchlist, setIsInWatchlist] = useState(false);

    useEffect(() => {
        const checkWatchlistStatus = async () => {
            const token = localStorage.getItem("token");
            try {
                const response = await axios.get(`${API_URL}/api/user/${userId}/watchlist`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const list = type === "series"
                    ? response.data.seriesWatchlist || []
                    : response.data.watchlist || [];

                const isInList = list.some(item => String(item.id) === String(movieId));

                setIsInWatchlist(isInList);

                if (isInList) {
                    setStatus("added");
                    localStorage.setItem(`watchlist-${type}-${movieId}`, "added");
                    if (onStatusChange) onStatusChange(true);
                } else {
                    setStatus("default");
                    localStorage.removeItem(`watchlist-${type}-${movieId}`);
                    if (onStatusChange) onStatusChange(false);
                }

            } catch (error) {
                console.error("Error checking watchlist status:", error);
            }
        };

        if (userId && movieId) {
            checkWatchlistStatus();
            const storedStatus = localStorage.getItem(`watchlist-${type}-${movieId}`);
            if (storedStatus === "added") setStatus("added");
        }
    }, [movieId, userId, onStatusChange, type]);

    const toggleWatchlist = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!movieId) {
                console.error("ID is not available");
                return;
            }

            if (status === "default" || status === "removed") {
                await axios.post(
                    `${API_URL}/api/user/${userId}/watchlist`,
                    type === "series"
                        ? { seriesId: movieId, type }
                        : { movieId: movieId, type },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                setStatus("added");
                localStorage.setItem(`watchlist-${type}-${movieId}`, "added");
                if (onStatusChange) onStatusChange(true);

            } else {
                await axios.delete(`${API_URL}/api/user/${userId}/watchlist`, {
                    data: type === "series"
                        ? { seriesId: movieId, type }
                        : { movieId: movieId, type },
                    headers: { Authorization: `Bearer ${token}` },
                });

                setStatus("removed");
                localStorage.setItem(`watchlist-${type}-${movieId}`, "removed");
                setTimeout(() => {
                    setStatus("default");
                    localStorage.removeItem(`watchlist-${type}-${movieId}`);
                    if (onStatusChange) onStatusChange(false);
                }, 3000);
            }
        } catch (error) {
            console.error("Error toggling watchlist:", error);
        }
    };

    return (
        <button
            onClick={toggleWatchlist}
            className="text-2xl"
            style={{
                color: status === "added" ? "green" : status === "removed" ? "blue" : "white",
            }}
        >
            <FaBookmark />
        </button>
    );
};

export default WatchlistButton;
