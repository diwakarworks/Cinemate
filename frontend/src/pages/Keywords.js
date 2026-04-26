import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';

const apiKey = process.env.REACT_APP_TMDB_API_KEY;

const Keywords = () => {
    const { tagdata } = useParams();
    const [movies, setMovies] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    // Split the parameter to get ID and name
    const dashIndex = tagdata?.indexOf('-') || -1;
    const tagid = tagdata?.substring(0, dashIndex);
    const tagname = tagdata?.substring(dashIndex + 1);

    useEffect(() => {
        const fetchKeywordMovies = async () => {
            if (!tagid) return;

            setLoading(true);
            try {
                const res = await axios.get('https://api.themoviedb.org/3/discover/movie', {
                    params: {
                        api_key: apiKey,
                        with_keywords: tagid,
                        language: 'en-US',
                        page: currentPage,
                    },
                });
                setMovies(res.data.results);
                setTotalPages(Math.min(res.data.total_pages, 500)); // TMDB limits to 500 pages
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchKeywordMovies();
    }, [tagid, currentPage]);

    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePageClick = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getVisiblePages = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 p-6 text-white">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-900">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-left mb-12">
                    <h1 className="text-4xl md:text-4xl font-bold text-white mb-4">
                        {tagname ? decodeURIComponent(tagname) : 'Loading...'}
                    </h1>
                </div>

                {/* Movies Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-12">
                    {movies.map((movie) => (
                        <Link to={`/movie/${movie.id}`} className="block">
                            <div
                                key={movie.id}
                                className="group relative overflow-hidden h-full rounded-sm bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 cursor-pointer"
                            >
                                <div className="aspect-[2/3] overflow-hidden">
                                    <img
                                        src={movie.poster_path
                                            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                                            : '/api/placeholder/300/450'
                                        }
                                        alt={movie.title}
                                        className="w-full h-full border-2 group-hover:border-green-500 object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="absolute bottom-0 left-0 right-0 p-4">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="bg-yellow-500 text-black px-2 py-1 rounded-full font-semibold">
                                                    ⭐ {movie.vote_average?.toFixed(1)}
                                                </span>
                                                <span className="text-gray-300">
                                                    {movie.release_date?.substring(0, 4)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-sm font-semibold text-white line-clamp-2 ">
                                            {movie.title}
                                        </h3>
                                        <p className="text-xs text-gray-400 mt-1 line-clamp-1 ">
                                            {movie.overview}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center space-x-2 mt-12">
                        <button
                            onClick={handlePrevious}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-300 flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span>Previous</span>
                        </button>

                        <div className="flex space-x-1">
                            {getVisiblePages().map((page, index) => (
                                <button
                                    key={index}
                                    onClick={() => typeof page === 'number' && handlePageClick(page)}
                                    disabled={page === '...'}
                                    className={`px-3 py-2 rounded-lg transition-colors duration-300 ${page === currentPage
                                        ? 'bg-purple-600 text-white'
                                        : page === '...'
                                            ? 'text-gray-400 cursor-default'
                                            : 'bg-gray-800 text-white hover:bg-purple-600'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-300 flex items-center space-x-2"
                        >
                            <span>Next</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Page Info */}
                <div className="text-center mt-6 text-gray-400">
                    <p>Page {currentPage} of {totalPages}</p>
                </div>
            </div>
        </div>
    );
};

export default Keywords;    
