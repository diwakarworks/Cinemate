const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    totalMoviesWatched: { type: Number, default: 0 },
    favoriteGenres: { type: Map, of: Number }, 
});

const Stats = mongoose.model('Stats', statsSchema);
module.exports = Stats;
