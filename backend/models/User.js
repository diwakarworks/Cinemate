const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    profilePic:{type:String, required:true},
    password: { type: String, required: true },
    watchlist: [{ type: String, ref: 'Movie' }],
    seriesWatchlist: [{ type: String, ref: 'Series' }],
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
    favoriteSeries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Series' }],
    stats: {
        totalMoviesWatched: { type: Number, default: 0 },
        favoriteGenres: { type: Map, of: Number },
    },
    isWatchlistPrivate: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', userSchema);
