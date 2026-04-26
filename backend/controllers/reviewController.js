const Review = require('../models/Review');
const asyncHandler = require('express-async-handler');


const addReview = asyncHandler(async (req, res) => {
    const { userId, movieId, rating, comment } = req.body;

    const review = new Review({ userId, movieId, rating, comment });

    try {
        await review.save();
        res.status(201).json({ message: 'Review added' });
    } catch (error) {
        console.error(`Error${error.message}`)
        res.status(400).json({ message: 'Review couldnt be added' });
    }
});

const getReviewsForMovie = asyncHandler(async (req, res) => {
    const { movieId } = req.params;

    try {
        const reviews = await Review.find({ movieId }).populate('userId', 'username');
        res.json(reviews);
    } catch (error) {
        console.error(`Error ${error.message}`)
        res.status(500).json({ message: 'Couldnt get the Reviews for the Movie' });
    }
});

module.exports = { addReview, getReviewsForMovie };
