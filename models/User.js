const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    telegramId: { type: String, unique: true },
    username: { type: String, default: '' },
    lastLogin: Date,
    tokens: { type: Number, default: 0 },
    status: { type: String, enum: ['No banned', 'banned'], default: 'No banned' },
});

module.exports = mongoose.model('User', UserSchema);
