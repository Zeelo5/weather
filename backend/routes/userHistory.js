const express = require('express');
const UserHistory = require('../models/UserHistory');
const router = express.Router();

router.post('/', async (req, res) => {
  const { userId, city, temperature } = req.body;

  try {
    const userHistory = await UserHistory.findOne({ userId });

    if (userHistory) {
      userHistory.searchHistory.push({ city, temperature });
      await userHistory.save();
    } else {
      await UserHistory.create({ userId, searchHistory: [{ city, temperature }] });
    }

    res.status(200).json({ message: 'History saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error saving history' });
  }
});

router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const userHistory = await UserHistory.findOne({ userId });

    if (userHistory) {
      res.status(200).json(userHistory.searchHistory);
    } else {
      res.status(404).json({ message: 'No history found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving history' });
  }
});

module.exports = router;
