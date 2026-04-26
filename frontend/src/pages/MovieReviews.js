import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReviewCard from '../components/ReviewCard';
import { FaUser } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const apiKey = process.env.REACT_APP_TMDB_API_KEY;

// --- Movies ---
const fetchPopularMovies = async () => {
    const response = await axios.get(`https://api.themoviedb.org/3/movie/popular`, {
        params: { api_key: apiKey, language: 'en-US', page: 1 },
    });
    return response.data.results;
};

const fetchMovieReviews = async (movieId) => {
    const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}/reviews`, {
        params: { api_key: apiKey, language: 'en-US' },
    });
    return response.data.results;
};

const fetchMovieDetails = async (movieId) => {
    const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
        params: { api_key: apiKey, language: 'en-US' },
    });
    return response.data;
};

export const fetchRandomMovieReviews = async (numberOfMovies = 20) => {
    const movies = await fetchPopularMovies();
    const randomIds = [];

    while (randomIds.length < numberOfMovies) {
        const randomMovie = movies[Math.floor(Math.random() * movies.length)];
        if (!randomIds.includes(randomMovie.id)) randomIds.push(randomMovie.id);
    }

    const reviewsPromises = randomIds.map(async (movieId) => {
        const reviews = await fetchMovieReviews(movieId);
        const movieDetails = await fetchMovieDetails(movieId);
        const releaseYear = movieDetails.release_date.split('-')[0];
        return { reviews, title: movieDetails.title, year: releaseYear, type: 'movie' };
    });

    return Promise.all(reviewsPromises);
};

// --- Series ---
const fetchPopularSeries = async () => {
    const response = await axios.get(`https://api.themoviedb.org/3/tv/popular`, {
        params: { api_key: apiKey, language: 'en-US', page: 1 },
    });
    return response.data.results;
};

const fetchSeriesReviews = async (seriesId) => {
    const response = await axios.get(`https://api.themoviedb.org/3/tv/${seriesId}/reviews`, {
        params: { api_key: apiKey, language: 'en-US' },
    });
    return response.data.results;
};

const fetchSeriesDetails = async (seriesId) => {
    const response = await axios.get(`https://api.themoviedb.org/3/tv/${seriesId}`, {
        params: { api_key: apiKey, language: 'en-US' },
    });
    return response.data;
};

export const fetchRandomSeriesReviews = async (numberOfSeries = 20) => {
    const series = await fetchPopularSeries();
    const randomIds = [];

    while (randomIds.length < numberOfSeries) {
        const randomShow = series[Math.floor(Math.random() * series.length)];
        if (!randomIds.includes(randomShow.id)) randomIds.push(randomShow.id);
    }

    const reviewsPromises = randomIds.map(async (seriesId) => {
        const reviews = await fetchSeriesReviews(seriesId);
        const seriesDetails = await fetchSeriesDetails(seriesId);
        const releaseYear = seriesDetails.first_air_date?.split('-')[0] || 'N/A';
        return { reviews, title: seriesDetails.name, year: releaseYear, type: 'series' };
    });

    return Promise.all(reviewsPromises);
};

// --- Component ---
const MovieReviews = () => {
    const [activeTab, setActiveTab] = useState('movies');
    const [movieReviews, setMovieReviews] = useState([]);
    const [seriesReviews, setSeriesReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const getData = async () => {
            try {
                const [movies, series] = await Promise.all([
                    fetchRandomMovieReviews(20),
                    fetchRandomSeriesReviews(20),
                ]);
                setMovieReviews(movies);
                setSeriesReviews(series);
            } catch (err) {
                setError('Failed to fetch reviews');
            } finally {
                setLoading(false);
            }
        };
        getData();
    }, []);

    if (loading) return <p className="text-white">Loading reviews...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    const displayedReviews = activeTab === 'movies' ? movieReviews : seriesReviews;

    return (
        <div className="text-white">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-gray-400 font-semibold ml-7">REVIEWS</h2>
                <Link to="/userreviews">
                    <FaUser className="text-white text-2xl cursor-pointer mr-6" />
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 ml-6 mb-8">
                <button
                    onClick={() => setActiveTab('movies')}
                    className={`px-5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        activeTab === 'movies'
                            ? 'bg-white text-black border-white'
                            : 'bg-transparent text-white border-white/30 hover:border-white/60'
                    }`}
                >
                    Movies
                </button>
                <button
                    onClick={() => setActiveTab('series')}
                    className={`px-5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        activeTab === 'series'
                            ? 'bg-white text-black border-white'
                            : 'bg-transparent text-white border-white/30 hover:border-white/60'
                    }`}
                >
                    Series
                </button>
            </div>

            {/* Reviews List */}
            {displayedReviews.length === 0 ? (
                <p className="ml-6">No reviews available.</p>
            ) : (
                <ul>
                    {displayedReviews.map(({ reviews, title, year }, index) => (
                        <li key={index} className="mb-8">
                            <ReviewCard title={`${title} ${year}`} />
                            {reviews.length === 0 ? (
                                <p className="ml-4 mt-2 text-gray-400">No reviews available for this title.</p>
                            ) : (
                                <ul className="mt-4">
                                    {reviews.map(review => (
                                        <li key={review.id} className="mb-2">
                                            <h4 className="font-semibold ml-4 mb-4">{review.author}</h4>
                                            <p className="ml-4 mb-8">{review.content}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MovieReviews;