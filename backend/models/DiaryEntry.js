
const mongoose = require('mongoose');

const diaryEntrySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mediaId: { type: Number, required: true },
    mediaType: { type: String, enum: ['movie', 'tv'], required: true },
    title: { type: String, required: true },
    year:{type:String,required:true},
    posterPath: { type: String, required: true },
    watchedDate: { type: Date, required: true },
    rating: { type: Number, min: 1, max: 10 },
    review: { type: String },
    directorId: { type: Number },
    popularity: { type: Number, default: 0 },
    runtime: { type: Number, default: 0 } 
});

module.exports = mongoose.model('DiaryEntry', diaryEntrySchema);
