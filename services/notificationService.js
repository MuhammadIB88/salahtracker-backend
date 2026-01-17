const User = require('../models/user');
const admin = require('../config/firebaseAdmin');
const axios = require('axios');

const checkAndSendNotifications = async () => {
  try {
    const users = await User.find({ fcmToken: { $ne: null } });
    
    // Get today's date in YYYY-MM-DD format to check against the database
    const today = new Date().toISOString().split('T')[0];

    for (let user of users) {
      const targetLocation = user.city || user.state;
      let timings = user.cachedTimings;
      let userTimezone = 'Africa/Lagos'; // Default fallback

      // --- CACHE LOGIC START ---
      // If no timings exist OR they are from a previous day, fetch from API
      if (user.lastTimingUpdate !== today || !timings || Object.keys(timings).length === 0) {
        try {
          console.log(`fetching fresh timings from API for ${user.name} in ${targetLocation}...`);
          const response = await axios.get(
            `https://api.aladhan.com/v1/timingsByCity?city=${targetLocation}&country=${user.country}&method=3`
          );
          
          const data = response.data.data;
          timings = data.timings;
          
          // Save to user object in database
          user.cachedTimings = timings;
          user.lastTimingUpdate = today;
          await user.save();

          // Wait 1 second before next user to prevent 429 rate limit
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (apiErr) {
          console.error(`API Error for ${user.name}: ${apiErr.message}`);
          // If API fails, try to use old cached timings as a backup
          if (!timings) continue; 
        }
      }
      // --- CACHE LOGIC END ---

      // 3. Get the current time in Nigeria (WAT)
      const userCurrentTime = new Date().toLocaleString("en-GB", {
        timeZone: "Africa/Lagos", 
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      const prayersToCheck = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

      for (let prayer of prayersToCheck) {
        // Safety check to ensure timings[prayer] exists
        if (!timings[prayer]) continue;

        const prayerTime = timings[prayer].match(/\d{2}:\d{2}/)[0];

        // 4. Compare local user time with prayer time
        if (prayerTime === userCurrentTime) {
          const message = {
            notification: {
              title: `Time for ${prayer}`,
              body: `It is now time for ${prayer} in ${targetLocation}. Don't forget your journey! 🕌`,
            },
            token: user.fcmToken,
          };

          await admin.messaging().send(message);
          console.log(`✅ Notification sent: ${prayer} to ${user.name} in ${targetLocation} (Local Time: ${userCurrentTime})`);
        }
      }
    }
  } catch (error) {
    console.error("Notification Service Error:", error.message);
  }
};

const startNotificationTimer = () => {
  console.log("Azaan Notification Timer Started (Checking every minute) ⏰");
  setInterval(checkAndSendNotifications, 60000);
};

module.exports = { startNotificationTimer };