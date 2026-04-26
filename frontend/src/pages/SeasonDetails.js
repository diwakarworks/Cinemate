import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BiArrowBack } from 'react-icons/bi';

const apiKey = process.env.REACT_APP_TMDB_API_KEY;

const SeasonDetails = () => {
    const {id, seasonNumber} = useParams();
    const [season, setSeason] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedEpisodes, setExpandedEpisodes] = useState(new Set());

    useEffect(() => {
        const fetchSeason = async () => {
            try {
                const res = await fetch(
                    `https://api.themoviedb.org/3/tv/${id}/season/${seasonNumber}?api_key=${apiKey}`
                );

                if (!res.ok) throw new Error('Failed to fetch season details');

                const data = await res.json();
                setSeason(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSeason();
    }, [id, seasonNumber]);

    const formatDate = (dateString) => {
        if (!dateString) return "TBA";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        }).format(date);
    };

    const toggleEpisodeExpanded = (episodeId) => {
        const newExpanded = new Set(expandedEpisodes);
        if (newExpanded.has(episodeId)) {
            newExpanded.delete(episodeId);
        } else {
            newExpanded.add(episodeId);
        }
        setExpandedEpisodes(newExpanded);
    };

    const truncateText = (text, maxLength = 150) => {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
                <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                    <span className="text-white text-lg">Loading season details...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
                    <div className="text-red-400 text-lg font-semibold mb-2">Error</div>
                    <div className="text-red-200">{error}</div>
                </div>
            </div>
        );
    }

    if (!season) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
                <div className="text-gray-400 text-lg">No season data found.</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Season Header */}
                <div className="mb-8 pb-6 border-b-2 border-cyan-400/30">
                    <div className="flex items-start space-x-6">
                        <BiArrowBack
                            className="w-12 h-12 mt-20  -ml-20 cursor-pointer text-white hover:text-blue-500"
                            onClick={() => window.history.back()}
                            />
                        {season.poster_path && (
                            <img
                                src={`https://image.tmdb.org/t/p/w300${season.poster_path}`}
                                alt={season.name}
                                className="w-32 h-48 object-cover rounded-xl shadow-2xl border-2 border-white/10"
                            />
                        )}
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold text-white mb-3 leading-tight">
                                {season.name}
                            </h1>
                            <div className="flex items-center space-x-6 mb-4 text-gray-300">
                                <span className="bg-cyan-500/20 -ml-2  text-cyan-300 px-3 py-1 rounded-full text-sm font-medium">
                                    {season.episodes?.length || 0} Episodes
                                </span>
                                {season.air_date && (
                                    <span className="text-gray-400">
                                        {new Date(season.air_date).getFullYear()}
                                    </span>
                                )}
                            </div>
                            {season.overview && (
                               <p className="absolute  text-gray-200 -mt-2 text-md leading-normal max-w-4xl">
                                    {season.overview}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Episodes List */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-white mb-6">Episodes</h2>
                    
                    {season.episodes?.map((episode, index) => {
                        const isExpanded = expandedEpisodes.has(episode.id);
                        const hasLongOverview = episode.overview && episode.overview.length > 150;
                        
                        return (
                            <div
                                key={episode.id}
                                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-cyan-400/30 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10"
                            >
                                <div className="flex items-start space-x-6">
                                    {/* Episode Image */}
                                    <div className="flex-shrink-0">
                                        {episode.still_path ? (
                                            <img
                                                src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                                                alt={episode.name}
                                                className="w-40 h-24 object-cover rounded-lg shadow-lg border border-white/20"
                                            />
                                        ) : (
                                            <div className="w-40 h-24 bg-slate-700/50 rounded-lg flex items-center justify-center border border-white/10">
                                                <span className="text-gray-400 text-sm font-medium">No Image</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Episode Info */}
                                    <div className="flex-1 min-w-0">
                                        {/* Episode Number and Title */}
                                        <div className="mb-3">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <span className="bg-cyan-500 -ml-1 text-white px-3 py-1 rounded-full text-sm font-bold">
                                                    {episode.episode_number}
                                                </span>
                                                <h3 className="text-xl font-semibold text-white leading-tight">
                                                    {episode.name || `Episode ${episode.episode_number}`}
                                                </h3>
                                            </div>
                                        </div>

                                        {/* Episode Meta */}
                                        <div className="flex items-center space-x-4 mb-4 text-sm">
                                            <span className="text-gray-300 bg-slate-700/30 px-2 py-1 rounded">
                                                {formatDate(episode.air_date)}
                                            </span>
                                            {episode.runtime && (
                                                <span className="text-gray-300 bg-slate-700/30 px-2 py-1 rounded">
                                                    {episode.runtime}m
                                                </span>
                                            )}
                                            {episode.vote_average > 0 && (
                                                <span className="text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded">
                                                    ⭐ {episode.vote_average.toFixed(1)}
                                                </span>
                                            )}
                                        </div>

                                        {/* Episode Overview */}
                                        {episode.overview && (
                                            <div className="text-gray-200 ml-2 leading-relaxed">
                                                <p>
                                                    {isExpanded ? episode.overview : truncateText(episode.overview)}
                                                </p>
                                                {hasLongOverview && (
                                                    <button
                                                        onClick={() => toggleEpisodeExpanded(episode.id)}
                                                        className="mt-2 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors duration-200"
                                                    >
                                                        {isExpanded ? 'Show Less' : 'Show More'}
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {!episode.overview && (
                                            <p className="text-gray-400 italic">No overview available.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {season.episodes?.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-lg">No episodes found for this season.</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SeasonDetails;
