const PeopleList = require('../models/People');

const getUserLists = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const lists = await PeopleList.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json(lists);
  } catch (error) {
    console.error(`Error getting user lists: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

const createList = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, note } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'List name is required' });
    }

    const list = await PeopleList.create({
      user: userId,
      name: name.trim(),
      note: note?.trim() || '',
    });

    res.status(201).json(list);
  } catch (error) {
    console.error(`Error creating list: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

const getListById = async (req, res) => {
  try {
    const { listId } = req.params;

    if (!listId) {
      return res.status(400).json({ message: 'List ID is required' });
    }

    const list = await PeopleList.findById(listId);

    if (!list) {
      return res.status(404).json({ message: `List with ID ${listId} not found` });
    }

    if (list.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this list' });
    }

    res.status(200).json(list);
  } catch (error) {
    console.error(`Error getting list by ID: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

const updateList = async (req, res) => {
  try {
    const { listId } = req.params;
    const { name, note } = req.body;

    if (!listId) {
      return res.status(400).json({ message: 'List ID is required' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'List name cannot be empty' });
    }

    const list = await PeopleList.findById(listId);

    if (!list) {
      return res.status(404).json({ message: `List with ID ${listId} not found` });
    }

    if (list.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this list' });
    }

    list.name = name.trim();
    list.note = note?.trim() ?? list.note;

    const updated = await list.save();
    res.status(200).json(updated);
  } catch (error) {
    console.error(`Error updating list: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

const deleteList = async (req, res) => {
  try {
    const { listId } = req.params;

    if (!listId) {
      return res.status(400).json({ message: 'List ID is required' });
    }

    const list = await PeopleList.findById(listId);

    if (!list) {
      return res.status(404).json({ message: `List with ID ${listId} not found` });
    }

    if (list.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this list' });
    }

    await list.deleteOne();
    res.status(200).json({ message: 'List deleted successfully' });
  } catch (error) {
    console.error(`Error deleting list: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

const addPerson = async (req, res) => {
  try {
    const { listId } = req.params;
    const { tmdb_person_id, name, profile_path, known_for_department } = req.body;

    if (!listId) {
      return res.status(400).json({ message: 'List ID is required' });
    }

    if (!tmdb_person_id) {
      return res.status(400).json({ message: 'TMDB person ID is required' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Person name is required' });
    }

    const list = await PeopleList.findById(listId);

    if (!list) {
      return res.status(404).json({ message: `List with ID ${listId} not found` });
    }

    if (list.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this list' });
    }

    const alreadyExists = list.people.some(
      (p) => p.tmdb_person_id === Number(tmdb_person_id)
    );

    if (alreadyExists) {
      return res.status(409).json({ message: `${name} is already in this list` });
    }

    list.people.push({
      tmdb_person_id: Number(tmdb_person_id),
      name: name.trim(),
      profile_path: profile_path || '',
      known_for_department: known_for_department || '',
    });

    await list.save();
    res.status(200).json(list);
  } catch (error) {
    console.error(`Error adding person to list: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

const removePerson = async (req, res) => {
  try {
    const { listId, tmdbId } = req.params;

    if (!listId) {
      return res.status(400).json({ message: 'List ID is required' });
    }

    if (!tmdbId) {
      return res.status(400).json({ message: 'TMDB person ID is required' });
    }

    const list = await PeopleList.findById(listId);

    if (!list) {
      return res.status(404).json({ message: `List with ID ${listId} not found` });
    }

    if (list.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this list' });
    }

    const personExists = list.people.some(
      (p) => p.tmdb_person_id === Number(tmdbId)
    );

    if (!personExists) {
      return res.status(404).json({ message: `Person with TMDB ID ${tmdbId} not found in this list` });
    }

    list.people = list.people.filter(
      (p) => p.tmdb_person_id !== Number(tmdbId)
    );

    await list.save();
    res.status(200).json(list);
  } catch (error) {
    console.error(`Error removing person from list: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserLists,
  createList,
  getListById,
  updateList,
  deleteList,
  addPerson,
  removePerson,
};