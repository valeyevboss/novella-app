const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');
const User = require('../models/User');
const BlockedUser = require('../models/BlockedUser');

const app = express();
const port = process.env.PORT || 3000;

const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(telegramBotToken, { polling: true });

// Подключение папки для статических файлов
app.use(express.static(path.join(__dirname, '..', 'public')));

// Отдача index.html по умолчанию
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Маршрут для страницы блокировки
app.get('/banned', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'banned.html'));
});

// Подключение к MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

// Запуск сервера
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// Функция для проверки, заблокирован ли пользователь
const isUserBlocked = async (telegramId) => {
    const blockedUser = await BlockedUser.findOne({ telegramId: telegramId });
    return !!blockedUser;
};

// Функция для блокировки пользователя
const blockUser = async (telegramId, reason) => {
    const blockedUser = new BlockedUser({
        telegramId: telegramId,
        reason: reason,
        bannedAt: new Date()
    });
    await blockedUser.save();
};

// Функция для вычисления токенов в зависимости от возраста аккаунта
const calculateTokens = (months) => {
    if (months < 5) return 0;
    if (months < 12) return 2485;
    if (months < 36) return Math.floor(Math.random() * (4500 - 3900 + 1)) + 3900;
    if (months < 48) return 5250;
    if (months < 60) return 5900;
    if (months < 72) return 6700;
    if (months < 84) return 8900;
    if (months < 96) return 9100;
    if (months < 120) return 11200;
    return 15000;
};

// Обработка команды /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userName = msg.from.username || msg.from.first_name;

    // Проверяем, находится ли пользователь в банлисте
    if (await isUserBlocked(userId)) {
        bot.sendMessage(chatId, 'Your account has been banned. Please contact support. Visit: http://yourdomain.com/banned');
        return;
    }

    let user = await User.findOne({ telegramId: userId });
    if (!user) {
        const accountAge = Math.floor(Math.random() * 120); // Здесь должна быть логика для определения возраста аккаунта
        if (accountAge < 1) {
            await blockUser(userId, 'Account age is less than 1 month');
            bot.sendMessage(chatId, 'Your account is banned due to insufficient account age. Visit: http://yourdomain.com/banned');
            return;
        }
        user = new User({
            telegramId: userId,
            username: userName,
            lastLogin: new Date(),
            tokens: calculateTokens(accountAge) // начальное количество токенов
        });
        await user.save();
    } else {
        user.lastLogin = new Date();
        await user.save();
    }

    // Отправка сообщения пользователю
    bot.sendMessage(chatId, `Username: ${userName}, congratulations!`);
    bot.sendPhoto(chatId, 'https://yourdomain.com/telegram.png');
    bot.sendMessage(chatId, `Account age: ${Math.floor(Math.random() * 120)} months\nTokens awarded: ${user.tokens}`);
});

// Обработка команды /banned для просмотра заблокированных пользователей
bot.onText(/\/banned/, async (msg) => {
    const chatId = msg.chat.id;

    const bannedUsers = await BlockedUser.find({});
    if (bannedUsers.length === 0) {
        bot.sendMessage(chatId, 'No banned users found.');
        return;
    }

    const response = bannedUsers.map(user => `ID: ${user.telegramId}, Reason: ${user.reason}`).join('\n');
    bot.sendMessage(chatId, `Banned users:\n${response}`);
});

// Очистка токенов каждые 24 часа
const cleanUpTokens = async () => {
    const now = new Date();
    const thresholdDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 дня назад

    const usersToUpdate = await User.find({ lastLogin: { $lt: thresholdDate } });

    for (const user of usersToUpdate) {
        user.tokens -= user.tokens * 0.10; // Сгорает 10% токенов
        if (user.tokens < 0) user.tokens = 0; // Токены не могут быть отрицательными
        user.lastLogin = now; // Обновляем последнюю активность
        await user.save();
    }
};

// Запуск задачи очистки каждый день
setInterval(cleanUpTokens, 24 * 60 * 60 * 1000); // Каждые 24 часа