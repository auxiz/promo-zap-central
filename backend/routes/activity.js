
const express = require('express');
const router = express.Router();

// Store recent activity in memory (would normally go into a database)
const recentActivity = [];

// Maximum number of activities to store
const MAX_ACTIVITIES = 50;

// Add an activity
const addActivity = (type, title) => {
  const activity = {
    type,
    title,
    timestamp: Date.now()
  };
  
  // Add to beginning of array
  recentActivity.unshift(activity);
  
  // Trim to max size
  if (recentActivity.length > MAX_ACTIVITIES) {
    recentActivity.length = MAX_ACTIVITIES;
  }
};

// Get recent activity
router.get('/recent', (req, res) => {
  res.json({ events: recentActivity });
});

// Export both router and addActivity as a single object
module.exports = {
  router,
  addActivity
};
