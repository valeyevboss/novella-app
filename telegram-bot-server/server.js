const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');

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

// Модель заблокированных пользователей
const blockedUserSchema = new mongoose.Schema({
    telegramId: { type: Number, required: true, unique: true },
    reason: { type: String, required: true },
    blockedAt: { type: Date, default: Date.now }
});

const BlockedUser = mongoose.model('BlockedUser', blockedUserSchema);

// Функция для проверки, заблокирован ли пользователь
const isUserBlocked = async (telegramId) => {
    return await BlockedUser.findOne({ telegramId });
};

// Функция для блокировки пользователя
const blockUser = async (telegramId, reason) => {
    const blockedUser = new BlockedUser({ telegramId, reason });
    await blockedUser.save();
};

// Настройка и запуск Telegram бота
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

    // Опции для клавиатуры
    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Play Now',
                        web_app: {
                            url: 'https://novella-telegram-bot.onrender.com' // Замените на URL вашего веб-приложения
                        }
                    },
                    {
                        text: 'Join Novella Community',
                        url: 'https://t.me/novellatoken_community' // Замените на URL вашего телеграм-канала
                    }
                ]
            ]
        }
    };

    const imageUrl = 'https://i.imgur.com/zhgId3M.jpg'; // Публичный URL вашего изображения

    // Отправка приветственного сообщения с клавиатурой
    bot.sendPhoto(chatId, imageUrl, {
        caption: 'Welcome to the bot!',
        ...options
    }).catch(err => {
        console.error('Failed to send photo:', err);
    });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});