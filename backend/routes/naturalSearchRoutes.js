const express = require("express");

const {
  naturalSearch,
} = require("../controllers/naturalSearchController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, naturalSearch);

module.exports = router;