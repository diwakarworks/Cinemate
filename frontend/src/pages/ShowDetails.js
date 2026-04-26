import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Stars from './Stars';
import { X } from "lucide-react"
import SimilarShows from './SimilarShows';
import TVProviders from './TVProviders';
import WatchlistButton from './WatchListButton';

const apiKey = process.env.REACT_APP_TMDB_API_KEY;

const ShowDetails = () => {
    const { id } = useParams();
    const [externalIds, setExternalIds] = useState(null);
    const [show, setShow] = useState(null);
    const [isZoomed, setIsZoomed] = useState();
    const [cast, setCast] = useState([]);
    const [genres, setGenres] = useState([]);
    const [certification, setCertification] = useState([]);
    const [crew, setCrew] = useState({
        Director: null,
        Producer: null,
        ExecutiveProducer: null,
        CostumeDesign: null,
        ArtDirection: null,
        Writing: null,
    });
    const [trailer, setTrailer] = useState('');
    const [searchParams] = useSearchParams();
    const tagname = searchParams.get('tag.name');
    const [error, setError] = useState('');
    const [series, setSeries] = useState();
    const [keywords, setKeywords] = useState([]);
    const [countries, setCountries] = useState([]);
    const [creatorId, setCreatorId] = useState('');
    const [reviews, setReviews] = useState([]);
    const[isInWatchlist, setIsInWatchlist] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchShowDetails = async () => {
            try {
                const showResponse = await axios.get(`https://api.themoviedb.org/3/tv/${id}`, {
                    params: { api_key: apiKey },
                });
                setShow(showResponse.data);

                const videoResponse = await axios.get(`https://api.themoviedb.org/3/tv/${id}/videos`, {
                    params: { api_key: apiKey },
                });
                const trailerVideo = videoResponse.data.results.find(video => video.type === 'Trailer');
                if (trailerVideo) {
                    setTrailer(`https://www.youtube.com/watch?v=${trailerVideo.key}`);
                }

                const creditsResponse = await axios.get(`https://api.themoviedb.org/3/tv/${id}/credits`, {
                    params: { api_key: apiKey },
                });
                const reviewsResponse = await axios.get(`https://api.themoviedb.org/3/tv/${id}/reviews`, {
                    params: { api_key: apiKey },
                });
                setReviews(reviewsResponse.data.results.slice(0, 3));

                const crewData = creditsResponse.data.crew;
                console.log(crewData);

                const directorData = crewData
                    .filter(member =>
                        member.job === 'Director' ||
                        (member.department === 'Production' &&
                            member.job === 'Executive Producer' &&
                            member.known_for_department === 'Writing')
                    )
                    .sort((a, b) => b.popularity - a.popularity)[0];

                if (directorData) {
                    setCreatorId(directorData.id);
                }

                const producerData = crewData.find(member => member.job === 'Producer');
                const executiveProducerData = crewData.find(member => member.job === 'Executive Producer' || member.job === 'Co-Executive Producer');
                const costumeDesignData = crewData.find(member => member.job === 'Costume Design');
                const artDirectionData = crewData.find(member => member.job === 'Art Direction');
                const writingData = crewData.find(member => member.department === 'Writing');

                setCrew({
                    Director: directorData || null,
                    Producer: producerData,
                    ExecutiveProducer: executiveProducerData,
                    CostumeDesign: costumeDesignData,
                    ArtDirection: artDirectionData,
                    Writing: writingData,
                });

                const castData = creditsResponse.data.cast.slice(0, 6);
                setCast(castData);

            } catch (err) {
                setError('Failed to load show details.');
                console.error('Error fetching show details:', err);
            }
        };

        fetchShowDetails();
    }, [id]);

    useEffect(() => {
        const fetchExtras = async () => {
            try {
                const [keywordsRes, showRes] = await Promise.all([
                    axios.get(`https://api.themoviedb.org/3/tv/${show.id}/keywords`, {
                        params: { api_key: apiKey },
                    }),
                    axios.get(`https://api.themoviedb.org/3/tv/${show.id}`, {
                        params: { api_key: apiKey },
                    }),
                ]);

                setKeywords(keywordsRes.data.results || []);
                setCountries(showRes.data.production_countries || []);
            } catch (error) {
                console.error('Failed to fetch keywords or countries:', error);
            }
        };

        if (show?.id) fetchExtras();
    }, [show?.id]);

    useEffect(() => {
        const fetchSeriesData = async () => {
            try {
                const [genreRes, certRes] = await Promise.all([
                    axios.get(`https://api.themoviedb.org/3/tv/${id}`, {
                        params: {
                            api_key: process.env.REACT_APP_TMDB_API_KEY,
                            language: "en-US",
                        },
                    }),
                    axios.get(`https://api.themoviedb.org/3/tv/${id}/content_ratings`, {
                        params: {
                            api_key: process.env.REACT_APP_TMDB_API_KEY,
                        },
                    }),
                ]);

                setGenres(genreRes.data.genres || []);


                const ratings = certRes.data.results;
                const region = ratings.find((r) => r.iso_3166_1 === "IN") || ratings.find((r) => r.iso_3166_1 === "US");
                setCertification(region?.rating || "NR");
            } catch (err) {
                console.error("Error fetching series data", err);
            }
        };

        fetchSeriesData();
    }, [id]);




    const handleBack = () => {
        navigate('/');
    };

    const openZoom = () => {
        setIsZoomed(true);
        document.body.style.overflow = 'hidden'
    }

    const closeZoom = () => {
        setIsZoomed(false);
        document.body.style.overflow = 'unset';
    }


    const handleReviewClick = (reviewId) => {
        navigate(`/tv/${id}/review/${reviewId}`);
    };



    const handleIMDBClick = () => {
        try {
            const imdbId = externalIds?.imdb_id || show.external_ids?.imdb_id || show.imdb_id;

            if (imdbId) {
                window.open(`https://www.imdb.com/title/${imdbId}`, '_blank');
            } else {
                if (show.name) {
                    const searchQuery = encodeURIComponent(show.name);
                    window.open(`https://www.imdb.com/find?q=${searchQuery}`, '_blank');
                }
            }
        }
        catch (error) {
            console.error('Error opening IMDB link:', error);
        }
    };
    const handleJustWatchClick = () => {
        // JustWatch search by show name
        if (show.name) {
            const searchQuery = encodeURIComponent(show.name);
            window.open(`https://www.justwatch.com/us/search?q=${searchQuery}`, '_blank');
        }
    };


    const handleMedia = () => {
        navigate(`/series/${id}/gallery`)
    }



    if (!show) return <p>Loading show details...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="show-details max-w-4xl min-h-screen max-h-full mx-auto p-6 bg-gray-900 text-white rounded-lg shadow-lg">
            {/* Back button at the top */}

            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                <img
                    src={`https://image.tmdb.org/t/p/w300${show.poster_path}`}
                    alt={show.name}
                    className="w-full md:w-60 h-auto rounded-lg shadow-lg ml-4 cursor-pointer"
                    onClick={openZoom}
                />
                {isZoomed && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-95 backdrop-blur-md"
                        style={{
                            marginLeft: 'calc(-50vw + 50%)',
                            marginRight: 'calc(-50vw + 50%)',
                            width: '100vw'
                        }}

                    >
                        <button
                            onClick={closeZoom}
                            className="absolute top-4 right-4 text-white hover:text-gray-300 hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
                        >
                            <X size={24} />
                        </button>

                        <div
                            className="relative max-w-4xl max-h-[90vh] p-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={`https://image.tmdb.org/t/p/w400${show.poster_path}`}
                                alt={show.title}
                                className="w-full h-full object-contain rounded-lg shadow-2xl"
                            />
                        </div>
                    </div>


                )}

                <WatchlistButton movieId={id} onStatusChange={setIsInWatchlist} type="series" />

                 
                <div className="flex-1 space-y-4">
                    <h1 className="text-4xl font-bold text-white ml-8">{show.name}</h1>
                    <div className="">

                        <p className="text-md ml-8 text-gray-400 flex flex-wrap gap-1 mb-4">

                            {certification && (
                                <span className="text-md text-gray-400">{certification}</span>
                            )}

                            {certification && show.genres.length > 0 && (
                                <span className="text-gray-400"> &nbsp;•</span>
                            )}
                            {show.genres.map((genre, index) => (
                                <span key={genre.id} className="flex items-center">
                                    <Link
                                        to={`/genre/${genre.id}-${encodeURIComponent(genre.name)}/tv`}
                                        className="text-md  text-gray-400 hover:text-white transition-colors"
                                    >
                                        {genre.name}
                                    </Link>
                                    {index < show.genres.length - 1 && (
                                        <span className="text-gray-400 ml-1">,</span>
                                    )}
                                </span>
                            ))}
                        </p>
                    </div>


                    <p className="ml-9">
                        DIRECTED BY
                        <br />
                        {crew.Director && crew.Director.id && (
                            <Link to={`/show-creator/${crew.Director.id}`}>
                                <span className="text-gray-300 font-semibold">{crew.Director.name}</span>
                            </Link>
                        )}
                    </p>
                    <Link to={`/tv/${id}/seasons`}>
                    <p className="ml-9">{new Date(show.first_air_date).getFullYear()}  • {show.number_of_seasons} Seasons</p>
                    </Link>





                    {trailer && (
                        <div className="ml-9 mt-4">
                            <a href={trailer} target="_blank" rel="noopener noreferrer">
                                TRAILER
                            </a>
                        </div>
                    )}


                    <p className="text-gray-300 text-md ml-9 italic">{show.tagline}</p>
                    <p className="text-gray-400 ml-9">{show.overview}</p>

                    <p className="ml-9">
                        <strong>Rating:</strong>
                        <Stars rating={show.vote_average} />
                    </p>
                    <button
                        className="absolute bg-blue-400 -ml-60 bottom-64 mt-10 p-2 w-24  hover:bg-blue-500 rounded-full"
                        onClick={handleBack}
                    >
                        Back
                    </button>

                    <hr className="border-gray-700 ml-8 mt-10 mb-14" />

                    <div className="mt-6 ml-4 space-y-4">
                        {/* Tags */}
                        {keywords.length > 0 && (
                            <div>
                                <h4 className="text-gray-500 font-semibold ml-4 mb-2">TAGS</h4>
                                <div className="ml-4 flex flex-wrap gap-1">
                                    {keywords.map((tag) => (
                                        <Link
                                            key={tag.id}
                                            to={`/keyword/${tag.id}-${encodeURIComponent(tag.name)}/tv`}
                                        >
                                            <span className="bg-gray-300 font-sans text-black text-xs font-semibold px-2 py-1 rounded">
                                                {tag.name}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        <hr className="border-gray-700 mt-10 ml-4 mb-14" />

                        {countries.length > 0 && (
                            <div>
                                <h4 className="text-gray-400 ml-4  font-semibold mb-2">ORIGINS</h4>
                                <div className="flex flex-wrap gap-2">
                                    {countries.map((c) => (
                                        <span
                                            key={c.iso_3166_1}
                                            className="bg-slate-700 text-gray-200 ml-2 text-md font-medium px-2 py-1 rounded-full"
                                        >
                                            {c.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <hr className="border-gray-700 mt-10 ml-8 mb-14" />


                    <p className=" text-gray-400 ml-8 font-semibold">CAST</p>
                    <div className="flex ml-9 mb-4 space-x-6">
                        {cast.map(actor => (
                            <div key={actor.cast_id} className="text-center">
                                {actor.profile_path ? (
                                    <Link to={`/person/${actor.id}`}>
                                        <img
                                            src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                                            alt={actor.name}
                                            className="w-20 h-20 rounded-full mx-auto"
                                        />
                                    </Link>
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-gray-500 mx-auto"></div>
                                )}
                                <p className="text-gray-500 text-sm mt-2">{actor.name}</p>
                                <p className="text-gray-400 text-xs">{actor.character}</p>
                            </div>
                        ))}
                    </div>

                    <hr className="border-gray-700 ml-8 mt-10 mb-2" />

                    {/* Crew Details */}
                    <p className=" text-gray-400 ml-8  font-semibold">CREW</p>
                    <div className="flex ml-9 mb-4 space-x-6">
                        {Object.entries(crew).map(([role, member]) => member && (
                            <div key={member.id} className="text-center">
                                {member.profile_path ? (
                                    <img
                                        src={`https://image.tmdb.org/t/p/w200${member.profile_path}`}
                                        alt={member.name}
                                        className="w-20 h-20 rounded-full mx-auto"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-gray-500 mx-auto mb-2"></div>
                                )}
                                <p className="text-gray-500 text-sm mt-2">{member.name}</p>
                                <p className="text-gray-400 text-xs mb-2">{role.replace(/([A-Z])/g, ' $1')}</p>
                            </div>
                        ))}
                    </div>
                    <hr className="border-gray-700 mt-10 ml-8 mb-2" />

                    <TVProviders/>
                     <hr className="border-gray-700 mt-10 ml-8 mb-2" />

                    <p className="text-gray-500 font-semibold ml-8 text-md mt-8">REVIEWS</p>
                    {reviews.length > 0 ? (
                        <div className="space-y-6 mt-4">
                            {reviews.map((review) => {
                                let avatarUrl = review.author_details.avatar_path;

                                if (avatarUrl) {
                                    if (avatarUrl.startsWith("/")) {
                                        avatarUrl = `https://media.themoviedb.org/t/p/w150_and_h150_face${avatarUrl}`;
                                    }
                                } else {
                                    avatarUrl = "https://placeholder.com/50/50";
                                }

                                return (
                                    <div key={review.id} className="bg-stone-900 shadow-lg flex items-start space-x-4">
                                        <img
                                            src={avatarUrl}
                                            alt={review.author}
                                            className="ml-8 w-8 h-8 rounded-full border-2 border-gray-600"
                                        />

                                        <div className="flex-1">
                                            <p className="text-gray-400 font-semibold">{review.author}</p>

                                            {review.author_details.rating && (
                                                <div className="flex items-center space-x-1 mt-1">
                                                    {Array.from({ length: Math.floor(review.author_details.rating) }, (_, i) => (
                                                        <span key={i} className="text-green-500 ml-80 text-lg">★</span>
                                                    ))}
                                                    {review.author_details.rating % 1 !== 0 && <span className="text-green-500 text-lg opacity-50">★</span>}
                                                </div>
                                            )}

                                            <p className="text-gray-300 text-sm mt-2">
                                                {review.content.length > 250 ? `${review.content.substring(0, 250)}...` : review.content}
                                            </p>
                                            <button
                                                onClick={() => handleReviewClick(review.id)}
                                                className="text-gray-500 text-sm hover:text-gray-600 ml-96 mt-2"
                                            >
                                                FULL REVIEW →
                                            </button>


                                            <hr className="border-gray-700 mt-4" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-500">No reviews available.</p>
                    )}



                    <h3 className="absolute text-gray-400  ml-8 text-xs font-semibold">SIMILAR SHOWS</h3>
                    {/* Similar Shows section - now properly placed inside the main content */}
                    <hr className="border-gray-700 mt-12 ml-8 mb-4" />
                    <SimilarShows seriesId={id} />
                    <div className="flex items-center gap-2 text-sm">
                        <span className="absolute text-gray-400 ml-8 font-semibold">OPEN IN</span>
                        <button
                            onClick={handleIMDBClick}
                            className="bg-yellow-500 mt-20 text-black ml-8  cursor-pointer px-2 py-1 rounded font-semibold hover:bg-yellow-600 transition-colors"
                        >
                            IMDB
                        </button>
                        <button
                            onClick={handleJustWatchClick}
                            className="bg-blue-600 text-black mt-20 ml-2 cursor-pointer px-2 py-1 rounded font-semibold hover:bg-blue-700 transition-colors"

                        >
                            JustWatch
                        </button>
                        <button
                            onClick={handleMedia}
                            className="bg-blue-600 text-black mt-20 ml-2 cursor-pointer px-2 py-1 rounded font-semibold hover:bg-blue-700 transition-colors"

                        >
                            Media
                        </button>
                    </div>

                </div>
            </div>
        </div >
    );
};


export default ShowDetails;
