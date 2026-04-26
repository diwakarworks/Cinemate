const mongoose = require('mongoose')


const FilmSchema = new mongoose.Schema({
    tmdbId: Number,
    title:String,
    year:String,
    poster_path:String,
    rank:Number
});

const UserRankingSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, required:true},
    directorId:{type:Number, required:true},
    name:{type:String},
    films: [FilmSchema],
    bio:{type:String},
},{timestamps:true});

module.exports = mongoose.model('UserRanking', UserRankingSchema); 