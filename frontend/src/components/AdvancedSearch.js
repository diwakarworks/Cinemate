import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MovieCard from './MovieCard';
import ShowCard from './ShowCard';
import { useNavigate, Link } from "react-router-dom";
import { BiArrowBack } from 'react-icons/bi';

const apiKey = process.env.REACT_APP_TMDB_API_KEY;

const AdvancedSearch = () => {
    const [searchResults, setSearchResults] = useState([]);
    const [filters, setFilters] = useState({ genre: '', year: '', rating: '' });
    const [genres, setGenres] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGenres = async () => {
            const [movieRes, tvRes] = await Promise.all([
                axios.get(`https://api.themoviedb.org/3/genre/movie/list`, { params: { api_key: apiKey } }),
                axios.get(`https://api.themoviedb.org/3/genre/tv/list`, { params: { api_key: apiKey } }),
            ]);
            const allGenres = [...movieRes.data.genres, ...tvRes.data.genres];
            const unique = Array.from(new Map(allGenres.map(g => [g.name, g])).values());
            unique.sort((a, b) => a.name.localeCompare(b.name));
            setGenres(unique);
        };
        fetchGenres();
    }, []);

    const handleSearch = async () => {
        try {
            const params = {
                api_key: apiKey,
                with_genres: filters.genre || undefined,
                'vote_average.gte': filters.rating || undefined,
            };

            const [movieRes, tvRes] = await Promise.all([
                axios.get(`https://api.themoviedb.org/3/discover/movie`, {
                    params: { ...params, primary_release_year: filters.year || undefined },
                }),
                axios.get(`https://api.themoviedb.org/3/discover/tv`, {
                    params: { ...params, first_air_date_year: filters.year || undefined },
                }),
            ]);

            const movieBasic = movieRes.data.results.map(item => ({ ...item, mediaType: 'movie' }));
            const series = tvRes.data.results.map(item => ({ ...item, mediaType: 'tv' }));

            // Fetch full details + credits for each movie
            const movieDetails = await Promise.all(
                movieBasic.slice(0, 9).map(item =>
                    axios.get(`https://api.themoviedb.org/3/movie/${item.id}`, {
                        params: { api_key: apiKey, append_to_response: 'credits' },
                    }).then(res => ({
                        ...res.data,
                        mediaType: 'movie',
                        director: res.data.credits?.crew?.find(p => p.job === 'Director') || null,
                        cast: res.data.credits?.cast?.slice(0, 5) || [],
                    }))
                )
            );

            const combined = [...movieDetails, ...series]
                .sort((a, b) => b.popularity - a.popularity)
                .slice(0, 9);

            setSearchResults(combined);
            setHasSearched(true);
        } catch (error) {
            console.error("Error fetching search results:", error);
        }
    };

    return (
        <div className="bg-stone-900 min-h-screen rounded shadow-md p-8 sm:p-12 text-white">
            <div className="flex items-center mb-8">
                <BiArrowBack
                    className="w-8 h-8 cursor-pointer text-white hover:text-blue-500"
                    onClick={() => navigate('/')}
                />
                <h2 className="text-3xl font-semibold ml-4">Advanced Search</h2>
            </div>
            <hr className="border-gray-700 mb-10" />

            <div className="max-w-lg mx-auto space-y-6">
                <div>
                    <label className="block text-sm font-medium text-white mb-2">Genre</label>
                    <select
                        value={filters.genre}
                        onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
                        className="w-full border border-gray-700 rounded-md p-3 bg-gray-800 text-gray-300 focus:outline-none focus:ring focus:ring-blue-500"
                    >
                        <option value="">Select a genre</option>
                        {genres.map(genre => (
                            <option key={genre.id} value={genre.id}>{genre.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-white mb-2">Year</label>
                    <input
                        type="text"
                        value={filters.year}
                        onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                        className="w-full border border-gray-700 rounded-md p-3 bg-gray-800 text-gray-300 focus:outline-none focus:ring focus:ring-blue-500"
                        placeholder="Enter year"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-white mb-2">Rating</label>
                    <input
                        type="number"
                        value={filters.rating}
                        onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                        className="w-full border border-gray-700 rounded-md p-3 bg-gray-800 text-gray-300 focus:outline-none focus:ring focus:ring-blue-500"
                        placeholder="Minimum rating (1-10)"
                        min="1"
                        max="10"
                    />
                </div>

                <button
                    onClick={handleSearch}
                    className="w-full bg-blue-600 text-white font-semibold py-3 rounded-md hover:bg-blue-700 transition duration-200"
                >
                    Search
                </button>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {searchResults.length > 0 ? (
                    searchResults.map(item => (
                        <Link
                            to={item.mediaType === 'movie' ? `/movie/${item.id}` : `/show/${item.id}`}
                            key={`${item.mediaType}-${item.id}`}
                            className="movie-card p-2"
                        >
                            {item.mediaType === 'movie'
                                ? <MovieCard movie={item} />
                                : <ShowCard show={item} />
                            }
                        </Link>
                    ))
                ) : (
                    hasSearched && (
                        <p className="text-white text-center w-full col-span-full">No results found.</p>
                    )
                )}
            </div>
        </div>
    );
};

export default AdvancedSearch;