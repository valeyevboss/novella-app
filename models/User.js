const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    telegramId: Number,
    username: String,
    lastLogin: Date,
    tokens: Number
});

module.exports = mongoose.model('User', UserSchema);
