const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    telegramId: { type: String, unique: true }, // Telegram userid
    username: { type: String, default: '' }, // Username
    avatarUrl: { type: String, default: '' }, // Avatar username
    lastLogin: Date, // Last session
    tokens: { type: Number, default: 0 }, // Token balance
    status: { type: String, enum: ['No banned', 'banned'], default: 'No banned' }, // banned system
    ip: { type: String }, // ip adress
    rank: { type: Number, default: 0 }, // Leader rank #top
    isPremium: { type: Boolean, default: false }, // Check Telegram Premium
    invitedBy: { type: String, default: null }, // Who invited?
    friendsCount: { type: Number, default: 0 } // Count invited
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);