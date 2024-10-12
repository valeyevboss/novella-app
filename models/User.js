const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    telegramId: { type: String, unique: true }, // Telegram userid
    username: { type: String, default: '' }, // Username
    avatarUrl: { type: String, default: '' }, // Avatar username
    lastLogin: Date, // Last session
    tokens: { type: Number, default: 0 }, // Token balance
    status: { type: String, enum: ['No banned', 'banned'], default: 'No banned' }, // banned system
    ip: { type: String }, // ip adress
    rank: { type: Number, default: 0 } // Leader rank #top
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);