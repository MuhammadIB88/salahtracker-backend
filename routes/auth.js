const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// --- SIGNUP ROUTE ---
router.post('/signup', async (req, res) => {
  try {
    // 1. Added city and fcmToken to the destructuring to catch them from the frontend
    const { name, email, password, country, state, city, fcmToken } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    // 2. Included city and fcmToken in the new user creation
    user = new User({ 
      name, 
      email, 
      password, 
      country, 
      state, 
      city, 
      fcmToken 
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // 3. Generate token so they log in immediately after signup
    const payload = { userId: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    // 4. Return the full data just like the Login route does
    res.status(201).json({ 
      msg: "User registered successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        country: user.country,
        state: user.state,
        city: user.city,
        fcmToken: user.fcmToken
      }
    });
  } catch (err) {
    console.error("Signup Error:", err);
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
        state: user.state,
        city: user.city, // Returns city on login
        fcmToken: user.fcmToken // Returns token on login
      }
    });

  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// --- UPDATE FCM TOKEN ROUTE ---
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

// --- UPDATE LOCATION ROUTE ---
router.post('/update-location', async (req, res) => {
  try {
    const { userId, country, state, city } = req.body;

    if (!userId || !country || !state || !city) {
      return res.status(400).json({ msg: "Missing userId, country, state, or city" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { country, state, city }, 
      { new: true }
    );

    res.json({ 
      msg: "Location updated successfully",
      user: {
        country: updatedUser.country,
        state: updatedUser.state,
        city: updatedUser.city
      }
    });
  } catch (err) {
    console.error("Location update error:", err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;