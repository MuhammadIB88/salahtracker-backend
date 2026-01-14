const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true // Added required for safety
  },
  date: { type: String, required: true }, // e.g. "2026-01-13"
  
  // --- ADDED: Location metadata for travel support ---
  location: {
    city: { type: String, default: 'Lagos' },
    country: { type: String, default: 'Nigeria' }
  },

  prayers: [
    {
      name: String,        // Fajr, Dhuhr, etc.
      actualTime: String,  // The Azaan time for that specific location
      observedTime: String,
      remark: String
    }
  ]
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

module.exports = mongoose.model('Log', LogSchema);