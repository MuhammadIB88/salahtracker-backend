const User = require('../models/user');
const admin = require('../config/firebaseAdmin');
const axios = require('axios');

const checkAndSendNotifications = async () => {
  try {
    // 1. Find all users who have an FCM token saved
    const users = await User.find({ fcmToken: { $ne: null } });

    for (let user of users) {
      // LOGIC: Use city if it exists, otherwise use state
      const targetLocation = user.city || user.state;

      // 2. Fetch prayer times for the user's specific location
      const response = await axios.get(
        `https://api.aladhan.com/v1/timingsByCity?city=${targetLocation}&country=${user.country}&method=3`
      );
      
      const data = response.data.data;
      const timings = data.timings;
      const userTimezone = data.meta.timezone;

      // 3. Get the current time in the user's specific timezone
      const userCurrentTime = new Date().toLocaleString("en-GB", {
        timeZone: userTimezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      const prayersToCheck = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

      for (let prayer of prayersToCheck) {
        const prayerTime = timings[prayer].match(/\d{2}:\d{2}/)[0];

        // 4. Compare local user time with prayer time
        if (prayerTime === userCurrentTime) {
          const message = {
            notification: {
              title: `Time for ${prayer}`,
              // Updated body to show the City/Location name
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

// Start the loop (Checks every minute)
const startNotificationTimer = () => {
  console.log("Azaan Notification Timer Started (Checking every minute) ⏰");
  setInterval(checkAndSendNotifications, 60000);
};

module.exports = { startNotificationTimer };