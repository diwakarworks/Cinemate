const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const axios = require('axios');
const Movie = require('../models/Movie');
const Series = require('../models/Series');
const mongoose = require('mongoose');


const getUserStats = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user.stats);
    } catch (error) {
        console.error(`Error ${error.message}`)
        res.status(500).json({ message: 'Failed to get User Stats' });
    }
});

// const addToWatchlist = asyncHandler(async (req, res) => {
//     const userId = req.user._id;
//     const { movieId } = req.body;

//     try {
//         const user = await User.findById(userId);
//         if (!user) return res.status(404).json({ message: 'User not found' });

        
//         if (!Array.isArray(user.watchlist)) {
//             user.watchlist = [];
//         }

//         const movieIdStr = movieId ? movieId.toString() : null;
//         console.log(movieIdStr);
//         if (!movieIdStr) {
//             return res.status(400).json({ message: 'Invalid movieId' });
//         }

//         if (!user.watchlist.includes(movieIdStr)) {
//             user.watchlist.push(movieIdStr);
//             await user.save();
//             res.status(201).json({ message: 'Movie added to watchlist' });
//         } else {
//             res.status(200).json({ message: 'Movie already in watchlist' });
//         }
//     } catch (error) {
//         console.error(`Error: ${error.message}`);
//         res.status(500).json({ message: 'Movie Watchlist error' });
//     }
// });



const addToWatchlist = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { movieId, seriesId, type } = req.body; 

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (type === 'movie') {
            if (!Array.isArray(user.watchlist)) user.watchlist = [];

            const movieIdStr = movieId?.toString();
            if (!movieIdStr) return res.status(400).json({ message: 'Invalid movieId' });

            if (!user.watchlist.includes(movieIdStr)) {
                user.watchlist.push(movieIdStr);
                await user.save();
                return res.status(201).json({ message: 'Movie added to watchlist' });
            } else {
                return res.status(200).json({ message: 'Movie already in watchlist' });
            }

        } else if (type === 'series') {
            if (!Array.isArray(user.seriesWatchlist)) user.seriesWatchlist = [];

            const seriesIdStr = seriesId?.toString();
            if (!seriesIdStr) return res.status(400).json({ message: 'Invalid seriesId' });

            if (!user.seriesWatchlist.includes(seriesIdStr)) {
                user.seriesWatchlist.push(seriesIdStr);
                await user.save();
                return res.status(201).json({ message: 'Series added to watchlist' });
            } else {
                return res.status(200).json({ message: 'Series already in watchlist' });
            }

        } else {
            return res.status(400).json({ message: 'Invalid type. Use "movie" or "series"' });
        }

    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).json({ message: 'Watchlist error' });
    }
});

const updateStats = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { totalMoviesWatched, favoriteGenres } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.stats) {
            user.stats = { totalMoviesWatched: 0, favoriteGenres: new Map() };
        } else if (!user.stats.favoriteGenres) {
            user.stats.favoriteGenres = new Map();
        }

        user.stats.totalMoviesWatched += totalMoviesWatched;

        for (const genre in favoriteGenres) {
            const currentCount = user.stats.favoriteGenres.get(genre) || 0;
            user.stats.favoriteGenres.set(genre, currentCount + favoriteGenres[genre]);
        }

        await user.save();
        res.status(200).json({ message: 'User stats updated' });
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).json({ message: 'User stats error' });
    }
});

const deleteStats = asyncHandler(async (req, res) => {
    const userId = req.params.id;

    try {
        // Find and update the user by unsetting the 'stats' field
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $unset: { stats: "" } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User stats deleted successfully" });
    } catch (error) {
        console.error(`Error deleting stats: ${error.message}`);
        res.status(500).json({ message: "Failed to delete user stats" });
    }
});

// const getWatchlist = asyncHandler(async (req, res) => {

//     const userId = req.user._id;

//     try {
//         const user = await User.findById(userId).select('watchlist').lean();
//         if (!user) return res.status(404).json({ message: 'User not found' });

//         const fetchMovieDetails = async (movieId, retries = 3) => {
//             try {
//                 const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
//                     params: { api_key: process.env.TMDB_API_KEY },
//                     timeout: 5000, // Set timeout to 5s
//                     httpAgent: new (require('http').Agent)({ keepAlive: true }), // Keep connection alive
//                     httpsAgent: new (require('https').Agent)({ keepAlive: true }),
//                 });
//                 return response.data;
//             } catch (error) {
//                 if (retries > 0) {
//                     console.warn(`Retrying fetch for movie ${movieId}, attempts left: ${retries}`);
//                     await new Promise((resolve) => setTimeout(resolve, 500)); // Small delay before retry
//                     return fetchMovieDetails(movieId, retries - 1);
//                 }
//                 console.error(`Failed to fetch movie ${movieId}:`, error.message);
//                 return null; // Skip movie on persistent failure
//             }
//         };

//         const movieDetails = await Promise.all(user.watchlist.map(movieId => fetchMovieDetails(movieId)));

//         res.status(200).json({ watchlist: movieDetails.filter(movie => movie !== null) }); // Remove null responses
//     } catch (error) {
//         console.error(`Error: ${error.message}`);
//         res.status(500).json({ message: 'Failed to retrieve watchlist' });
//     }
// });

const getWatchlist = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    try {
        const user = await User.findById(userId).select('watchlist seriesWatchlist').lean();
        if (!user) return res.status(404).json({ message: 'User not found' });

        const agentOptions = {
            httpAgent: new (require('http').Agent)({ keepAlive: true }),
            httpsAgent: new (require('https').Agent)({ keepAlive: true }),
        };

        // Fetch movie details from TMDB
        const fetchMovieDetails = async (movieId, retries = 3) => {
            try {
                const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
                    params: { api_key: process.env.TMDB_API_KEY },
                    timeout: 5000,
                    ...agentOptions,
                });
                return { ...response.data, mediaType: 'movie' }; // tag it
            } catch (error) {
                if (retries > 0) {
                    console.warn(`Retrying fetch for movie ${movieId}, attempts left: ${retries}`);
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    return fetchMovieDetails(movieId, retries - 1);
                }
                console.error(`Failed to fetch movie ${movieId}:`, error.message);
                return null;
            }
        };

        // Fetch series details from TMDB
        const fetchSeriesDetails = async (seriesId, retries = 3) => {
            try {
                const response = await axios.get(`https://api.themoviedb.org/3/tv/${seriesId}`, {
                    params: { api_key: process.env.TMDB_API_KEY },
                    timeout: 5000,
                    ...agentOptions,
                });
                return { ...response.data, mediaType: 'series' }; // tag it
            } catch (error) {
                if (retries > 0) {
                    console.warn(`Retrying fetch for series ${seriesId}, attempts left: ${retries}`);
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    return fetchSeriesDetails(seriesId, retries - 1);
                }
                console.error(`Failed to fetch series ${seriesId}:`, error.message);
                return null;
            }
        };

        // Fetch both in parallel
        const [movieDetails, seriesDetails] = await Promise.all([
            Promise.all((user.watchlist || []).map(id => fetchMovieDetails(id))),
            Promise.all((user.seriesWatchlist || []).map(id => fetchSeriesDetails(id))),
        ]);

        res.status(200).json({
            watchlist: movieDetails.filter(Boolean),
            seriesWatchlist: seriesDetails.filter(Boolean),
        });

    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).json({ message: 'Failed to retrieve watchlist' });
    }
});

const deleteWatchlistForSpecificMovie = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { movieId, seriesId, type } = req.body;  // match your add controller

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (type === 'series') {
            const itemIndex = user.seriesWatchlist.indexOf(seriesId.toString());
            if (itemIndex === -1) {
                return res.status(404).json({ message: 'Series not found in watchlist' });
            }
            user.seriesWatchlist.splice(itemIndex, 1);
        } else {
            const itemIndex = user.watchlist.indexOf(movieId.toString());
            if (itemIndex === -1) {
                return res.status(404).json({ message: 'Movie not found in watchlist' });
            }
            user.watchlist.splice(itemIndex, 1);
        }

        await user.save();
        res.status(200).json({ message: `${type} removed from watchlist` });

    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).json({ message: 'Error removing from watchlist' });
    }
});


const addToFavorites = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { movieId, year, title, poster_path } = req.body; 

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Use findOneAndUpdate with upsert (creates if doesn't exist)
        const movie = await Movie.findOneAndUpdate(
            { tmdbId: movieId },
            { 
                tmdbId: movieId, 
                title, 
                year, 
                poster_path 
            },
            { 
                upsert: true,  // Create if doesn't exist
                new: true,     // Return the updated/created document
                setDefaultsOnInsert: true
            }
        );

        console.log('✅ Movie:', movie.title);

        // Check if already in favorites
        const isAlreadyFavorite = user.favorites.some(
            fav => fav.toString() === movie._id.toString()
        );

        if (isAlreadyFavorite) {
            return res.status(400).json({ message: 'Movie is already in favorites' });
        }

        // Add to favorites
        user.favorites.push(movie._id);
        await user.save();

        res.status(201).json({ 
            message: 'Movie added to favorites',
            movie: {
                _id: movie._id,
                tmdbId: movie.tmdbId,
                title: movie.title
            }
        });

    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
});

const removeFromFavorites = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { movieId } = req.body;  

    try {
        const user = await User.findById(userId).populate('favorites');
        if (!user) return res.status(404).json({ message: 'User not found' });

        console.log('Current favorites:', user.favorites); 
        console.log('Trying to remove movieId:', movieId);

        // Find the movie in the database by tmdbId
        const movie = await Movie.findOne({ tmdbId: movieId });
        
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found in database' });
        }

        // Check if the movie's _id is in user.favorites
        const index = user.favorites.findIndex(
            fav => fav._id.toString() === movie._id.toString()
        );

        if (index > -1) {
            user.favorites.splice(index, 1); 
            await user.save(); 
            return res.status(200).json({ 
                message: 'Movie removed from favorites',
                favorites: user.favorites 
            });
        } else {
            return res.status(400).json({ message: 'Movie is not in favorites' });
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).json({ message: 'Failed to remove movie from favorites' });
    }
});



const getFavorites = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    try {
        
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        
        console.log('User favorites:', user.favorites);

  
        const movies = await Movie.find({ _id: { $in: user.favorites } });

        
        if (!movies.length) {
            return res.status(200).json({ message: 'No favorites found' });
        }

     
        const favoriteMovies = movies.map(movie => ({
            id: movie._id, 
            title: movie.title,
            year: movie.year,
            poster_path : movie.poster_path,
        }));

        
        res.status(200).json(favoriteMovies);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).json({ message: 'Failed to fetch favorites' });
    }
});



module.exports = { getUserStats, addToWatchlist, updateStats,deleteStats, getWatchlist,addToFavorites,deleteWatchlistForSpecificMovie,removeFromFavorites,getFavorites };
