const express = require('express');
const router = express.Router();
const Log = require('../models/Log');

// SAVE DAILY LOG
router.post('/save', async (req, res) => {
  try {
    const { userId, date, prayers } = req.body;

    // This finds a log for that user on that specific date. 
    // If it exists, it updates it. If not, it creates a new one (upsert).
    const log = await Log.findOneAndUpdate(
      { userId, date },
      { userId, date, prayers },
      { new: true, upsert: true }
    );

    res.json({ msg: "Salah log saved successfully", log });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// GET USER LOGS (For Monthly Progress)
router.get('/:userId', async (req, res) => {
  try {
    const logs = await Log.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

module.exports = router;