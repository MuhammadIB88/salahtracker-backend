const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  country: { type: String, required: true },
  state: { type: String, required: true },
  // Adding fcmToken here. It is not 'required', so it won't break 
  // existing users when they log in.
  fcmToken: { type: String, default: null }
});

module.exports = mongoose.model('User', UserSchema);