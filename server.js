const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// 1. Imports
const authRoutes = require('./routes/auth');
const logRoutes = require('./routes/logs');
const { startNotificationTimer } = require('./services/notificationService'); // ADDED THIS

const app = express();

// 2. Middleware
app.use(cors({
  origin: "https://salahtracker-evhm.onrender.com"
}));
app.use(express.json());

// 3. Routes
// Keep-alive route for Cron-job.org
app.get('/ping', (req, res) => {
  res.status(200).send('Server is awake!');
});

app.use('/api/auth', authRoutes);
app.use('/api/logs', logRoutes);

// 4. Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Successfully connected to MongoDB"))
  .catch(err => console.log("❌ Connection error:", err));

// 5. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  
  // ADDED THIS: Starts the 1-minute checking loop
  startNotificationTimer(); 
});