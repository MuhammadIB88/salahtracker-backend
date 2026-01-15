const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// --- SIGNUP ROUTE ---
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, country, state } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    user = new User({ name, email, password, country, state });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// --- LOGIN ROUTE ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    const payload = { userId: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        country: user.country,
        state: user.state
      }
    });

  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// --- NEW: UPDATE FCM TOKEN ROUTE ---
// This route saves the device token to the specific user
router.post('/update-fcm-token', async (req, res) => {
  try {
    const { userId, fcmToken } = req.body;

    if (!userId || !fcmToken) {
      return res.status(400).json({ msg: "Missing userId or token" });
    }

    await User.findByIdAndUpdate(userId, { fcmToken });
    res.json({ msg: "FCM Token updated successfully" });
  } catch (err) {
    console.error("Token update error:", err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;