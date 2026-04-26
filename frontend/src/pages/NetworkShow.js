import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const NetworkShows = () => {
    const { id } = useParams(); // TV network ID
    const [shows, setShows] = useState([]);
    const [networkName, setNetworkName] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    const API_KEY = process.env.REACT_APP_TMDB_API_KEY;

    useEffect(() => {
        const fetchNetworkShows = async () => {
            try {
                setLoading(true);

                // 1️⃣ Get TV shows with that network
                const showRes = await axios.get(
                    `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_networks=${id}&page=${currentPage}`
                );
                setShows(showRes.data.results);
                setTotalPages(showRes.data.total_pages);
                setTotalResults(showRes.data.total_results);

                // 2️⃣ Get network name (only on first load)
                if (currentPage === 1) {
                    const networkRes = await axios.get(
                        `https://api.themoviedb.org/3/network/${id}?api_key=${API_KEY}`
                    );
                    setNetworkName(networkRes.data.name);
                }

                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch shows by network:', error);
                setLoading(false);
            }
        };

        fetchNetworkShows();
    }, [id, currentPage]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const renderPagination = () => {
        const pages = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        // Adjust start page if we're near the end
        if (endPage - startPage < maxPagesToShow - 1) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        // Previous button
        pages.push(
            <button
                key="prev"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
            >
                Previous
            </button>
        );

        // First page if not in range
        if (startPage > 1) {
            pages.push(
                <button
                    key={1}
                    onClick={() => handlePageChange(1)}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                    1
                </button>
            );
            if (startPage > 2) {
                pages.push(
                    <span key="ellipsis1" className="px-3 py-2 text-gray-400">
                        ...
                    </span>
                );
            }
        }

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${i === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                >
                    {i}
                </button>
            );
        }

        // Last page if not in range
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push(
                    <span key="ellipsis2" className="px-3 py-2 text-gray-400">
                        ...
                    </span>
                );
            }
            pages.push(
                <button
                    key={totalPages}
                    onClick={() => handlePageChange(totalPages)}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                    {totalPages}
                </button>
            );
        }

        // Next button
        pages.push(
            <button
                key="next"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
            >
                Next
            </button>
        );

        return pages;
    };

    if (loading && currentPage === 1) {
        return (
            <div className="min-h-screen bg-stone-900">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-300 rounded-lg w-64 mb-8"></div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                            {[...Array(20)].map((_, i) => (
                                <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                                    <div className="aspect-[2/3] bg-gray-300"></div>
                                    <div className="p-4">
                                        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-800">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {networkName || `Network #${id}`}
                    </h1>
                    <p className="text-gray-600">
                        {totalResults > 0 ? `${totalResults} shows found` : 'No shows found'}
                    </p>
                </div>

                {/* Loading overlay for pagination */}
                {loading && currentPage > 1 && (
                    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
                        <div className="bg-stone-900 rounded-lg p-6 shadow-lg">
                            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                            <p className="mt-4 text-gray-600 text-center">Loading...</p>
                        </div>
                    </div>
                )}

                {/* Shows Grid */}
                {shows.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mb-12">
                            {shows.map((show) => (
                                <div
                                    key={show.id}
                                    className="bg-white rounded-none shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group"
                                >
                                    <div className="aspect-[2/3] overflow-hidden">
                                        <Link to={`/show/${show.id}`}>
                                            <img
                                                src={
                                                    show.poster_path
                                                        ? `https://image.tmdb.org/t/p/w342${show.poster_path}`
                                                        : 'https://via.placeholder.com/342x513/e5e7eb/9ca3af?text=No+Image'
                                                }
                                                alt={show.name}
                                                className="w-full h-full object-cover transition-transform duration-200 border-4 border-transparent group-hover:border-green-500 group-hover:scale-105"
                                            />
                                        </Link>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2">
                                            {show.name}
                                        </h3>
                                        {show.first_air_date && (
                                            <p className="text-xs text-gray-500">
                                                {new Date(show.first_air_date).getFullYear()}
                                            </p>
                                        )}
                                        {show.vote_average > 0 && (
                                            <div className="flex items-center mt-2">
                                                <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                                <span className="text-xs text-gray-600">
                                                    {show.vote_average.toFixed(1)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-2">
                                <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                    {renderPagination()}
                                </div>
                            </div>
                        )}

                        {/* Page Info */}
                        <div className="text-center mt-6">
                            <p className="text-sm text-gray-500">
                                Page {currentPage} of {totalPages} • Showing {shows.length} of {totalResults} results
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No shows found</h3>
                        <p className="text-gray-500">This network doesn't have any shows available.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NetworkShows;