const mongoose = require('mongoose');

const people = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  note: { type: String, default: '' },
  people: [
    {
      tmdb_person_id: { type: Number, required: true },
      name: { type: String, required: true },
      profile_path: { type: String, default: '' },
      known_for_department: { type: String, default: '' },
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model('People', people);