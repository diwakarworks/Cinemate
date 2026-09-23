const express = require('express');
const { getMoods,discoverSearch } = require('../controllers/searchController');
const {protect} = require('../middleware/authMiddleware');

const router = express.Router();


router.route("/discover").get(protect, getMoods).post(protect, discoverSearch);

module.exports = router;
