const express = require('express');
const { getUserStats, addToWatchlist, getWatchlist,deleteWatchlistForSpecificMovie,updateStats,deleteStats,addToFavorites, removeFromFavorites, getFavorites,addFavoriteSeries,getFavoriteSeries,removeFavoriteSeries,importAllWatchlists, exportAllWatchlists, clearWatchlist,setWatchlistVisibility } = require('../controllers/userController');
const {protect} = require('../middleware/authMiddleware');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/:id/stats', protect, getUserStats);
router.post('/:userId/watchlist', protect, addToWatchlist);
router.get('/:id/watchlist', protect,getWatchlist);
router.delete('/:userId/watchlist', protect,deleteWatchlistForSpecificMovie);
router.put('/:id/stats',protect, updateStats);
router.delete('/:id/stats', deleteStats);
router.post('/:id/favorites', protect, addToFavorites);
router.delete('/:id/favorites', protect, removeFromFavorites); 
router.get('/:id/favorites', protect, getFavorites); 
router.post('/:id/favorites/series', protect, addFavoriteSeries);
router.get('/:id/favorites/series', protect, getFavoriteSeries);
router.delete('/:id/favorites/series/:tmdbId', protect, removeFavoriteSeries);
router.get('/watchlist/export-all', protect, exportAllWatchlists);
router.post('/watchlist/import-all', protect, upload.single('file'), importAllWatchlists);
router.delete('/watchlist/clear', protect, clearWatchlist);
router.patch('/watchlist/visibility', protect, setWatchlistVisibility);



module.exports = router;
