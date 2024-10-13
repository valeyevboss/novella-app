const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    telegramId: { type: String, unique: true }, // Telegram userid
    username: { type: String, default: '' }, // Username
    avatarUrl: { type: String, default: '' }, // Avatar username
    startDate: { type: Date, default: Date.now }, // Date first time start
    lastLogin: Date, // Last session
    tokens: { type: Number, default: 0 }, // Token balance
    status: { type: String, enum: ['No banned', 'banned'], default: 'No banned' }, // Banned system
    ip: { type: String }, // ip adress
    rank: { type: Number, default: 0 }, // Leader rank #top
    refcode: { type: String, unique: true }, // Уникальный реферальный код
    friendsCount: { type: Number, default: 0 } // Количество друзей
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);