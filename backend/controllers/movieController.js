const axios = require('axios');
const asyncHandler = require('express-async-handler');

const fetchMovies = asyncHandler(async (req, res) => {
    const { genre = '', page = 1 } = req.query;
    const apiKey = process.env.TMDB_API_KEY;

    if (!apiKey) {
        console.error("TMDB API key not set in environment variables.");
        return res.status(500).json({ message: "Server configuration error: API key missing" });
    }

    try {
        const response = await axios.get(`https://api.themoviedb.org/3/discover/movie`, {
            params: {
                api_key: apiKey,
                with_genres: genre,
                page
            },
            timeout: 10000 
        });

       
        res.json({
            page: response.data.page,
            results: response.data.results,
            total_pages: response.data.total_pages,
            total_results: response.data.total_results
        });

    } catch (error) {
        console.error(`Error fetching movies: ${error.message}`, error);

       
        res.status(500).json({
            message: "Failed to fetch movies",
            error: error.message
        });
    }
});

module.exports = { fetchMovies };
