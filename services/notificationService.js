const User = require('../models/user');
const admin = require('../config/firebaseAdmin');
const axios = require('axios');

const checkAndSendNotifications = async () => {
  try {
    // 1. Find all users who have an FCM token saved
    const users = await User.find({ fcmToken: { $ne: null } });

    for (let user of users) {
      // 2. Fetch prayer times for the user's location
      const response = await axios.get(
        `https://api.aladhan.com/v1/timingsByCity?city=${user.state}&country=${user.country}&method=3`
      );
      
      const data = response.data.data;
      const timings = data.timings;
      const userTimezone = data.meta.timezone; // Get the user's local timezone (e.g., "Africa/Lagos")

      // 3. Get the current time in the user's specific timezone
      const userCurrentTime = new Date().toLocaleString("en-GB", {
        timeZone: userTimezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      const prayersToCheck = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

      for (let prayer of prayersToCheck) {
        // Extract only the HH:mm part from the API
        const prayerTime = timings[prayer].match(/\d{2}:\d{2}/)[0];

        // 4. Compare local user time with prayer time
        if (prayerTime === userCurrentTime) {
          const message = {
            notification: {
              title: `Time for ${prayer}`,
              body: `It is now time for ${prayer} in ${user.state}. Don't forget your journey! 🕌`,
            },
            token: user.fcmToken,
          };

          await admin.messaging().send(message);
          console.log(`✅ Notification sent: ${prayer} to ${user.name} (Local Time: ${userCurrentTime})`);
        }
      }
    }
  } catch (error) {
    console.error("Notification Service Error:", error.message);
  }
};

// Start the loop (Checks every minute)
const startNotificationTimer = () => {
  console.log("Azaan Notification Timer Started (Checking every minute) ⏰");
  setInterval(checkAndSendNotifications, 60000);
};

module.exports = { startNotificationTimer };