const express = require('express');
const {protect} = require('../middleware/authMiddleware');
const {getUserLists,getListById,createList,updateList,deleteList,addMovieToList,removeMovieFromList,updateMoviePosition,addSeriesToList,removeSeriesFromList,updateSeriesPosition} = require('../controllers/listController');
const router = express.Router();

router.get('/user/:userId',getUserLists)
router.get('/:listId',protect,getListById);
router.post('/:userId',protect,createList);
router.put('/:listId',protect,updateList);
router.delete('/:listId',protect,deleteList);
router.post('/:listId/movies',protect,addMovieToList);
router.delete('/:listId/movies/:tmdbId',protect,removeMovieFromList);
router.put('/:listId/movies/:tmdbId/position',protect,updateMoviePosition);
router.post('/:listId/series', protect, addSeriesToList);
router.delete('/:listId/series/:tmdbId', protect, removeSeriesFromList);
router.patch('/:listId/series/:tmdbId/position', protect, updateSeriesPosition);

module.exports = router;