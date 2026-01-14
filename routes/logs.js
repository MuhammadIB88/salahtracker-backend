const express = require('express');
const router = express.Router();
const Log = require('../models/Log');

// SAVE DAILY LOG
router.post('/save', async (req, res) => {
  try {
    // 1. Destructure 'location' from the request body
    const { userId, date, prayers, location } = req.body;

    // 2. Update the findOneAndUpdate to include location
    const log = await Log.findOneAndUpdate(
      { userId, date },
      { 
        userId, 
        date, 
        prayers,
        location // This ensures the specific city/country for this date is saved
      },
      { new: true, upsert: true }
    );

    res.json({ msg: "Salah log saved successfully", log });
  } catch (err) {
    console.error("Save Log Error:", err);
    res.status(500).send("Server Error");
  }
});

// GET USER LOGS (For Monthly Progress)
router.get('/:userId', async (req, res) => {
  try {
    // Sorting by date -1 ensures the most recent days appear first in History
    const logs = await Log.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    console.error("Get Logs Error:", err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;