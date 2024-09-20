const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

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
    const userId = req.query.userId; // Получите userId из параметров запроса
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'), (err) => {
        if (err) {
            console.error('Error sending index.html:', err);
            return res.status(err.status).end();
        }
        const script = `<script>document.body.dataset.userId = "${userId}";</script>`;
        res.write(script);
        res.end();
    });
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

// Проверка статуса пользователя и наличия username
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

// Маршрут для получения актуального баланса токенов
app.get('/get-tokens/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ tokens: user.tokens });
    } catch (error) {
        console.error('Ошибка получения баланса токенов:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Маршрут для начисления токенов
app.post('/add-tokens/:userId', async (req, res) => {
    const { userId } = req.params;
    const { tokens } = req.body; // Количество токенов для начисления

    try {
        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.tokens += tokens; // Увеличиваем количество токенов
        await user.save();

        res.json({ success: true, tokens: user.tokens });
    } catch (error) {
        console.error('Ошибка при начислении токенов:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Объявляем URL изображения
const imageUrl = 'https://res.cloudinary.com/dvjohgg6j/image/upload/v1725631955/Banner/Novella%20banner.jpg'; // Публичный URL вашего изображения

// Обработчик команды /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userName = msg.from.username || '';

    try {
        let user = await User.findOne({ telegramId: userId });
        if (!user) {
            user = new User({
                telegramId: userId,
                username: userName,
                userId: uuidv4(), // Генерируем уникальный userId
                lastLogin: new Date(),
                tokens: 0
            });
            await user.save();
        } else {
            user.lastLogin = new Date();
            if (userName) {
                user.username = userName;
            }
            await user.save();
        }

        // Проверка статуса
        if (user.status === 'banned') {
            return bot.sendMessage(chatId, 'Your account has been blocked. Please contact support.');
        }

        const welcomeMessage = user.username ? `Welcome, ${user.username}!` : `Welcome!`;
        const webAppUrl = `https://novella-telegram-bot.onrender.com/loading?userId=${user.userId}`;

        // Отправка сообщения
        const options = {
            reply_markup: {
                inline_keyboard: [[
                    { text: 'Play Now', web_app: { url: webAppUrl } },
                    { text: 'Join Novella Community', url: 'https://t.me/novellatoken_community' }
                ]]
            }
        };
        
        bot.sendPhoto(chatId, imageUrl, {
            caption: welcomeMessage,
            reply_markup: options.reply_markup
        });
    } catch (err) {
        console.error('Error handling /start:', err);
        bot.sendMessage(chatId, 'Your account has been blocked. Please contact support.');
    }
});
