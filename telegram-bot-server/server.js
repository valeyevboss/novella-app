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

// Проверка статуса пользователя и наличия username
app.get('/check-user/:telegramId', async (req, res) => {
    try {
        const { telegramId } = req.params;
        const user = await User.findOne({ telegramId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Проверяем статус
        if (user.status === 'banned') {
            return res.json({ redirect: '/banned' });
        }

        if (!user.username) {
            return res.json({ redirect: '/loadingerror' });
        }

        // Отправляем токены и статус пользователя
        return res.json({ tokens: user.tokens, redirect: '/' });
    } catch (error) {
        console.error('Ошибка проверки пользователя:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Обновление токенов
app.post('/update-tokens/:telegramId', async (req, res) => {
    try {
        const { telegramId } = req.params;
        const { amount } = req.body;

        if (typeof amount !== 'number') {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        const user = await User.findOne({ telegramId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.status === 'banned') {
            return res.status(403).json({ error: 'User is banned' });
        }

        user.tokens += amount;
        await user.save();

        // Обновление кеша токенов на клиенте
        const cacheKey = `tokens_${telegramId}`;
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(cacheKey);
        }

        return res.json({ success: true, newBalance: user.tokens });
    } catch (error) {
        console.error('Ошибка обновления токенов:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Объявляем URL изображения
const imageUrl = 'https://res.cloudinary.com/dvjohgg6j/image/upload/v1725631955/Banner/Novella%20banner.jpg'; // Публичный URL вашего изображения

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userName = msg.from.username || ''; // Оставляем пустым, если username нет

    try {
        // Ищем пользователя в базе данных или создаем нового
        let user = await User.findOne({ telegramId: userId });
        if (!user) {
            user = new User({
                telegramId: userId,
                username: userName,
                userId: uuidv4(),  // Генерируем уникальный userId
                lastLogin: new Date(),
                tokens: 0
            });
            await user.save();
        } else {
            user.lastLogin = new Date();
            if (userName) {
                user.username = userName; // Обновляем username, если он существует
            }
            await user.save();
        }

        // Проверяем статус пользователя перед отправкой сообщения
        if (user.status === 'banned') {
            return bot.sendMessage(chatId, 'The action cannot be performed because your account has been blocked. Please contact support.');
        }

        const welcomeMessage = user.username ? `Welcome, ${user.username}!` : `Welcome!`;
        const webAppUrl = `https://novella-telegram-bot.onrender.com/loading?telegramId=${userId}`;

        const options = {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Play Now',
                            web_app: { url: webAppUrl }
                        },
                        {
                            text: 'Join Novella Community',
                            url: 'https://t.me/novellatoken_community'
                        }
                    ]
                ]
            }
        };

        // Отправляем фото и сообщение
        bot.sendPhoto(chatId, imageUrl, {
            caption: welcomeMessage,
            reply_markup: options.reply_markup
        });
    } catch (err) {
        console.error('Error handling /start:', err);
        bot.sendMessage(chatId, 'The action cannot be performed because your account has been blocked. Please contact support.');
    }
});