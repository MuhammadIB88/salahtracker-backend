const User = require('../models/user');
const admin = require('../config/firebaseAdmin');
const axios = require('axios');

const checkAndSendNotifications = async () => {
  const now = new Date();
  // Get current time in HH:mm format
  const currentTime = now.getHours().toString().padStart(2, '0') + ":" + 
                      now.getMinutes().toString().padStart(2, '0');

  try {
    // 1. Find all users who have an FCM token saved
    const users = await User.find({ fcmToken: { $ne: null } });

    for (let user of users) {
      // 2. Fetch prayer times for the user's location
      // Using user.state as city and user.country as country
      const response = await axios.get(
        `https://api.aladhan.com/v1/timingsByCity?city=${user.state}&country=${user.country}&method=3`
      );
      
      const timings = response.data.data.timings;
      const prayersToCheck = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

      for (let prayer of prayersToCheck) {
        // Extract only the HH:mm part from the API (it sometimes includes timezone)
        const prayerTime = timings[prayer].match(/\d{2}:\d{2}/)[0];

        // 3. If the prayer time is RIGHT NOW, send the notification
        if (prayerTime === currentTime) {
          const message = {
            notification: {
              title: `Time for ${prayer}`,
              body: `It is now time for ${prayer} in ${user.state}. Don't forget your journey! 🕌`,
            },
            token: user.fcmToken,
          };

          await admin.messaging().send(message);
          console.log(`Notification sent: ${prayer} for ${user.name}`);
        }
      }
    }
  } catch (error) {
    console.error("Notification Service Error:", error.message);
  }
};

// This starts the loop to check every 60,000 milliseconds (1 minute)
const startNotificationTimer = () => {
  console.log("Azaan Notification Timer Started (Checking every minute) ⏰");
  setInterval(checkAndSendNotifications, 60000);
};

module.exports = { startNotificationTimer };