const express = require('express');
const { getUserStats, addToWatchlist, getWatchlist,deleteWatchlistForSpecificMovie,updateStats,deleteStats,addToFavorites, removeFromFavorites, getFavorites } = require('../controllers/userController');
const {protect} = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/:id/stats', protect, getUserStats);
router.post('/:userId/watchlist', protect, addToWatchlist);
router.get('/:id/watchlist', protect,getWatchlist);
router.delete('/:userId/watchlist', protect,deleteWatchlistForSpecificMovie);
router.put('/:id/stats',protect, updateStats);
router.delete('/:id/stats', deleteStats);
router.post('/:id/favorites', protect, addToFavorites);
router.delete('/:id/favorites', protect, removeFromFavorites); 
router.get('/:id/favorites', protect, getFavorites); 

module.exports = router;
