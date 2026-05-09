const express = require('express');
const { searchMovies } = require('../controllers/searchController');
const {protect} = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/movies', protect, searchMovies);

module.exports = router;
