const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    telegramId: { type: String, unique: true }, // telegram id
    username: { type: String, default: '' }, // username
    avatarUrl: { type: String, default: '' }, // avatar username
    lastLogin: Date, // last session
    tokens: { type: Number, default: 0 }, // Token balance
    status: { type: String, enum: ['No banned', 'banned'], default: 'No banned' }, // banned system
    ip: { type: String }, // ip adress
    country: { type: String, default: 'Unknown' },
    rank: { type: Number, default: 0 }, // number top
    invitedBy: { type: String, default: null }, // who invited?
    friendsCount: { type: Number, default: 0 } // Count invited
});

module.exports = mongoose.model('User', UserSchema);