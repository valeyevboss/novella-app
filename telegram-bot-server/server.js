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

// Отдача index.html по умолчанию
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Подключение к MongoDB с ожиданием
async function startServer() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
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

// Маршрут для получения токенов
app.get('/tokens', async (req, res) => {
    try {
        const { telegramId } = req.query;
        console.log('Запрос на токены для:', telegramId); // Логируем ID

        if (!telegramId) {
            return res.status(400).json({ error: 'Telegram ID is required' });
        }

        const user = await User.findOne({ telegramId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        console.log('Найден пользователь:', user); // Логируем найденного пользователя
        res.json({ tokens: user.tokens });
    } catch (error) {
        console.error('Ошибка получения токенов:', error);
        res.status(500).json({ error: 'Ошибка получения токенов' });
    }
});

// Опции для клавиатуры
const options = {
    reply_markup: {
        inline_keyboard: [
            [
                {
                    text: 'Play Now',
                    web_app: {
                        url: 'https://novella-telegram-bot.onrender.com/' // URL веб-приложения
                    }
                },
                {
                    text: 'Join Novella Community',
                    url: 'https://t.me/novellatoken_community' // URL телеграм-канала
                }
            ]
        ]
    }
};

const imageUrl = 'https://res.cloudinary.com/dvjohgg6j/image/upload/v1725631955/Banner/Novella%20banner.jpg'; // Публичный URL изображения

// Обработка команды /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userName = msg.from.username || msg.from.first_name;

    try {
        // Ищем пользователя в базе данных или создаем нового
        let user = await User.findOne({ telegramId: userId });
        if (!user) {
            console.log('Создаем нового пользователя');
            user = new User({
                telegramId: userId,
                username: userName,
                lastLogin: new Date(),
                tokens: 1000 // Здесь задаем начальное количество токенов
            });
            await user.save();
        } else {
            // Обновляем только lastLogin, не сбрасывая tokens
            console.log('Пользователь найден, обновляем lastLogin');
            user.lastLogin = new Date();
            await user.save(); // Обновляем только дату
        }

        console.log('Текущий баланс токенов:', user.tokens); // Логируем баланс токенов

        // Отправляем сообщение с картинкой и кнопками
        bot.sendPhoto(chatId, imageUrl, {
            caption: `Welcome, ${userName}!`,
            reply_markup: options.reply_markup
        });
    } catch (err) {
        console.error('Error handling /start:', err);
        bot.sendMessage(chatId, 'An error has occurred. Please try again later.');
    }
});
