const exporess = require('express');
const { protect } = require('../middleware/authMiddleware');
const { chat } = require('../controllers/ragController');

const router = exporess.Router();

router.post('/chat', protect, chat);

module.exports = router;