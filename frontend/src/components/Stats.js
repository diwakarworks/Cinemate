import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FilmIcon } from '@heroicons/react/outline';
import { BiArrowBack } from 'react-icons/bi';
import {useNavigate} from "react-router-dom";


const API_URL = 'http://localhost:5002';

const Stats = () => {
    const [stats, setStats] = useState({
        totalMoviesWatched: 0,
        favoriteGenres: {},
    });
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const userId = '6729bdee4d96b9e3cf88229b';

    useEffect(() => {
        const fetchUserStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/api/user/${userId}/stats`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setStats(response.data);
            } catch (err) {
                setError('Failed to load stats');
                console.error('Error fetching stats:', err);
            }
        };

        fetchUserStats();
    }, []);

    const handleHome = () => {
        navigate('/');
    }

    if (error) return <p className="text-red-500 text-center">{error}</p>;

    return (
        <div className="p-4 min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg shadow-lg text-white">
            <h2 className="text-3xl font-bold ml-28 mt-4 text-left mb-4  text-yellow-400 "> STATS</h2>
            <div className="flex items-left">
                <BiArrowBack className=" -mt-12 w-10 h-10 absolute cursor-pointer ml-2 text-white hover:text-red-500" onClick={handleHome} />
            </div>
            <hr className="border-indigo-600  mt-10 mb-10" />

            <div className="flex items-center justify-center gap-4 mb-6">
                <FilmIcon className="w-8 h-8 text-yellow-300 mb-10" />
                <p className="text-2xl font-semibold mb-10 ">{stats.totalMoviesWatched}</p>
                <span className="text-lg mb-10">Movies Watched</span>
            </div>

            <h3 className="text-4xl font-semibold text-black font-mono text-center mb-20 ">Favorite Genres</h3>
            <ul className="space-y-8">
                {Object.keys(stats.favoriteGenres).map((genre) => (
                    <li key={genre} className="flex items-center justify-between p-2 bg-white bg-opacity-10 rounded-lg shadow-sm">
                        <span className="text-md font-medium">{genre}</span>
                        <span className="text-sm font-light text-gray-100">
                            {stats.favoriteGenres[genre]} movies
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Stats;
