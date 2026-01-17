const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  country: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, default: null },
  fcmToken: { type: String, default: null },
  
  // NEW: Stores the prayer times for the current day
  cachedTimings: {
    type: Object,
    default: {}
  },
  
  // NEW: Stores the date when cachedTimings were last fetched
  // Format: "YYYY-MM-DD"
  lastTimingUpdate: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('User', UserSchema);