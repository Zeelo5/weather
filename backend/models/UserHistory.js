const mongoose = require('mongoose');

const userHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  searchHistory: [
    {
      city: { type: String, required: true },
      temperature: { type: Number, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('UserHistory', userHistorySchema);
