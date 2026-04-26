const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    tmdbId: { type: String,unique:true },
    title: { type: String ,required:true},
    year: { type: Number ,required:true },  
    rating: { type: String }, 
    plot: { type: String },
    duration: { type: String },
    poster_path: { type: String,required:true }, 
    vote_average: { type: Number },
    genre_ids: [{ type: Number }],
    cast: [{ type: String }],
    userComments: [{ username: String, comment: String }],
});

const Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie;
