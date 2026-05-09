require("dotenv").config();
const axios = require("axios");
const cosine = require("compute-cosine-similarity");
const { generateEmbedding } = require("../ai/embedding");

const API_KEY = process.env.TMDB_API_KEY;


const GENRE_MAP = {
  "mind bending": [878, 53, 9648],       
  "sad love story": [10749, 18],           
  "action": [28],                        
  "horror": [27],                       
  "funny": [35],                           
  "comedy": [35],
  "animated": [16],                        
  "superhero": [28, 878],                  
  "war": [10752],
  "crime": [80],
  "documentary": [99],
  "fantasy": [14],
  "adventure": [12],
  "family": [10751],
  "mystery": [9648],
};

function getGenreIds(query) {
  const lower = query.toLowerCase();
  const ids = new Set();
  for (const [keyword, genres] of Object.entries(GENRE_MAP)) {
    if (lower.includes(keyword)) {
      genres.forEach((id) => ids.add(id));
    }
  }
  return [...ids];
}

async function fetchMoviesByGenres(genreIds) {
  const res = await axios.get(
    `https://api.themoviedb.org/3/discover/movie`,
    {
      params: {
        api_key: API_KEY,
        with_genres: genreIds.join(","),  
        sort_by: "popularity.desc",
        "vote_count.gte": 1000,      
        "vote_average.gte": 6.0,    
        language: "en-US",
        page: 1,
      },
    }
  );
  return res.data.results;
}

async function fetchMoviesByKeyword(query) {
  const res = await axios.get(
    `https://api.themoviedb.org/3/search/movie`,
    {
      params: {
        api_key: API_KEY,
        query,
        language: "en-US",
        page: 1,
      },
    }
  );
  return res.data.results;
}

async function fetchPopularMovies() {
  const res = await axios.get(
    `https://api.themoviedb.org/3/movie/popular`,
    { params: { api_key: API_KEY } }
  );
  return res.data.results;
}

async function searchMovies(req, res) {
  try {
    const { query } = req.body;

    const genreIds = getGenreIds(query);


    const [genreMovies, keywordMovies, popularMovies] = await Promise.all([
      genreIds.length > 0 ? fetchMoviesByGenres(genreIds) : [],
      fetchMoviesByKeyword(query),
      fetchPopularMovies(),
    ]);


    const seen = new Set();
    const allMovies = [];
    for (const movie of [...genreMovies, ...keywordMovies, ...popularMovies]) {
      if (!seen.has(movie.id) && movie.overview && movie.poster_path) {
        seen.add(movie.id);
        allMovies.push(movie);
      }
    }


    const queryEmbedding = await generateEmbedding(query);

    const results = await Promise.all(
      allMovies.map(async (movie) => {
        const movieEmbedding = await generateEmbedding(movie.overview);
        let score = cosine(queryEmbedding, movieEmbedding) ?? 0;

      
        const matchedGenres = genreIds.filter((id) =>
          movie.genre_ids.includes(id)
        );
        score += matchedGenres.length * 0.15; 

        if (movie.vote_average) {
          score += (movie.vote_average / 10) * 0.1;
        }

        return {
          id: movie.id,      
          title: movie.title,
          poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
          score: Math.min(score, 1),  // cap at 1
          genres: movie.genre_ids,
          rating: movie.vote_average,
          year: movie.release_date?.split("-")[0] || "",
        };
      })
    );

    results.sort((a, b) => b.score - a.score);
    res.json(results.slice(0, 15));

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}

module.exports = { searchMovies };