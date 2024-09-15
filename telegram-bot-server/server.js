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

// Отдача loading.html и loadingerror.html по запросу
app.get('/loading', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'loading.html'));
});

app.get('/loadingerror', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'loadingerror.html'));
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

// Маршрут для получения токенов
app.get('/tokens/:telegramId', async (req, res) => {
    try {
        const { telegramId } = req.params;
        const user = await User.findOne({ telegramId });

        if (user) {
            // Отправляем количество токенов для пользователя
            res.json({ tokens: user.tokens });
        } else {
            res.status(404).json({ message: 'Пользователь не найден' });
        }
    } catch (error) {
        console.error('Ошибка получения токенов:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});


// Проверка статуса пользователя и наличия username
app.get('/check-user/:telegramId', async (req, res) => {
    try {
        const { telegramId } = req.params;
        const user = await User.findOne({ telegramId });

        if (!user) {
            // Если пользователь не найден, отправляем ошибку
            return res.status(404).json({ error: 'User not found' });
        }

        // Проверка статуса
        if (user.status === 'banned') {
            // Если пользователь заблокирован, перенаправляем на страницу banned.html
            return res.redirect('/banned.html');
        }

        // Если пользователь не заблокирован, проверяем наличие username
        if (!user.username) {
            // Если username нет, перенаправляем на loadingerror.html
            return res.redirect('/loadingerror.html');
        }

        // Если все нормально, перенаправляем на главную страницу index.html
        return res.redirect('/index.html');

    } catch (error) {
        console.error('Ошибка проверки пользователя:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
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
                        url: `https://novella-telegram-bot.onrender.com/?telegramId=` // Добавим telegramId при отправке сообщения
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

        const welcomeMessage = user.username ? `Welcome, ${user.username}!` : `Welcome!`;
        const webAppUrl = `https://novella-telegram-bot.onrender.com/loading?telegramId=${userId}`;

        bot.sendPhoto(chatId, imageUrl, {
            caption: welcomeMessage,
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
        });
    } catch (err) {
        console.error('Error handling /start:', err);
        bot.sendMessage(chatId, 'The action cannot be performed because your account has been blocked. Please contact support.');
    }
});