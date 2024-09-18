const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');  // Для генерации уникальных userID

const UserSchema = new mongoose.Schema({
    telegramId: { type: String, unique: true },
    userID: { type: String, unique: true, default: uuidv4 },  // Генерируем уникальный userID
    username: { type: String, default: '' },
    lastLogin: Date,
    tokens: { type: Number, default: 0 },
    status: { type: String, enum: ['No banned', 'banned'], default: 'No banned' },
});

// Добавляем индексы на поля telegramId и userID
UserSchema.index({ telegramId: 1 }, { unique: true });
UserSchema.index({ userID: 1 }, { unique: true });

module.exports = mongoose.model('User', UserSchema);
