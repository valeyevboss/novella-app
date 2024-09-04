const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');

// Подключаем модель пользователя
const User = mongoose.model('User', new mongoose.Schema({
    telegramId: Number,
    username: String,
    lastLogin: Date,
    tokens: Number
}));

// Ваш токен бота Telegram
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

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

// Массив для хранения заблокированных пользователей (для примера)
const bannedUsers = new Set();

// Обработка команды /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userName = msg.from.username || msg.from.first_name;

    // Проверяем, находится ли пользователь в банлисте
    if (bannedUsers.has(userId)) {
        bot.sendMessage(chatId, 'Your account has been banned. Please contact support.');
        return;
    }

    let user = await User.findOne({ telegramId: userId });
    if (!user) {
        user = new User({
            telegramId: userId,
            username: userName,
            lastLogin: new Date(),
            tokens: calculateTokens(0) // начальное количество токенов
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
