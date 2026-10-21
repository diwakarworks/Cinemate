
const mongoose = require("mongoose");
const ChatConversation = require("../models/ChatConversation");
const ChatMessage = require("../models/ChatMessage");

const { normalChatCompletion } = require("../services/rag/normalChat");

function getUserId(req) {
  return req.user?._id || req.user?.id;
}


const  sendMessage = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { message, conversationId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required." });
    }

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message is required." });
    }

    let conversation;

    if (conversationId) {
      if (!mongoose.isValidObjectId(conversationId)) {
        return res.status(400).json({ error: "Invalid conversation ID." });
      }

      conversation = await ChatConversation.findOne({
        _id: conversationId,
        userId,
      });

      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found." });
      }
    } else {
      conversation = await ChatConversation.create({
        userId,
        title: message.trim().slice(0, 60),
      });
    }

    const previousMessages = await ChatMessage.find({
      conversationId: conversation._id,
    })
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    previousMessages.reverse();

    const userMessage = message.trim();

    await ChatMessage.create({
      conversationId: conversation._id,
      role: "user",
      content: userMessage,
    });

    const messages = [
      {
        role: "system",
        content: `
You are Cinemate, a knowledgeable and engaging movie and TV assistant.

Discuss films, directors, actors, genres, screenwriting, cinematography,
plot interpretations, and television series.

Use previous conversation messages to understand follow-up questions.
Do not invent facts. Acknowledge uncertainty when appropriate.
You do not automatically have current release or streaming information.
        `.trim(),
      },
      ...previousMessages.map(({ role, content }) => ({ role, content })),
      { role: "user", content: userMessage },
    ];

    const result = await normalChatCompletion(messages);
    const answer = result.answer;
    const movies = result.movies;

    await ChatMessage.create({
      conversationId: conversation._id,
      role: "assistant",
      content: answer,
    });

    conversation.updatedAt = new Date();
    await conversation.save();

    return res.status(200).json({
      conversationId: conversation._id,
      answer,
      movies
    });
  } catch (error) {
    console.error("Normal chat error:", error.message);

    return res.status(500).json({
      error: "Unable to generate a response.",
    });
  }
}

const getConversations = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Authentication required." });
    }

    const conversations = await ChatConversation.find({ userId })
      .sort({ updatedAt: -1 })
      .select("_id title createdAt updatedAt")
      .lean();

    return res.status(200).json({ conversations });
  } catch (error) {
    console.error("Conversation list error:", error.message);
    return res.status(500).json({ error: "Unable to load conversations." });
  }
}


const getMessages = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required." });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid conversation ID." });
    }

    const conversation = await ChatConversation.findOne({
      _id: id,
      userId,
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found." });
    }

    const messages = await ChatMessage.find({ conversationId: id })
      .sort({ createdAt: 1 })
      .select("role content createdAt")
      .lean();

    return res.status(200).json({ conversationId: id, messages });
  } catch (error) {
    console.error("Message history error:", error.message);
    return res.status(500).json({ error: "Unable to load chat history." });
  }
}

module.exports = {
  sendMessage,
  getConversations,
  getMessages,
};
