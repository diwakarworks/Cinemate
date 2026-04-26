const express = require('express');
const {addReview,getReviewsForMovie} = require('../controllers/reviewController');
const {protect} = require('../middleware/authMiddleware');

const router = express.Router();

router.post ('/',protect,addReview);
router.get('/:movieId',getReviewsForMovie);

module.exports = router;