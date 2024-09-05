const mongoose = require('mongoose');

const BlockedUserSchema = new mongoose.Schema({
    telegramId: Number,
    reason: String,
    bannedAt: Date
});

module.exports = mongoose.model('BlockedUser', BlockedUserSchema);
