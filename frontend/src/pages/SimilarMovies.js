import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const apiKey = process.env.REACT_APP_TMDB_API_KEY;

const SimilarMovies = ({ movieId }) => {
    const [similarMovies, setSimilarMovies] = useState([]);

    useEffect(() => {
        const fetchSimilar = async () => {
            try {
                const res = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}/recommendations`, {
                    params: {
                        api_key: apiKey,
                        language: 'en-US',
                        page: 1,
                    },
                });
                const data = res.data;
                console.log(data);
                setSimilarMovies(res.data.results?.slice(0, 20) || []);
            } catch (err) {
                console.error('Error fetching similar movies:', err);
            }
        };

        if (movieId) fetchSimilar();
    }, [movieId]);

    if (!similarMovies.length) return null;

    return (
        <div className="ml-6 flex gap-4 overflow-x-auto  scrollbar-thin scrollbar-thumb-slate-600 pb-2">
            {similarMovies.slice(0, 20).map((movie) => (
                <Link
                    key={movie.id}
                    to={`/movie/${movie.id}`}
                    className="flex-shrink-0 w-[110px] hover:scale-105 transition-transform duration-300"
                >
                    <div className="w-[110px] h-[160px] bg-slate-700 rounded overflow-hidden">
                        <img
                            src={
                                movie.poster_path
                                    ? `https://image.tmdb.org/t/p/w185${movie.poster_path}`
                                    : '/no-poster.png'
                            }
                            alt={movie.title}
                            className="w-full h-full  object-cover border-2 hover:border-green-500"
                        />
                    </div>
                </Link>
            ))}
        </div>
    )
}

export default SimilarMovies;
