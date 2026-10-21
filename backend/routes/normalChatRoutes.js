const express = require("express");
const {
  sendMessage,
  getConversations,
  getMessages,
} = require("../controllers/normalChatController");
const {protect} = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/messages", protect, sendMessage);
router.get("/conversations", protect, getConversations);
router.get("/conversations/:id/messages", protect, getMessages);

module.exports = router;
