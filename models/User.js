const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    telegramId: { type: String, unique: true },
    username: { type: String, default: '' },
    userId: { type: String, unique: true, default: uuidv4 },  // Уникальный userId
    lastLogin: Date,
    tokens: { type: Number, default: 0 },
    status: { type: String, enum: ['No banned', 'banned'], default: 'No banned' },
});

// Добавляем уникальные индексы на поля telegramId
UserSchema.index({ telegramId: 1 }, { unique: true });

module.exports = mongoose.model('User', UserSchema);
