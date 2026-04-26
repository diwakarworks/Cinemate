const mongoose = require('mongoose');

const mediaItemSchema = {
    tmdbId: { type: Number, required: true },
    title: { type: String, required: true },
    year: String,
    posterPath: String,
    position: { type: Number, default: 0 },
    addedAt: { type: Date, default: Date.now }
};

const listSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    movies: [{
        ...mediaItemSchema,
        director: String  
    }],
    series: [{           
        ...mediaItemSchema,
        seasons: Number  
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

listSchema.pre('save', async function () {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('List', listSchema);