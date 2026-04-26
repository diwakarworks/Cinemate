const express  = require('express')
const {protect} = require('../middleware/authMiddleware');
const{getUserRanking,addUserRanking} = require('../controllers/rankingController');
const router = express.Router()

router.get('/:userId/:directorId',getUserRanking)
router.post('/:userId/:directorId',protect,addUserRanking)

module.exports = router;