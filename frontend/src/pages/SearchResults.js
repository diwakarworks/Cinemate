import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import ShowCard from '../components/ShowCard';
import { useLocation, Link } from 'react-router-dom';

const apiKey = process.env.REACT_APP_TMDB_API_KEY;

const SearchResults = () => {
    const [searchResults, setSearchResults] = useState({ movies: [], shows: [], people: [], collections: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const query = new URLSearchParams(useLocation().search).get('query');

    useEffect(() => {
        const fetchResults = async () => {
            if (query) {
                try {
                    const [moviesResponse, showsResponse] = await Promise.all([
                        axios.get(`https://api.themoviedb.org/3/search/movie`, {
                            params: { api_key: apiKey, query, language: 'en-US', include_adult: false }
                        }),
                        axios.get(`https://api.themoviedb.org/3/search/tv`, {
                            params: { api_key: apiKey, query, language: 'en-US' }
                        })
                    ]);

                    const moviesWithDetails = await Promise.all(moviesResponse.data.results.map(async (movie) => {
                        const [detail, credits] = await Promise.all([
                            axios.get(`https://api.themoviedb.org/3/movie/${movie.id}`, { params: { api_key: apiKey } }),
                            axios.get(`https://api.themoviedb.org/3/movie/${movie.id}/credits`, { params: { api_key: apiKey } })
                        ]);
                        return {
                            ...detail.data,
                            director: credits.data.crew.find(member => member.job === 'Director'),
                            cast: credits.data.cast.slice(0, 5)
                        };
                    }));

                    const showsWithDetails = await Promise.all(showsResponse.data.results.map(async (show) => {
                        const [detail, credits] = await Promise.all([
                            axios.get(`https://api.themoviedb.org/3/tv/${show.id}`, { params: { api_key: apiKey } }),
                            axios.get(`https://api.themoviedb.org/3/tv/${show.id}/credits`, { params: { api_key: apiKey } })
                        ]);
                        return {
                            ...detail.data,
                            director: credits.data.crew.find(member => member.job === 'Director'),
                            cast: credits.data.cast.slice(0, 5)
                        };
                    }));

                    setSearchResults(prev => ({
                        ...prev,
                        movies: moviesWithDetails,
                        shows: showsWithDetails
                    }));
                } catch (err) {
                    console.error('Error fetching movies/shows:', err);
                    setError('Failed to fetch movie/show results.');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchResults();
    }, [query]);

    useEffect(() => {
        const fetchPeople = async () => {
            try {
                const response = await axios.get('https://api.themoviedb.org/3/search/person', {
                    params: { api_key: apiKey, query, language: 'en-US' }
                });
                setSearchResults(prev => ({
                    ...prev,
                    people: response.data.results || []
                }));
            } catch (err) {
                console.error('Error fetching people:', err);
            }
        };

        if (query) fetchPeople();
    }, [query]);

    
    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const response = await axios.get('https://api.themoviedb.org/3/search/collection', {
                    params: { api_key: apiKey, query, language: 'en-US' }
                });
                setSearchResults(prev => ({
                    ...prev,
                    collections: response.data.results || []
                }));
            } catch (err) {
                console.error('Error fetching collections:', err);
            }
        };

        if (query) fetchCollections();
    }, [query]);

    if (loading) return <p className="text-center">Loading search results...</p>;
    if (error) return <p className="text-red-500 text-center">{error}</p>;

    return (
        <div className="p-4 min-h-screen">
            {searchResults.movies.length > 0 && (
                <div>
                    <h2 className="text-white ml-4 text-xl font-semibold mb-2">Movies</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {searchResults.movies.map(movie => (
                            <Link to={`/movie/${movie.id}`} key={movie.id} className="movie-card p-2">
                                <MovieCard movie={movie} />
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {searchResults.shows.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-white text-xl ml-4 font-semibold mb-2">TV Shows</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {searchResults.shows.map(show => (
                            <Link to={`/show/${show.id}`} key={show.id} className="movie-card p-2">
                                <ShowCard show={show} />
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {searchResults.people.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-white text-xl font-semibold mb-2">People</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {searchResults.people.map(person => (
                            <Link to={`/person/${person.id}`} key={person.id} className="border-2 hover:border-green-500 rounded-md p-2 text-center">
                                {person.profile_path && (
                                    <img
                                        src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                                        alt={person.name}
                                        className="w-full h-auto rounded"
                                    />
                                )}
                                <p className="text-blue-400 mt-2">{person.name}</p>
                                <p className="text-sm">
                                    <span className="text-red-500 font-medium">
                                        {person.known_for_department || 'N/A'}
                                    </span>
                                    <span className="text-white"> • {person.known_for?.map(work => work.title || work.name).join(', ')}</span>
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            
            {searchResults.collections.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-white text-xl ml-1 font-semibold mb-4">Collections</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {searchResults.collections.map(collection => (
                            <Link
                                to={`/collection/${collection.id}`}
                                key={collection.id}
                                className="border-2 hover:border-green-500 rounded-md p-2 text-center"
                            >
                                {collection.poster_path ? (
                                    <img
                                        src={`https://image.tmdb.org/t/p/w185${collection.poster_path}`}
                                        alt={collection.name}
                                        className="w-full h-auto rounded"
                                    />
                                ) : (
                                    <div className="w-full h-40 bg-gray-700 rounded flex items-center justify-center">
                                        <span className="text-gray-400 text-sm">No Image</span>
                                    </div>
                                )}
                                <p className="text-blue-400 mt-2 font-medium">{collection.name}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {searchResults.movies.length === 0 && searchResults.shows.length === 0 &&
             searchResults.people.length === 0 && searchResults.collections.length === 0 && (
                <p className="text-white mt-6">No results found for "{query}".</p>
            )}
        </div>
    );
};

export default SearchResults;