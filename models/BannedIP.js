const mongoose = require('mongoose');

const bannedIPSchema = new mongoose.Schema({
    ip: { type: String, required: true, unique: true },
    reason: { type: String, default: 'Banned for violating rules' },
    createdAt: { type: Date, default: Date.now, expires: '30d' } // Удаление через 30 дней
});

// Создание модели BannedIP
const BannedIP = mongoose.model('BannedIP', bannedIPSchema);

// Функция для блокировки IP-адреса
const banUserByIp = async (ip, reason) => {
    const bannedIp = new BannedIP({ ip, reason });
    await bannedIp.save();
    console.log(`IP ${ip} заблокирован.`);
};

module.exports = {
    BannedIP,
    banUserByIp
};
