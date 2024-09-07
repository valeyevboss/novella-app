const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');
const User = require('../models/User');

const app = express();
const port = process.env.PORT || 3000;

const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
if (!telegramBotToken) {
    console.error('TELEGRAM_BOT_TOKEN is not defined in environment variables.');
    process.exit(1);
}

const bot = new TelegramBot(telegramBotToken, { polling: true });

// Подключение папки для статических файлов
app.use(express.static(path.join(__dirname, '..', 'public')));

// Сначала отдаем страницу загрузки
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'loading.html'));
});

// Если пользователь забанен, перенаправляем его на banned.html
app.get('/banned', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'banned.html'));
});

// Если нет username, перенаправляем на страницу ошибки
app.get('/loadingerror', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'loadingerror.html'));
});

// Добавляем маршрут для проверки статуса пользователя
app.get('/check-status', async (req, res) => {
    const telegramId = req.query.telegramId; // Получаем telegramId из запроса

    try {
        // Ищем пользователя в базе данных
        const user = await User.findOne({ telegramId: telegramId });

        if (user) {
            res.json({ status: user.status }); // Возвращаем статус пользователя (banned или нет)
        } else {
            res.json({ status: 'No user found' }); // Если пользователь не найден
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' }); // Обработка ошибок
    }
});

// Подключение к MongoDB с ожиданием
async function startServer() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Запуск сервера только после успешного подключения к базе данных
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Останавливаем сервер при ошибке подключения
    }
}


startServer();

// Опции для клавиатуры
const options = {
    reply_markup: {
        inline_keyboard: [
            [
                {
                    text: 'Play Now',
                    web_app: {
                        url: 'https://novella-telegram-bot.onrender.com/' // Замените на URL вашего веб-приложения
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

const imageUrl = 'https://res.cloudinary.com/dvjohgg6j/image/upload/v1725631955/Banner/Novella%20banner.jpg'; // Публичный URL вашего изображения

// Обработка команды /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userName = msg.from.username || msg.from.first_name;

    try {
        // Ищем пользователя в базе данных или создаем нового
        let user = await User.findOne({ telegramId: userId });

        // Если пользователя нет, создаём нового
        if (!user) {
            user = new User({
                telegramId: userId,
                username: userName,
                lastLogin: new Date(),
                tokens: 0,
                status: 'No banned' // По умолчанию новый пользователь не забанен
            });
            await user.save();
        } else {
            user.lastLogin = new Date();
            await user.save();
        }

        // Проверяем, забанен ли пользователь
        if (user.status === 'banned') {
            bot.sendMessage(chatId, 'You are banned. Please visit the following link for more information: https://novella-telegram-bot.onrender.com/banned');
            return; // Останавливаем выполнение
        }

        // Если у пользователя нет username, перенаправляем его на страницу ошибки
        if (!userName) {
            bot.sendMessage(chatId, 'Redirecting to error page...');
            bot.sendMessage(chatId, "https://novella-telegram-bot.onrender.com/loadingerror");
            return;
        }

        // Если всё в порядке, отправляем сообщение с картинкой и кнопками
        bot.sendPhoto(chatId, imageUrl, {
            caption: `Welcome, ${userName}!`,
            reply_markup: options.reply_markup
        });
    } catch (err) {
        console.error('Error handling /start:', err);
        bot.sendMessage(chatId, 'An error has occurred. Please try again later.');
    }
});
