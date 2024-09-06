const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const User = require('./models/User'); // Подключаем модель пользователя
const BlockedUser = require('./models/BlockedUser'); // Подключаем модель заблокированных пользователей
const axios = require('axios');
const numVerifyApiKey = '261bcd2a0ee31012d6a2fadc696603ba';

// Ваш токен бота Telegram
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Функция для проверки номера телефона через NumVerify API
const checkPhoneNumber = async (phoneNumber) => {
    const url = `http://apilayer.net/api/validate?access_key=${numVerifyApiKey}&number=${phoneNumber}`;
    try {
        const response = await axios.get(url);
        const data = response.data;

        if (data.valid) {
            console.log(`Номер телефона валиден: ${data.number}`);
            return true;
        } else {
            console.log(`Номер телефона недействителен: ${phoneNumber}`);
            return false;
        }
    } catch (error) {
        console.error('Ошибка при проверке номера:', error);
        return false;
    }
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

// Проверка, заблокирован ли пользователь
const isUserBlocked = async (telegramId) => {
    const blockedUser = await BlockedUser.findOne({ telegramId: telegramId });
    return !!blockedUser;
};

// Добавление пользователя в список заблокированных
const blockUser = async (telegramId, reason) => {
    const blockedUser = new BlockedUser({
        telegramId: telegramId,
        reason: reason,
        bannedAt: new Date()
    });
    await blockedUser.save();
};

// Обработка команды /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userName = msg.from.username || msg.from.first_name;
	
	// Пример номера телефона пользователя (в реальности его нужно будет запросить у пользователя)
    const userPhoneNumber = '+1234567890'; 

    // Проверяем, находится ли пользователь в банлисте
    if (await isUserBlocked(userId)) {
        bot.sendMessage(chatId, 'Your account has been banned. Please contact support.');
        return;
    }
	
	// Проверяем номер телефона через NumVerify
    const isPhoneValid = await checkPhoneNumber(userPhoneNumber);
    if (!isPhoneValid) {
        await blockUser(userId, 'Invalid phone number');
        bot.sendMessage(chatId, 'Your account is banned due to invalid phone number.');
        return;
    }

    let user = await User.findOne({ telegramId: userId });
    if (!user) {
        const accountAge = Math.floor(Math.random() * 120); // Здесь должна быть логика для определения возраста аккаунта
        if (accountAge < 1) {
            await blockUser(userId, 'Account age is less than 1 month');
            bot.sendMessage(chatId, 'Your account is banned due to insufficient account age.');
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
