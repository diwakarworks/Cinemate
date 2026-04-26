const express = require('express');
const {protect} = require('../middleware/authMiddleware');
const {addDiaryEntry,getUserDiary,getDiaryEntry,deleteDiaryEntry} = require('../controllers/diaryController');

const router = express.Router();

router.post('/:id', protect, addDiaryEntry);
router.get('/:userId/entries',protect,getUserDiary);
router.get('/:userId/entries/:entryId',protect,getDiaryEntry);
router.delete('/:userId/entries/:entryId', protect, deleteDiaryEntry);

module.exports = router;