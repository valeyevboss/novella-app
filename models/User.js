const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    telegramId: Number,
    username: { type: String, default: null }, // Если username не задан, то по умолчанию null
    lastLogin: Date,
    tokens: Number,
    status: { type: String, default: 'No banned' } // Поле для статуса пользователя (No banned, banned)
});

module.exports = mongoose.model('User', UserSchema);
