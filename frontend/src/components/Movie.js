import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./MovieLists.css";

const apiKey = process.env.REACT_APP_TMDB_API_KEY;

const fetchTopRatedMovies = async () => {
  const totalPages = 6;
  const allMovies = [];

  for (let page = 1; page <= totalPages; page++) {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/top_rated`,
      {
        params: {
          api_key: apiKey,
          page: page,
        },
      },
    );
    allMovies.push(...response.data.results);
  }

  return allMovies;
};

const fetchUpcomingMovies = async () => {
  const totalPages = 1;
  const allMovies = [];

  for (let page = 1; page <= totalPages; page++) {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/upcoming`,
      {
        params: {
          api_key: apiKey,
          page: page,
        },
      },
    );
    allMovies.push(...response.data.results);
  }

  return allMovies;
};

const fetchTopRatedTVShows = async () => {
  const totalPages = 6;
  const allShows = [];

  for (let page = 1; page <= totalPages; page++) {
    const response = await axios.get(
      `https://api.themoviedb.org/3/tv/top_rated`,
      {
        params: {
          api_key: apiKey,
          page: page,
        },
      },
    );
    allShows.push(...response.data.results);
  }

  return allShows;
};

const fetchPopularTVShows = async () => {
  const totalPages = 2;
  const allShows = [];

  for (let page = 1; page <= totalPages; page++) {
    const response = await axios.get(
      `https://api.themoviedb.org/3/tv/airing_today`,
      {
        params: {
          api_key: apiKey,
          page: page,
        },
      },
    );
    allShows.push(...response.data.results);
  }

  return allShows;
};

const fetchTrending = async () => {
  const response = await axios.get(
    `https://api.themoviedb.org/3/trending/all/day`,
    {
      params: {
        api_key: apiKey,
        lang: "en-US",
      },
    },
  );
  return response.data.results;
};
const fetchMoviesByGenre = async (genreId, sortBy) => {
  const response = await axios.get(
    `https://api.themoviedb.org/3/discover/movie`,
    {
      params: {
        api_key: apiKey,
        with_genres: genreId,
        sort_by: sortBy,
        page: 1,
      },
    },
  );
  return response.data.results;
};

const CustomArrow = ({ className, onClick, direction }) => (
  <div
    className={className}
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2,
      position: "absolute",
      [direction === "left" ? "left" : "right"]: 15,
      top: "50%",
      transform: "translateY(-50%)",
      cursor: "pointer",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      borderRadius: "50%",
      width: "40px",
      height: "40px",
    }}
  >
    <span className="text-3xl text-white">
      {direction === "left" ? "‹" : "›"}
    </span>
  </div>
);

const Movie = () => {
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [topRatedTVShows, setTopRatedTVShows] = useState([]);
  const [otherMovies, setOtherMovies] = useState([]);
  const [upcomingmovies, setUpComingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [popularTVShows, setPopularTVShows] = useState([]);
  const [trending, setTrending] = useState([]);

  const movieLists = useMemo(
    () => [
      {
        title: "Newly Released Movies",
        genreId: null,
        sortBy: "popularity.desc",
      },
      { title: "Top Action Movies", genreId: 28, sortBy: "popularity.desc" },
      { title: "Best Comedy Movies", genreId: 35, sortBy: "popularity.desc" },
      { title: "Top Crime Movies", genreId: 80, sortBy: "popularity.desc" },
      { title: "Top Horror Movies", genreId: 27, sortBy: "popularity.desc" },
      { title: "Top Thriller Movies", genreId: 53, sortBy: "popularity.desc" },
      { title: "Top Family Movies", genreId: 10751, sortBy: "popularity.desc" },
      { title: "Top Fantasy Movies", genreId: 14, sortBy: "popularity.desc" },
      { title: "Top Mystery Movies", genreId: 9648, sortBy: "popularity.desc" },
      { title: "Top History Movies", genreId: 36, sortBy: "popularity.desc" },
      {
        title: "Top Documentary Movies",
        genreId: 99,
        sortBy: "popularity.desc",
      },
      { title: "Top Western Movies", genreId: 37, sortBy: "popularity.desc" },
      {
        title: "Top Musical Movies",
        genreId: 10402,
        sortBy: "popularity.desc",
      },
      { title: "Top War Movies", genreId: 10752, sortBy: "popularity.desc" },
      {
        title: "Top Romance Movies",
        genreId: 10749,
        sortBy: "popularity.desc",
      },
      { title: "Top Animation Movies", genreId: 16, sortBy: "popularity.desc" },
      { title: "Top Adventure Movies", genreId: 12, sortBy: "popularity.desc" },
      { title: "Top Sci-Fi Movies", genreId: 878, sortBy: "popularity.desc" },
      { title: "Top Drama Movies", genreId: 18, sortBy: "popularity.desc" },
 ],
    [],
  );

  useEffect(() => {
    const loadMovies = async () => {
      setLoading(true);
      try {
        const topRated = await fetchTopRatedMovies();
        setTopRatedMovies(topRated);

        const otherMoviesPromises = movieLists.map((list) =>
          fetchMoviesByGenre(list.genreId, list.sortBy),
        );
        const allOtherMovies = await Promise.all(otherMoviesPromises);
        setOtherMovies(allOtherMovies);
      } catch (err) {
        setError("Failed to fetch movies");
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, [movieLists]);

  useEffect(() => {
    const loadMovies = async () => {
      setLoading(true);
      try {
        const upcoming = await fetchUpcomingMovies();
        setUpComingMovies(upcoming);

        const otherMoviesPromises = movieLists.map((list) =>
          fetchMoviesByGenre(list.genreId, list.sortBy),
        );
        const allOtherMovies = await Promise.all(otherMoviesPromises);
        setOtherMovies(allOtherMovies);
      } catch (err) {
        setError("Failed to fetch movies");
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, [movieLists]);

  useEffect(() => {
    const loadShows = async () => {
      setLoading(true);
      try {
        const topRatedTVShows = await fetchTopRatedTVShows();
        setTopRatedTVShows(topRatedTVShows);
        const otherMoviesPromises = movieLists.map((list) =>
          fetchMoviesByGenre(list.genreId, list.sortBy),
        );
        const allOtherMovies = await Promise.all(otherMoviesPromises);
        setOtherMovies(allOtherMovies);
      } catch (err) {
        setError("Failed to fetch movies or shows");
      } finally {
        setLoading(false);
      }
    };

    loadShows();
  }, [movieLists]);

  useEffect(() => {
    const loadPopularShows = async () => {
      setLoading(true);
      try {
        const popularShows = await fetchPopularTVShows();
        setPopularTVShows(popularShows);
      } catch (err) {
        setError("Failed to fetch popular TV shows");
      } finally {
        setLoading(false);
      }
    };

    loadPopularShows();
  }, []);

  useEffect(() => {
    const loadTrending = async () => {
      try {
        const trendingData = await fetchTrending();
        setTrending(trendingData);
      } catch (err) {
        setError("Failed to fetch trending movies or shows");
      }
    };
    loadTrending();
  }, []);

  if (loading) return <p>Loading movies...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 10,
    slidesToScroll: 5,
    nextArrow: <CustomArrow direction="right" />,
    prevArrow: <CustomArrow direction="left" />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 6, slidesToScroll: 5 } },
      { breakpoint: 768, settings: { slidesToShow: 4, slidesToScroll: 3 } },
      { breakpoint: 480, settings: { slidesToShow: 2, slidesToScroll: 2 } },
    ],
  };

  return (
    <div className="text-white">
      <h2 className="text-lg font-semibold ml-2 mb-8">Top Rated Movies</h2>
      <Slider {...sliderSettings}>
        {topRatedMovies.map((movie) => (
          <Link
            to={`/movie/${movie.id}`}
            key={movie.id}
            className="movie-card p-2"
          >
            <img
              src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
              alt={movie.title}
              className="w-full h-auto rounded transition-transform duration-300 ease-in-out transform hover:scale-105"
            />
            <p className="mt-2 text-center text-sm">{movie.title}</p>
          </Link>
        ))}
      </Slider>

      <div className="text-white">
        <h2 className="text-lg font-semibold ml-2 mb-8">Upcoming Movies</h2>
        <Slider {...sliderSettings}>
          {upcomingmovies.map((movie) => (
            <Link
              to={`/movie/${movie.id}`}
              key={movie.id}
              className="movie-card p-2"
            >
              <img
                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                alt={movie.title}
                className="w-full h-auto rounded transition-transform duration-300 ease-in-out transform hover:scale-105"
              />
              <p className="mt-2 text-center text-sm">{movie.title}</p>
            </Link>
          ))}
        </Slider>

        <div className="text-white">
          <h2 className="text-lg font-semibold ml-2 mb-8">
            Top Rated TV Shows
          </h2>
          <Slider {...sliderSettings}>
            {topRatedTVShows.map((show) => (
              <Link
                to={`/show/${show.id}`}
                key={show.id}
                className="movie-card p-2"
              >
                <img
                  src={`https://image.tmdb.org/t/p/w200${show.poster_path}`}
                  alt={show.name}
                  className="w-full h-auto rounded transition-transform duration-300 ease-in-out transform hover:scale-105"
                />
                <p className="mt-2 text-center text-sm">{show.name}</p>
              </Link>
            ))}
          </Slider>

          <div className="text-white">
            <h2 className="text-lg font-semibold ml-2 mb-8">
              Today's TV Premieres
            </h2>
            <Slider {...sliderSettings}>
              {popularTVShows.map((show) => (
                <Link
                  to={`/show/${show.id}`}
                  key={show.id}
                  className="movie-card p-2"
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w200${show.poster_path}`}
                    alt={show.name}
                    className="w-full h-auto rounded transition-transform duration-300 ease-in-out transform hover:scale-105"
                  />
                  <p className="mt-2 text-center text-sm">{show.name}</p>
                </Link>
              ))}
            </Slider>
          </div>

          <div className="text-white">
            <h2 className="text-lg font-semibold ml-2 mb-8">Trending Now</h2>
            <Slider {...sliderSettings}>
              {trending.map((item) => (
                <Link
                  to={`/${item.media_type === "movie" ? "movie" : "show"}/${item.id}`}
                  key={item.id}
                  className="movie-card p-2"
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                    alt={item.title || item.name}
                    className="w-full h-auto rounded transition-transform duration-300 ease-in-out transform hover:scale-105"
                  />
                  <p className="mt-2 text-center text-sm">
                    {item.title || item.name}
                  </p>
                </Link>
              ))}
            </Slider>
          </div>

          {movieLists.map((list, index) => (
            <div key={index} className="mt-10">
              <h2 className="text-lg font-semibold mb-4">{list.title}</h2>
              <Slider {...sliderSettings}>
                {(otherMovies[index] || []).map((movie) => (
                  <Link
                    to={`/movie/${movie.id}`}
                    key={movie.id}
                    className="movie-card p-2"
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-auto rounded transition-transform duration-300 ease-in-out transform hover:scale-105"
                    />
                    <p className="mt-2 text-center text-sm">{movie.title}</p>
                  </Link>
                ))}
              </Slider>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Movie;
