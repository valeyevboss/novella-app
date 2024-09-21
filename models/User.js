const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Для генерации уникальных идентификаторов

const UserSchema = new mongoose.Schema({
    userId: { type: String, unique: true, default: () => uuidv4() }
    telegramId: { type: String, unique: true },
    username: { type: String, default: '' },
    lastLogin: Date,
    tokens: { type: Number, default: 0 },
    status: { type: String, enum: ['No banned', 'banned'], default: 'No banned' },
});

// Добавляем уникальные индексы на поля telegramId и userId
UserSchema.index({ telegramId: 1 }, { unique: true });
UserSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('User', UserSchema);
