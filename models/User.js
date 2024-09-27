const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    telegramId: { type: String, unique: true },
    username: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    lastLogin: Date,
    tokens: { type: Number, default: 0 },
    status: { type: String, enum: ['No banned', 'banned'], default: 'No banned' },
    ip: String,
    rank: { type: Number, default: 0 } // Новое поле для хранения ранга
});

module.exports = mongoose.model('User', UserSchema);