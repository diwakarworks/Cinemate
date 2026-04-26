    import React, { useEffect, useState } from 'react';
    import axios from 'axios';
    import { Link } from 'react-router-dom';

    const apiKey = process.env.REACT_APP_TMDB_API_KEY;

    const SimilarShows = ({ seriesId }) => {
    const [similarShows, setSimilarShows] = useState([]);

    useEffect(() => {
        const fetchSimilar = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get(`https://api.themoviedb.org/3/tv/${seriesId}/recommendations`, {
            params: {
                api_key: apiKey,
                language: 'en-US',
                page: 1,
            },
            });
            const data = res.data;
            console.log(data);
            setSimilarShows(res.data.results?.slice(0, 20) || []);
        } catch (err) {
            console.error('Error fetching similar shows:', err);
        }
        };

        if (seriesId) fetchSimilar();
    }, [seriesId]);

    if (!similarShows.length) return null;

    return (
        <div className="ml-8 flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-600 pb-2 ">
                    {similarShows.slice(0, 20).map((show) => (
                        <Link
                            key={show.id}
                            to={`/show/${show.id}`}
                            className="flex-shrink-0 w-[110px] hover:scale-105 transition-transform duration-300"
                        >
                            <div className="w-[110px] h-[160px] bg-slate-700 rounded  overflow-hidden">
                                <img
                                    src={
                                        show.poster_path
                                            ? `https://image.tmdb.org/t/p/w185${show.poster_path}`
                                            : '/no-poster.png'
                                    }
                                    alt={show.title}
                                    className="w-full h-full object-cover border-2 hover:border-green-500"
                                />
                            </div>
                        </Link>
                    ))}
                </div>
            )
        }

    export default SimilarShows;
