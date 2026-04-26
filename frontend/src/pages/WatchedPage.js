import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const API_URL = 'https://cinemate-6k9l.onrender.com';

const WatchedPage = () => {
    const { userId } = useParams();
    const [movies, setMovies] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWatched = async () => {
            const token = localStorage.getItem('token');

            try {
                const res = await axios.get(
                    `${API_URL}/api/diary/${userId}/entries`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                console.log('hurray', res.data);

                setMovies(res.data.entries);
                setTotal(res.data.total);
            } catch (err) {
                console.error('Error loading watched movies:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchWatched();
    }, [userId]);

    // ⭐ Convert rating to stars
    const getStarRating = (rating) => {
        const fullStars = Math.floor(rating);
        const halfStars = rating % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStars;

        const stars = [];

        for (let i = 0; i < fullStars; i++) {
            stars.push(<FaStar key={`full-${i}`} />);
        }

        if (halfStars) {
            stars.push(<FaStarHalfAlt key="half" />);
        }

        for (let i = 0; i < emptyStars; i++) {
            stars.push(<FaRegStar key={`empty-${i}`} />);
        }

        return stars;
    };

    // 🔥 map backend type → frontend route
    const getRouteType = (type) => {
        if (type === 'tv') return 'show';
        return 'movie';
    };

    // 🔹 Loading Skeleton
    if (loading) {
        return (
            <div className="bg-stone-900 min-h-screen text-white px-6 py-10">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="text-center">
                            <Skeleton height={350} borderRadius={10} />
                            <div className="mt-2 flex justify-center space-x-1">
                                {Array.from({ length: 5 }).map((_, j) => (
                                    <Skeleton key={j} width={14} height={14} circle />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-stone-900 min-h-screen text-white px-6 py-10">

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {movies.map((entry) => (
                    <div key={entry._id} className="text-center">

                        {/* ✅ FIXED LINK */}
                        <Link to={`/${getRouteType(entry.mediaType)}/${entry.mediaId}`}>
                            <img
                                src={entry.posterPath}
                                alt={entry.title}
                                className="rounded-lg border-2 hover:border-green-500 duration-300"
                            />
                        </Link>

                        {/* ⭐ Rating */}
                        <div className="text-gray-400 flex justify-center mt-2 space-x-1">
                            {entry.rating
                                ? getStarRating(entry.rating)
                                : <span className="text-xs">N/A</span>}
                        </div>

                    </div>
                ))}
            </div>

        </div>
    );
};

export default WatchedPage;
