const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');
const User = require('../models/User');
const BannedIP = require('../models/BannedIP');

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

// Маршрут для проверки пользователя, наличие username, блокировок, токенов и записи IP
app.get('/check-user/:telegramId', async (req, res) => {
    const telegramId = req.params.telegramId;
    const userIp = getUserIP(req); // Получаем IP пользователя

    try {
        // Проверяем, заблокирован ли IP
        const bannedIP = await BannedIP.findOne({ ip: userIp });
        if (bannedIP) {
            return res.json({ redirect: `/banned?userId=${telegramId}` });
        }

        // Ищем пользователя по Telegram ID
        let user = await User.findOne({ telegramId });

        if (!user) {
            return res.json({ redirect: '/loadingerror' });
        }

        // Обновляем IP и последний вход пользователя
        user.ip = userIp;
        user.lastLogin = new Date();
        await user.save();

        // Отправляем ответ с информацией о токенах
        res.json({ tokens: user.tokens, redirect: '/index' });
    } catch (error) {
        console.error('Ошибка при проверке пользователя:', error);
        res.status(500).json({ redirect: '/loadingerror' });
    }
});

// Объявляем URL изображения
const imageUrl = 'https://res.cloudinary.com/dvjohgg6j/image/upload/v1725631955/Banner/Novella%20banner.jpg'; // Публичный URL вашего изображения

// Получение IP-адреса пользователя
const getUserIP = (req) => {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
};

// Обработчик команды /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id; // Телеграм ID пользователя
    const userName = msg.from.username || '';

    try {
		const userIp = getUserIP(req); // Получаем IP пользователя
				
		// Проверяем, заблокирован ли IP
		const bannedIP = await BannedIP.findOne({ ip: userIp });
		if (bannedIP) {
			return bot.sendMessage(chatId, `Dear @${userName}, You have been blocked by IP address for multiple violations of our rules, with respect, team Novella App.`);
		}
        // Ищем пользователя по Telegram ID
        let user = await User.findOne({ telegramId });

        if (!user) {
            try {
                // Создаем нового пользователя
                user = new User({
                    telegramId: telegramId,
                    username: userName,
                    lastLogin: new Date(),
                    tokens: 0,
					ip: userIp // Сохраняем IP при создании нового пользователя
                });
                await user.save();
            } catch (err) {
                if (err.code === 11000) {
                    console.error('User already exists with this telegramId');
                } else {
                    console.error('Error saving user:', err);
                }
                return;
            }
        } else {
            // Обновляем последний вход и IP
            user.lastLogin = new Date();
            if (userName) {
                user.username = userName;
            }
			user.ip = userIp; // Обновляем IP пользователя
            await user.save();
        }

        // Проверка статуса пользователя
        if (user.status === 'banned') {
            return bot.sendMessage(chatId, 'Your account has been blocked. Please contact support.');
        }

		const webAppUrl = `https://novella-telegram-bot.onrender.com/loading?userId=${telegramId}`; // Здесь использован telegramId

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