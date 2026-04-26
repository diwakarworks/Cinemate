const DiaryEntry = require("../models/DiaryEntry");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const axios = require("axios");

const addDiaryEntry = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const {
    mediaId,
    mediaType,
    title,
    year,
    posterPath,
    watchedDate,
    rating,
    review,
  } = req.body;

  const parsedDate = new Date(watchedDate.split("/").reverse().join("-"));

  if (isNaN(parsedDate.getTime())) {
    return res
      .status(400)
      .json({ message: "Invalid date format. Use dd/mm/yyyy" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const tmdbApiKey = process.env.TMDB_API_KEY;

    const creditsUrl = `https://api.themoviedb.org/3/${mediaType}/${mediaId}/credits?api_key=${tmdbApiKey}`;

    const { data } = await axios.get(creditsUrl);

    let directorId = null;

    if (mediaType === "movie") {
      const director = data.crew.find((person) => person.job === "Director");
      directorId = director ? director.id : null;
    }

    if (mediaType === "tv") {
      const tvUrl = `https://api.themoviedb.org/3/tv/${mediaId}?api_key=${tmdbApiKey}`;
      const { data: tvData } = await axios.get(tvUrl);
      directorId = tvData.created_by?.[0]?.id || null;
    }
    const entry = await DiaryEntry.create({
      user: userId,
      mediaId,
      mediaType,
      title,
      year,
      posterPath,
      watchedDate: parsedDate,
      rating,
      review,
      directorId,
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ message: "Failed to add diary entry" });
  }
});

const getUserDiary = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const entries = await DiaryEntry.find({ user: userId }).sort({
      watchedDate: -1,
    });
    res.json({ user, entries });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return res.status(500).json({ message: "Server Error" });
  }
});

const getDiaryEntry = asyncHandler(async (req, res) => {
  const { userId, entryId } = req.params;

  if (!entryId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: "Invalid entry ID format" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const entry = await DiaryEntry.findOne({ _id: entryId, user: userId });
    if (!entry) {
      return res.status(404).json({ message: "Diary entry not found" });
    } else {
      res.json(entry);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return res.status(400).json({ message: "Failed to fetch the diary entry" });
  }
});

const deleteDiaryEntry = asyncHandler(async (req, res) => {
  const { userId, entryId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const entry = await DiaryEntry.findOneAndDelete({
      _id: entryId,
      user: userId,
    });
    if (!entry) {
      return res
        .status(404)
        .json({ message: "Diary entry not found or unauthorized" });
    }

    res.status(200).json({ message: "Diary entry deleted successfully" });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return res.status(500).json({ message: "Server Error" });
  }
});

module.exports = {
  addDiaryEntry,
  getUserDiary,
  getDiaryEntry,
  deleteDiaryEntry,
};
