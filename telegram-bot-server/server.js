const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid'); // Для генерации UUID

const app = express();
const port = process.env.PORT || 3000;

const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
if (!telegramBotToken) {
    console.error('TELEGRAM_BOT_TOKEN is not defined in environment variables.');
    process.exit(1);
}

const bot = new TelegramBot(telegramBotToken, { polling: true });

const bodyParser = require('body-parser');
app.use(bodyParser.json()); // для обновления токенов и данных

// Подключение папки для статических файлов
app.use(express.static(path.join(__dirname, '..', 'public')));

// Отдача index.html по умолчанию
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Отдача loading.html и loadingerror.html по запросу
app.get('/loading', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'loading.html'));
});

app.get('/loadingerror', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'loadingerror.html'));
});

// Отдача banned.html по запросу
app.get('/banned', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'banned.html'));
});

// Подключение к MongoDB с ожиданием
async function startServer() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
        });
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

// Проверка статуса пользователя и наличия username по userId
app.get('/check-user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.status === 'banned') {
            return res.json({ redirect: '/banned' });
        }

        if (!user.username) {
            return res.json({ redirect: '/loadingerror' });
        }

        return res.json({ tokens: user.tokens, redirect: '/' });
    } catch (error) {
        console.error('Ошибка проверки пользователя:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Объявляем URL изображения
const imageUrl = 'https://res.cloudinary.com/dvjohgg6j/image/upload/v1725631955/Banner/Novella%20banner.jpg'; // Публичный URL вашего изображения

// Обработчик команды /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id; // Телеграм ID пользователя
    const userName = msg.from.username || '';

    try {
        // Ищем пользователя по Telegram ID
        let user = await User.findOne({ telegramId });
        if (!user) {
            // Создаем нового пользователя с уникальным userId
            user = new User({
                userId: uuidv4(), // Генерация нового уникального userId
                telegramId: telegramId,
                username: userName,
                lastLogin: new Date(),
                tokens: 0
            });
            await user.save();
        } else {
            // Обновляем последний вход
            user.lastLogin = new Date();
            if (userName) {
                user.username = userName;
            }
            await user.save();
        }

        // Проверка статуса пользователя
        if (user.status === 'banned') {
            return bot.sendMessage(chatId, 'Your account has been blocked. Please contact support.');
        }

        // Создаем URL для web app, используя userId
        const webAppUrl = `https://novella-telegram-bot.onrender.com/loading?userId=${user.userId}`;

        // Отправляем сообщение пользователю с кнопками
        const options = {
            reply_markup: {
                inline_keyboard: [[
                    { text: 'Play Now', web_app: { url: webAppUrl } },
                    { text: 'Join Novella Community', url: 'https://t.me/novellatoken_community' }
                ]]
            }
        };

        bot.sendPhoto(chatId, imageUrl, {
            caption: `Welcome, ${user.username || 'Guest'}!`,
            reply_markup: options.reply_markup
        });
    } catch (err) {
        console.error('Error handling /start:', err);
        bot.sendMessage(chatId, 'An error occurred. Please try again later.');
    }
});