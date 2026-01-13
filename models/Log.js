const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: String, required: true }, // e.g. "2026-01-13"
  prayers: [
    {
      name: String,        // Fajr, Dhuhr, etc.
      actualTime: String,
      observedTime: String,
      remark: String
    }
  ]
});

module.exports = mongoose.model('Log', LogSchema);