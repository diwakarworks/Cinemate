import { useEffect, useState } from "react";
import { BiArrowBack } from "react-icons/bi";
import { useParams, useNavigate } from "react-router-dom";

const apiKey = process.env.REACT_APP_TMDB_API_KEY;

const TVSeasons = () => {
    const { id } = useParams();
    const [seasons, setSeasons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDetails, setShowDetails] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSeasons = async () => {
            try {
                const res = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}`);
                const data = await res.json();
                setSeasons(data.seasons || []);
            } catch (error) {
                console.error("Failed to fetch seasons", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSeasons();
    }, [id]);

    const handleSeasonClick = (seasonNumber) => {
        navigate(`/tv/${id}/season/${seasonNumber}`);
    };

    

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
                <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                    <span className="text-white text-lg">Loading seasons...</span>
                </div>
            </div>
        );
    }

    const handleBack = () => {
        navigate(-1);
    }
    return (
        <div
         className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center space-x-4 mb-8">
                        <BiArrowBack
                            className="w-8 h-8 mt-2 cursor-pointer text-white hover:text-blue-500"
                            onClick={handleBack}
                        />

                    <div className="h-6 w-px bg-gray-600"></div>
                    <h2 className="text-3xl font-bold text-white">All Seasons</h2>
                </div>
                
                          <hr className="border-gray-700 -mt-4 mb-4" />

                {/* Seasons Grid */}
                <div className="space-y-6">
                    {seasons.map((season) => (
                        <div
                            key={season.id}
                            onClick={() => handleSeasonClick(season.season_number)}
                            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-cyan-400/30 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10 cursor-pointer group"
                        >
                            <div className="flex gap-6 items-start">
                                {/* Season Poster */}
                                <div className="flex-shrink-0">
                                    {season.poster_path ? (
                                        <img
                                            src={`https://image.tmdb.org/t/p/w200${season.poster_path}`}
                                            alt={season.name}
                                            className="w-24 h-36 rounded-lg shadow-lg border border-white/20 object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-24 h-36 bg-slate-700/50 rounded-lg flex items-center justify-center border border-white/10">
                                            <span className="text-gray-400 text-xs text-center px-2">No Image</span>
                                        </div>
                                    )}
                                </div>

                                {/* Season Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <h3 className="text-xl font-semibold text-white group-hover:text-cyan-300 transition-colors duration-200">
                                            {season.name}
                                        </h3>
                                    </div>

                                    {/* Season Meta */}
                                    <div className="flex items-center space-x-4 mb-4 text-sm">
                                        <span className="text-green-500 -ml-2 bg-slate-700/30 px-2 py-1 rounded">
                                            {season.air_date?.slice(0, 4) || "N/A"}
                                        </span>
                                        <span className="text-red-500 bg-slate-700/30 px-2 py-1 rounded">
                                            {season.episode_count} Episodes
                                        </span>
                                    </div>

                                    {/* Season Overview */}
                                    <p className="text-gray-200  text-sm leading-relaxed line-clamp-3">
                                        {season.overview || "No overview available for this season."}
                                    </p>

                                    {/* Click indicator */}
                                    <div className="mt-4 flex items-center text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {seasons.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-lg">No seasons found for this series.</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TVSeasons;