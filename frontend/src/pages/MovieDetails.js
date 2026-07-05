import React, { useEffect, useState } from "react";
import {
  useParams,
  useSearchParams,
  useNavigate,
  Link,
} from "react-router-dom";
import axios from "axios";
import Stars from "./Stars";
import WatchlistButton from "./WatchListButton";
import { X } from "lucide-react";
import SimilarMovies from "../pages/SimilarMovies";
import MovieProvidersAndProduction from "./MovieProvidersAndProduction";
import AddToFavoritesButton from "../components/AddToFavoritesButton";

const apiKey = process.env.REACT_APP_TMDB_API_KEY;

const region = "US";

const MovieDetails = () => {
  const { id } = useParams();
  const [isZoomed, setIsZoomed] = useState();
  const [tmdbId, setTmdbId] = useState();
  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [genres, setGenres] = useState([]);
  const [searchParams] = useSearchParams();
  const [certification, setCertification] = useState("");
  const [isInWatchlist, setIsInWatchlist] = useState("false");
  const tagname = searchParams.get("tag.name");
  const [crew, setCrew] = useState({
    director: null,
    producer: null,
    cinematographer: null,
    writer: null,
    visualEffects: null,
  });
  const [trailer, setTrailer] = useState(null);
  const [externalIds, setExternalIds] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [countries, setCountries] = useState([]);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [movieDetails, setMovieDetails] = useState();
  const navigate = useNavigate();
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    const cached = localStorage.getItem("tmdb_languages");
    if (cached) {
      const parsed = JSON.parse(cached);
      const isValid =
        Array.isArray(parsed) &&
        parsed.length > 50 &&
        parsed.every((l) => l.iso_639_1 && l.english_name);
      if (isValid) {
        setLanguages(parsed);
        return;
      }
    }
    const fetchLanguages = async () => {
      try {
        const res = await axios.get(
          `https://api.themoviedb.org/3/configuration/languages`,
          { params: { api_key: apiKey } },
        );
        const cleaned = res.data
          .filter((l) => l.english_name)
          .map((l) => ({
            iso_639_1: l.iso_639_1,
            english_name: l.english_name,
          }));
        setLanguages(cleaned);
        localStorage.setItem("tmdb_languages", JSON.stringify(cleaned));
        console.log(cleaned,"tmdb languages");
      } catch (err) {
        console.error("Failed to fetch languages:", err);
      }
    };
    fetchLanguages();
  }, []);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const movieResponse = await axios.get(
          `https://api.themoviedb.org/3/movie/${id}`,
          {
            params: { api_key: apiKey },
          },
        );
        setMovie(movieResponse.data);

        const creditsResponse = await axios.get(
          `https://api.themoviedb.org/3/movie/${id}/credits`,
          {
            params: { api_key: apiKey },
          },
        );

        const crewData = creditsResponse.data.crew;

        const directorData = crewData.find(
          (member) => member.job === "Director",
        );
        const producerData = crewData.find(
          (member) => member.job === "Producer",
        );
        const cinematographerData = crewData.find(
          (member) =>
            member.job === "Director of Photography" ||
            member.job === "Cinematographer",
        );
        const writerData = crewData.find((member) => member.job === "Writer");
        const visualEffectsData = crewData.find(
          (member) => member.job === "Visual Effects Supervisor",
        );

        setCrew({
          director: directorData,
          producer: producerData,
          cinematographer: cinematographerData,
          writer: writerData,
          visualEffects: visualEffectsData,
        });

        const castData = creditsResponse.data.cast.slice(0, 5);
        setCast(castData);

        const videosResponse = await axios.get(
          `https://api.themoviedb.org/3/movie/${id}/videos`,
          {
            params: { api_key: apiKey },
          },
        );
        const youtubeTrailer = videosResponse.data.results.find(
          (video) => video.site === "YouTube" && video.type === "Trailer",
        );
        if (youtubeTrailer) {
          setTrailer(`https://www.youtube.com/watch?v=${youtubeTrailer.key}`);
        }

        const reviewsResponse = await axios.get(
          `https://api.themoviedb.org/3/movie/${id}/reviews`,
          {
            params: { api_key: apiKey },
          },
        );
        setReviews(reviewsResponse.data.results.slice(0, 3));
      } catch (err) {
        setError("Failed to load movie details.");
        console.error("Error fetching movie details:", err);
      }
    };

    fetchMovieDetails();
  }, [id]);

  useEffect(() => {
    const fetchExternalIds = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(
          `https://api.themoviedb.org/3/movie/${movie.id}/external_ids`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              api_key: apiKey,
            },
          },
        );
        const data = res.data;
        console.log(data);
        setExternalIds(res.data);
      } catch (err) {
        console.error("Failed to fetch external IDs:", err);
      }
    };

    if (movie?.id) fetchExternalIds();
  }, [movie?.id]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await axios.get(
          `https://api.themoviedb.org/3/genre/movie/list`,
          {
            params: {
              api_key: apiKey,
              language: "en-US",
            },
          },
        );
        setGenres(res.data.genres);
      } catch (error) {
        console.error("Failed to fetch genres:", error);
      }
    };

    fetchGenres();
  }, [movie]);

  useEffect(() => {
    const status = localStorage.getItem(`watchlist-${id}`);
    console.log("Watchlist status:", status);
    setIsInWatchlist(status === "added");
  }, [id]);

  useEffect(() => {
    const fetchCertification = async () => {
      try {
        const res = await axios.get(
          `https://api.themoviedb.org/3/movie/${id}/release_dates`,
          {
            params: {
              api_key: apiKey,
            },
          },
        );

        const results = res.data.results;
        const region =
          results.find((r) => r.iso_3166_1 === "IN") ||
          results.find((r) => r.iso_3166_1 === "US");

        if (region) {
          const cert = region.release_dates.find((r) => r.certification !== "");
          setCertification(cert?.certification || "NR");
        }
      } catch (err) {
        console.error("Error fetching certification", err);
      }
    };

    fetchCertification();
  }, [id]);

  useEffect(() => {
    const fetchExtras = async () => {
      try {
        const [keywordsRes, movieRes] = await Promise.all([
          axios.get(`https://api.themoviedb.org/3/movie/${movie.id}/keywords`, {
            params: { api_key: apiKey },
          }),
          axios.get(`https://api.themoviedb.org/3/movie/${movie.id}`, {
            params: { api_key: apiKey },
          }),
        ]);

        setKeywords(keywordsRes.data.keywords || []);
        setCountries(movieRes.data.production_countries || []);
      } catch (error) {
        console.error("Failed to fetch keywords or countries:", error);
      }
    };

    if (movie?.id) fetchExtras();
  }, [movie?.id]);

  const List = () => {
    navigate("/");
  };

  const handleReviewClick = (reviewId) => {
    navigate(`/review/${reviewId}`);
  };

  const openZoom = () => {
    setIsZoomed(true);
    document.body.style.overflow = "hidden";
  };

  const closeZoom = () => {
    setIsZoomed(false);
    document.body.style.overflow = "unset";
  };

  const handleIMDBClick = () => {
    const imdbId =
      externalIds?.imdb_id || movie.external_ids?.imdb_id || movie.imdb_id;

    if (imdbId) {
      window.open(
        `https://www.imdb.com/title/${externalIds.imdb_id}`,
        "_blank",
      );
    }
  };

  const handleJustWatchClick = () => {
    if (movie?.title || movie?.name) {
      const name = movie.title || movie.name;
      const query = encodeURIComponent(name);
      window.open(`https://www.justwatch.com/us/search?q=${query}`, "_blank");
    }
  };

  const handleMoodboard = () => {
    navigate(`/movie/${id}/gallery`);
  };

  const originalLanguageName =
  languages.find((l) => l.iso_639_1 === movie?.original_language)
    ?.english_name || movie?.original_language;

  if (!movie) return <p>Loading movie details...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="movie-details max-w-4xl min-h-screen max-h-full mx-auto p-6 bg-gray-900 text-white rounded-lg shadow-lg">
      <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
        <img
          src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
          alt={movie.title}
          className="w-full md:w-60 h-auto rounded-lg shadow-lg ml-4 cursor-pointer"
          onClick={openZoom}
        />
        {isZoomed && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-95 backdrop-blur-md"
            style={{
              marginLeft: "calc(-50vw + 50%)",
              marginRight: "calc(-50vw + 50%)",
              width: "100vw",
            }}
            onClick={closeZoom}
          >
            <button
              onClick={closeZoom}
              className="absolute top-4 right-4 z-60 p-2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full text-white transition-all duration-200"
            >
              <X size={24} />
            </button>

            <div
              className="relative max-w-4xl max-h-[90vh] p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={`https://image.tmdb.org/t/p/w400${movie.poster_path}`}
                alt={movie.title}
                className="w-full h-full object-contain rounded-lg shadow-2xl"
              />
            </div>
          </div>
        )}

        <WatchlistButton movieId={id} onStatusChange={setIsInWatchlist} />

        <AddToFavoritesButton
          movieId={movie.id}
          title={movie.title}
          year={new Date(movie.release_date).getFullYear()}
          posterPath={movie.poster_path}
        />

        <div className="flex-1 space-y-6">
          <h1 className="text-4xl font-bold text-white ml-8">{movie.title}</h1>
          <div className="">
            <p className="text-md ml-8 text-gray-400 flex flex-wrap gap-1 mb-4">
              {certification && (
                <span className="text-md text-gray-400">{certification}</span>
              )}

              {certification && movie.genres.length > 0 && (
                <span className="text-gray-400"> &nbsp;•</span>
              )}
              {movie.genres.map((genre, index) => (
                <span key={genre.id} className="flex items-center">
                  <Link
                    to={`/genre/${genre.id}-${encodeURIComponent(
                      genre.name,
                    )}/movie`}
                    className="text-md  text-gray-400 hover:text-white transition-colors"
                  >
                    {genre.name}
                  </Link>
                  {index < movie.genres.length - 1 && (
                    <span className="text-gray-400 ml-1">,</span>
                  )}
                </span>
              ))}
            </p>
          </div>

          <p className="ml-8 ">
            DIRECTED BY &nbsp;
            <br />
            {crew.director ? (
              <Link
                to={`/director/${crew.director.id}`}
                className="text-gray-300 font-semibold "
              >
                {crew.director.name}
              </Link>
            ) : (
              <span className="text-gray-300 font-semibold">Unknown</span>
            )}
          </p>

          <p className="ml-9">
            {new Date(movie.release_date).getFullYear()} {movie.runtime} mins
          </p>
          {trailer && (
            <p className="ml-9 uppercase cursor-pointer">
              <a href={trailer} target="_blank" rel="noopener noreferrer">
                Trailer
              </a>
            </p>
          )}

          <p className="text-gray-300 text-md ml-9 italic">{movie.tagline}</p>
          <p className="text-gray-400 ml-9">{movie.overview}</p>

          <p className="ml-9">
            <strong>Rating:</strong>
            <Stars rating={movie.vote_average} />
          </p>

          {isInWatchlist && (
            <>
              <hr className="border-gray-700 mt-10 ml-8 mb-8" />
              <div className="ml-8 my-8">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 text-gray-300 rounded-full text-md">
                  ✓ This film in your watchlist
                </span>
              </div>
              <hr className="border-gray-700 mt-8 ml-8 mb-10" />
            </>
          )}

          <div className="mt-6 ml-4 space-y-4">
            {/* Tags */}
            {keywords.length > 0 && (
              <div>
                <h4 className="text-gray-400 font-semibold ml-4 mb-2">TAGS</h4>
                <div className="ml-4 flex flex-wrap gap-1">
                  {keywords.map((tag) => (
                    <Link
                      to={`/keyword/${tag.id}-${encodeURIComponent(
                        tag.name,
                      )}/movie`}
                    >
                      <span
                        key={tag.id}
                        className="bg-gray-300 font-sans text-black text-xs font-semibold px-2 py-1 rounded"
                      >
                        {tag.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {movie.belongs_to_collection && (
              <Link
                to={`/collection/${movie.belongs_to_collection.id}`}
                className="block ml-3 mt-8"
              >
                <div className="flex items-center gap-4 p-4 bg-zinc-900 rounded-xl border border-zinc-800 hover:bg-zinc-800 transition cursor-pointer w-fit">
                  {/* Poster */}
                  <img
                    src={`https://image.tmdb.org/t/p/w200${movie.belongs_to_collection.poster_path}`}
                    alt={movie.belongs_to_collection.name}
                    className="w-16 h-24 object-cover rounded-lg shadow"
                  />

                  {/* Text */}
                  <div>
                    <p className="text-xs text-gray-400">Part of</p>
                    <h3 className="text-lg font-semibold text-white">
                      {movie.belongs_to_collection.name}
                    </h3>
                    <p className="text-sm text-blue-400  mt-1">
                      View Collection
                    </p>
                  </div>
                </div>
              </Link>
            )}

            <hr className="border-gray-700 mt-10 ml-4 mb-14" />

            {countries.length > 0 && (
              <div>
                <h4 className="text-gray-400 ml-4  font-semibold mb-2">
                  ORIGINS
                </h4>
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

          {movie.original_language && (
            <div className="mt-4">
              <h4 className="text-gray-400 ml-8 font-semibold mb-2">
                ORIGINAL LANGUAGE
              </h4>
              <div className="flex flex-wrap gap-2">
                <span className="bg-slate-700 ml-6 text-gray-200 ml-2 text-md font-medium px-2 py-1 mb-4 rounded-full">
                  {originalLanguageName}
                </span>
              </div>
              <h4 className="text-gray-400 ml-8 font-semibold mb-2">
                ORIGINAL Title
              </h4>
              {(movie.original_title || movie.title) && (
                <span className="text-white ml-8 text-sm italic">
                  {movie.original_title || movie.title}
                </span>
              )}
            </div>
          )}

          <hr className="border-gray-700 mt-10 ml-8 mb-14" />

          <p className=" text-gray-400 ml-8 font-semibold">CAST</p>
          <div className="flex ml-9 mb-4 space-x-6">
            {cast.map((actor) => (
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
                <p className="text-gray-300 text-sm font-semibold mt-2">
                  {actor.name}
                </p>
                <p className="text-gray-500 text-xs">{actor.character}</p>
              </div>
            ))}
          </div>

          <hr className="border-gray-700 mt-10 ml-8 mb-2" />

          {/* Crew Details */}
          <p className="text-gray-400 ml-8 font-semibold">CREW</p>
          <div className="flex ml-9 mb-4 space-x-6">
            {crew.director && (
              <div key={crew.director.id} className="text-center">
                {crew.director.profile_path ? (
                  <Link to={`/person/${crew.director.id}`}>
                    <img
                      src={`https://image.tmdb.org/t/p/w200${crew.director.profile_path}`}
                      alt={crew.director.name}
                      className="w-20 h-20 rounded-full mx-auto"
                    />
                  </Link>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-500 mx-auto"></div>
                )}
                <p className="text-gray-300 text-sm mt-2">
                  {crew.director.name}
                </p>
                <p className="text-gray-400 text-xs">Director</p>
              </div>
            )}
            {crew.producer && (
              <div key={crew.producer.id} className="text-center">
                {crew.producer.profile_path ? (
                  <Link to={`/person/${crew.producer.id}`}>
                    <img
                      src={`https://image.tmdb.org/t/p/w200${crew.producer.profile_path}`}
                      alt={crew.producer.name}
                      className="w-20 h-20 rounded-full mx-auto"
                    />
                  </Link>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-500 mx-auto"></div>
                )}
                <p className="text-gray-300 text-sm mt-2">
                  {crew.producer.name}
                </p>
                <p className="text-gray-400 text-xs">Producer</p>
              </div>
            )}
            {crew.cinematographer && (
              <div key={crew.cinematographer.id} className="text-center">
                {crew.cinematographer.profile_path ? (
                  <Link to={`/person/${crew.cinematographer.id}`}>
                    <img
                      src={`https://image.tmdb.org/t/p/w200${crew.cinematographer.profile_path}`}
                      alt={crew.cinematographer.name}
                      className="w-20 h-20 rounded-full mx-auto"
                    />
                  </Link>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-500 mx-auto"></div>
                )}
                <p className="text-gray-300 text-sm mt-2">
                  {crew.cinematographer.name}
                </p>
                <p className="text-gray-400 text-xs">Cinematographer</p>
              </div>
            )}
            {crew.writer && (
              <div key={crew.writer.id} className="text-center">
                {crew.writer.profile_path ? (
                  <Link to={`/person/${crew.writer.id}`}>
                    <img
                      src={`https://image.tmdb.org/t/p/w200${crew.writer.profile_path}`}
                      alt={crew.writer.name}
                      className="w-20 h-20 rounded-full mx-auto"
                    />
                  </Link>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-500 mx-auto"></div>
                )}
                <p className="text-gray-300 text-sm mt-2">{crew.writer.name}</p>
                <p className="text-gray-400 text-xs">Writer</p>
              </div>
            )}
            {crew.visualEffects && (
              <div key={crew.visualEffects.id} className="text-center mb-4">
                {crew.visualEffects.profile_path ? (
                  <Link to={`/person/${crew.visualEffects.id}`}>
                    <img
                      src={`https://image.tmdb.org/t/p/w200${crew.visualEffects.profile_path}`}
                      alt={crew.visualEffects.name}
                      className="w-20 h-20 rounded-full mx-auto"
                    />
                  </Link>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-500 mx-auto"></div>
                )}
                <p className="text-gray-300 text-sm mt-2">
                  {crew.visualEffects.name}
                </p>
                <p className="text-gray-400 text-xs">Visual Effects</p>
              </div>
            )}
          </div>
          <hr className="border-gray-700 mt-10 ml-6 mb-14" />
          <MovieProvidersAndProduction id={id} />
          <hr className="border-gray-700 mt-10 ml-6 mb-14" />
          <p className="text-gray-500 font-semibold ml-6 text-md mt-8">
            REVIEWS
          </p>
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
                  <div
                    key={review.id}
                    className="bg-stone-900  shadow-lg flex items-start space-x-4"
                  >
                    <img
                      src={avatarUrl}
                      alt={review.author}
                      className="w-10 h-10 ml-6 mb-8 rounded-full border-2 border-gray-600"
                    />

                    <div className="flex-1">
                      <p className="text-gray-400  font-semibold">
                        {review.author}
                      </p>

                      {review.author_details.rating && (
                        <div className="flex items-center space-x-1 mt-1">
                          {Array.from(
                            {
                              length: Math.floor(review.author_details.rating),
                            },
                            (_, i) => (
                              <span
                                key={i}
                                className="text-green-500 ml-80 text-lg"
                              >
                                ★
                              </span>
                            ),
                          )}
                          {review.author_details.rating % 1 !== 0 && (
                            <span className="text-green-500 text-lg opacity-50">
                              ★
                            </span>
                          )}
                        </div>
                      )}

                      <p className="text-gray-300 text-sm mt-2">
                        {review.content.length > 250
                          ? `${review.content.substring(0, 250)}...`
                          : review.content}
                      </p>
                      <button
                        onClick={() => handleReviewClick(review.id)}
                        className="text-gray-500 text-sm hover:text-gray-600 ml-96 mt-2"
                      >
                        FULL REVIEW →
                      </button>

                      <hr className="border-gray-700  mt-4" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 ml-6 ">No reviews available.</p>
          )}

          <h3 className="absolute text-gray-400 ml-6  text-sm font-semibold">
            SIMILAR FILMS
          </h3>

          <hr className="border-gray-700 mt-12 ml-6  mb-14" />

          <SimilarMovies movieId={id} />
          <div className="flex items-center gap-2 text-sm">
            <span className="absolute ml-6  text-gray-400 font-semibold">
              OPEN IN
            </span>
            <button
              onClick={handleIMDBClick}
              className="bg-yellow-500 text-black mt-20 ml-6 px-2 py-1 cursor-pointer rounded font-semibold hover:bg-yellow-600 transition-colors"
            >
              IMDB
            </button>
            <button
              onClick={handleJustWatchClick}
              className="bg-blue-400 text-black mt-20 ml-2     cursor-pointer px-2 py-1 rounded font-semibold hover:bg-blue-500 transition-colors"
            >
              JustWatch
            </button>
            <button
              onClick={handleMoodboard}
              className=" absolute mt-20 ml-48 w-20 h-7 leading-none  px-4 py-2 bg-indigo-600 text-black font-semibold rounded hover:bg-indigo-700 transition"
            >
              Media
            </button>
          </div>
        </div>
        <div className="absolute flex flex-col justify-between h-screen">
          <button
            className="bg-blue-400 mb-4 mx-auto p-2 w-24 hover:bg-blue-500 rounded-full mt-96 ml-16"
            onClick={List}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};
export default MovieDetails;
