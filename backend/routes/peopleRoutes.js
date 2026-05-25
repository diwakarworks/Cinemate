const express = require('express');
const { getUserLists, createList, deleteList,getListById, updateList, addPerson, removePerson } = require('../controllers/peopleController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/:userId', getUserLists);
router.post('/:userId', protect, createList);
router.get('/list/:listId', protect, getListById);      
router.put('/list/:listId', protect, updateList);       
router.delete('/list/:listId', protect, deleteList);
router.post('/list/:listId/add', protect, addPerson);
router.delete('/list/:listId/:tmdbId', protect, removePerson);

module.exports = router;